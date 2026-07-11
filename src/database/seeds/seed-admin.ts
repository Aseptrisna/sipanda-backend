import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { AppModule } from '../../app.module';
import { UsersService } from '../../users/users.service';
import { Role } from '../../common/enums/role.enum';

async function run() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const configService = app.get(ConfigService);
  const usersService = app.get(UsersService);

  const email = configService.get<string>('SEED_ADMIN_EMAIL');
  const password = configService.get<string>('SEED_ADMIN_PASSWORD');
  const nama = configService.get<string>('SEED_ADMIN_NAMA') ?? 'Super Admin';

  if (!email || !password) {
    console.error(
      'SEED_ADMIN_EMAIL dan SEED_ADMIN_PASSWORD wajib diisi di .env',
    );
    await app.close();
    process.exit(1);
  }

  const existing = await usersService.findByEmail(email);

  if (existing) {
    console.log(`User dengan email ${email} sudah ada, seed dilewati.`);
    await app.close();
    return;
  }

  const password_hash = await bcrypt.hash(password, 10);

  await usersService.create({
    nama,
    email,
    password_hash,
    role: Role.SUPER_ADMIN,
  });

  console.log(`Super Admin berhasil dibuat: ${email}`);
  await app.close();
}

run().catch((error) => {
  console.error('Gagal menjalankan seed admin:', error);
  process.exit(1);
});
