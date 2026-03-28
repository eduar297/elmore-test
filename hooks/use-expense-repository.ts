import { useStore } from "@/contexts/store-context";
import { ExpenseRepository } from "@/repositories/expense.repository";
import { useSQLiteContext } from "expo-sqlite";
import { useMemo } from "react";

export function useExpenseRepository() {
  const db = useSQLiteContext();
  const { currentStore } = useStore();
  const storeId = currentStore?.id;
  return useMemo(() => new ExpenseRepository(db, storeId), [db, storeId]);
}
