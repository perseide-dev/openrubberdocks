import { IsUUID, IsOptional, IsObject, IsNumber, IsEnum } from 'class-validator';
import { BlockType } from '../enums/block-type.enum';

export class CreateBlockDto {
    @IsUUID()
    fileUuid: string;

    @IsUUID()
    @IsOptional()
    parentBlockUuid?: string;

    @IsEnum(BlockType)
    type: BlockType;

    @IsObject()
    @IsOptional()
    properties?: Record<string, any>;

    @IsNumber()
    orderIndex: number;
}
