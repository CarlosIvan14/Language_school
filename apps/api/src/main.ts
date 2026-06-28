import { NestFactory, Reflector } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import helmet from 'helmet'
import { AppModule } from './app.module'
import { AllExceptionsFilter } from './common/filters/http-exception.filter'
import { RolesGuard } from './common/guards/roles.guard'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true })

  app.use(helmet())

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
  app.useGlobalGuards(new RolesGuard(new Reflector()))

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
