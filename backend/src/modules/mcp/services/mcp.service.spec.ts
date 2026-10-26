import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { McpService } from '@moduleMcp/services/mcp.service';
import { WorkspaceService } from '@moduleWorkspace/services/workspace.service';
import { ProjectsService } from '@moduleProjects/services/projects.service';
import { TasksService } from '@moduleProjects/services/tasks.service';
import { TaskTimeLogsService } from '@moduleProjects/services/task-time-logs.service';
import { User } from '@moduleUsers/entities/user.entity';
import { UserType } from '@moduleUsers/enums/users.enum';

describe('McpService', () => {
  let service: McpService;
  let workspaceService: jest.Mocked<Partial<WorkspaceService>>;
  let projectsService: jest.Mocked<Partial<ProjectsService>>;
  let tasksService: jest.Mocked<Partial<TasksService>>;
  let taskTimeLogsService: jest.Mocked<Partial<TaskTimeLogsService>>;

  beforeEach(async () => {
    workspaceService = {
      findAll: jest.fn().mockResolvedValue([
        { uuid: 'ws-1', name: 'Main Workspace', description: 'Test', createdAt: new Date() },
      ]),
    };

    projectsService = {
      findAll: jest.fn().mockResolvedValue([
        { uuid: 'proj-1', name: 'Project Alpha', description: 'Alpha', color: '#000000' },
      ]),
    };

    tasksService = {
      findAll: jest.fn().mockResolvedValue([]),
      findOne: jest.fn().mockResolvedValue({
        uuid: 'task-1',
        title: 'Task 1',
        status: { uuid: 'st-1', name: 'To Do', category: 'TODO' },
      }),
      create: jest.fn(),
      update: jest.fn(),
    };

    taskTimeLogsService = {
      findAll: jest.fn().mockResolvedValue([]),
      create: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        McpService,
        { provide: WorkspaceService, useValue: workspaceService },
        { provide: ProjectsService, useValue: projectsService },
        { provide: TasksService, useValue: tasksService },
        { provide: TaskTimeLogsService, useValue: taskTimeLogsService },
      ],
    }).compile();

    service = module.get<McpService>(McpService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Tool execution & RBAC checks', () => {
    it('should block external users from creating tasks (Engine-Level Mutation Lock)', async () => {
      const externalUser = {
        id: 1,
        uuid: 'ext-uuid',
        type: UserType.EXTERNAL,
        canViewProjects: true,
      } as User;

      // Access private setupToolHandlers to test registered handler
      const serverMock: any = {
        setRequestHandler: jest.fn(),
      };

      (service as any).setupToolHandlers(serverMock, externalUser);

      // Find the CallToolRequest handler
      const callToolHandler = serverMock.setRequestHandler.mock.calls.find(
        (call: any[]) => call[0] === CallToolRequestSchema,
      )[1];

      const result = await callToolHandler({
        params: {
          name: 'ord_create_task',
          arguments: { projectUuid: 'proj-1', title: 'New Task' },
        },
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('External users have an engine-level mutation lock');
      expect(tasksService.create).not.toHaveBeenCalled();
    });

    it('should block users without canViewProjects from listing projects', async () => {
      const restrictedUser = {
        id: 2,
        uuid: 'res-uuid',
        type: UserType.INTERNAL,
        canViewProjects: false,
      } as User;

      const serverMock: any = {
        setRequestHandler: jest.fn(),
      };

      (service as any).setupToolHandlers(serverMock, restrictedUser);

      const callToolHandler = serverMock.setRequestHandler.mock.calls.find(
        (call: any[]) => call[0] === CallToolRequestSchema,
      )[1];

      const result = await callToolHandler({
        params: {
          name: 'ord_list_projects',
          arguments: { workspaceUuid: 'ws-1' },
        },
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('User is not authorized to view projects');
      expect(projectsService.findAll).not.toHaveBeenCalled();
    });

    it('should allow internal users with permissions to create tasks', async () => {
      const internalUser = {
        id: 3,
        uuid: 'int-uuid',
        type: UserType.INTERNAL,
        canViewProjects: true,
      } as User;

      tasksService.create!.mockResolvedValue({
        uuid: 'task-created-1',
        title: 'New Feature Task',
        status: { name: 'To Do' },
        type: { name: 'Task' },
      } as any);

      const serverMock: any = {
        setRequestHandler: jest.fn(),
      };

      (service as any).setupToolHandlers(serverMock, internalUser);

      const callToolHandler = serverMock.setRequestHandler.mock.calls.find(
        (call: any[]) => call[0] === CallToolRequestSchema,
      )[1];

      const result = await callToolHandler({
        params: {
          name: 'ord_create_task',
          arguments: { projectUuid: 'proj-1', title: 'New Feature Task' },
        },
      });

      expect(result.isError).toBeUndefined();
      expect(tasksService.create).toHaveBeenCalledWith(
        'proj-1',
        { title: 'New Feature Task' },
        'int-uuid',
      );
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.message).toBe('Task created successfully');
      expect(parsed.task.uuid).toBe('task-created-1');
    });
  });
});
