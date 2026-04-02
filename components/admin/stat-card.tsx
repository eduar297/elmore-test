import { Card, Text, YStack } from "tamagui";

export function StatCard({
  label,
  value,
  icon,
  color,
  detail,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  detail?: string;
}) {
  return (
    <Card
      flex={1}
      p="$2"
      bg="$color1"
      borderWidth={1}
      borderColor="$borderColor"
      style={{ borderRadius: 12 }}
    >
      <YStack gap="$1">
        {icon}
        <Text
          fontSize="$3"
          fontWeight="bold"
          color={color as any}
          numberOfLines={1}
        >
          {value}
        </Text>
        {detail && (
          <Text fontSize={10} color="$color8" numberOfLines={1}>
            {detail}
          </Text>
        )}
        <Text fontSize="$1" color="$color10" numberOfLines={1}>
          {label}
        </Text>
      </YStack>
    </Card>
  );
}
