import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

const port = 7000;
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  new ValidationPipe({
    whitelist: true,
    transform: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
  });
  await app.listen(port);
}
bootstrap();
