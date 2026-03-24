import { PurchaseRepository } from "@/repositories/purchase.repository";
import { useSQLiteContext } from "expo-sqlite";
import { useMemo } from "react";

export function usePurchaseRepository() {
  const db = useSQLiteContext();
  return useMemo(() => new PurchaseRepository(db), [db]);
}
