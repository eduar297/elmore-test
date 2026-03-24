import { ChevronLeft, ChevronRight } from "@tamagui/lucide-icons";
import { Button, Card, Text, XStack } from "tamagui";

export function MonthSelector({
  label,
  onPrev,
  onNext,
  canGoForward,
}: {
  label: string;
  onPrev: () => void;
  onNext: () => void;
  canGoForward: boolean;
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
        <Text fontSize="$5" fontWeight="bold" color="$color">
          {label}
        </Text>
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
