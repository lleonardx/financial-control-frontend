export const AccountType = {
  CHECKING: 'CHECKING',
  CASH: 'CASH',
  CREDIT_CARD: 'CREDIT_CARD',
  INVESTMENT: 'INVESTMENT'
} as const;

export type AccountType = (typeof AccountType)[keyof typeof AccountType];
  
export type Account = {
  _id: string;
  userId: string;
  name: string;
  type: AccountType;
  initialBalance: number;
  currentBalance: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateAccountPayload = {
  name: string;
  type: AccountType;
  initialBalance?: number;
};

export type UpdateAccountPayload = Partial<CreateAccountPayload>;

export const accountTypeLabels: Record<AccountType, string> = {
  [AccountType.CHECKING]: 'Conta corrente',
  [AccountType.CASH]: 'Dinheiro',
  [AccountType.CREDIT_CARD]: 'Cartão de crédito',
  [AccountType.INVESTMENT]: 'Investimento'
};