import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import {
    BadRequestException,
    ForbiddenException,
    NotFoundException,
    PayloadTooLargeException,
} from '@nestjs/common';
import { Readable } from 'stream';
import { StorageService } from '@moduleFiles/storage/services/storage.service';
import { StorageAttachment } from '@moduleFiles/storage/entities/storage-attachment.entity';
import { LocalStorageDriver } from '@moduleFiles/storage/drivers/local-storage.driver';
import { S3StorageDriver } from '@moduleFiles/storage/drivers/s3-storage.driver';
import { StorageDriverType } from '@moduleFiles/storage/enums/storage-driver.enum';
import { Workspace } from '@moduleWorkspace/entities/workspace.entity';
import { User } from '@moduleUsers/entities/user.entity';
import { AccessControlService } from '@moduleAuthorization/services/access-control.service';

describe('StorageService', () => {
    let service: StorageService;
    let attachmentRepository: any;
    let workspaceRepository: any;
    let accessControlService: any;
    let localDriver: any;
    let s3Driver: any;

    const mockWorkspace: Partial<Workspace> = {
        id: 10,
        uuid: 'ws-uuid-123',
        name: 'Test Workspace',
        storageQuotaBytes: 1000,
    };

    const mockUser = {
        id: 1,
        uuid: 'user-uuid-1',
        scopes: [],
    };

    beforeEach(async () => {
        attachmentRepository = {
            find: jest.fn().mockResolvedValue([]),
            findOne: jest.fn(),
            create: jest.fn((val) => ({ ...val, id: 1 })),
            save: jest.fn((val) => Promise.resolve(val)),
            remove: jest.fn().mockResolvedValue(undefined),
            createQueryBuilder: jest.fn(() => ({
                select: jest.fn().mockReturnThis(),
                addSelect: jest.fn().mockReturnThis(),
                where: jest.fn().mockReturnThis(),
                getRawOne: jest.fn().mockResolvedValue({ usedBytes: '200', count: '1' }),
            })),
        };

        workspaceRepository = {
            findOne: jest.fn().mockResolvedValue(mockWorkspace),
        };

        accessControlService = {
            hasPermission: jest.fn().mockResolvedValue(true),
        };

        localDriver = {
            driverType: StorageDriverType.LOCAL,
            putObject: jest.fn().mockResolvedValue(undefined),
            getObjectStream: jest.fn().mockResolvedValue({
                stream: Readable.from(Buffer.from('test')),
                contentLength: 4,
            }),
            deleteObject: jest.fn().mockResolvedValue(undefined),
        };

        s3Driver = {
            driverType: StorageDriverType.S3,
            putObject: jest.fn().mockResolvedValue(undefined),
            getObjectStream: jest.fn(),
            deleteObject: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                StorageService,
                {
                    provide: getRepositoryToken(StorageAttachment),
                    useValue: attachmentRepository,
                },
                {
                    provide: getRepositoryToken(Workspace),
                    useValue: workspaceRepository,
                },
                {
                    provide: getRepositoryToken(User),
                    useValue: { findOne: jest.fn().mockResolvedValue({ id: 1, uuid: 'user-uuid-1' }) },
                },
                {
                    provide: AccessControlService,
                    useValue: accessControlService,
                },
                {
                    provide: ConfigService,
                    useValue: {
                        get: jest.fn((key: string) => {
                            if (key === 'STORAGE_DRIVER') return 'local';
                            if (key === 'STORAGE_DEFAULT_QUOTA_BYTES') return 1000;
                            if (key === 'STORAGE_MAX_FILE_BYTES') return 5000;
                            return undefined;
                        }),
                    },
                },
                {
                    provide: LocalStorageDriver,
                    useValue: localDriver,
                },
                {
                    provide: S3StorageDriver,
                    useValue: s3Driver,
                },
            ],
        }).compile();

        service = module.get<StorageService>(StorageService);
    });

    it('computes workspace quota status accurately', async () => {
        const quota = await service.getWorkspaceQuotaStatus('ws-uuid-123', mockUser);
        expect(quota.usedBytes).toBe(200);
        expect(quota.quotaBytes).toBe(1000);
        expect(quota.remainingBytes).toBe(800);
        expect(quota.usagePercent).toBe(20);
    });

    it('uploads binary using active local driver when within workspace quota', async () => {
        const fakeFile = {
            originalname: 'architecture-diagram.png',
            mimetype: 'image/png',
            size: 500,
            buffer: Buffer.alloc(500),
        } as Express.Multer.File;

        const saved = await service.uploadAttachment(
            fakeFile,
            { workspaceUuid: 'ws-uuid-123', fileUuid: 'file-uuid-1' },
            mockUser,
        );

        expect(localDriver.putObject).toHaveBeenCalledTimes(1);
        expect(saved.workspaceUuid).toBe('ws-uuid-123');
        expect(saved.sizeBytes).toBe(500);
        expect(saved.mimeType).toBe('image/png');
    });

    it('rejects upload with PayloadTooLargeException when workspace quota is exceeded', async () => {
        const fakeFile = {
            originalname: 'huge.bin',
            mimetype: 'application/octet-stream',
            size: 900,
            buffer: Buffer.alloc(900),
        } as Express.Multer.File;

        await expect(
            service.uploadAttachment(
                fakeFile,
                { workspaceUuid: 'ws-uuid-123' },
                mockUser,
            ),
        ).rejects.toThrow(PayloadTooLargeException);
        expect(localDriver.putObject).not.toHaveBeenCalled();
    });

    it('rejects read/stream with ForbiddenException when user lacks workspace document:read permission', async () => {
        attachmentRepository.findOne.mockResolvedValue({
            uuid: 'att-1',
            workspaceUuid: 'ws-uuid-123',
            storageKey: 'workspaces/ws-uuid-123/att-1.png',
            driver: StorageDriverType.LOCAL,
        });
        accessControlService.hasPermission.mockResolvedValue(false);

        await expect(service.getAttachmentWithStream('att-1', mockUser)).rejects.toThrow(
            ForbiddenException,
        );
    });

    it('rejects missing file with BadRequestException and missing attachment with NotFoundException', async () => {
        await expect(
            service.uploadAttachment(undefined, { workspaceUuid: 'ws-uuid-123' }, mockUser),
        ).rejects.toThrow(BadRequestException);

        attachmentRepository.findOne.mockResolvedValue(null);
        await expect(service.getAttachmentWithStream('missing', mockUser)).rejects.toThrow(
            NotFoundException,
        );
    });
});
