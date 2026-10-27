import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { validate, dataSourceOptions } from '@config/index';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule, UsersModule, WorkspaceModule, McpModule, AuditModule } from '@modules/index';
import { AuthorizationModule } from '@moduleAuthorization/authorization.module';
import { FilesModule } from '@moduleFiles/manager/files.module';
import { BlocksModule } from '@moduleFiles/blocks/blocks.module';
import { ProjectsModule } from '@moduleProjects/projects.module';
import { CreateCoreUserCommand } from '@commands/launch.command';
import { CreateApiKeyCommand } from '@commands/create-api-key.command';

@Module({
  imports: [
    FilesModule,
    BlocksModule,
    ProjectsModule,
    TypeOrmModule.forRoot(dataSourceOptions),
    ConfigModule.forRoot({
      validate,
      isGlobal: true
    }),
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100,
    }]),
    AuthModule,
    UsersModule,
    WorkspaceModule,
    AuthorizationModule,
    McpModule,
    AuditModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    CreateCoreUserCommand,
    CreateApiKeyCommand,
  ],
})
export class AppModule { }
