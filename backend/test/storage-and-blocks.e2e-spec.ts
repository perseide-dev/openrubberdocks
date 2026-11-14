import { Test, TestingModule } from '@nestjs/testing';
import {
    ExecutionContext,
    INestApplication,
    ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import request from 'supertest';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { StorageController } from '@moduleFiles/storage/controllers/storage.controller';
import { StorageService } from '@moduleFiles/storage/services/storage.service';
import { LocalStorageDriver } from '@moduleFiles/storage/drivers/local-storage.driver';
import { S3StorageDriver } from '@moduleFiles/storage/drivers/s3-storage.driver';
import { StorageAttachment } from '@moduleFiles/storage/entities/storage-attachment.entity';
import { BlocksController } from '@moduleFiles/blocks/controllers/blocks.controller';
import { BlocksService } from '@moduleFiles/blocks/services/blocks.service';
import { Block } from '@moduleFiles/blocks/entities/block.entity';
import { BlockRevision } from '@moduleFiles/blocks/entities/block-revision.entity';
import { BlockType } from '@moduleFiles/blocks/enums/block-type.enum';
import { File } from '@moduleFiles/manager/entities/file.entity';
import { Workspace } from '@moduleWorkspace/entities/workspace.entity';
import { User } from '@moduleUsers/entities/user.entity';
import { AccessControlService } from '@moduleAuthorization/services/access-control.service';
import { PermissionsGuard } from '@commonGuards/permissions.guard';
import { JsonApiExceptionFilter } from '@commonExceptions/json-api-exception.filter';

describe('StorageModule & Rich Blocks (E2E)', () => {
    let app: INestApplication;
    let tempStorageDir: string;
    let currentTestUser: { id: number; uuid: string; type: string; scopes: any[] };
    let permissionResolver: (userOrId: any, action: string, workspaceUuid?: string) => Promise<boolean>;

    const workspaceUuid = '11111111-1111-4111-8111-111111111111';
    const fileUuid = '22222222-2222-4222-8222-222222222222';
    const attachmentsStore: StorageAttachment[] = [];
    const blocksStore: Block[] = [];

    beforeAll(async () => {
        tempStorageDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'ord-e2e-storage-'));

        currentTestUser = {
            id: 1,
            uuid: '33333333-3333-4333-8333-333333333333',
            type: 'internal',
            scopes: [],
        };

        permissionResolver = async (userOrId: any, action: string) => {
            if (currentTestUser.type === 'external' && !action.endsWith(':read')) {
                return false;
            }
            return true;
        };

        const mockAttachmentRepo = {
            find: jest.fn(async ({ where }: any) =>
                attachmentsStore.filter((a) => a.workspaceUuid === where?.workspaceUuid),
            ),
            findOne: jest.fn(async ({ where }: any) =>
                attachmentsStore.find((a) => a.uuid === where?.uuid) ?? null,
            ),
            create: jest.fn((dto: Partial<StorageAttachment>) => ({
                id: attachmentsStore.length + 1,
                createdAt: new Date(),
                updatedAt: new Date(),
                ...dto,
            })),
            save: jest.fn(async (entity: StorageAttachment) => {
                attachmentsStore.push(entity);
                return entity;
            }),
            remove: jest.fn(async (entity: StorageAttachment) => {
                const idx = attachmentsStore.findIndex((a) => a.uuid === entity.uuid);
                if (idx >= 0) attachmentsStore.splice(idx, 1);
            }),
            createQueryBuilder: jest.fn(() => ({
                select: jest.fn().mockReturnThis(),
                addSelect: jest.fn().mockReturnThis(),
                where: jest.fn().mockReturnThis(),
                getRawOne: jest.fn(async () => {
                    const usedBytes = attachmentsStore.reduce(
                        (sum, item) => sum + Number(item.sizeBytes || 0),
                        0,
                    );
                    return {
                        usedBytes: String(usedBytes),
                        count: String(attachmentsStore.length),
                    };
                }),
            })),
        };

        const mockWorkspaceRepo = {
            findOne: jest.fn(async ({ where }: any) => {
                if (where?.uuid === workspaceUuid) {
                    return {
                        id: 10,
                        uuid: workspaceUuid,
                        name: 'E2E Workspace',
                        storageQuotaBytes: 2048, // 2 KB quota for E2E testing
                    };
                }
                return null;
            }),
        };

        const mockFileRepo = {
            findOne: jest.fn(async ({ where }: any) => {
                if (where?.uuid === fileUuid) {
                    return {
                        id: 20,
                        uuid: fileUuid,
                        workspaceId: 10,
                        workspaceUuid,
                        title: 'Architecture Spec',
                    };
                }
                return null;
            }),
        };

        const mockBlockRepo = {
            delete: jest.fn(async () => {
                blocksStore.length = 0;
            }),
            create: jest.fn((item: Partial<Block>) => ({
                id: blocksStore.length + 1,
                uuid: `44444444-4444-4444-8444-${String(blocksStore.length + 1).padStart(12, '0')}`,
                createdAt: new Date(),
                updatedAt: new Date(),
                ...item,
            })),
            save: jest.fn(async (items: Block | Block[]) => {
                if (Array.isArray(items)) {
                    blocksStore.push(...items);
                    return items;
                }
                blocksStore.push(items);
                return items;
            }),
            createQueryBuilder: jest.fn(() => ({
                leftJoinAndSelect: jest.fn().mockReturnThis(),
                where: jest.fn().mockReturnThis(),
                andWhere: jest.fn().mockReturnThis(),
                orderBy: jest.fn().mockReturnThis(),
                getMany: jest.fn(async () => [...blocksStore]),
                getOne: jest.fn(async () => blocksStore[0] ?? null),
            })),
        };

        const moduleFixture: TestingModule = await Test.createTestingModule({
            controllers: [StorageController, BlocksController],
            providers: [
                StorageService,
                LocalStorageDriver,
                S3StorageDriver,
                BlocksService,
                PermissionsGuard,
                {
                    provide: ConfigService,
                    useValue: {
                        get: (key: string) => {
                            if (key === 'STORAGE_DRIVER') return 'local';
                            if (key === 'STORAGE_LOCAL_PATH') return tempStorageDir;
                            if (key === 'STORAGE_DEFAULT_QUOTA_BYTES') return 2048;
                            if (key === 'STORAGE_MAX_FILE_BYTES') return 10240;
                            return undefined;
                        },
                    },
                },
                {
                    provide: AccessControlService,
                    useValue: {
                        hasPermission: jest.fn((userOrId: any, action: string, wsUuid?: string) =>
                            permissionResolver(userOrId, action, wsUuid),
                        ),
                    },
                },
                {
                    provide: getRepositoryToken(StorageAttachment),
                    useValue: mockAttachmentRepo,
                },
                {
                    provide: getRepositoryToken(Workspace),
                    useValue: mockWorkspaceRepo,
                },
                {
                    provide: getRepositoryToken(File),
                    useValue: mockFileRepo,
                },
                {
                    provide: getRepositoryToken(Block),
                    useValue: mockBlockRepo,
                },
                {
                    provide: getRepositoryToken(BlockRevision),
                    useValue: {
                        create: jest.fn((v) => v),
                        save: jest.fn(async (v) => v),
                    },
                },
                {
                    provide: getRepositoryToken(User),
                    useValue: {
                        findOne: jest.fn(async () => ({
                            id: currentTestUser.id,
                            uuid: currentTestUser.uuid,
                        })),
                    },
                },
            ],
        })
            .overrideGuard(AuthGuard('jwt'))
            .useValue({
                canActivate: (ctx: ExecutionContext) => {
                    const req = ctx.switchToHttp().getRequest();
                    req.user = currentTestUser;
                    return true;
                },
            })
            .compile();

        app = moduleFixture.createNestApplication();
        app.useGlobalFilters(new JsonApiExceptionFilter());
        await app.init();
    });

    afterAll(async () => {
        await app.close();
        await fs.promises.rm(tempStorageDir, { recursive: true, force: true });
    });

    it('POST /storage/upload uploads binary, persists to local driver, and returns JSON:API resource', async () => {
        const binaryContent = Buffer.from('FAKE_PNG_IMAGE_BYTES_1234567890');

        const res = await request(app.getHttpServer())
            .post('/storage/upload')
            .field('workspaceUuid', workspaceUuid)
            .field('fileUuid', fileUuid)
            .attach('file', binaryContent, {
                filename: 'diagram.png',
                contentType: 'image/png',
            })
            .expect(201);

        expect(res.body.data).toBeDefined();
        expect(res.body.data.type).toBe('storage-attachments');
        expect(res.body.data.attributes.originalName).toBe('diagram.png');
        expect(res.body.data.attributes.mimeType).toBe('image/png');
        expect(res.body.data.attributes.sizeBytes).toBe(binaryContent.length);
        expect(res.body.data.attributes.driver).toBe('local');
    });

    it('GET /storage/quota/:workspaceUuid returns accurate JSON:API storage-quotas usage', async () => {
        const res = await request(app.getHttpServer())
            .get(`/storage/quota/${workspaceUuid}`)
            .expect(200);

        expect(res.body.data.type).toBe('storage-quotas');
        expect(res.body.data.attributes.usedBytes).toBe(31);
        expect(res.body.data.attributes.quotaBytes).toBe(2048);
        expect(res.body.data.attributes.remainingBytes).toBe(2048 - 31);
        expect(res.body.data.attributes.attachmentCount).toBe(1);
    });

    it('GET /storage/attachments/:uuid/content streams binary with nosniff header', async () => {
        const attachmentUuid = attachmentsStore[0].uuid;

        const res = await request(app.getHttpServer())
            .get(`/storage/attachments/${attachmentUuid}/content`)
            .expect(200);

        expect(res.headers['content-type']).toContain('image/png');
        expect(res.headers['x-content-type-options']).toBe('nosniff');
        expect(res.headers['content-disposition']).toContain('diagram.png');
        expect(Buffer.from(res.body).toString()).toBe('FAKE_PNG_IMAGE_BYTES_1234567890');
    });

    it('POST /storage/upload rejects upload with 413 Payload Too Large when workspace quota is exceeded', async () => {
        const overQuotaBuffer = Buffer.alloc(2040, 'A'); // 31 + 2040 > 2048 quota

        const res = await request(app.getHttpServer())
            .post('/storage/upload')
            .field('workspaceUuid', workspaceUuid)
            .attach('file', overQuotaBuffer, {
                filename: 'overflow.bin',
                contentType: 'application/octet-stream',
            })
            .expect(413);

        expect(res.body.errors).toBeDefined();
        expect(res.body.errors[0].status).toBe('413');
        expect(res.body.errors[0].detail).toContain('quota exceeded');
    });

    it('POST /storage/upload blocks external read-only users with 403 Forbidden (mutation lock)', async () => {
        currentTestUser = {
            id: 2,
            uuid: '99999999-9999-4999-8999-999999999999',
            type: 'external',
            scopes: [],
        };

        const res = await request(app.getHttpServer())
            .post('/storage/upload')
            .field('workspaceUuid', workspaceUuid)
            .attach('file', Buffer.from('tiny'), {
                filename: 'blocked.txt',
                contentType: 'text/plain',
            })
            .expect(403);

        expect(res.body.errors).toBeDefined();
        expect(res.body.errors[0].status).toBe('403');

        // Restore internal user
        currentTestUser = {
            id: 1,
            uuid: '33333333-3333-4333-8333-333333333333',
            type: 'internal',
            scopes: [],
        };
    });

    it('PUT /blocks/file/:fileUuid syncs all 6 expanded BlockType blocks and returns JSON:API collection', async () => {
        const payload = {
            data: {
                type: 'blocks',
                attributes: {
                    blocks: [
                        {
                            type: BlockType.IMAGE,
                            properties: {
                                text: `/storage/attachments/${attachmentsStore[0].uuid}/content`,
                                attachment: {
                                    attachmentUuid: attachmentsStore[0].uuid,
                                    originalName: 'diagram.png',
                                },
                            },
                            orderIndex: 0,
                        },
                        {
                            type: BlockType.FILE_ATTACHMENT,
                            properties: {
                                text: `/storage/attachments/${attachmentsStore[0].uuid}/content`,
                                attachment: {
                                    attachmentUuid: attachmentsStore[0].uuid,
                                    originalName: 'audit.log',
                                },
                            },
                            orderIndex: 1,
                        },
                        {
                            type: BlockType.TABLE,
                            properties: {
                                text: '| Header 1 | Header 2 |\n| --- | --- |\n| Val 1 | Val 2 |',
                                table: {
                                    headers: ['Header 1', 'Header 2'],
                                    rows: [['Val 1', 'Val 2']],
                                },
                            },
                            orderIndex: 2,
                        },
                        {
                            type: BlockType.CALLOUT,
                            properties: {
                                text: 'All tokens must use httpOnly cookies.',
                                calloutVariant: 'WARNING',
                            },
                            orderIndex: 3,
                        },
                        {
                            type: BlockType.MERMAID,
                            properties: {
                                text: 'flowchart LR\n  Client --> API',
                            },
                            orderIndex: 4,
                        },
                        {
                            type: BlockType.OPENAPI_SPEC,
                            properties: {
                                text: 'openapi: 3.0.3\ninfo:\n  title: Storage API\n  version: 1.0.0\npaths: {}',
                            },
                            orderIndex: 5,
                        },
                        {
                            type: BlockType.INTERNAL_LINK,
                            properties: {
                                text: 'Architecture Spec',
                                internalLink: {
                                    targetType: 'document',
                                    targetUuid: fileUuid,
                                    targetTitle: 'Architecture Spec',
                                },
                            },
                            orderIndex: 6,
                        },
                    ],
                },
            },
        };

        const res = await request(app.getHttpServer())
            .put(`/blocks/file/${fileUuid}`)
            .send(payload)
            .expect(200);

        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body.data).toHaveLength(7);
        expect(res.body.data.map((item: any) => item.attributes.type)).toEqual([
            'image',
            'file_attachment',
            'table',
            'callout',
            'mermaid',
            'openapi_spec',
            'internal_link',
        ]);
    });
});
