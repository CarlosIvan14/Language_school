import { Controller, Get, Post, Delete, Param, Body, UseGuards, Req, UseInterceptors, UploadedFile } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger'
import { AuthGuard } from '@nestjs/passport'
import { diskStorage } from 'multer'
import { extname } from 'path'
import { MaterialsService } from './materials.service'

@ApiTags('materials')
@Controller('courses/:courseId/materials')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class MaterialsController {
  constructor(private readonly materialsService: MaterialsService) {}

  @Get()
  findAll(@Param('courseId') courseId: string, @Req() req: any) {
    return this.materialsService.findByCourse(courseId, req.user.id, req.user.role)
  }

  @Post()
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: process.env.UPLOAD_DIR ?? './uploads',
      filename: (_, file, cb) => cb(null, `${Date.now()}${extname(file.originalname)}`),
    }),
    limits: { fileSize: 50 * 1024 * 1024 },
    fileFilter: (_, file, cb) => {
      const allowed = /pdf|mp4|mp3|docx|pptx|jpg|jpeg|png|gif/i
      cb(null, allowed.test(extname(file.originalname)))
    },
  }))
  create(
    @Param('courseId') courseId: string,
    @Body() body: { title: string; type: string; description?: string },
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any,
  ) {
    return this.materialsService.create(
      { ...body, courseId, storagePath: file ? `/uploads/${file.filename}` : undefined },
      req.user.id,
    )
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.materialsService.remove(id, req.user.id, req.user.role)
  }
}
