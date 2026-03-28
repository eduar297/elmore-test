import type { Store } from "@/models/store";
import { StoreRepository } from "@/repositories/store.repository";
import { useSQLiteContext } from "expo-sqlite";
import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";

interface StoreContextValue {
  /** All available stores. */
  stores: Store[];
  /** The currently selected store (null until chosen). */
  currentStore: Store | null;
  /** Select a store. */
  setCurrentStore: (store: Store | null) => void;
  /** Reload the stores list from DB. */
  refreshStores: () => Promise<void>;
}

const StoreContext = createContext<StoreContextValue>({
  stores: [],
  currentStore: null,
  setCurrentStore: () => {},
  refreshStores: async () => {},
});

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const db = useSQLiteContext();
  const repo = useMemo(() => new StoreRepository(db), [db]);

  const [stores, setStores] = useState<Store[]>([]);
  const [currentStore, setCurrentStoreState] = useState<Store | null>(null);

  const refreshStores = useCallback(async () => {
    const list = await repo.findAll();
    setStores(list);
    // Always use the fresh object from list so color/name changes propagate
    if (list.length > 0) {
      setCurrentStoreState((prev) => {
        if (prev) return list.find((s) => s.id === prev.id) ?? list[0];
        return list[0];
      });
    } else {
      setCurrentStoreState(null);
    }
  }, [repo]);

  useEffect(() => {
    refreshStores();
  }, [refreshStores]);

  const setCurrentStore = useCallback((store: Store | null) => {
    setCurrentStoreState(store);
  }, []);

  const value = useMemo(
    () => ({ stores, currentStore, setCurrentStore, refreshStores }),
    [stores, currentStore, setCurrentStore, refreshStores],
  );

  return (
    <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
  );
}

export function useStore() {
  return useContext(StoreContext);
}
