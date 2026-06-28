import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@language-school/types'

@Injectable()
export class SupabaseService {
  private readonly client: SupabaseClient<Database>
  private readonly adminClient: SupabaseClient<Database>

  constructor(private config: ConfigService) {
    this.client = createClient<Database>(
      this.config.getOrThrow('SUPABASE_URL'),
      this.config.getOrThrow('SUPABASE_ANON_KEY')
    )

    // Admin client uses service_role — bypasses RLS for privileged operations
    this.adminClient = createClient<Database>(
      this.config.getOrThrow('SUPABASE_URL'),
      this.config.getOrThrow('SUPABASE_SERVICE_ROLE_KEY'),
      { auth: { autoRefreshToken: false, persistSession: false } }
    )
  }

  get db() {
    return this.client
  }

  get admin() {
    return this.adminClient
  }

  forUser(accessToken: string) {
    return createClient<Database>(
      this.config.getOrThrow('SUPABASE_URL'),
      this.config.getOrThrow('SUPABASE_ANON_KEY'),
      {
        global: { headers: { Authorization: `Bearer ${accessToken}` } },
        auth: { autoRefreshToken: false, persistSession: false },
      }
    )
  }
}
