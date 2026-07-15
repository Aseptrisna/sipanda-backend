import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { Model } from 'mongoose';
import { OrangTua, OrangTuaDocument } from './schemas/orang-tua.schema';
import { CreateOrangTuaDto } from './dto/create-orang-tua.dto';
import { UpdateOrangTuaDto } from './dto/update-orang-tua.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { paginate } from '../common/utils/paginate';
import { UsersService } from '../users/users.service';
import { Role } from '../common/enums/role.enum';

@Injectable()
export class OrangTuaService {
  constructor(
    @InjectModel(OrangTua.name)
    private readonly orangTuaModel: Model<OrangTuaDocument>,
    private readonly usersService: UsersService,
  ) {}

  async create(dto: CreateOrangTuaDto) {
    const existingUser = await this.usersService.findByEmail(dto.email);

    if (existingUser) {
      throw new ConflictException(
        `Email ${dto.email} sudah terdaftar sebagai akun`,
      );
    }

    const orangTua = await this.orangTuaModel.create(dto);
    const generatedPassword = randomBytes(6).toString('base64url');
    const password_hash = await bcrypt.hash(generatedPassword, 10);

    await this.usersService.create({
      nama: dto.nama,
      email: dto.email,
      password_hash,
      role: Role.ORANG_TUA,
      ref_id: orangTua._id,
    });

    return {
      ...orangTua.toObject(),
      generated_password: generatedPassword,
    };
  }

  findAll(query: PaginationQueryDto) {
    return paginate(this.orangTuaModel, {}, query.page, query.limit);
  }

  async findOne(id: string) {
    const orangTua = await this.orangTuaModel.findById(id).exec();

    if (!orangTua) {
      throw new NotFoundException('Data orang tua tidak ditemukan');
    }

    return orangTua;
  }

  async update(id: string, dto: UpdateOrangTuaDto) {
    const orangTua = await this.orangTuaModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();

    if (!orangTua) {
      throw new NotFoundException('Data orang tua tidak ditemukan');
    }

    return orangTua;
  }

  async remove(id: string) {
    const orangTua = await this.orangTuaModel.findByIdAndDelete(id).exec();

    if (!orangTua) {
      throw new NotFoundException('Data orang tua tidak ditemukan');
    }

    return orangTua;
  }

  async resetPassword(id: string) {
    const orangTua = await this.findOne(id);
    return this.usersService.resetPasswordByEmail(orangTua.email);
  }
}
