import { NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Readable } from 'stream';
import { S3StorageDriver } from '@moduleFiles/storage/drivers/s3-storage.driver';
import { StorageDriverType } from '@moduleFiles/storage/enums/storage-driver.enum';

const sendMock = jest.fn();

jest.mock('@aws-sdk/client-s3', () => {
    return {
        S3Client: jest.fn().mockImplementation(() => ({
            send: (...args: any[]) => sendMock(...args),
        })),
        HeadBucketCommand: jest.fn().mockImplementation((input) => ({ __cmd: 'HeadBucket', input })),
        CreateBucketCommand: jest.fn().mockImplementation((input) => ({ __cmd: 'CreateBucket', input })),
        PutObjectCommand: jest.fn().mockImplementation((input) => ({ __cmd: 'PutObject', input })),
        GetObjectCommand: jest.fn().mockImplementation((input) => ({ __cmd: 'GetObject', input })),
        DeleteObjectCommand: jest.fn().mockImplementation((input) => ({ __cmd: 'DeleteObject', input })),
    };
});

describe('S3StorageDriver (RustFS & AWS S3 compatibility)', () => {
    let driver: S3StorageDriver;

    beforeEach(() => {
        sendMock.mockReset();
        const configService = {
            get: jest.fn((key: string) => {
                const map: Record<string, any> = {
                    STORAGE_S3_ENDPOINT: 'http://rustfs:9000',
                    STORAGE_S3_REGION: 'us-east-1',
                    STORAGE_S3_BUCKET: 'ord-bucket',
                    STORAGE_S3_ACCESS_KEY: 'rustfsadmin',
                    STORAGE_S3_SECRET_KEY: 'rustfssecret',
                    STORAGE_S3_FORCE_PATH_STYLE: true,
                };
                return map[key];
            }),
        } as unknown as ConfigService;

        driver = new S3StorageDriver(configService);
    });

    it('reports driverType as S3', () => {
        expect(driver.driverType).toBe(StorageDriverType.S3);
    });

    it('verifies bucket and uploads object via PutObjectCommand', async () => {
        sendMock.mockResolvedValue({});
        const buf = Buffer.from('SPEC_DATA');

        await driver.putObject('workspaces/ws-1/spec.yaml', buf, 'application/yaml');

        expect(sendMock).toHaveBeenCalledTimes(2);
        expect(sendMock.mock.calls[0][0]).toEqual({
            __cmd: 'HeadBucket',
            input: { Bucket: 'ord-bucket' },
        });
        expect(sendMock.mock.calls[1][0]).toEqual({
            __cmd: 'PutObject',
            input: {
                Bucket: 'ord-bucket',
                Key: 'workspaces/ws-1/spec.yaml',
                Body: buf,
                ContentType: 'application/yaml',
                ContentLength: buf.length,
            },
        });
    });

    it('auto-creates bucket when HeadBucketCommand fails on fresh RustFS instance', async () => {
        sendMock
            .mockRejectedValueOnce(new Error('NotFound'))
            .mockResolvedValueOnce({})
            .mockResolvedValueOnce({});

        await driver.putObject('workspaces/ws-1/a.bin', Buffer.from('123'), 'application/octet-stream');

        expect(sendMock.mock.calls[0][0].__cmd).toBe('HeadBucket');
        expect(sendMock.mock.calls[1][0].__cmd).toBe('CreateBucket');
        expect(sendMock.mock.calls[2][0].__cmd).toBe('PutObject');
    });

    it('streams object from GetObjectCommand and throws NotFoundException on error', async () => {
        sendMock.mockResolvedValueOnce({
            Body: Readable.from(Buffer.from('STREAM_OK')),
            ContentLength: 9,
            ContentType: 'text/plain',
        });

        const res = await driver.getObjectStream('workspaces/ws-1/doc.txt');
        expect(res.contentLength).toBe(9);
        expect(res.contentType).toBe('text/plain');

        sendMock.mockRejectedValueOnce(new Error('NoSuchKey'));
        await expect(driver.getObjectStream('missing')).rejects.toThrow(NotFoundException);
    });

    it('deletes object via DeleteObjectCommand', async () => {
        sendMock.mockResolvedValueOnce({});
        await driver.deleteObject('workspaces/ws-1/doc.txt');
        expect(sendMock).toHaveBeenCalledWith({
            __cmd: 'DeleteObject',
            input: { Bucket: 'ord-bucket', Key: 'workspaces/ws-1/doc.txt' },
        });
    });
});
