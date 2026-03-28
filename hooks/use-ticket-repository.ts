import { useStore } from "@/contexts/store-context";
import { TicketRepository } from "@/repositories/ticket.repository";
import { useSQLiteContext } from "expo-sqlite";
import { useMemo } from "react";

export function useTicketRepository() {
  const db = useSQLiteContext();
  const { currentStore } = useStore();
  const storeId = currentStore?.id;
  return useMemo(() => new TicketRepository(db, storeId), [db, storeId]);
}
