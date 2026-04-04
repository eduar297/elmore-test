import type {
    NotificationCategory,
    NotificationSeverity,
} from "@/services/notifications/types";

/** Row from the notification_history table */
export interface NotificationHistoryEntry {
  id: number;
  category: NotificationCategory;
  severity: NotificationSeverity;
  title: string;
  body: string;
  dedupeKey: string | null;
  seen: number;
  createdAt: string;
}
