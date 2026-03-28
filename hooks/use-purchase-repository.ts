import { useStore } from "@/contexts/store-context";
import { PurchaseRepository } from "@/repositories/purchase.repository";
import { useSQLiteContext } from "expo-sqlite";
import { useMemo } from "react";

export function usePurchaseRepository() {
  const db = useSQLiteContext();
  const { currentStore } = useStore();
  const storeId = currentStore?.id;
  return useMemo(() => new PurchaseRepository(db, storeId), [db, storeId]);
}
