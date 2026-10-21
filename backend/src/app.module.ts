import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { validate, dataSourceOptions } from '@config/index';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule, UsersModule, WorkspaceModule } from '@modules/index';
import { AuthorizationModule } from '@moduleAuthorization/authorization.module';
import { FilesModule } from '@moduleFiles/manager/files.module';
import { BlocksModule } from '@moduleFiles/blocks/blocks.module';
import { ProjectsModule } from '@moduleProjects/projects.module';
import { CreateCoreUserCommand } from '@commands/launch.command';

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
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    CreateCoreUserCommand
  ],
})
export class AppModule { }
