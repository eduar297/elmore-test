import { useSQLiteContext } from "expo-sqlite";
import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";

interface PreferencesContextValue {
  showStoreBubble: boolean;
  setShowStoreBubble: (v: boolean) => void;
}

const PreferencesContext = createContext<PreferencesContextValue>({
  showStoreBubble: true,
  setShowStoreBubble: () => {},
});

export function PreferencesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const db = useSQLiteContext();
  const [showStoreBubble, setShowStoreBubbleState] = useState(true);

  useEffect(() => {
    (async () => {
      const row = await db.getFirstAsync<{ value: string }>(
        "SELECT value FROM app_settings WHERE key = ?",
        ["showStoreBubble"],
      );
      if (row) setShowStoreBubbleState(row.value === "1");
    })();
  }, [db]);

  const setShowStoreBubble = useCallback(
    async (v: boolean) => {
      setShowStoreBubbleState(v);
      await db.runAsync(
        "INSERT OR REPLACE INTO app_settings (key, value) VALUES (?, ?)",
        "showStoreBubble",
        v ? "1" : "0",
      );
    },
    [db],
  );

  const value = useMemo(
    () => ({ showStoreBubble, setShowStoreBubble }),
    [showStoreBubble, setShowStoreBubble],
  );

  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  return useContext(PreferencesContext);
}
