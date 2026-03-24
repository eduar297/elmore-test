import { todayISO } from "@/utils/format";
import { Calendar, ChevronLeft, ChevronRight, X } from "@tamagui/lucide-icons";
import { useEffect, useMemo, useState } from "react";
import {
    Modal,
    Pressable,
    Text as RNText,
    StyleSheet,
    View,
    useColorScheme,
} from "react-native";
import type { DateData } from "react-native-calendars";
import { Calendar as RNCalendar } from "react-native-calendars";
import { Button, Card, Text, XStack } from "tamagui";

export type Period = "day" | "week" | "month" | "year" | "range";

export interface DateRange {
  from: string;
  to: string;
}

const PERIOD_LABELS: Record<Period, string> = {
  day: "Día",
  week: "Semana",
  month: "Mes",
  year: "Año",
  range: "Rango",
};

export function PeriodTabs({
  period,
  onChangePeriod,
}: {
  period: Period;
  onChangePeriod: (p: Period) => void;
}) {
  return (
    <XStack
      bg="$color2"
      style={{ borderRadius: 10 }}
      p="$1"
      gap={4}
      height={38}
    >
      {(["day", "week", "month", "year", "range"] as Period[]).map((p) => {
        const active = period === p;
        return (
          <Pressable
            key={p}
            onPress={() => onChangePeriod(p)}
            style={{
              flex: 1,
              borderRadius: 8,
              backgroundColor: active ? "#2563eb" : "transparent",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text
              fontSize={12}
              fontWeight="700"
              color={active ? "white" : "$color10"}
            >
              {PERIOD_LABELS[p]}
            </Text>
          </Pressable>
        );
      })}
    </XStack>
  );
}

export function DateNavigator({
  label,
  onPrev,
  onNext,
  canGoForward,
  onCalendarPress,
}: {
  label: string;
  onPrev: () => void;
  onNext: () => void;
  canGoForward: boolean;
  onCalendarPress?: () => void;
}) {
  return (
    <Card
      bg="$color1"
      borderWidth={1}
      borderColor="$borderColor"
      style={{ borderRadius: 12 }}
      p="$2"
    >
      <XStack style={{ alignItems: "center", justifyContent: "space-between" }}>
        <Button size="$3" chromeless icon={ChevronLeft} onPress={onPrev} />
        <Pressable
          onPress={onCalendarPress}
          style={{ alignItems: "center", flex: 1 }}
        >
          <Calendar size={14} color="$blue10" />
          <Text
            fontSize="$3"
            fontWeight="600"
            color="$color"
            mt="$0.5"
            style={{ textAlign: "center" }}
          >
            {label}
          </Text>
        </Pressable>
        <Button
          size="$3"
          chromeless
          icon={ChevronRight}
          onPress={onNext}
          disabled={!canGoForward}
          opacity={canGoForward ? 1 : 0.3}
        />
      </XStack>
    </Card>
  );
}

/* ── Calendar picker modal ────────────────────────────────────────────────── */

export function CalendarSheet({
  open,
  onClose,
  mode,
  selectedDay,
  range,
  onSelectDay,
  onSelectRange,
}: {
  open: boolean;
  onClose: () => void;
  mode: "day" | "range";
  selectedDay?: string;
  range?: DateRange;
  onSelectDay?: (date: string) => void;
  onSelectRange?: (range: DateRange) => void;
}) {
  const dark = useColorScheme() === "dark";
  const today = todayISO();

  const c = useMemo(
    () => ({
      bg: dark ? "#1c1c1e" : "#ffffff",
      card: dark ? "#2c2c2e" : "#f2f2f7",
      text: dark ? "#f2f2f7" : "#1c1c1e",
      muted: dark ? "#8e8e93" : "#8e8e93",
      border: dark ? "#3a3a3c" : "#e5e5ea",
      blue: "#2563eb",
      blueLight: "#93c5fd",
      blueFaint: dark ? "#1e3a5f" : "#eff6ff",
      disabled: dark ? "#3a3a3c" : "#d1d1d6",
    }),
    [dark],
  );

  const [rangeStart, setRangeStart] = useState<string | null>(null);
  const [rangeEnd, setRangeEnd] = useState<string | null>(null);

  // Sync internal state whenever the modal opens
  useEffect(() => {
    if (open) {
      setRangeStart(range?.from ?? null);
      setRangeEnd(range?.to ?? null);
    }
  }, [open, range?.from, range?.to]);

  const handleDayPress = (day: DateData) => {
    if (day.dateString > today) return;
    if (mode === "day") {
      onSelectDay?.(day.dateString);
      onClose();
      return;
    }
    if (!rangeStart || (rangeStart && rangeEnd)) {
      setRangeStart(day.dateString);
      setRangeEnd(null);
    } else {
      const s = day.dateString < rangeStart ? day.dateString : rangeStart;
      const e = day.dateString < rangeStart ? rangeStart : day.dateString;
      setRangeStart(s);
      setRangeEnd(e);
    }
  };

  const markedDates = useMemo(() => {
    if (mode === "day") {
      return selectedDay
        ? { [selectedDay]: { selected: true, selectedColor: c.blue } }
        : {};
    }
    if (!rangeStart) return {};
    if (!rangeEnd)
      return { [rangeStart]: { selected: true, selectedColor: c.blue } };
    const marks: Record<
      string,
      {
        selected?: boolean;
        startingDay?: boolean;
        endingDay?: boolean;
        color?: string;
        textColor?: string;
      }
    > = {};
    const start = new Date(rangeStart + "T12:00:00");
    const end = new Date(rangeEnd + "T12:00:00");
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const key = d.toISOString().slice(0, 10);
      marks[key] = {
        color: key === rangeStart || key === rangeEnd ? c.blue : c.blueLight,
        textColor: "white",
        startingDay: key === rangeStart,
        endingDay: key === rangeEnd,
      };
    }
    return marks;
  }, [mode, selectedDay, rangeStart, rangeEnd, c.blue, c.blueLight]);

  const calendarTheme = useMemo(
    () => ({
      backgroundColor: "transparent",
      calendarBackground: "transparent",
      textSectionTitleColor: c.muted,
      selectedDayBackgroundColor: c.blue,
      selectedDayTextColor: "#ffffff",
      todayTextColor: c.blue,
      dayTextColor: c.text,
      textDisabledColor: c.disabled,
      monthTextColor: c.text,
      arrowColor: c.blue,
      textMonthFontWeight: "bold" as const,
      textDayFontSize: 14,
      textMonthFontSize: 15,
    }),
    [c],
  );

  return (
    <Modal
      visible={open}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      {/* Tap-outside overlay */}
      <Pressable style={styles.overlay} onPress={onClose} />

      {/* Centered card (pointerEvents="box-none" lets card children receive touches) */}
      <View style={styles.centeredContainer} pointerEvents="box-none">
        {/* Inner Pressable stops tap from bubbling to overlay */}
        <Pressable onPress={() => {}}>
          <View
            style={[
              styles.card,
              { backgroundColor: c.bg, borderColor: c.border },
            ]}
          >
            {/* Header */}
            <View style={styles.header}>
              <RNText style={[styles.title, { color: c.text }]}>
                {mode === "day" ? "Seleccionar fecha" : "Seleccionar rango"}
              </RNText>
              <Pressable onPress={onClose} style={styles.closeBtn} hitSlop={8}>
                <X size={18} color={c.muted as any} />
              </Pressable>
            </View>

            {/* Range from / to chips */}
            {mode === "range" && (
              <View style={styles.rangeRow}>
                <View
                  style={[
                    styles.rangeChip,
                    {
                      backgroundColor: rangeStart ? c.blueFaint : c.card,
                      borderColor: rangeStart ? c.blue : c.border,
                    },
                  ]}
                >
                  <RNText style={[styles.chipLabel, { color: c.muted }]}>
                    Desde
                  </RNText>
                  <RNText style={[styles.chipValue, { color: c.text }]}>
                    {rangeStart ?? "—"}
                  </RNText>
                </View>
                <RNText style={[styles.arrow, { color: c.muted }]}>→</RNText>
                <View
                  style={[
                    styles.rangeChip,
                    {
                      backgroundColor: rangeEnd ? c.blueFaint : c.card,
                      borderColor: rangeEnd ? c.blue : c.border,
                    },
                  ]}
                >
                  <RNText style={[styles.chipLabel, { color: c.muted }]}>
                    Hasta
                  </RNText>
                  <RNText style={[styles.chipValue, { color: c.text }]}>
                    {rangeEnd ?? "—"}
                  </RNText>
                </View>
              </View>
            )}

            {/* Calendar */}
            <RNCalendar
              markingType={mode === "range" ? "period" : "dot"}
              markedDates={markedDates}
              onDayPress={handleDayPress}
              maxDate={today}
              theme={calendarTheme}
            />

            {/* Confirm button (range only) */}
            {mode === "range" && (
              <View style={styles.confirmRow}>
                <Pressable
                  onPress={() => {
                    if (rangeStart && rangeEnd) {
                      onSelectRange?.({ from: rangeStart, to: rangeEnd });
                      onClose();
                    }
                  }}
                  disabled={!rangeStart || !rangeEnd}
                  style={[
                    styles.confirmBtn,
                    {
                      backgroundColor:
                        rangeStart && rangeEnd ? c.blue : c.disabled,
                      opacity: rangeStart && rangeEnd ? 1 : 0.6,
                    },
                  ]}
                >
                  <RNText style={styles.confirmText}>Aplicar rango</RNText>
                </Pressable>
              </View>
            )}
          </View>
        </Pressable>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 4,
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
  },
  closeBtn: {
    padding: 4,
  },
  rangeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  rangeChip: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  chipLabel: {
    fontSize: 11,
    textAlign: "center",
  },
  chipValue: {
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
  },
  arrow: {
    fontSize: 18,
  },
  confirmRow: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  confirmBtn: {
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: "center",
  },
  confirmText: {
    fontSize: 15,
    fontWeight: "700",
    color: "white",
  },
});
