import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Kelas, KelasDocument } from './schemas/kelas.schema';
import { CreateKelasDto } from './dto/create-kelas.dto';
import { UpdateKelasDto } from './dto/update-kelas.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { paginate } from '../common/utils/paginate';

@Injectable()
export class KelasService {
  constructor(
    @InjectModel(Kelas.name) private readonly kelasModel: Model<KelasDocument>,
  ) {}

  create(dto: CreateKelasDto) {
    return this.kelasModel.create(dto);
  }

  findAll(query: PaginationQueryDto) {
    return paginate(this.kelasModel, {}, query.page, query.limit);
  }

  async findOne(id: string) {
    const kelas = await this.kelasModel.findById(id).exec();

    if (!kelas) {
      throw new NotFoundException('Kelas tidak ditemukan');
    }

    return kelas;
  }

  async update(id: string, dto: UpdateKelasDto) {
    const kelas = await this.kelasModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();

    if (!kelas) {
      throw new NotFoundException('Kelas tidak ditemukan');
    }

    return kelas;
  }

  async remove(id: string) {
    const kelas = await this.kelasModel.findByIdAndDelete(id).exec();

    if (!kelas) {
      throw new NotFoundException('Kelas tidak ditemukan');
    }

    return kelas;
  }
}
