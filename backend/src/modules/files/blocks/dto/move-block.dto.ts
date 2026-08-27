import { IsUUID, IsOptional, IsNumber } from 'class-validator';

export class MoveBlockDto {
    @IsUUID()
    @IsOptional()
    new_parent_block_id?: string;

    @IsNumber()
    new_order_index: number;
}
