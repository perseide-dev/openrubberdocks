import { IsUUID, IsOptional, IsObject, IsNumber, IsEnum } from 'class-validator';
import { BlockType } from '../enums/block-type.enum';

export class CreateBlockDto {
    @IsUUID()
    page_id: string;

    @IsUUID()
    @IsOptional()
    parent_block_id?: string;

    @IsEnum(BlockType)
    type: BlockType | string;

    @IsObject()
    @IsOptional()
    properties?: Record<string, any>;

    @IsNumber()
    order_index: number;
}
