import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import * as ScreenOrientation from "expo-screen-orientation";
import { useEffect, useState } from "react";
import { Button, StyleSheet } from "react-native";

export default function DisplayScreen() {
  const [started, setStarted] = useState(false);

  useEffect(() => {
    // On unmount, unlock orientation
    return () => {
      ScreenOrientation.unlockAsync();
    };
  }, []);

  const handleStart = async () => {
    await ScreenOrientation.lockAsync(
      ScreenOrientation.OrientationLock.LANDSCAPE,
    );
    setStarted(true);
  };

  if (!started) {
    return (
      <ThemedView style={styles.container}>
        <Button title="Iniciar" onPress={handleStart} />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">🖥️ DISPLAY MODE</ThemedText>
      <ThemedText>Pantalla horizontal para mostrador</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    gap: 16,
    justifyContent: "center",
    alignItems: "center",
  },
});
