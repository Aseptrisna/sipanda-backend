import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Siswa, SiswaDocument } from './schemas/siswa.schema';
import { CreateSiswaDto } from './dto/create-siswa.dto';
import { UpdateSiswaDto } from './dto/update-siswa.dto';
import { FindSiswaQueryDto } from './dto/find-siswa-query.dto';
import { paginate } from '../common/utils/paginate';

@Injectable()
export class SiswaService {
  constructor(
    @InjectModel(Siswa.name) private readonly siswaModel: Model<SiswaDocument>,
  ) {}

  create(dto: CreateSiswaDto) {
    return this.siswaModel.create(dto);
  }

  findAll(query: FindSiswaQueryDto) {
    const filter = query.kelas_id ? { kelas_id: query.kelas_id } : {};
    return paginate(this.siswaModel, filter, query.page, query.limit);
  }

  findAnakSaya(orangTuaId: string) {
    return this.siswaModel.find({ orang_tua_id: orangTuaId }).exec();
  }

  async findOne(id: string) {
    const siswa = await this.siswaModel.findById(id).exec();

    if (!siswa) {
      throw new NotFoundException('Siswa tidak ditemukan');
    }

    return siswa;
  }

  async update(id: string, dto: UpdateSiswaDto) {
    const siswa = await this.siswaModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();

    if (!siswa) {
      throw new NotFoundException('Siswa tidak ditemukan');
    }

    return siswa;
  }

  async remove(id: string) {
    const siswa = await this.siswaModel.findByIdAndDelete(id).exec();

    if (!siswa) {
      throw new NotFoundException('Siswa tidak ditemukan');
    }

    return siswa;
  }
}
