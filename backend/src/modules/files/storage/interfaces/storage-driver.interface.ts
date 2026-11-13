import type { Readable } from 'stream';
import type { StorageDriverType } from '@moduleFiles/storage/enums/storage-driver.enum';

export interface StorageStreamResult {
    stream: Readable;
    contentLength?: number;
    contentType?: string;
}

export interface StorageDriverInterface {
    readonly driverType: StorageDriverType;
    putObject(key: string, buffer: Buffer, mimeType: string): Promise<void>;
    getObjectStream(key: string): Promise<StorageStreamResult>;
    deleteObject(key: string): Promise<void>;
}
