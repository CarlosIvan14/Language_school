import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import * as bcrypt from 'bcryptjs'
import { PrismaService } from '../prisma/prisma.service'
import { EmailService } from '../email/email.service'
import type { RegisterDto } from './dto/register.dto'
import type { LoginDto } from './dto/login.dto'

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
    private email: EmailService,
  ) {}

  private genCode() {
    return String(Math.floor(100000 + Math.random() * 900000)) // 6 digits
  }

  // ── Password reset via emailed code ──
  async forgotPassword(rawEmail: string) {
    const email = rawEmail.trim().toLowerCase()
    const user = await this.prisma.user.findUnique({ where: { email } })
    // Always respond ok — don't reveal whether the email exists
    if (user) {
      const code = this.genCode()
      await this.prisma.verificationCode.create({
        data: {
          userId: user.id,
          type: 'password_reset',
          code,
          expiresAt: new Date(Date.now() + 15 * 60_000),
        },
      })
      await this.email.sendPasswordResetCode(email, code)
    }
    return { ok: true }
  }

  async resetPassword(rawEmail: string, code: string, newPassword: string) {
    if (!newPassword || newPassword.length < 6) throw new BadRequestException('La contraseña debe tener al menos 6 caracteres')
    const email = rawEmail.trim().toLowerCase()
    const user = await this.prisma.user.findUnique({ where: { email } })
    if (!user) throw new BadRequestException('Código o correo inválido')

    const record = await this.prisma.verificationCode.findFirst({
      where: { userId: user.id, type: 'password_reset', code, usedAt: null, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' },
    })
    if (!record) throw new BadRequestException('Código inválido o expirado')

    const passwordHash = await bcrypt.hash(newPassword, 12)
    await this.prisma.$transaction([
      this.prisma.user.update({ where: { id: user.id }, data: { passwordHash, refreshToken: null } }),
      this.prisma.verificationCode.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
    ])
    return { ok: true }
  }

  // ── Email change via emailed code (sent to the NEW address) ──
  async requestEmailChange(userId: string, rawNewEmail: string) {
    const newEmail = rawNewEmail.trim().toLowerCase()
    if (!newEmail.includes('@')) throw new BadRequestException('Correo inválido')
    const taken = await this.prisma.user.findUnique({ where: { email: newEmail } })
    if (taken) throw new ConflictException('Ese correo ya está en uso')

    const code = this.genCode()
    await this.prisma.verificationCode.create({
      data: {
        userId,
        type: 'email_change',
        code,
        newEmail,
        expiresAt: new Date(Date.now() + 15 * 60_000),
      },
    })
    await this.email.sendEmailChangeCode(newEmail, code)
    return { ok: true }
  }

  async confirmEmailChange(userId: string, code: string) {
    const record = await this.prisma.verificationCode.findFirst({
      where: { userId, type: 'email_change', code, usedAt: null, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' },
    })
    if (!record?.newEmail) throw new BadRequestException('Código inválido o expirado')

    const stillFree = await this.prisma.user.findUnique({ where: { email: record.newEmail } })
    if (stillFree) throw new ConflictException('Ese correo ya está en uso')

    const updated = await this.prisma.$transaction(async tx => {
      await tx.verificationCode.update({ where: { id: record.id }, data: { usedAt: new Date() } })
      return tx.user.update({
        where: { id: userId },
        data: { email: record.newEmail! },
        select: { id: true, email: true, role: true, fullName: true },
      })
    })
    return updated
  }

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } })
    if (existing) throw new ConflictException('Email already registered')

    const passwordHash = await bcrypt.hash(dto.password, 12)

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        fullName: dto.fullName,
        timezone: dto.timezone ?? 'UTC',
        language: (dto.language as any) ?? 'es',
        phone: dto.phone,
        role: 'student',
        student: {
          create: {
            nativeLanguage: dto.nativeLanguage ?? 'en',
            spanishLevel: (dto.spanishLevel as any) ?? 'A1',
          },
        },
      },
      select: { id: true, email: true, role: true, fullName: true },
    })

    return this.issueTokens(user)
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } })
    if (!user) throw new UnauthorizedException('Invalid credentials')

    const valid = await bcrypt.compare(dto.password, user.passwordHash)
    if (!valid) throw new UnauthorizedException('Invalid credentials')

    return this.issueTokens({ id: user.id, email: user.email, role: user.role, fullName: user.fullName })
  }

  async refresh(userId: string, refreshToken: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } })
    if (!user?.refreshToken) throw new UnauthorizedException()

    const valid = await bcrypt.compare(refreshToken, user.refreshToken)
    if (!valid) throw new UnauthorizedException()

    return this.issueTokens({ id: user.id, email: user.email, role: user.role, fullName: user.fullName })
  }

  async logout(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    })
  }

  async me(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true, email: true, role: true, fullName: true,
        avatarUrl: true, bio: true, phone: true, timezone: true, language: true,
        student: { select: { id: true, spanishLevel: true, nativeLanguage: true } },
        teacher: { select: { id: true, specialties: true, bio: true, zoomLink: true } },
      },
    })
  }

  private async issueTokens(user: { id: string; email: string; role: string; fullName: string }) {
    const payload = { sub: user.id, email: user.email, role: user.role }

    const accessToken = this.jwt.sign(payload, {
      secret: this.config.getOrThrow('JWT_SECRET'),
      expiresIn: this.config.get('JWT_EXPIRES_IN', '15m'),
    })

    const refreshToken = this.jwt.sign(payload, {
      secret: this.config.getOrThrow('JWT_REFRESH_SECRET'),
      expiresIn: this.config.get('JWT_REFRESH_EXPIRES_IN', '7d'),
    })

    const hashedRefresh = await bcrypt.hash(refreshToken, 10)
    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: hashedRefresh },
    })

    return {
      accessToken,
      refreshToken,
      user: { id: user.id, email: user.email, role: user.role, fullName: user.fullName },
    }
  }

  async updateProfile(userId: string, data: { fullName?: string; phone?: string; timezone?: string; language?: string; avatarUrl?: string; bio?: string }, role?: string) {
    const allowed: any = {}
    if (data.fullName)  allowed.fullName  = data.fullName
    if (data.phone)     allowed.phone     = data.phone
    if (data.timezone)  allowed.timezone  = data.timezone
    if (data.language)  allowed.language  = data.language
    if (data.bio !== undefined)       allowed.bio       = data.bio
    if (data.avatarUrl !== undefined) allowed.avatarUrl = data.avatarUrl
    if (role)           allowed.role      = role
    return this.prisma.user.update({
      where: { id: userId },
      data: allowed,
      select: { id: true, email: true, fullName: true, phone: true, timezone: true, language: true, avatarUrl: true, bio: true, role: true },
    })
  }
}
