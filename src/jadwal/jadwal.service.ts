import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Jadwal, JadwalDocument } from './schemas/jadwal.schema';
import { CreateJadwalDto } from './dto/create-jadwal.dto';
import { UpdateJadwalDto } from './dto/update-jadwal.dto';
import { FindJadwalQueryDto } from './dto/find-jadwal-query.dto';
import { paginate } from '../common/utils/paginate';

@Injectable()
export class JadwalService {
  constructor(
    @InjectModel(Jadwal.name)
    private readonly jadwalModel: Model<JadwalDocument>,
  ) {}

  create(dto: CreateJadwalDto) {
    return this.jadwalModel.create(dto);
  }

  findAll(query: FindJadwalQueryDto) {
    const filter = query.kelas_id ? { kelas_id: query.kelas_id } : {};
    return paginate(this.jadwalModel, filter, query.page, query.limit);
  }

  async findOne(id: string) {
    const jadwal = await this.jadwalModel.findById(id).exec();

    if (!jadwal) {
      throw new NotFoundException('Jadwal tidak ditemukan');
    }

    return jadwal;
  }

  async update(id: string, dto: UpdateJadwalDto) {
    const jadwal = await this.jadwalModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();

    if (!jadwal) {
      throw new NotFoundException('Jadwal tidak ditemukan');
    }

    return jadwal;
  }

  async remove(id: string) {
    const jadwal = await this.jadwalModel.findByIdAndDelete(id).exec();

    if (!jadwal) {
      throw new NotFoundException('Jadwal tidak ditemukan');
    }

    return jadwal;
  }
}
