import { Card, Text, XStack, YStack } from "tamagui";

function DeltaBadge({ delta }: { delta: number }) {
  if (delta === 0) return null;
  const up = delta > 0;
  return (
    <XStack
      px="$1"
      py={1}
      bg={up ? "$green3" : "$red3"}
      style={{
        borderRadius: 6,
        alignItems: "center",
      }}
    >
      <Text fontSize={9} fontWeight="600" color={up ? "$green10" : "$red10"}>
        {up ? "▲" : "▼"} {Math.abs(delta).toFixed(0)}%
      </Text>
    </XStack>
  );
}

export function StatCard({
  label,
  value,
  icon,
  color,
  detail,
  delta,
  bg,
  borderColor,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  detail?: string;
  /** Percentage change vs previous period. */
  delta?: number;
  /** Card background override (e.g. "$green2" for tinted cards). */
  bg?: string;
  /** Card border override (e.g. "$green6"). */
  borderColor?: string;
}) {
  return (
    <Card
      flex={1}
      p="$2"
      bg={(bg ?? "$color1") as any}
      borderWidth={1}
      borderColor={(borderColor ?? "$borderColor") as any}
      style={{ borderRadius: 12 }}
    >
      <YStack gap="$1">
        <XStack
          style={{ alignItems: "center", justifyContent: "space-between" }}
        >
          <XStack style={{ alignItems: "center" }} gap="$1">
            {icon}
            <Text fontSize="$1" color="$color10" numberOfLines={1}>
              {label}
            </Text>
          </XStack>
          {delta !== undefined && <DeltaBadge delta={delta} />}
        </XStack>
        <Text
          fontSize="$3"
          fontWeight="bold"
          color={color as any}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.7}
        >
          {value}
        </Text>
        {detail && (
          <Text fontSize={10} color="$color8" numberOfLines={1}>
            {detail}
          </Text>
        )}
      </YStack>
    </Card>
  );
}
