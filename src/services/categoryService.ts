import { api } from '../api/axios';
import type { Category, CategoryType, CreateCategoryPayload, UpdateCategoryPayload } from '../types/category';

export const categoryService = {
  async findAll(type?: CategoryType): Promise<Category[]> {
    const { data } = await api.get<Category[]>('/categories', {
      params: type ? { type } : undefined
    });

    return data;
  },

  async create(payload: CreateCategoryPayload): Promise<Category> {
    const { data } = await api.post<Category>('/categories', payload);
    return data;
  },

  async update(id: string, payload: UpdateCategoryPayload): Promise<Category> {
    const { data } = await api.patch<Category>(`/categories/${id}`, payload);
    return data;
  },

  async remove(id: string): Promise<{ message: string }> {
    const { data } = await api.delete<{ message: string }>(`/categories/${id}`);
    return data;
  }
};