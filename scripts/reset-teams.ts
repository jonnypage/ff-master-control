import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { TeamsService } from '../src/teams/teams.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const teamsService = app.get(TeamsService);

  const confirm = process.env.CONFIRM;
  if (confirm !== 'true') {
    console.error(
      '❌ Refusing to delete teams without CONFIRM=true (this is destructive).',
    );
    await app.close();
    process.exit(1);
  }

  try {
    await teamsService.deleteAll();
    console.log('✅ All teams deleted.');
  } catch (error: any) {
    console.error('❌ Error deleting teams:', error?.message ?? error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

bootstrap();

