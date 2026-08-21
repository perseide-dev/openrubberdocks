import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { validate, dataSourceOptions } from '@config/index';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule, UsersModule } from '@modules/index';

@Module({
  imports: [
    TypeOrmModule.forRoot(dataSourceOptions),
    ConfigModule.forRoot({
      validate,
      isGlobal: true
    }),
    AuthModule,
    UsersModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
