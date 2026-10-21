import {
    IsString,
    IsOptional,
    IsUUID,
    IsInt,
    IsDateString,
    IsObject,
    IsArray,
} from 'class-validator';

export class UpdateTaskDto {
    @IsOptional()
    @IsString()
    title?: string;

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
    parentTaskUuid?: string | null;

    @IsOptional()
    @IsInt()
    orderIndex?: number;

    @IsOptional()
    @IsDateString()
    startDate?: string | null;

    @IsOptional()
    @IsDateString()
    dueDate?: string | null;

    @IsOptional()
    @IsInt()
    estimatedMinutes?: number | null;

    @IsOptional()
    @IsObject()
    customProperties?: Record<string, any>;

    @IsOptional()
    @IsArray()
    @IsUUID('4', { each: true })
    assigneeUuids?: string[];
}
