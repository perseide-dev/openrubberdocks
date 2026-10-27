import {
    IsNotEmpty,
    IsString,
    IsOptional,
    IsUUID,
    IsInt,
    IsDateString,
    IsObject,
    IsArray,
} from 'class-validator';

export class CreateTaskDto {
    @IsNotEmpty()
    @IsString()
    title: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsUUID()
    statusUuid?: string;

    @IsOptional()
    @IsUUID()
    typeUuid?: string;

    @IsOptional()
    @IsUUID()
    parentTaskUuid?: string;

    @IsOptional()
    @IsInt()
    orderIndex?: number;

    @IsOptional()
    @IsDateString()
    startDate?: string;

    @IsOptional()
    @IsDateString()
    dueDate?: string;

    @IsOptional()
    @IsInt()
    estimatedMinutes?: number;

    @IsOptional()
    @IsObject()
    customProperties?: Record<string, any>;

    @IsOptional()
    @IsArray()
    @IsUUID('4', { each: true })
    assigneeUuids?: string[];
}
