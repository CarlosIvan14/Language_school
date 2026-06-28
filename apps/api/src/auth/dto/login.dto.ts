import { IsEmail, IsString } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class LoginDto {
  @ApiProperty({ example: 'olena@email.com' })
  @IsEmail()
  email: string

  @ApiProperty()
  @IsString()
  password: string
}
