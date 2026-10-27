import {
  IsArray,
  IsEnum,
  IsNumber,
  IsObject,
  IsOptional,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { BlockType } from '@moduleFiles/blocks/enums/block-type.enum';

export class SyncBlockItemDto {
  @IsEnum(BlockType)
  type: BlockType;

  @IsObject()
  @IsOptional()
  properties?: Record<string, any>;

  @IsNumber()
  @IsOptional()
  orderIndex?: number;

  @IsUUID()
  @IsOptional()
  parentBlockUuid?: string;
}

export class SyncBlocksDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SyncBlockItemDto)
  blocks: SyncBlockItemDto[];
}
