import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Button, Host } from "@expo/ui/swift-ui";
import { StyleSheet } from "react-native";

export default function TabIosScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">iOS Test</ThemedText>
      <SaveButton />
    </ThemedView>
  );
}

export function SaveButton() {
  return (
    <Host style={{ flex: 1 }}>
      <Button label="Save changes" />
    </Host>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    gap: 16,
  },
});
