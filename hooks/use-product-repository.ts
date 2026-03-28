import { useStore } from "@/contexts/store-context";
import { ProductRepository } from "@/repositories/product.repository";
import { useSQLiteContext } from "expo-sqlite";
import { useMemo } from "react";

export function useProductRepository() {
  const db = useSQLiteContext();
  const { currentStore } = useStore();
  const storeId = currentStore?.id;
  return useMemo(() => new ProductRepository(db, storeId), [db, storeId]);
}
