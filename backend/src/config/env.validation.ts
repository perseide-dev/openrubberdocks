import { plainToInstance } from 'class-transformer';
import { IsNumber, IsString, IsBoolean, validateSync, IsOptional, MinLength } from 'class-validator';

class EnviromentVariables {
    @IsOptional()
    @IsString()
    NODE_ENV?: string;

    @IsString()
    DB_HOST: string;

    @IsNumber()
    DB_PORT: number;

    @IsString()
    DB_USER: string;

    @IsString()
    DB_PASSWORD: string;

    @IsString()
    DB_NAME: string;

    @IsBoolean()
    DB_SYNCHRONIZE: boolean;

    @IsString()
    @MinLength(16, { message: 'JWT_ACCESS_SECRET must be at least 16 characters long for security' })
    JWT_ACCESS_SECRET: string;

    @IsString()
    @MinLength(16, { message: 'JWT_REFRESH_SECRET must be at least 16 characters long for security' })
    JWT_REFRESH_SECRET: string;

    @IsOptional()
    @IsNumber()
    BCRYPT_SALT_ROUNDS?: number;
}

export function validate(config: Record<string, unknown>) {
    const validateConfig = plainToInstance(
        EnviromentVariables,
        config,
        { enableImplicitConversion: true },
    );
    const errors = validateSync(validateConfig, { skipMissingProperties: false });
    if (errors.length > 0) {
        throw new Error(errors.toString());
    }
    return validateConfig;
}