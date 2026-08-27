import { IsUUID, IsOptional, IsNumber } from 'class-validator';

export class MoveBlockDto {
    @IsUUID()
    @IsOptional()
    newParentBlockUuid?: string;

    @IsNumber()
    newOrderIndex: number;
}
