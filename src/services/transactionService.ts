import { api } from '../api/axios';
import type {
  CreateTransactionPayload,
  Transaction,
  TransactionStatus,
  TransactionType,
  UpdateTransactionPayload
} from '../types/transaction';

type FindAllParams = {
  type?: TransactionType;
  status?: TransactionStatus;
  accountId?: string;
  categoryId?: string;
  startDate?: string;
  endDate?: string;
};

export const transactionService = {
  async findAll(params?: FindAllParams): Promise<Transaction[]> {
    const { data } = await api.get<Transaction[]>('/transactions', {
      params
    });

    return data;
  },

  async create(payload: CreateTransactionPayload): Promise<Transaction> {
    const { data } = await api.post<Transaction>('/transactions', payload);
    return data;
  },

  async update(id: string, payload: UpdateTransactionPayload): Promise<Transaction> {
    const { data } = await api.patch<Transaction>(`/transactions/${id}`, payload);
    return data;
  },

  async remove(id: string): Promise<{ message: string }> {
    const { data } = await api.delete<{ message: string }>(`/transactions/${id}`);
    return data;
  }
};