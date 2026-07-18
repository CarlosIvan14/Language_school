import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { NestExpressApplication } from '@nestjs/platform-express'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { join } from 'path'
import { existsSync, mkdirSync } from 'fs'
import helmet from 'helmet'
import { AppModule } from './app.module'
import { AllExceptionsFilter } from './common/filters/http-exception.filter'

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { rawBody: true })

  // helmet with crossOriginResourcePolicy relaxed so the web app can load /uploads images
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }))

  // Serve uploaded files (avatars) statically at /uploads
  const uploadDir = process.env.UPLOAD_DIR ?? './uploads'
  if (!existsSync(uploadDir)) mkdirSync(uploadDir, { recursive: true })
  app.useStaticAssets(join(process.cwd(), uploadDir), { prefix: '/uploads/' })

  app.enableCors({
    origin: [process.env.FRONTEND_URL ?? 'http://localhost:3000'],
    credentials: true,
  })

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  )

  app.useGlobalFilters(new AllExceptionsFilter())

  app.setGlobalPrefix('api/v1')

  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('EspañolPro API')
      .setDescription('Language School Management Platform')
      .setVersion('1.0')
      .addBearerAuth()
      .build()
    SwaggerModule.setup('api/docs', app, SwaggerModule.createDocument(app, config))
    console.log(`📚 Swagger: http://localhost:${process.env.PORT ?? 3001}/api/docs`)
  }

  const port = process.env.PORT ?? 3001
  await app.listen(port)
  console.log(`🚀 API running on http://localhost:${port}/api/v1`)
}

bootstrap()
