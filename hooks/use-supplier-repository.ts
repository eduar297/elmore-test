import { SupplierRepository } from "@/repositories/supplier.repository";
import { useSQLiteContext } from "expo-sqlite";
import { useMemo } from "react";

export function useSupplierRepository() {
  const db = useSQLiteContext();
  return useMemo(() => new SupplierRepository(db), [db]);
}
