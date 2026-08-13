import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
export class RefreshTokenDto {
    @IsUUID()
    @IsNotEmpty({ message: 'El ID del usuario es requerido' })
    userUUID: string;
    @IsString()
    @IsNotEmpty({ message: 'El refresh token es requerido' })
    refreshToken: string;
}