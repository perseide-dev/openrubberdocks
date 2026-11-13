import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StorageAttachment } from '@moduleFiles/storage/entities/storage-attachment.entity';
import { LocalStorageDriver } from '@moduleFiles/storage/drivers/local-storage.driver';
import { S3StorageDriver } from '@moduleFiles/storage/drivers/s3-storage.driver';
import { StorageService } from '@moduleFiles/storage/services/storage.service';
import { StorageController } from '@moduleFiles/storage/controllers/storage.controller';
import { Workspace } from '@moduleWorkspace/entities/workspace.entity';
import { User } from '@moduleUsers/entities/user.entity';
import { AuthorizationModule } from '@moduleAuthorization/authorization.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([StorageAttachment, Workspace, User]),
        AuthorizationModule,
    ],
    controllers: [StorageController],
    providers: [LocalStorageDriver, S3StorageDriver, StorageService],
    exports: [StorageService],
})
export class StorageModule {}
