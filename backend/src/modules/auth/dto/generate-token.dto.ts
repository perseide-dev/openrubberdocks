import { IsNotEmpty, IsString } from 'class-validator';
export class GenerateTokenDto {
    @IsString()
    @IsNotEmpty({ message: 'The user ID is required' })
    userUUID: string;

    @IsString()
    @IsNotEmpty({ message: 'A unique username is required' })
    rubberHandle: string;
}