import { Module } from '@nestjs/common'
import { SupabaseService } from '../supabase/supabase.service'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'

@Module({
  providers: [SupabaseService, JwtAuthGuard],
  exports: [SupabaseService, JwtAuthGuard],
})
export class AuthModule {}
