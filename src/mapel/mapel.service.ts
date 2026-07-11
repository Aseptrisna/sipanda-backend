import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Mapel, MapelDocument } from './schemas/mapel.schema';
import { CreateMapelDto } from './dto/create-mapel.dto';
import { UpdateMapelDto } from './dto/update-mapel.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { paginate } from '../common/utils/paginate';

@Injectable()
export class MapelService {
  constructor(
    @InjectModel(Mapel.name) private readonly mapelModel: Model<MapelDocument>,
  ) {}

  create(dto: CreateMapelDto) {
    return this.mapelModel.create(dto);
  }

  findAll(query: PaginationQueryDto) {
    return paginate(this.mapelModel, {}, query.page, query.limit);
  }

  async findOne(id: string) {
    const mapel = await this.mapelModel.findById(id).exec();

    if (!mapel) {
      throw new NotFoundException('Mapel tidak ditemukan');
    }

    return mapel;
  }

  async update(id: string, dto: UpdateMapelDto) {
    const mapel = await this.mapelModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();

    if (!mapel) {
      throw new NotFoundException('Mapel tidak ditemukan');
    }

    return mapel;
  }

  async remove(id: string) {
    const mapel = await this.mapelModel.findByIdAndDelete(id).exec();

    if (!mapel) {
      throw new NotFoundException('Mapel tidak ditemukan');
    }

    return mapel;
  }
}
