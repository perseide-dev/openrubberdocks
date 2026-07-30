import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { SeederOptions } from 'typeorm-extension';

dotenv.config();

export const dataSourceOptions: DataSourceOptions & SeederOptions = {
    type: 'postgres',
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT || "5432", 10),
    host: process.env.DB_HOST,
    entities: [
        'dist/api/**/*.entity{.ts,.js}',
    ],
    migrations: ['dist/database/migrations/*{.ts,.js}'],
    seeds: ['dist/database/seeds/*{.ts,.js}'],
    factories: ['dist/database/factories/**/*{.ts,.js}'],
    seedTracking: false,
    synchronize: process.env.DB_SYNCHRONIZE === 'true',
    logging: process.env.NODE_ENV === 'development',
    namingStrategy: new SnakeNamingStrategy(),
    cache: true,
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;

dataSource.initialize();