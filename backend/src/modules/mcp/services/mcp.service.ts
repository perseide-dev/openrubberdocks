import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
  ErrorCode,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import type { Request, Response } from 'express';
import { WorkspaceService } from '@moduleWorkspace/services/workspace.service';
import { ProjectsService } from '@moduleProjects/services/projects.service';
import { TasksService } from '@moduleProjects/services/tasks.service';
import { TaskTimeLogsService } from '@moduleProjects/services/task-time-logs.service';
import { User } from '@moduleUsers/entities/user.entity';
import { UserType } from '@moduleUsers/enums/users.enum';

interface McpSession {
  sessionId: string;
  transport: SSEServerTransport;
  server: Server;
  user: User;
}

@Injectable()
export class McpService {
  private readonly logger = new Logger(McpService.name);
  private readonly sessions = new Map<string, McpSession>();

  constructor(
    private readonly workspaceService: WorkspaceService,
    private readonly projectsService: ProjectsService,
    private readonly tasksService: TasksService,
    private readonly taskTimeLogsService: TaskTimeLogsService,
  ) {}

  async handleSseConnection(req: Request, res: Response, user: User): Promise<void> {
    const server = new Server(
      {
        name: 'openrubberdocks-mcp',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      },
    );

    this.setupToolHandlers(server, user);

    const transport = new SSEServerTransport('/mcp/messages', res);
    const sessionId = transport.sessionId;

    this.sessions.set(sessionId, {
      sessionId,
      transport,
      server,
      user,
    });

    transport.onclose = () => {
      this.logger.log(`MCP session closed: ${sessionId} for user @${user.rubberHandle}`);
      this.sessions.delete(sessionId);
    };

    transport.onerror = (error) => {
      this.logger.error(`MCP transport error for session ${sessionId}:`, error);
    };

    await server.connect(transport);
    this.logger.log(`MCP session established: ${sessionId} for user @${user.rubberHandle}`);
  }

