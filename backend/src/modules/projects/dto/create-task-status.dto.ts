import {
    IsNotEmpty,
    IsString,
    IsOptional,
    IsEnum,
    IsInt,
} from 'class-validator';
import type { TaskStatusCategory } from '@moduleProjects/entities/task-status.entity';

export class CreateTaskStatusDto {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsEnum(['TODO', 'IN_PROGRESS', 'DONE', 'CANCELLED'])
    category: TaskStatusCategory;

    @IsOptional()
    @IsString()
    color?: string;

    @IsOptional()
    @IsInt()
    orderIndex?: number;
}
