import {
    cancelReminder,
    configureForegroundBehaviour,
    scheduleReminder,
    sendLocalNotification,
    setupNotifications,
} from "@/services/notifications/notification-service";
import type {
    NotificationCategory,
    NotificationPrefKey,
    NotificationPrefs,
    NotificationSeverity,
    ScheduledReminder,
} from "@/services/notifications/types";
import {
    DEFAULT_NOTIFICATION_PREFS,
    DEFAULT_SYNC_REMINDERS,
} from "@/services/notifications/types";
import { useSQLiteContext } from "expo-sqlite";
import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";

// ── Context ─────────────────────────────────────────────────────────────────

interface NotificationContextValue {
  /** Fire a system notification */
  notify: (opts: {
    category: NotificationCategory;
    severity: NotificationSeverity;
    title: string;
    body: string;
    data?: Record<string, unknown>;
  }) => void;
  /** Get current notification preferences */
  prefs: NotificationPrefs;
  /** Toggle a notification preference on/off */
  togglePref: (key: NotificationPrefKey, value: boolean) => Promise<void>;
  /** Get all reminders */
  reminders: ScheduledReminder[];
  /** Update a reminder (time, enabled, etc.) */
  updateReminder: (reminder: ScheduledReminder) => Promise<void>;
  /** Whether system notification permission was granted */
  hasPermission: boolean;
}

const NotificationContext = createContext<NotificationContextValue>({
  notify: () => {},
  prefs: DEFAULT_NOTIFICATION_PREFS,
  togglePref: async () => {},
  reminders: [],
  updateReminder: async () => {},
  hasPermission: false,
});

export const useNotifications = () => useContext(NotificationContext);

// ── Pref key → category mapping ─────────────────────────────────────────────

const CATEGORY_TO_PREF: Record<NotificationCategory, NotificationPrefKey> = {
  sync_reminder: "notif_sync_reminder",
  sync_result: "notif_sync_result",
  stock_alert: "notif_stock_alert",
  general: "notif_general",
};

// ── Provider ────────────────────────────────────────────────────────────────

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const db = useSQLiteContext();
  const [hasPermission, setHasPermission] = useState(false);
  const [prefs, setPrefs] = useState<NotificationPrefs>(
    DEFAULT_NOTIFICATION_PREFS,
  );
  const [reminders, setReminders] = useState<ScheduledReminder[]>([]);

  // ── Init: permissions + load saved prefs ──────────────────────────────
  useEffect(() => {
    (async () => {
      configureForegroundBehaviour();
      const granted = await setupNotifications();
      setHasPermission(granted);
    })();
  }, []);

  // Load prefs from DB
  useEffect(() => {
    (async () => {
      const rows = await db.getAllAsync<{ key: string; value: string }>(
        "SELECT key, value FROM app_settings WHERE key LIKE 'notif_%'",
      );
      if (rows.length > 0) {
        const loaded = { ...DEFAULT_NOTIFICATION_PREFS };
        for (const row of rows) {
          if (row.key in loaded) {
            loaded[row.key as NotificationPrefKey] = row.value === "1";
          }
        }
        setPrefs(loaded);
      }
    })();
  }, [db]);

  // Load reminders from DB
  useEffect(() => {
    (async () => {
      const row = await db.getFirstAsync<{ value: string }>(
        "SELECT value FROM app_settings WHERE key = ?",
        ["sync_reminders"],
      );
      if (row) {
        try {
          setReminders(JSON.parse(row.value));
        } catch {
          setReminders(DEFAULT_SYNC_REMINDERS);
        }
      } else {
        // First run — seed defaults
        setReminders(DEFAULT_SYNC_REMINDERS);
        await db.runAsync(
          "INSERT OR REPLACE INTO app_settings (key, value) VALUES (?, ?)",
          "sync_reminders",
          JSON.stringify(DEFAULT_SYNC_REMINDERS),
        );
        // Schedule the defaults
        for (const r of DEFAULT_SYNC_REMINDERS) {
          await scheduleReminder(r);
        }
      }
    })();
  }, [db]);

  // ── Toggle pref ───────────────────────────────────────────────────────
  const togglePref = useCallback(
    async (key: NotificationPrefKey, value: boolean) => {
      setPrefs((prev) => ({ ...prev, [key]: value }));
      await db.runAsync(
        "INSERT OR REPLACE INTO app_settings (key, value) VALUES (?, ?)",
        key,
        value ? "1" : "0",
      );
    },
    [db],
  );

  // ── Update reminder ───────────────────────────────────────────────────
  const updateReminder = useCallback(
    async (updated: ScheduledReminder) => {
      const next = reminders.map((r) => (r.id === updated.id ? updated : r));
      setReminders(next);
      await db.runAsync(
        "INSERT OR REPLACE INTO app_settings (key, value) VALUES (?, ?)",
        "sync_reminders",
        JSON.stringify(next),
      );
      // Reschedule or cancel
      if (updated.enabled) {
        await scheduleReminder(updated);
      } else {
        await cancelReminder(updated.id);
      }
    },
    [db, reminders],
  );

  // ── Notify ────────────────────────────────────────────────────────────
  const notify = useCallback(
    (opts: {
      category: NotificationCategory;
      severity: NotificationSeverity;
      title: string;
      body: string;
      data?: Record<string, unknown>;
    }) => {
      const prefKey = CATEGORY_TO_PREF[opts.category];
      // Check if this category is enabled
      if (!prefs[prefKey]) return;

      // System notification
      if (hasPermission) {
        sendLocalNotification({
          category: opts.category,
          severity: opts.severity,
          title: opts.title,
          body: opts.body,
          data: opts.data,
        });
      }
    },
    [prefs, hasPermission],
  );

  const value = useMemo(
    () => ({
      notify,
      prefs,
      togglePref,
      reminders,
      updateReminder,
      hasPermission,
    }),
    [notify, prefs, togglePref, reminders, updateReminder, hasPermission],
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}