  async handlePostMessage(sessionId: string, req: Request, res: Response): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new NotFoundException(`MCP session ${sessionId} not found`);
    }

    await session.transport.handlePostMessage(req, res, req.body);
  }

  private setupToolHandlers(server: Server, user: User): void {
    server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'ord_list_workspaces',
            description: 'List all workspaces accessible by the authenticated user.',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
          {
            name: 'ord_list_projects',
            description: 'List all projects within a specified workspace.',
            inputSchema: {
              type: 'object',
              properties: {
                workspaceUuid: {
                  type: 'string',
                  description: 'The UUID of the workspace.',
                },
              },
              required: ['workspaceUuid'],
            },
          },
          {
            name: 'ord_list_tasks',
            description: 'List all tasks in a project.',
            inputSchema: {
              type: 'object',
              properties: {
                projectUuid: {
                  type: 'string',
                  description: 'The UUID of the project.',
                },
              },
              required: ['projectUuid'],
            },
          },
          {
            name: 'ord_get_task_details',
            description: 'Retrieve detailed information about a task, including time logs, subtasks, and custom properties.',
            inputSchema: {
              type: 'object',
              properties: {
                taskUuid: {
                  type: 'string',
                  description: 'The UUID of the task.',
                },
              },
              required: ['taskUuid'],
            },
          },
          {
            name: 'ord_create_task',
            description: 'Create a new task within a project. (Subject to scoped RBAC; blocked for external users).',
            inputSchema: {
              type: 'object',
              properties: {
                projectUuid: {
                  type: 'string',
                  description: 'The UUID of the project.',
                },
                title: {
                  type: 'string',
                  description: 'The title of the task.',
                },
                description: {
                  type: 'string',
                  description: 'Optional description of the task.',
                },
                statusUuid: {
                  type: 'string',
                  description: 'Optional UUID of the task status.',
                },
                typeUuid: {
                  type: 'string',
                  description: 'Optional UUID of the task type.',
                },
                estimatedMinutes: {
                  type: 'number',
                  description: 'Estimated minutes for task completion.',
                },
                dueDate: {
                  type: 'string',
                  description: 'Due date in ISO 8601 format (e.g. 2026-12-31T23:59:59Z).',
                },
              },
              required: ['projectUuid', 'title'],
            },
          },
          {
            name: 'ord_update_task',
            description: 'Update an existing task title, description, status, or dates. (Blocked for external users).',
            inputSchema: {
              type: 'object',
              properties: {
                taskUuid: {
                  type: 'string',
                  description: 'The UUID of the task to update.',
                },
                title: {
                  type: 'string',
                  description: 'Updated title.',
                },
                description: {
                  type: 'string',
                  description: 'Updated description.',
                },
                statusUuid: {
                  type: 'string',
                  description: 'Updated status UUID.',
                },
                typeUuid: {
                  type: 'string',
                  description: 'Updated type UUID.',
                },
                dueDate: {
                  type: 'string',
                  description: 'Updated due date in ISO 8601 format.',
                },
                estimatedMinutes: {
                  type: 'number',
                  description: 'Updated estimated minutes.',
                },
              },
              required: ['taskUuid'],
            },
          },
          {
            name: 'ord_log_task_time',
            description: 'Record logged work time on a task. (Blocked for external users).',
            inputSchema: {
              type: 'object',
              properties: {
                taskUuid: {
                  type: 'string',
                  description: 'The UUID of the task.',
                },
                minutes: {
                  type: 'number',
                  description: 'Time spent in minutes.',
                },
                description: {
                  type: 'string',
                  description: 'Optional summary of work done.',
                },
                date: {
                  type: 'string',
                  description: 'Optional log date in ISO 8601 format.',
                },
              },
              required: ['taskUuid', 'minutes'],
            },
          },
        ],
      };
    });

    server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'ord_list_workspaces': {
            const workspaces = await this.workspaceService.findAll({}, user);
            const formatted = workspaces.map((w) => ({
              uuid: w.uuid,
              name: w.name,
              description: w.description,
              createdAt: w.createdAt,
            }));
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(formatted, null, 2),
                },
              ],
            };
          }

          case 'ord_list_projects': {
            if (!user.canViewProjects) {
              throw new ForbiddenException('User is not authorized to view projects');
            }
            const workspaceUuid = String(args?.workspaceUuid || '');
            if (!workspaceUuid) {
              throw new McpError(ErrorCode.InvalidParams, 'workspaceUuid is required');
            }
            const projects = await this.projectsService.findAll(workspaceUuid);
            const formatted = projects.map((p) => ({
              uuid: p.uuid,
              name: p.name,
              description: p.description,
              color: p.color,
              startDate: p.startDate,
              targetDate: p.targetDate,
            }));
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(formatted, null, 2),
                },
              ],
            };
          }

          case 'ord_list_tasks': {
            if (!user.canViewProjects) {
              throw new ForbiddenException('User is not authorized to view projects');
            }
            const projectUuid = String(args?.projectUuid || '');
            if (!projectUuid) {
              throw new McpError(ErrorCode.InvalidParams, 'projectUuid is required');
            }
            const tasks = await this.tasksService.findAll(projectUuid);
            const formatted = tasks.map((t) => ({
              uuid: t.uuid,
              title: t.title,
              status: t.status ? { uuid: t.status.uuid, name: t.status.name, category: t.status.category } : null,
              type: t.type ? { uuid: t.type.uuid, name: t.type.name } : null,
              assignees: t.assignees?.map((a) => ({ uuid: a.uuid, username: a.username, rubberHandle: a.rubberHandle })),
              orderIndex: t.orderIndex,
              dueDate: t.dueDate,
              estimatedMinutes: t.estimatedMinutes,
            }));
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(formatted, null, 2),
                },
              ],
            };
          }

          case 'ord_get_task_details': {
            if (!user.canViewProjects) {
              throw new ForbiddenException('User is not authorized to view projects');
            }
            const taskUuid = String(args?.taskUuid || '');
            if (!taskUuid) {
              throw new McpError(ErrorCode.InvalidParams, 'taskUuid is required');
            }
            const task = await this.tasksService.findOne(taskUuid);
            const timeLogs = await this.taskTimeLogsService.findAll(taskUuid);
            const totalLoggedMinutes = timeLogs.reduce((sum, l) => sum + (l.minutes || 0), 0);

            const details = {
              uuid: task.uuid,
              title: task.title,
              description: task.description,
              status: task.status ? { uuid: task.status.uuid, name: task.status.name, category: task.status.category } : null,
              type: task.type ? { uuid: task.type.uuid, name: task.type.name } : null,
              projectUuid: task.projectUuid,
              orderIndex: task.orderIndex,
              startDate: task.startDate,
              dueDate: task.dueDate,
              estimatedMinutes: task.estimatedMinutes,
              customProperties: task.customProperties,
              assignees: task.assignees?.map((a) => ({ uuid: a.uuid, username: a.username, rubberHandle: a.rubberHandle })),
              subtasks: task.subtasks?.map((st) => ({ uuid: st.uuid, title: st.title, status: st.status?.name })),
              timeLogs: timeLogs.map((tl) => ({
                uuid: tl.uuid,
                minutes: tl.minutes,
                description: tl.description,
                date: tl.date,
                loggedBy: tl.user ? `@${tl.user.rubberHandle}` : null,
              })),
              totalLoggedMinutes,
            };

            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(details, null, 2),
                },
              ],
            };
          }

          case 'ord_create_task': {
            if (user.type === UserType.EXTERNAL) {
              throw new ForbiddenException(
                'External users have an engine-level mutation lock and cannot create tasks.',
              );
            }
            const projectUuid = String(args?.projectUuid || '');
            const title = String(args?.title || '');
            if (!projectUuid || !title) {
              throw new McpError(ErrorCode.InvalidParams, 'projectUuid and title are required');
            }

            const created = await this.tasksService.create(
              projectUuid,
              {
                title,
                description: args?.description ? String(args.description) : undefined,
                statusUuid: args?.statusUuid ? String(args.statusUuid) : undefined,
                typeUuid: args?.typeUuid ? String(args.typeUuid) : undefined,
                dueDate: args?.dueDate ? String(args.dueDate) : undefined,
                estimatedMinutes: typeof args?.estimatedMinutes === 'number' ? args.estimatedMinutes : undefined,
              },
              user.uuid,
            );

            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(
                    {
                      message: 'Task created successfully',
                      task: {
                        uuid: created.uuid,
                        title: created.title,
                        status: created.status?.name,
                        type: created.type?.name,
                      },
                    },
                    null,
                    2,
                  ),
                },
              ],
            };
          }

          case 'ord_update_task': {
            if (user.type === UserType.EXTERNAL) {
              throw new ForbiddenException(
                'External users have an engine-level mutation lock and cannot modify tasks.',
              );
            }
            const taskUuid = String(args?.taskUuid || '');
            if (!taskUuid) {
              throw new McpError(ErrorCode.InvalidParams, 'taskUuid is required');
            }

            const updated = await this.tasksService.update(taskUuid, {
              title: args?.title !== undefined ? String(args.title) : undefined,
              description: args?.description !== undefined ? String(args.description) : undefined,
              statusUuid: args?.statusUuid !== undefined ? String(args.statusUuid) : undefined,
              typeUuid: args?.typeUuid !== undefined ? String(args.typeUuid) : undefined,
              dueDate: args?.dueDate !== undefined ? String(args.dueDate) : undefined,
              estimatedMinutes: typeof args?.estimatedMinutes === 'number' ? args.estimatedMinutes : undefined,
            });

            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(
                    {
                      message: 'Task updated successfully',
                      task: {
                        uuid: updated.uuid,
                        title: updated.title,
                        status: updated.status?.name,
                        type: updated.type?.name,
                      },
                    },
                    null,
                    2,
                  ),
                },
              ],
            };
          }

          case 'ord_log_task_time': {
            if (user.type === UserType.EXTERNAL) {
              throw new ForbiddenException(
                'External users have an engine-level mutation lock and cannot log time.',
              );
            }
            const taskUuid = String(args?.taskUuid || '');
            const minutes = Number(args?.minutes);
            if (!taskUuid || !minutes || isNaN(minutes) || minutes <= 0) {
              throw new McpError(ErrorCode.InvalidParams, 'taskUuid and a positive minutes value are required');
            }

            const logged = await this.taskTimeLogsService.create(
              taskUuid,
              {
                minutes,
                description: args?.description ? String(args.description) : undefined,
                date: args?.date ? String(args.date) : undefined,
              },
              user.uuid,
            );

            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(
                    {
                      message: 'Time logged successfully',
                      log: {
                        uuid: logged.uuid,
                        minutes: logged.minutes,
                        date: logged.date,
                        description: logged.description,
                      },
                    },
                    null,
                    2,
                  ),
                },
              ],
            };
          }

          default:
            throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
        }
      } catch (err: any) {
        this.logger.error(`Error executing tool ${name}:`, err);
        return {
          isError: true,
          content: [
            {
              type: 'text',
              text: `Error executing tool '${name}': ${err.message || String(err)}`,
            },
          ],
        };
      }
    });
  }
}
