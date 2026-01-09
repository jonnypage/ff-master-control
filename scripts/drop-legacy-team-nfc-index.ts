import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { getConnectionToken } from '@nestjs/mongoose';
import type { Connection } from 'mongoose';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const connection = app.get<Connection>(getConnectionToken());

  try {
    const collection = connection.collection('teams');
    const indexes = await collection.indexes();
    const hasLegacyNfcIndex = indexes.some((idx) => idx?.name === 'nfcCardId_1');

    if (!hasLegacyNfcIndex) {
      console.log('✅ No legacy index teams.nfcCardId_1 found. Nothing to do.');
      await app.close();
      process.exit(0);
    }

    await collection.dropIndex('nfcCardId_1');
    console.log('✅ Dropped legacy index teams.nfcCardId_1');
  } catch (err: any) {
    console.error(
      `❌ Failed to drop legacy index teams.nfcCardId_1: ${err?.message ?? String(err)}`,
    );
    process.exit(1);
  } finally {
    await app.close();
  }
}

bootstrap();

