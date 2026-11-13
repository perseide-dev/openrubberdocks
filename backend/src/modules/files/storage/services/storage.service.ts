import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    NotFoundException,
    Optional,
    PayloadTooLargeException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import * as path from 'path';
import { StorageAttachment } from '@moduleFiles/storage/entities/storage-attachment.entity';
import { UploadAttachmentDto } from '@moduleFiles/storage/dto/upload-attachment.dto';
import { StorageDriverType } from '@moduleFiles/storage/enums/storage-driver.enum';
import { LocalStorageDriver } from '@moduleFiles/storage/drivers/local-storage.driver';
import { S3StorageDriver } from '@moduleFiles/storage/drivers/s3-storage.driver';
import type {
    StorageDriverInterface,
    StorageStreamResult,
} from '@moduleFiles/storage/interfaces/storage-driver.interface';
import {
    DEFAULT_MAX_FILE_BYTES,
    DEFAULT_WORKSPACE_QUOTA_BYTES,
    STORAGE_ERRORS_CONSTANTS,
} from '@moduleFiles/storage/constants/storage.constants';
import { Workspace } from '@moduleWorkspace/entities/workspace.entity';
import { User } from '@moduleUsers/entities/user.entity';
import { AccessControlService } from '@moduleAuthorization/services/access-control.service';

export interface WorkspaceStorageQuotaStatus {
    uuid: string;
    workspaceUuid: string;
    driver: StorageDriverType;
    usedBytes: number;
    quotaBytes: number;
    remainingBytes: number;
    usagePercent: number;
    attachmentCount: number;
}

@Injectable()
export class StorageService {
    private readonly activeDriverType: StorageDriverType;
    private readonly defaultQuotaBytes: number;
    private readonly maxFileBytes: number;

    constructor(
        @InjectRepository(StorageAttachment)
        private readonly attachmentRepository: Repository<StorageAttachment>,
        @InjectRepository(Workspace)
        private readonly workspaceRepository: Repository<Workspace>,
        private readonly accessControlService: AccessControlService,
        private readonly configService: ConfigService,
        private readonly localDriver: LocalStorageDriver,
        private readonly s3Driver: S3StorageDriver,
        @Optional()
        @InjectRepository(User)
        private readonly userRepository?: Repository<User>,
    ) {
        const rawDriver = (
            this.configService.get<string>('STORAGE_DRIVER') || StorageDriverType.LOCAL
        )
            .trim()
            .toLowerCase();

        this.activeDriverType =
            rawDriver === StorageDriverType.S3 ? StorageDriverType.S3 : StorageDriverType.LOCAL;

        this.defaultQuotaBytes =
            Number(this.configService.get<number>('STORAGE_DEFAULT_QUOTA_BYTES')) ||
            DEFAULT_WORKSPACE_QUOTA_BYTES;

        this.maxFileBytes =
            Number(this.configService.get<number>('STORAGE_MAX_FILE_BYTES')) ||
            DEFAULT_MAX_FILE_BYTES;
    }

    getDriver(driverType?: StorageDriverType): StorageDriverInterface {
        const target = driverType ?? this.activeDriverType;
        return target === StorageDriverType.S3 ? this.s3Driver : this.localDriver;
    }

    private resolveUserOrId(user: any): any {
        if (!user) return null;
        return Array.isArray(user.scopes) ? user : user.id;
    }

    async assertWorkspaceReadPermission(user: any, workspaceUuid: string): Promise<void> {
        const userOrId = this.resolveUserOrId(user);
        if (!userOrId) {
            throw new ForbiddenException(STORAGE_ERRORS_CONSTANTS.FORBIDDEN_WORKSPACE_READ());
        }
        const canRead = await this.accessControlService.hasPermission(
            userOrId,
            'document:read',
            workspaceUuid,
        );
        if (!canRead) {
            throw new ForbiddenException(STORAGE_ERRORS_CONSTANTS.FORBIDDEN_WORKSPACE_READ());
        }
    }

    async assertWorkspaceWritePermission(user: any, workspaceUuid: string): Promise<void> {
        const userOrId = this.resolveUserOrId(user);
        if (!userOrId) {
            throw new ForbiddenException(STORAGE_ERRORS_CONSTANTS.FORBIDDEN_WORKSPACE_WRITE());
        }
        const canWrite = await this.accessControlService.hasPermission(
            userOrId,
            'document:write',
            workspaceUuid,
        );
        if (!canWrite) {
            throw new ForbiddenException(STORAGE_ERRORS_CONSTANTS.FORBIDDEN_WORKSPACE_WRITE());
        }
    }

    private async computeWorkspaceUsage(
        workspaceUuid: string,
    ): Promise<{ usedBytes: number; count: number }> {
        if (!this.attachmentRepository.createQueryBuilder) {
            const list = await this.attachmentRepository.find({ where: { workspaceUuid } });
            const usedBytes = list.reduce((sum, item) => sum + Number(item.sizeBytes || 0), 0);
            return { usedBytes, count: list.length };
        }

        const raw = await this.attachmentRepository
            .createQueryBuilder('att')
            .select('COALESCE(SUM(att.size_bytes), 0)', 'usedBytes')
            .addSelect('COUNT(att.id)', 'count')
            .where('att.workspace_uuid = :workspaceUuid', { workspaceUuid })
            .getRawOne<{ usedBytes: string; count: string }>();

        return {
            usedBytes: Number(raw?.usedBytes ?? 0),
            count: Number(raw?.count ?? 0),
        };
    }

