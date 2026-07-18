import { Controller, Post, Get, Patch, Body, UseGuards, Req, HttpCode, ForbiddenException, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { diskStorage } from 'multer'
import { extname } from 'path'
import { randomUUID } from 'crypto'
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger'
import { ThrottlerGuard } from '@nestjs/throttler'
import { AuthGuard } from '@nestjs/passport'
import { ConfigService } from '@nestjs/config'
import { AuthService } from './auth.service'
import { RegisterDto } from './dto/register.dto'
import { LoginDto } from './dto/login.dto'

const UPLOAD_DIR = process.env.UPLOAD_DIR ?? './uploads'

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
  updateProfile(@Req() req: any, @Body() body: { fullName?: string; phone?: string; timezone?: string; language?: string; avatarUrl?: string; bio?: string }) {
    return this.authService.updateProfile(req.user.id, body)
  }

  // ── Profile photo upload ──
  @Post('avatar')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: UPLOAD_DIR,
      filename: (_req, file, cb) => cb(null, `avatar-${randomUUID()}${extname(file.originalname)}`),
    }),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
    fileFilter: (_req, file, cb) => {
      if (/^image\/(png|jpe?g|webp|gif)$/.test(file.mimetype)) cb(null, true)
      else cb(new BadRequestException('Solo se permiten imágenes (png, jpg, webp, gif)'), false)
    },
  }))
  async uploadAvatar(@Req() req: any, @UploadedFile() file: any) {
    if (!file) throw new BadRequestException('No se recibió ninguna imagen')
    const url = `/uploads/${file.filename}`
    await this.authService.updateProfile(req.user.id, { avatarUrl: url })
    return { avatarUrl: url }
  }

  // ── Password reset (emailed code) ──
  @Post('forgot-password')
  @HttpCode(200)
  @UseGuards(ThrottlerGuard)
  forgotPassword(@Body() body: { email: string }) {
    return this.authService.forgotPassword(body.email)
  }

  @Post('reset-password')
  @HttpCode(200)
  @UseGuards(ThrottlerGuard)
  resetPassword(@Body() body: { email: string; code: string; newPassword: string }) {
    return this.authService.resetPassword(body.email, body.code, body.newPassword)
  }

  // ── Email change (code sent to the new address) ──
  @Post('request-email-change')
  @HttpCode(200)
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  requestEmailChange(@Req() req: any, @Body() body: { newEmail: string }) {
    return this.authService.requestEmailChange(req.user.id, body.newEmail)
  }

  @Post('confirm-email-change')
  @HttpCode(200)
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  confirmEmailChange(@Req() req: any, @Body() body: { code: string }) {
    return this.authService.confirmEmailChange(req.user.id, body.code)
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
