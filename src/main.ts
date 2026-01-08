import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // CORS
  // - Dev-safe default: reflect Origin (origin: true)
  // - Prod hardening: set CORS_ORIGINS="https://<frontend-domain>,https://<another-domain>"
  const corsOriginsEnv = process.env.CORS_ORIGINS;
  const corsOrigins =
    corsOriginsEnv && corsOriginsEnv.trim().length > 0
      ? corsOriginsEnv
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      : true;

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
  });
  
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}/graphql`);
}
bootstrap();

