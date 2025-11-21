import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { UsersService } from '../src/users/users.service';
import { UserRole } from '../src/auth/roles.decorator';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const usersService = app.get(UsersService);

  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;
  const role = (process.env.ADMIN_ROLE as UserRole) || UserRole.ADMIN;

  if (!username || !password) {
    console.error(
      '❌ Error: ADMIN_USERNAME and ADMIN_PASSWORD environment variables are required',
    );
    process.exit(1);
  }

  try {
    const existingUser = await usersService.findByUsername(username);
    if (existingUser) {
      console.log(`User "${username}" already exists. Skipping creation.`);
      await app.close();
      process.exit(0);
    }

    await usersService.create({
      username,
      password,
      role,
    });
    console.log(`✅ Admin user "${username}" created successfully!`);
    console.log(`   Username: ${username}`);
    console.log(`   Password: ${password}`);
    console.log(`   Role: ${role}`);
    console.log('\n⚠️  Please change the password after first login!');
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    process.exit(1);
  }

  await app.close();
  process.exit(0);
}

bootstrap();
