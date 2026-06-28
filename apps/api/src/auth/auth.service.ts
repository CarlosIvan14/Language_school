import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import * as bcrypt from 'bcryptjs'
import { PrismaService } from '../prisma/prisma.service'
import type { RegisterDto } from './dto/register.dto'
import type { LoginDto } from './dto/login.dto'

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

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
        avatarUrl: true, phone: true, timezone: true, language: true,
        student: { select: { id: true, spanishLevel: true, nativeLanguage: true } },
        teacher: { select: { id: true, specialties: true, bio: true } },
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

  async updateProfile(userId: string, data: { fullName?: string; phone?: string; timezone?: string; language?: string; avatarUrl?: string }, role?: string) {
    const allowed: any = {}
    if (data.fullName)  allowed.fullName  = data.fullName
    if (data.phone)     allowed.phone     = data.phone
    if (data.timezone)  allowed.timezone  = data.timezone
    if (data.language)  allowed.language  = data.language
    if (data.avatarUrl !== undefined) allowed.avatarUrl = data.avatarUrl
    if (role)           allowed.role      = role
    return this.prisma.user.update({
      where: { id: userId },
      data: allowed,
      select: { id: true, email: true, fullName: true, phone: true, timezone: true, language: true, avatarUrl: true, role: true },
    })
  }
}
