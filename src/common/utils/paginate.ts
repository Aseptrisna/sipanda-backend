import { Model, QueryFilter } from 'mongoose';

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export async function paginate<T>(
  model: Model<T>,
  filter: QueryFilter<T>,
  page = 1,
  limit = 20,
): Promise<PaginatedResult<T>> {
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    model.find(filter).skip(skip).limit(limit).exec(),
    model.countDocuments(filter).exec(),
  ]);

  return {
    data,
    meta: {
      page,
      limit,
      total,
      total_pages: Math.ceil(total / limit) || 0,
    },
  };
}
