import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Serve uploaded files statically
  app.useStaticAssets(join(process.cwd(), 'uploads'), { prefix: '/uploads' });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Enable CORS
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
    ],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('CzechServices API')
    .setDescription('Service booking platform for Czech Republic')
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'JWT',
    )
    .addTag('Auth')
    .addTag('Users')
    .addTag('Verification')
    .addTag('Locations')
    .addTag('Services')
    .addTag('Profiles')
    .addTag('Media')
    .addTag('Bookings')
    .addTag('Chat')
    .addTag('Emergency')
    .addTag('Contacts')
    .addTag('Subscriptions')
    .addTag('Admin')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.API_PORT || 3000;
  await app.listen(port, '127.0.0.1');

  console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║        🚀 CzechServices Backend Server Started! 🚀        ║
║                                                            ║
║  Server:     http://localhost:${port}                    ║
║  Swagger:    http://localhost:${port}/api/docs          ║
║  Environment: ${process.env.NODE_ENV || 'development'}        ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
  `);
}

bootstrap();
