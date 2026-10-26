import { PartialType } from '@nestjs/mapped-types';
import { CreateWorkspaceDto } from '@moduleWorkspace/dto/create-workspace.dto';

export class UpdateWorkspaceDto extends PartialType(CreateWorkspaceDto) {}
