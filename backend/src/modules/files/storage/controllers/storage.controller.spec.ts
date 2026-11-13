import { Test, TestingModule } from '@nestjs/testing';
import { Readable } from 'stream';
import { StorageController } from '@moduleFiles/storage/controllers/storage.controller';
import { StorageService } from '@moduleFiles/storage/services/storage.service';
import { StorageDriverType } from '@moduleFiles/storage/enums/storage-driver.enum';
import { AccessControlService } from '@moduleAuthorization/services/access-control.service';

describe('StorageController', () => {
    let controller: StorageController;
    let storageService: any;

    beforeEach(async () => {
        storageService = {
            uploadAttachment: jest.fn().mockResolvedValue({
                uuid: 'att-uuid-1',
                workspaceUuid: 'ws-1',
                originalName: 'spec.png',
                mimeType: 'image/png',
                sizeBytes: 1024,
            }),
            getWorkspaceQuotaStatus: jest.fn().mockResolvedValue({
                uuid: 'ws-1',
                workspaceUuid: 'ws-1',
                driver: StorageDriverType.LOCAL,
                usedBytes: 1024,
                quotaBytes: 524288000,
                remainingBytes: 524286976,
                usagePercent: 0,
                attachmentCount: 1,
            }),
            listWorkspaceAttachments: jest.fn().mockResolvedValue([]),
            getAttachmentWithStream: jest.fn().mockResolvedValue({
                attachment: {
                    uuid: 'att-uuid-1',
                    originalName: 'spec.png',
                    mimeType: 'image/png',
                    sizeBytes: 4,
                },
                streamResult: {
                    stream: Readable.from(Buffer.from('data')),
                    contentLength: 4,
                },
            }),
            removeAttachment: jest.fn().mockResolvedValue(undefined),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [StorageController],
            providers: [
                {
                    provide: StorageService,
                    useValue: storageService,
                },
                {
                    provide: AccessControlService,
                    useValue: { hasPermission: jest.fn().mockResolvedValue(true) },
                },
            ],
        }).compile();

        controller = module.get<StorageController>(StorageController);
    });

    it('delegates upload to StorageService', async () => {
        const fakeFile = { originalname: 'spec.png' } as Express.Multer.File;
        const req = { user: { id: 1, uuid: 'u-1' } } as any;
        const result = await controller.upload(fakeFile, { workspaceUuid: 'ws-1' }, req);
        expect(storageService.uploadAttachment).toHaveBeenCalledWith(
            fakeFile,
            { workspaceUuid: 'ws-1' },
            req.user,
        );
        expect(result.uuid).toBe('att-uuid-1');
    });

    it('delegates quota lookup to StorageService', async () => {
        const req = { user: { id: 1, uuid: 'u-1' } } as any;
        const result = await controller.getQuota('ws-1', req);
        expect(storageService.getWorkspaceQuotaStatus).toHaveBeenCalledWith('ws-1', req.user);
        expect(result.workspaceUuid).toBe('ws-1');
    });
});
