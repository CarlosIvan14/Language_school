import { IsString, IsEnum, IsInt, IsPositive, IsDateString, IsOptional, Min } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import type { SpanishLevel, CourseModality } from '@language-school/types'

export class CreateCourseDto {
  @ApiProperty({ required: false }) @IsOptional() @IsString() code?: string
  @ApiProperty() @IsString() title: string
  @ApiProperty({ required: false }) @IsOptional() @IsString() description?: string
  @ApiProperty({ enum: ['A1','A2','B1','B2','C1','C2'] }) @IsEnum(['A1','A2','B1','B2','C1','C2']) level: SpanishLevel
  @ApiProperty() @IsString() teacher_id: string
  @ApiProperty({ enum: ['online','in_person','hybrid'] }) @IsEnum(['online','in_person','hybrid']) modality: CourseModality
  @ApiProperty() @IsInt() @IsPositive() capacity: number
  @ApiProperty() @IsInt() @IsPositive() duration_weeks: number
  @ApiProperty() @IsInt() @Min(0) price_cents: number
  @ApiProperty({ required: false }) @IsOptional() @IsString() currency?: string
  @ApiProperty() @IsDateString() starts_at: string
  @ApiProperty({ required: false }) @IsOptional() @IsDateString() ends_at?: string
}
