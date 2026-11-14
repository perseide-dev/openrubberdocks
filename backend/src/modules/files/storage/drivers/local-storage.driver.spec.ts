import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { LocalStorageDriver } from '@moduleFiles/storage/drivers/local-storage.driver';
import { StorageDriverType } from '@moduleFiles/storage/enums/storage-driver.enum';

describe('LocalStorageDriver', () => {
    let driver: LocalStorageDriver;
    let tempDir: string;

    beforeEach(async () => {
        tempDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'ord-storage-test-'));
        const configService = {
            get: jest.fn((key: string) => {
                if (key === 'STORAGE_LOCAL_PATH') return tempDir;
                return undefined;
            }),
        } as unknown as ConfigService;

        driver = new LocalStorageDriver(configService);
    });

    afterEach(async () => {
        await fs.promises.rm(tempDir, { recursive: true, force: true });
    });

    it('reports driverType as LOCAL', () => {
        expect(driver.driverType).toBe(StorageDriverType.LOCAL);
    });

    it('writes, streams, and deletes binary objects inside rootDir', async () => {
        const key = 'workspaces/ws-1/test-binary.png';
        const payload = Buffer.from('PNG_BINARY_CONTENT_12345');

        await driver.putObject(key, payload, 'image/png');

        const { stream, contentLength } = await driver.getObjectStream(key);
        expect(contentLength).toBe(payload.length);

        const chunks: Buffer[] = [];
        for await (const chunk of stream) {
            chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
        }
        expect(Buffer.concat(chunks).toString()).toBe('PNG_BINARY_CONTENT_12345');

        await driver.deleteObject(key);
        await expect(driver.getObjectStream(key)).rejects.toThrow(NotFoundException);
    });

    it('blocks directory traversal attempts outside rootDir', async () => {
        const maliciousKey = '../../../etc/passwd';
        await expect(
            driver.putObject(maliciousKey, Buffer.from('x'), 'text/plain'),
        ).rejects.toThrow(BadRequestException);
    });
});
