import { useNotifications } from "@/components/ui/notification-provider";
import { useColors } from "@/hooks/use-colors";
import type {
    NotificationPrefKey,
    ScheduledReminder,
} from "@/services/notifications/types";
import {
    Bell,
    BellOff,
    Clock,
    Package,
    RefreshCw,
} from "@tamagui/lucide-icons";
import React, { useCallback } from "react";
import { Switch, Text, TouchableOpacity, View } from "react-native";
import { settingStyles as styles } from "./shared";

// ── Pref display config ─────────────────────────────────────────────────────

const PREF_ITEMS: {
  key: NotificationPrefKey;
  label: string;
  description: string;
  Icon: typeof Bell;
  colorKey: "blue" | "green" | "orange" | "danger";
}[] = [
  {
    key: "notif_sync_reminder",
    label: "Recordatorios de sincronización",
    description:
      "Notificaciones programadas para recordarte sincronizar con los vendedores",
    Icon: RefreshCw,
    colorKey: "blue",
  },
  {
    key: "notif_sync_result",
    label: "Resultados de sincronización",
    description:
      "Notificación al completar una sincronización con los cambios realizados",
    Icon: RefreshCw,
    colorKey: "green",
  },
  {
    key: "notif_stock_alert",
    label: "Alertas de inventario",
    description: "Avisos cuando un producto tiene stock bajo o se agota",
    Icon: Package,
    colorKey: "orange",
  },
  {
    key: "notif_general",
    label: "Notificaciones generales",
    description: "Información general y avisos del sistema",
    Icon: Bell,
    colorKey: "blue",
  },
];

// ── Embeddable notification cards (used inside PreferencesSection) ───────────

export function NotificationCards() {
  const c = useColors();
  const {
    prefs,
    togglePref,
    reminders,
    updateReminder,
    hasPermission,
    notify,
  } = useNotifications();

  const handleEditTime = useCallback(
    (reminder: ScheduledReminder) => {
      const nextHour = (reminder.hour + 1) % 24;
      updateReminder({ ...reminder, hour: nextHour });
    },
    [updateReminder],
  );

  const handleEditTimeMinute = useCallback(
    (reminder: ScheduledReminder) => {
      const nextMinute = (reminder.minute + 15) % 60;
      updateReminder({ ...reminder, minute: nextMinute });
    },
    [updateReminder],
  );

  const handleTestNotification = useCallback(() => {
    notify({
      category: "general",
      severity: "success",
      title: "Notificación de prueba",
      body: "¡Las notificaciones están funcionando correctamente!",
    });
  }, [notify]);

  return (
    <>
      {/* ── Permission warning ───────────────────────────────────── */}
      {!hasPermission && (
        <View
          style={[
            styles.profileCard,
            {
              backgroundColor: c.card,
              borderColor: c.danger,
              borderWidth: 1.5,
            },
          ]}
        >
          <View style={styles.cardTitleRow}>
            <BellOff size={15} color={c.danger as any} />
            <Text style={[styles.cardTitle, { color: c.danger }]}>
              Permisos requeridos
            </Text>
          </View>
          <Text
            style={[
              styles.workerMeta,
              { color: c.muted, paddingHorizontal: 14, paddingBottom: 12 },
            ]}
          >
            Las notificaciones del sistema están desactivadas. Actívalas en
            Ajustes del dispositivo para recibir recordatorios.
          </Text>
        </View>
      )}

      {/* ── Notification types ───────────────────────────────────── */}
      <View
        style={[
          styles.profileCard,
          { backgroundColor: c.card, borderColor: c.border },
        ]}
      >
        <View style={styles.cardTitleRow}>
          <Bell size={14} color={c.blue as any} />
          <Text style={[styles.cardTitle, { color: c.text }]}>
            Notificaciones
          </Text>
        </View>

        {PREF_ITEMS.map((item) => (
          <View key={item.key} style={styles.prefRow}>
            <View style={{ flex: 1, gap: 2 }}>
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
              >
                <item.Icon size={14} color={c[item.colorKey] as any} />
                <Text style={[styles.workerName, { color: c.text }]}>
                  {item.label}
                </Text>
              </View>
              <Text style={[styles.workerMeta, { color: c.muted }]}>
                {item.description}
              </Text>
            </View>
            <Switch
              value={prefs[item.key]}
              onValueChange={(v) => togglePref(item.key, v)}
              trackColor={{ false: c.border, true: c.blue }}
            />
          </View>
        ))}

        {/* Test button inline */}
        <View style={{ paddingHorizontal: 14, paddingBottom: 12 }}>
          <TouchableOpacity
            style={[
              styles.addBtn,
              { backgroundColor: c.blue, alignSelf: "flex-start" },
            ]}
            onPress={handleTestNotification}
          >
            <Bell size={14} color="#fff" />
            <Text style={styles.addBtnText}>Probar</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Scheduled reminders ──────────────────────────────────── */}
      <View
        style={[
          styles.profileCard,
          { backgroundColor: c.card, borderColor: c.border },
        ]}
      >
        <View style={styles.cardTitleRow}>
          <Clock size={14} color={c.blue as any} />
          <Text style={[styles.cardTitle, { color: c.text }]}>
            Recordatorios programados
          </Text>
        </View>
        <Text
          style={[
            styles.workerMeta,
            { color: c.muted, paddingHorizontal: 14, marginTop: -4 },
          ]}
        >
          Recibe un recordatorio diario para sincronizar con los vendedores
        </Text>

        {reminders.map((reminder) => (
          <View key={reminder.id} style={styles.prefRow}>
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={[styles.workerName, { color: c.text }]}>
                {reminder.label}
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 2,
                  opacity: reminder.enabled ? 1 : 0.4,
                }}
              >
                <Clock size={12} color={c.blue as any} />
                <TouchableOpacity
                  onPress={() => handleEditTime(reminder)}
                  disabled={!reminder.enabled}
                  hitSlop={8}
                >
                  <Text
                    style={{
                      fontSize: 15,
                      color: c.blue,
                      fontWeight: "600",
                      fontVariant: ["tabular-nums"],
                    }}
                  >
                    {String(reminder.hour).padStart(2, "0")}
                  </Text>
                </TouchableOpacity>
                <Text
                  style={{ fontSize: 15, color: c.blue, fontWeight: "600" }}
                >
                  :
                </Text>
                <TouchableOpacity
                  onPress={() => handleEditTimeMinute(reminder)}
                  disabled={!reminder.enabled}
                  hitSlop={8}
                >
                  <Text
                    style={{
                      fontSize: 15,
                      color: c.blue,
                      fontWeight: "600",
                      fontVariant: ["tabular-nums"],
                    }}
                  >
                    {String(reminder.minute).padStart(2, "0")}
                  </Text>
                </TouchableOpacity>
                <Text style={{ fontSize: 11, color: c.muted, marginLeft: 4 }}>
                  toca para ajustar
                </Text>
              </View>
            </View>
            <Switch
              value={reminder.enabled}
              onValueChange={(v) => updateReminder({ ...reminder, enabled: v })}
              trackColor={{ false: c.border, true: c.blue }}
            />
          </View>
        ))}
      </View>
    </>
  );
}
