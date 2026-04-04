import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global validation — auto validates all DTOs
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,        // strips unknown fields
    forbidNonWhitelisted: true, // throws error for unknown fields
    transform: true,        // auto transforms types
  }));

  // Global prefix
  app.setGlobalPrefix('v1/api');

  // CORS
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true,
  });

  await app.listen(3000);
  console.log('🚀 Server running on http://localhost:3000/v1/api');
}

bootstrap();