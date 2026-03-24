import { ProductRepository } from "@/repositories/product.repository";
import { useSQLiteContext } from "expo-sqlite";
import { useMemo } from "react";

export function useProductRepository() {
  const db = useSQLiteContext();
  return useMemo(() => new ProductRepository(db), [db]);
}
