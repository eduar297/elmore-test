import { Spinner, Text, YStack } from "tamagui";

interface LoadingStateProps {
  message?: string;
  color?: string;
}

export function LoadingState({
  message = "Cargando…",
  color = "$blue10",
}: LoadingStateProps) {
  return (
    <YStack
      flex={1}
      style={{ justifyContent: "center", alignItems: "center" }}
      gap="$3"
    >
      <Spinner size="large" color={color} />
      {message && (
        <Text color="$color10" fontSize="$3">
          {message}
        </Text>
      )}
    </YStack>
  );
}