    async getWorkspaceQuotaStatus(
        workspaceUuid: string,
        user: any,
    ): Promise<WorkspaceStorageQuotaStatus> {
        await this.assertWorkspaceReadPermission(user, workspaceUuid);

        const workspace = await this.workspaceRepository.findOne({
            where: { uuid: workspaceUuid },
        });
        if (!workspace) {
            throw new NotFoundException(STORAGE_ERRORS_CONSTANTS.WORKSPACE_NOT_FOUND());
        }

        const quotaBytes =
            Number(workspace.storageQuotaBytes) > 0
                ? Number(workspace.storageQuotaBytes)
                : this.defaultQuotaBytes;

        const { usedBytes, count } = await this.computeWorkspaceUsage(workspaceUuid);
        const remainingBytes = Math.max(0, quotaBytes - usedBytes);
        const usagePercent =
            quotaBytes > 0 ? Math.min(100, Number(((usedBytes / quotaBytes) * 100).toFixed(2))) : 100;

        return {
            uuid: workspace.uuid,
            workspaceUuid: workspace.uuid,
            driver: this.activeDriverType,
            usedBytes,
            quotaBytes,
            remainingBytes,
            usagePercent,
            attachmentCount: count,
        };
    }

    async uploadAttachment(
        file: Express.Multer.File | undefined,
        dto: UploadAttachmentDto,
        user: any,
    ): Promise<StorageAttachment> {
        if (!file || !file.buffer || file.size === undefined) {
            throw new BadRequestException(STORAGE_ERRORS_CONSTANTS.FILE_REQUIRED());
        }

        await this.assertWorkspaceWritePermission(user, dto.workspaceUuid);

        if (file.size > this.maxFileBytes) {
            throw new PayloadTooLargeException(
                STORAGE_ERRORS_CONSTANTS.FILE_TOO_LARGE(this.maxFileBytes),
            );
        }

        const workspace = await this.workspaceRepository.findOne({
            where: { uuid: dto.workspaceUuid },
        });
        if (!workspace) {
            throw new NotFoundException(STORAGE_ERRORS_CONSTANTS.WORKSPACE_NOT_FOUND());
        }

        const quotaBytes =
            Number(workspace.storageQuotaBytes) > 0
                ? Number(workspace.storageQuotaBytes)
                : this.defaultQuotaBytes;

        const { usedBytes } = await this.computeWorkspaceUsage(dto.workspaceUuid);
        if (usedBytes + file.size > quotaBytes) {
            throw new PayloadTooLargeException(
                STORAGE_ERRORS_CONSTANTS.QUOTA_EXCEEDED(usedBytes + file.size, quotaBytes),
            );
        }

        const safeExt = path
            .extname(file.originalname || '')
            .replace(/[^a-zA-Z0-9.]/g, '')
            .slice(0, 16);
        const objectUuid = crypto.randomUUID();
        const storageKey = `workspaces/${workspace.uuid}/${objectUuid}${safeExt}`;
        const mimeType = file.mimetype || 'application/octet-stream';

        const driver = this.getDriver(this.activeDriverType);
        await driver.putObject(storageKey, file.buffer, mimeType);

        let creator: User | null = null;
        if (this.userRepository && user?.uuid) {
            creator = await this.userRepository.findOne({
                where: { uuid: user.uuid },
            });
        }

        const attachment = this.attachmentRepository.create({
            uuid: objectUuid,
            workspaceId: workspace.id,
            workspaceUuid: workspace.uuid,
            fileUuid: dto.fileUuid ?? null,
            originalName: (file.originalname || 'attachment').slice(0, 255),
            storageKey,
            driver: this.activeDriverType,
            mimeType,
            sizeBytes: file.size,
            createdById: creator?.id ?? user?.id ?? null,
            createdByUuid: user?.uuid ?? null,
        });

        return await this.attachmentRepository.save(attachment);
    }

    async listWorkspaceAttachments(
        workspaceUuid: string,
        user: any,
    ): Promise<StorageAttachment[]> {
        await this.assertWorkspaceReadPermission(user, workspaceUuid);
        return await this.attachmentRepository.find({
            where: { workspaceUuid },
            order: { createdAt: 'DESC' },
        });
    }

    async getAttachmentWithStream(
        uuid: string,
        user: any,
    ): Promise<{ attachment: StorageAttachment; streamResult: StorageStreamResult }> {
        const attachment = await this.attachmentRepository.findOne({
            where: { uuid },
        });
        if (!attachment) {
            throw new NotFoundException(STORAGE_ERRORS_CONSTANTS.ATTACHMENT_NOT_FOUND());
        }

        await this.assertWorkspaceReadPermission(user, attachment.workspaceUuid);

        const driver = this.getDriver(attachment.driver);
        const streamResult = await driver.getObjectStream(attachment.storageKey);

        return { attachment, streamResult };
    }

    async removeAttachment(uuid: string, user: any): Promise<void> {
        const attachment = await this.attachmentRepository.findOne({
            where: { uuid },
        });
        if (!attachment) {
            throw new NotFoundException(STORAGE_ERRORS_CONSTANTS.ATTACHMENT_NOT_FOUND());
        }

        await this.assertWorkspaceWritePermission(user, attachment.workspaceUuid);

        const driver = this.getDriver(attachment.driver);
        await driver.deleteObject(attachment.storageKey);
        await this.attachmentRepository.remove(attachment);
    }
}
