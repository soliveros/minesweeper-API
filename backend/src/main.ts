import {
  NestFactory
} from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import {
  AppModule
} from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  const config = new DocumentBuilder()
    .setTitle('Mine Sweeper REST API')
    .setDescription('Rest API for Mine sweeper game.')
    .setVersion('0.0.1')
    .addTag('minesweeper-0.0.1')
    .addBearerAuth()
    .addSecurityRequirements("bearer")
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  await app.listen(8081);
}
bootstrap();