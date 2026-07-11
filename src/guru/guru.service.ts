import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Guru, GuruDocument } from './schemas/guru.schema';
import { CreateGuruDto } from './dto/create-guru.dto';
import { UpdateGuruDto } from './dto/update-guru.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { paginate } from '../common/utils/paginate';

@Injectable()
export class GuruService {
  constructor(
    @InjectModel(Guru.name) private readonly guruModel: Model<GuruDocument>,
  ) {}

  create(dto: CreateGuruDto) {
    return this.guruModel.create(dto);
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
