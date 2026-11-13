import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import type {
    StorageDriverInterface,
    StorageStreamResult,
} from '@moduleFiles/storage/interfaces/storage-driver.interface';
import { StorageDriverType } from '@moduleFiles/storage/enums/storage-driver.enum';
import {
    DEFAULT_LOCAL_STORAGE_PATH,
    STORAGE_ERRORS_CONSTANTS,
} from '@moduleFiles/storage/constants/storage.constants';

@Injectable()
export class LocalStorageDriver implements StorageDriverInterface {
    readonly driverType = StorageDriverType.LOCAL;
    private readonly rootDir: string;

    constructor(private readonly configService: ConfigService) {
        const configuredPath =
            this.configService.get<string>('STORAGE_LOCAL_PATH') || DEFAULT_LOCAL_STORAGE_PATH;
        this.rootDir = path.resolve(configuredPath);
        if (!fs.existsSync(this.rootDir)) {
            fs.mkdirSync(this.rootDir, { recursive: true });
        }
    }

    private resolveSafePath(key: string): string {
        const sanitizedKey = key.replace(/^[/\\]+/, '');
        const resolved = path.resolve(this.rootDir, sanitizedKey);
        const rootWithSep = this.rootDir.endsWith(path.sep)
            ? this.rootDir
            : `${this.rootDir}${path.sep}`;

        if (resolved !== this.rootDir && !resolved.startsWith(rootWithSep)) {
            throw new BadRequestException(STORAGE_ERRORS_CONSTANTS.INVALID_STORAGE_KEY());
        }
        return resolved;
    }

    async putObject(key: string, buffer: Buffer, _mimeType: string): Promise<void> {
        const targetPath = this.resolveSafePath(key);
        const parentDir = path.dirname(targetPath);
        await fs.promises.mkdir(parentDir, { recursive: true });
        await fs.promises.writeFile(targetPath, buffer);
    }

    async getObjectStream(key: string): Promise<StorageStreamResult> {
        const targetPath = this.resolveSafePath(key);
        try {
            const stat = await fs.promises.stat(targetPath);
            if (!stat.isFile()) {
                throw new NotFoundException(STORAGE_ERRORS_CONSTANTS.ATTACHMENT_NOT_FOUND());
            }
            const stream = fs.createReadStream(targetPath);
            return {
                stream,
                contentLength: stat.size,
            };
        } catch {
            throw new NotFoundException(STORAGE_ERRORS_CONSTANTS.ATTACHMENT_NOT_FOUND());
        }
    }

    async deleteObject(key: string): Promise<void> {
        const targetPath = this.resolveSafePath(key);
        try {
            await fs.promises.unlink(targetPath);
        } catch {
            // Ignore if file already missing on disk
        }
    }
}
