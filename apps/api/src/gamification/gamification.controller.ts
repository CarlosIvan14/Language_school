import { Controller, Get, Post, Query, UseGuards, Req } from '@nestjs/common'
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger'
import { AuthGuard } from '@nestjs/passport'
import { GamificationService } from './gamification.service'

@ApiTags('gamification')
@Controller('gamification')
export class GamificationController {
  constructor(private readonly gamificationService: GamificationService) {}

  @Get('leaderboard')
  getLeaderboard(@Query('limit') limit?: string) {
    return this.gamificationService.getLeaderboard(limit ? parseInt(limit) : 10)
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  getMyStats(@Req() req: any) {
    return this.gamificationService.getMyStats(req.user.id)
  }

  @Post('seed-badges')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  seedBadges() {
    return this.gamificationService.seedBadges()
  }
}
