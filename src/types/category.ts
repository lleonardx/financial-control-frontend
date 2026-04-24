export const CategoryType = {
    INCOME: 'INCOME',
    EXPENSE: 'EXPENSE'
  } as const;
  
  export type CategoryType = (typeof CategoryType)[keyof typeof CategoryType];
  
  export type Category = {
    _id: string;
    userId: string;
    name: string;
    type: CategoryType;
    color?: string;
    icon?: string;
    isDefault?: boolean;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
  };
  
  export type CreateCategoryPayload = {
    name: string;
    type: CategoryType;
    color?: string;
    icon?: string;
  };
  
  export type UpdateCategoryPayload = Partial<CreateCategoryPayload>;
  
  export const categoryTypeLabels: Record<CategoryType, string> = {
    [CategoryType.INCOME]: 'Receita',
    [CategoryType.EXPENSE]: 'Despesa'
  };