import { IsString, IsEmail, MinLength, IsOptional, IsArray, IsEnum, IsNumber, Min, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'
import { ApiProperty } from '@nestjs/swagger'
import type { SpanishLevel } from '@language-school/types'

export class CreateTeacherDto {
  @ApiProperty() @IsString() fullName: string
  @ApiProperty() @IsEmail() email: string
  @ApiProperty() @IsString() @MinLength(6) password: string
  @ApiProperty({ required: false, isArray: true, enum: ['A1','A2','B1','B2','C1','C2'] })
  @IsOptional() @IsArray() @IsEnum(['A1','A2','B1','B2','C1','C2'], { each: true })
  specialties?: SpanishLevel[]
  @ApiProperty({ required: false }) @IsOptional() @IsString() bio?: string
  @ApiProperty({ required: false }) @IsOptional() @IsString() zoomLink?: string
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() @Min(0) hourlyRate?: number
}

export class AvailabilitySlotDto {
  @ApiProperty() @IsNumber() weekday: number   // 0=Sun .. 6=Sat
  @ApiProperty() @IsNumber() startMin: number  // minutes from midnight
  @ApiProperty() @IsNumber() endMin: number
}

export class SetAvailabilityDto {
  @ApiProperty({ type: [AvailabilitySlotDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AvailabilitySlotDto)
  slots: AvailabilitySlotDto[]
}
