import {
    IsNotEmpty,
    IsUUID,
} from 'class-validator';

export class LinkProjectFileDto {
    @IsNotEmpty()
    @IsUUID()
    fileUuid: string;
}
