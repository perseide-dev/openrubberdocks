import {
    IsNotEmpty,
    IsString,
    IsOptional,
    IsEnum,
    IsArray,
    IsInt,
} from 'class-validator';
import type { TaskPropertyType, PropertyOption } from '@moduleProjects/entities/task-property-definition.entity';

export class CreateTaskPropertyDto {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsEnum(['text', 'number', 'select', 'multi_select', 'date', 'checkbox', 'url', 'user'])
    type: TaskPropertyType;

    @IsOptional()
    @IsArray()
    options?: PropertyOption[];

    @IsOptional()
    @IsInt()
    orderIndex?: number;
}
