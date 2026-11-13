import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
    S3Client,
    PutObjectCommand,
    GetObjectCommand,
    DeleteObjectCommand,
    HeadBucketCommand,
    CreateBucketCommand,
} from '@aws-sdk/client-s3';
import { Readable } from 'stream';
import type {
    StorageDriverInterface,
    StorageStreamResult,
} from '@moduleFiles/storage/interfaces/storage-driver.interface';
import { StorageDriverType } from '@moduleFiles/storage/enums/storage-driver.enum';
import {
    DEFAULT_S3_BUCKET,
    DEFAULT_S3_REGION,
    STORAGE_ERRORS_CONSTANTS,
} from '@moduleFiles/storage/constants/storage.constants';

@Injectable()
export class S3StorageDriver implements StorageDriverInterface {
    readonly driverType = StorageDriverType.S3;
    private readonly logger = new Logger(S3StorageDriver.name);
    private readonly s3Client: S3Client;
    private readonly bucket: string;
    private bucketVerified = false;

    constructor(private readonly configService: ConfigService) {
        const endpoint = this.configService.get<string>('STORAGE_S3_ENDPOINT');
        const region = this.configService.get<string>('STORAGE_S3_REGION') || DEFAULT_S3_REGION;
        const accessKeyId = this.configService.get<string>('STORAGE_S3_ACCESS_KEY') || '';
        const secretAccessKey = this.configService.get<string>('STORAGE_S3_SECRET_KEY') || '';
        const forcePathStyleConfig = this.configService.get<boolean>('STORAGE_S3_FORCE_PATH_STYLE');

        // Default forcePathStyle to true when a custom endpoint (RustFS / S3-compatible) is provided
        const forcePathStyle =
            forcePathStyleConfig !== undefined ? Boolean(forcePathStyleConfig) : Boolean(endpoint);

        this.bucket = this.configService.get<string>('STORAGE_S3_BUCKET') || DEFAULT_S3_BUCKET;

        this.s3Client = new S3Client({
            region,
            ...(endpoint ? { endpoint } : {}),
            forcePathStyle,
            ...(accessKeyId && secretAccessKey
                ? {
                      credentials: {
                          accessKeyId,
                          secretAccessKey,
                      },
                  }
                : {}),
        });
    }

    private async ensureBucketExists(): Promise<void> {
        if (this.bucketVerified) return;
        try {
            await this.s3Client.send(new HeadBucketCommand({ Bucket: this.bucket }));
            this.bucketVerified = true;
        } catch {
            try {
                await this.s3Client.send(new CreateBucketCommand({ Bucket: this.bucket }));
                this.bucketVerified = true;
            } catch (createErr) {
                this.logger.warn(
                    `Could not auto-create S3/RustFS bucket "${this.bucket}": ${
                        createErr instanceof Error ? createErr.message : String(createErr)
                    }`,
                );
            }
        }
    }

    async putObject(key: string, buffer: Buffer, mimeType: string): Promise<void> {
        await this.ensureBucketExists();
        await this.s3Client.send(
            new PutObjectCommand({
                Bucket: this.bucket,
                Key: key,
                Body: buffer,
                ContentType: mimeType,
                ContentLength: buffer.length,
            }),
        );
    }

    async getObjectStream(key: string): Promise<StorageStreamResult> {
        try {
            const response = await this.s3Client.send(
                new GetObjectCommand({
                    Bucket: this.bucket,
                    Key: key,
                }),
            );
            if (!response.Body) {
                throw new NotFoundException(STORAGE_ERRORS_CONSTANTS.ATTACHMENT_NOT_FOUND());
            }

            const stream =
                response.Body instanceof Readable
                    ? response.Body
                    : Readable.from(response.Body as AsyncIterable<Uint8Array>);

            return {
                stream,
                contentLength: response.ContentLength,
                contentType: response.ContentType,
            };
        } catch {
            throw new NotFoundException(STORAGE_ERRORS_CONSTANTS.ATTACHMENT_NOT_FOUND());
        }
    }

    async deleteObject(key: string): Promise<void> {
        try {
            await this.s3Client.send(
                new DeleteObjectCommand({
                    Bucket: this.bucket,
                    Key: key,
                }),
            );
        } catch {
            // Non-fatal if object was already deleted
        }
    }
}
