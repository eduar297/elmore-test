export const EXPENSE_CATEGORIES = {
  TRANSPORT: "Transporte",
  ELECTRICITY: "Electricidad",
  RENT: "Alquiler",
  REPAIRS: "Reparaciones",
  SUPPLIES: "Insumos",
  OTHER: "Otros",
} as const;

export type ExpenseCategory = keyof typeof EXPENSE_CATEGORIES;

export interface Expense {
  id: number;
  category: ExpenseCategory;
  description: string;
  amount: number;
  /** Date the expense occurred (YYYY-MM-DD) */
  date: string;
  storeId: number;
  createdAt: string;
  updatedAt: string;
}

export type CreateExpenseInput = Omit<
  Expense,
  "id" | "createdAt" | "updatedAt" | "storeId"
>;
