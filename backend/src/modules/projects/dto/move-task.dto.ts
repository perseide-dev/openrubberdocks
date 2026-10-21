import {
    IsNotEmpty,
    IsUUID,
    IsInt,
} from 'class-validator';

export class MoveTaskDto {
    @IsNotEmpty()
    @IsUUID()
    statusUuid: string;

    @IsNotEmpty()
    @IsInt()
    orderIndex: number;
}
