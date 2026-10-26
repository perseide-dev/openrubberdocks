import { IsNotEmpty, IsOptional, IsPositive, IsString, MaxLength } from 'class-validator';

export class CreateApiKeyDto {
  @IsString()
  @IsNotEmpty({ message: 'The API key name is required' })
  @MaxLength(100, { message: 'The API key name cannot exceed 100 characters' })
  name: string;

  @IsOptional()
  @IsPositive({ message: 'Expiration days must be a positive number' })
  expiresInDays?: number;
}
