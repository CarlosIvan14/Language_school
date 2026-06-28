import { Controller, Post, Get, Patch, Body, UseGuards, Req, HttpCode, ForbiddenException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger'
import { ThrottlerGuard } from '@nestjs/throttler'
import { AuthGuard } from '@nestjs/passport'
import { AuthService } from './auth.service'
import { RegisterDto } from './dto/register.dto'
import { LoginDto } from './dto/login.dto'

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly config: ConfigService,
  ) {}

  @Post('register')
  @UseGuards(ThrottlerGuard)
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto)
  }

  @Post('login')
  @HttpCode(200)
  @UseGuards(ThrottlerGuard)
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto)
  }

  @Post('refresh')
  @HttpCode(200)
  refresh(@Body() body: { userId: string; refreshToken: string }) {
    return this.authService.refresh(body.userId, body.refreshToken)
  }

  @Post('logout')
  @HttpCode(200)
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  logout(@Req() req: any) {
    return this.authService.logout(req.user.id)
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  me(@Req() req: any) {
    return this.authService.me(req.user.id)
  }

  @Patch('profile')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  updateProfile(@Req() req: any, @Body() body: { fullName?: string; phone?: string; timezone?: string; language?: string; avatarUrl?: string }) {
    return this.authService.updateProfile(req.user.id, body)
  }

  @Post('make-admin')
  @HttpCode(200)
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  async makeAdmin(@Req() req: any, @Body() body: { secret: string }) {
    const expected = this.config.get<string>('ADMIN_SETUP_SECRET')
    if (!expected || body.secret !== expected) throw new ForbiddenException('Invalid secret')
    return this.authService.updateProfile(req.user.id, {} as any, 'admin')
  }
}
