import { plainToInstance } from 'class-transformer';
import { IsNumber, IsString, IsBoolean, validateSync } from 'class-validator';

class EnviromentVariables {
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