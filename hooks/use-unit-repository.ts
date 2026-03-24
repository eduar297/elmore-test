import { UnitRepository } from "@/repositories/unit.repository";
import { useSQLiteContext } from "expo-sqlite";
import { useMemo } from "react";

export function useUnitRepository() {
  const db = useSQLiteContext();
  return useMemo(() => new UnitRepository(db), [db]);
}
