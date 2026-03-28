import { useStore } from "@/contexts/store-context";
import { SupplierRepository } from "@/repositories/supplier.repository";
import { useSQLiteContext } from "expo-sqlite";
import { useMemo } from "react";

export function useSupplierRepository() {
  const db = useSQLiteContext();
  const { currentStore } = useStore();
  const storeId = currentStore?.id;
  return useMemo(() => new SupplierRepository(db, storeId), [db, storeId]);
}
