import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { SupabaseService } from '../supabase/supabase.service'
import type { CreateCourseDto } from './dto/create-course.dto'

@Injectable()
export class CoursesService {
  constructor(private supabase: SupabaseService) {}

  async findAll(filters: { level?: string; modality?: string } = {}) {
    let query = this.supabase.admin
      .from('courses')
      .select('*, teachers(*, profiles(full_name, avatar_url))')
      .in('status', ['active', 'full'])
      .order('starts_at', { ascending: true })

    if (filters.level) query = query.eq('level', filters.level)
    if (filters.modality) query = query.eq('modality', filters.modality)

    const { data, error } = await query
    if (error) throw new BadRequestException(error.message)
    return data
  }

  async findOne(id: string) {
    const { data, error } = await this.supabase.admin
      .from('courses')
      .select('*, teachers(*, profiles(full_name, avatar_url))')
      .eq('id', id)
      .single()

    if (error || !data) throw new NotFoundException(`Course ${id} not found`)
    return data
  }

  async create(dto: CreateCourseDto) {
    const { data, error } = await this.supabase.admin
      .from('courses')
      .insert(dto)
      .select()
      .single()

    if (error) throw new BadRequestException(error.message)
    return data
  }

  async update(id: string, dto: Partial<CreateCourseDto>) {
    const { data, error } = await this.supabase.admin
      .from('courses')
      .update(dto)
      .eq('id', id)
      .select()
      .single()

    if (error) throw new BadRequestException(error.message)
    return data
  }

  async remove(id: string) {
    const { error } = await this.supabase.admin
      .from('courses')
      .update({ status: 'cancelled' })
      .eq('id', id)

    if (error) throw new BadRequestException(error.message)
    return { success: true }
  }

  async enroll(courseId: string) {
    // Check current enrollment count
    const { count } = await this.supabase.admin
      .from('enrollments')
      .select('*', { count: 'exact', head: true })
      .eq('course_id', courseId)
      .eq('status', 'active')

    const course = await this.findOne(courseId)

    const status = (count ?? 0) >= course.capacity ? 'waitlist' : 'active'
    return { status, message: status === 'waitlist' ? 'Added to waitlist' : 'Enrolled successfully' }
  }
}
