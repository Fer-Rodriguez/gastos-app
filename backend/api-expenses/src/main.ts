import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ⚡ Habilitar CORS para desarrollo y producción
  app.enableCors({
    origin: [
      'http://localhost:3000', // desarrollo local
      'https://gastos-app-ew4w.vercel.app', // tu frontend en Vercel
    ],
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.listen(process.env.PORT ?? 4000);
}
bootstrap();
