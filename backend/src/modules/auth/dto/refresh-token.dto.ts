import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
export class RefreshTokenDto {
    @IsUUID()
    @IsNotEmpty({ message: 'User UUID is required' })
    userUUID: string;
    @IsString()
    @IsNotEmpty({ message: 'Refresh token is required' })
    refreshToken: string;
}