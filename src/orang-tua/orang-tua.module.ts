import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OrangTua, OrangTuaSchema } from './schemas/orang-tua.schema';
import { OrangTuaService } from './orang-tua.service';
import { OrangTuaController } from './orang-tua.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: OrangTua.name, schema: OrangTuaSchema },
    ]),
    UsersModule,
  ],
  providers: [OrangTuaService],
  controllers: [OrangTuaController],
  exports: [OrangTuaService],
})
export class OrangTuaModule {}
