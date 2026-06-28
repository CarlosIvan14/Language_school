import { IsEmail, IsString, MinLength, IsEnum, IsOptional } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class RegisterDto {
  @ApiProperty({ example: 'Olena Kovalenko' })
  @IsString()
  fullName: string

  @ApiProperty({ example: 'olena@email.com' })
  @IsEmail()
  email: string

  @ApiProperty({ minLength: 8 })
  @IsString()
  @MinLength(8)
  password: string

  @ApiProperty({ enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'], required: false })
  @IsOptional()
  @IsEnum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2'])
  spanishLevel?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  nativeLanguage?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  timezone?: string

  @ApiProperty({ enum: ['es', 'en', 'uk'], required: false })
  @IsOptional()
  @IsEnum(['es', 'en', 'uk'])
  language?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  phone?: string
}
