import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { StyleSheet } from "react-native";

export default function TabIndexScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Test</ThemedText>
      <ThemedText>This is a test screen.</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    gap: 16,
  },
});
