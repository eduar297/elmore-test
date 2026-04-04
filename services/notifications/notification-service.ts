import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

import type {
    AppNotification,
    NotificationCategory,
    ScheduledReminder,
} from "./types";

// ── Permissions ─────────────────────────────────────────────────────────────

/** Request permission and configure the notification channel (Android). */
export async function setupNotifications(): Promise<boolean> {
  // Android channel
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "General",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#3b82f6",
    });
  }

  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === "granted") return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

// ── Notification handler defaults ───────────────────────────────────────────

/** Configure how notifications behave when the app is in the foreground. */
export function configureForegroundBehaviour() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

// ── Send (local, immediate) ─────────────────────────────────────────────────

const CATEGORY_CHANNEL: Record<NotificationCategory, string> = {
  sync_reminder: "default",
  sync_result: "default",
  stock_alert: "default",
  general: "default",
};

/** Fire a local notification right now. Returns the notification id. */
export async function sendLocalNotification(
  n: Omit<AppNotification, "id" | "timestamp">,
): Promise<string> {
  return Notifications.scheduleNotificationAsync({
    content: {
      title: n.title,
      body: n.body,
      data: { category: n.category, severity: n.severity, ...(n.data ?? {}) },
      sound: "default",
      ...(Platform.OS === "android"
        ? { channelId: CATEGORY_CHANNEL[n.category] }
        : {}),
    },
    trigger: null, // immediate
  });
}

// ── Scheduled reminders ─────────────────────────────────────────────────────

/**
 * Schedule (or reschedule) a daily reminder.
 * Cancels any previous notification with the same identifier first.
 */
export async function scheduleReminder(
  reminder: ScheduledReminder,
): Promise<string | null> {
  // Always cancel previous to avoid duplicates
  await cancelReminder(reminder.id);

  if (!reminder.enabled) return null;

  return Notifications.scheduleNotificationAsync({
    identifier: reminder.id,
    content: {
      title: reminder.label,
      body: reminder.body,
      data: { category: reminder.category, reminderId: reminder.id },
      sound: "default",
      ...(Platform.OS === "android" ? { channelId: "default" } : {}),
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: reminder.hour,
      minute: reminder.minute,
    },
  });
}

/** Cancel a previously scheduled reminder by its id. */
export async function cancelReminder(id: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(id);
}

/** Cancel ALL scheduled notifications. */
export async function cancelAllReminders(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

/** List all currently scheduled notifications (for debugging). */
export async function listScheduled() {
  return Notifications.getAllScheduledNotificationsAsync();
}
