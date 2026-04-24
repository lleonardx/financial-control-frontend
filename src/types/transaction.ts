import type { Account } from './account';

export const TransactionType = {
    INCOME: 'INCOME',
    EXPENSE: 'EXPENSE'
  } as const;
  
  export type TransactionType = (typeof TransactionType)[keyof typeof TransactionType];

  export const TransactionStatus = {
    PAID: 'PAID',
    PENDING: 'PENDING',
    OVERDUE: 'OVERDUE'
  } as const;
  
  export type TransactionStatus = (typeof TransactionStatus)[keyof typeof TransactionStatus];

export type TransactionCategory = {
  _id: string;
  name: string;
  type: TransactionType;
  color?: string;
  icon?: string;
};

export type Transaction = {
  _id: string;
  userId: string;
  accountId: string | Account;
  categoryId: string | TransactionCategory;
  type: TransactionType;
  description: string;
  amount: number;
  date: string;
  status: TransactionStatus;
  paymentMethod?: string;
  notes?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateTransactionPayload = {
  accountId: string;
  categoryId: string;
  type: TransactionType;
  description: string;
  amount: number;
  date: string;
  status?: TransactionStatus;
  paymentMethod?: string;
  notes?: string;
};

export type UpdateTransactionPayload = Partial<CreateTransactionPayload>;

export const transactionTypeLabels: Record<TransactionType, string> = {
  [TransactionType.INCOME]: 'Receita',
  [TransactionType.EXPENSE]: 'Despesa'
};

export const transactionStatusLabels: Record<TransactionStatus, string> = {
  [TransactionStatus.PAID]: 'Pago',
  [TransactionStatus.PENDING]: 'Pendente',
  [TransactionStatus.OVERDUE]: 'Atrasado'
};