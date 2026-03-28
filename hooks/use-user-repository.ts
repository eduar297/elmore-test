import { useStore } from "@/contexts/store-context";
import { UserRepository } from "@/repositories/user.repository";
import { useSQLiteContext } from "expo-sqlite";
import { useMemo } from "react";

export function useUserRepository() {
  const db = useSQLiteContext();
  const { currentStore } = useStore();
  const storeId = currentStore?.id;
  return useMemo(() => new UserRepository(db, storeId), [db, storeId]);
}
