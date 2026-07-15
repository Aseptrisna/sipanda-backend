import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { Model } from 'mongoose';
import { Guru, GuruDocument } from './schemas/guru.schema';
import { CreateGuruDto } from './dto/create-guru.dto';
import { UpdateGuruDto } from './dto/update-guru.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { paginate } from '../common/utils/paginate';
import { UsersService } from '../users/users.service';
import { Role } from '../common/enums/role.enum';

@Injectable()
export class GuruService {
  constructor(
    @InjectModel(Guru.name) private readonly guruModel: Model<GuruDocument>,
    private readonly usersService: UsersService,
  ) {}

  async create(dto: CreateGuruDto) {
    const existingUser = await this.usersService.findByEmail(dto.email);

    if (existingUser) {
      throw new ConflictException(
        `Email ${dto.email} sudah terdaftar sebagai akun`,
      );
    }

    const guru = await this.guruModel.create(dto);
    const generatedPassword = randomBytes(6).toString('base64url');
    const password_hash = await bcrypt.hash(generatedPassword, 10);

    await this.usersService.create({
      nama: dto.nama,
      email: dto.email,
      password_hash,
      role: Role.WALI_KELAS,
      ref_id: guru._id,
    });

    return {
      ...guru.toObject(),
      generated_password: generatedPassword,
    };
  }

  findAll(query: PaginationQueryDto) {
    return paginate(this.guruModel, {}, query.page, query.limit);
  }

  async findOne(id: string) {
    const guru = await this.guruModel.findById(id).exec();

    if (!guru) {
      throw new NotFoundException('Guru tidak ditemukan');
    }

    return guru;
  }

  async update(id: string, dto: UpdateGuruDto) {
    const guru = await this.guruModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();

    if (!guru) {
      throw new NotFoundException('Guru tidak ditemukan');
    }

    return guru;
  }

  async remove(id: string) {
    const guru = await this.guruModel.findByIdAndDelete(id).exec();

    if (!guru) {
      throw new NotFoundException('Guru tidak ditemukan');
    }

    return guru;
  }
}
