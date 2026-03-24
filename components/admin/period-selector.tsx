import { todayISO } from "@/utils/format";
import { Calendar, ChevronLeft, ChevronRight } from "@tamagui/lucide-icons";
import { useCallback, useState } from "react";
import { Pressable, useColorScheme } from "react-native";
import type { DateData } from "react-native-calendars";
import { Calendar as RNCalendar } from "react-native-calendars";
import { Button, Card, Sheet, Text, XStack, YStack } from "tamagui";

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

/* ── Calendar picker sheet ────────────────────────────────────────────────── */

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
  const colorScheme = useColorScheme();
  const dark = colorScheme === "dark";
  const today = todayISO();

  const [rangeStart, setRangeStart] = useState<string | null>(
    range?.from ?? null,
  );
  const [rangeEnd, setRangeEnd] = useState<string | null>(range?.to ?? null);

  const handleDayPress = useCallback(
    (day: DateData) => {
      if (day.dateString > today) return;
      if (mode === "day") {
        onSelectDay?.(day.dateString);
        onClose();
        return;
      }
      // Range mode
      if (!rangeStart || (rangeStart && rangeEnd)) {
        setRangeStart(day.dateString);
        setRangeEnd(null);
      } else {
        const start = day.dateString < rangeStart ? day.dateString : rangeStart;
        const end = day.dateString < rangeStart ? rangeStart : day.dateString;
        setRangeStart(start);
        setRangeEnd(end);
      }
    },
    [mode, rangeStart, rangeEnd, today, onSelectDay, onClose],
  );

  const confirmRange = useCallback(() => {
    if (rangeStart && rangeEnd) {
      onSelectRange?.({ from: rangeStart, to: rangeEnd });
      onClose();
    }
  }, [rangeStart, rangeEnd, onSelectRange, onClose]);

  const markedDates = useCallback(() => {
    if (mode === "day") {
      return selectedDay
        ? { [selectedDay]: { selected: true, selectedColor: "#2563eb" } }
        : {};
    }
    if (!rangeStart) return {};
    if (!rangeEnd)
      return {
        [rangeStart]: { selected: true, selectedColor: "#2563eb" },
      };
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
        color: key === rangeStart || key === rangeEnd ? "#2563eb" : "#93c5fd",
        textColor: "white",
        startingDay: key === rangeStart,
        endingDay: key === rangeEnd,
      };
    }
    return marks;
  }, [mode, selectedDay, rangeStart, rangeEnd]);

  const calendarTheme = {
    backgroundColor: "transparent",
    calendarBackground: "transparent",
    textSectionTitleColor: dark ? "#a1a1aa" : "#71717a",
    selectedDayBackgroundColor: "#2563eb",
    selectedDayTextColor: "#ffffff",
    todayTextColor: "#2563eb",
    dayTextColor: dark ? "#fafafa" : "#18181b",
    textDisabledColor: dark ? "#52525b" : "#d4d4d8",
    monthTextColor: dark ? "#fafafa" : "#18181b",
    arrowColor: "#2563eb",
    textMonthFontWeight: "bold" as const,
    textDayFontSize: 14,
    textMonthFontSize: 16,
  };

  return (
    <Sheet
      open={open}
      onOpenChange={(v: boolean) => !v && onClose()}
      snapPoints={[70]}
      dismissOnSnapToBottom
      modal
      zIndex={100_000}
    >
      <Sheet.Overlay />
      <Sheet.Frame bg="$background" style={{ borderRadius: 20 }}>
        <Sheet.Handle bg="$color6" />
        <YStack p="$4" gap="$3">
          <Text fontSize="$5" fontWeight="bold" color="$color">
            {mode === "day" ? "Seleccionar fecha" : "Seleccionar rango"}
          </Text>

          {mode === "range" && (
            <XStack gap="$3" style={{ justifyContent: "center" }}>
              <Card
                flex={1}
                p="$2"
                bg={rangeStart ? "$blue3" : "$color2"}
                borderWidth={1}
                borderColor="$borderColor"
                style={{ borderRadius: 8 }}
              >
                <Text
                  fontSize="$3"
                  style={{ textAlign: "center" }}
                  color="$color"
                >
                  {rangeStart ?? "Desde"}
                </Text>
              </Card>
              <Text
                fontSize="$4"
                color="$color10"
                style={{ alignSelf: "center" }}
              >
                →
              </Text>
              <Card
                flex={1}
                p="$2"
                bg={rangeEnd ? "$blue3" : "$color2"}
                borderWidth={1}
                borderColor="$borderColor"
                style={{ borderRadius: 8 }}
              >
                <Text
                  fontSize="$3"
                  style={{ textAlign: "center" }}
                  color="$color"
                >
                  {rangeEnd ?? "Hasta"}
                </Text>
              </Card>
            </XStack>
          )}

          <RNCalendar
            markingType={mode === "range" ? "period" : "dot"}
            markedDates={markedDates()}
            onDayPress={handleDayPress}
            maxDate={today}
            theme={calendarTheme}
          />

          {mode === "range" && (
            <Pressable
              onPress={confirmRange}
              disabled={!rangeStart || !rangeEnd}
              style={{
                backgroundColor: rangeStart && rangeEnd ? "#2563eb" : "#93c5fd",
                borderRadius: 10,
                paddingVertical: 12,
                alignItems: "center",
                opacity: rangeStart && rangeEnd ? 1 : 0.5,
              }}
            >
              <Text fontSize="$4" fontWeight="700" color="white">
                Aplicar rango
              </Text>
            </Pressable>
          )}
        </YStack>
      </Sheet.Frame>
    </Sheet>
  );
}
