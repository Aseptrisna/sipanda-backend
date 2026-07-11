import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './schemas/user.schema';
import { Role } from '../common/enums/role.enum';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  findByEmail(email: string) {
    return this.userModel.findOne({ email: email.toLowerCase() }).exec();
  }

  findById(id: string) {
    return this.userModel.findById(id).exec();
  }

  create(data: {
    nama: string;
    email: string;
    password_hash: string;
    role: Role;
    ref_id?: Types.ObjectId | null;
  }) {
    return this.userModel.create({ ...data, ref_id: data.ref_id ?? null });
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException('User tidak ditemukan');
    }

    if (dto.email && dto.email.toLowerCase() !== user.email) {
      const existing = await this.findByEmail(dto.email);
      if (existing) {
        throw new ConflictException('Email sudah digunakan akun lain');
      }
      user.email = dto.email.toLowerCase();
    }

    if (dto.nama) {
      user.nama = dto.nama;
    }

    await user.save();
    return user;
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException('User tidak ditemukan');
    }

    const cocok = await bcrypt.compare(dto.password_lama, user.password_hash);
    if (!cocok) {
      throw new UnauthorizedException('Password lama tidak sesuai');
    }

    if (dto.password_lama === dto.password_baru) {
      throw new BadRequestException(
        'Password baru harus berbeda dari password lama',
      );
    }

    user.password_hash = await bcrypt.hash(dto.password_baru, 10);
    await user.save();
    return { message: 'Password berhasil diubah' };
  }
}
