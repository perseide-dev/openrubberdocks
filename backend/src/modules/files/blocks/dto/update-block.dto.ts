import { IsOptional, IsObject } from 'class-validator';

export class UpdateBlockDto {
    @IsObject()
    @IsOptional()
    properties?: Record<string, any>;
}
