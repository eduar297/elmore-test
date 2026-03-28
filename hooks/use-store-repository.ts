import { StoreRepository } from "@/repositories/store.repository";
import { useSQLiteContext } from "expo-sqlite";
import { useMemo } from "react";

export function useStoreRepository() {
  const db = useSQLiteContext();
  return useMemo(() => new StoreRepository(db), [db]);
}
