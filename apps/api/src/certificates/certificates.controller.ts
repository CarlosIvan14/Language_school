import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common'
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger'
import { AuthGuard } from '@nestjs/passport'
import { CertificatesService } from './certificates.service'
import { Roles } from '../common/decorators/roles.decorator'

@ApiTags('certificates')
@Controller('certificates')
export class CertificatesController {
  constructor(private readonly certificatesService: CertificatesService) {}

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  getMyList(@Req() req: any) {
    return this.certificatesService.getMyCertificates(req.user.id)
  }

  @Get('verify/:hash')
  verify(@Param('hash') hash: string) {
    return this.certificatesService.verify(hash)
  }

  @Post('issue')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Roles('admin', 'teacher')
  issue(@Body() body: { studentId: string; courseId: string }) {
    return this.certificatesService.issue(body.studentId, body.courseId)
  }
}
