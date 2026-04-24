import type { Account } from './account';
import type { Transaction } from './transaction';

export type DashboardSummary = {
  month: {
    startDate: string;
    endDate: string;
  };
  cards: {
    totalBalance: number;
    income: number;
    expense: number;
    result: number;
    accountsCount: number;
    goalsCount: number;
  };
  accounts: Account[];
  categoryExpenses: Array<{
    categoryId: string;
    categoryName: string;
    color?: string;
    icon?: string;
    total: number;
  }>;
  recentTransactions: Transaction[];
  goals: Array<{
    _id: string;
    name: string;
    targetAmount: number;
    currentAmount: number;
    status: string;
  }>;
};