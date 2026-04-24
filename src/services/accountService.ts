import { api } from '../api/axios';
import type { Account, CreateAccountPayload, UpdateAccountPayload } from '../types/account';

export const accountService = {
  async findAll(): Promise<Account[]> {
    const { data } = await api.get<Account[]>('/accounts');
    return data;
  },

  async create(payload: CreateAccountPayload): Promise<Account> {
    const { data } = await api.post<Account>('/accounts', payload);
    return data;
  },

  async update(id: string, payload: UpdateAccountPayload): Promise<Account> {
    const { data } = await api.patch<Account>(`/accounts/${id}`, payload);
    return data;
  },

  async remove(id: string): Promise<{ message: string }> {
    const { data } = await api.delete<{ message: string }>(`/accounts/${id}`);
    return data;
  }
};