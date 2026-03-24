import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { SQLiteProvider } from "expo-sqlite";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { TamaguiProvider, Theme, useTheme } from "tamagui";

import { migrateDbIfNeeded } from "@/database/migrate";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { config } from "@/tamagui.config";

// Separate component so useTheme() runs inside TamaguiProvider
function AppStack() {
  const colorScheme = useColorScheme();
  const theme = useTheme();

  const headerBg =
    theme.background?.val ?? (colorScheme === "dark" ? "#151718" : "#ffffff");
  const headerTint =
    theme.color?.val ?? (colorScheme === "dark" ? "#ffffff" : "#000000");
  const headerBorder =
    theme.borderColor?.val ?? (colorScheme === "dark" ? "#2a2a2a" : "#e5e5e5");

  const headerScreenOptions = {
    headerStyle: { backgroundColor: headerBg },
    headerTintColor: headerTint,
    headerTitleStyle: { color: headerTint },
    headerShadowVisible: false,
    headerBottomBorderColor: headerBorder,
  };

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen
          name="index"
          options={{ headerShown: false, title: "ElMore" }}
        />
        <Stack.Screen
          name="(admin)"
          options={{ ...headerScreenOptions, title: "Panel Administrador" }}
        />
        <Stack.Screen
          name="(worker)"
          options={{ ...headerScreenOptions, title: "Panel Trabajador" }}
        />
        <Stack.Screen
          name="(display)"
          options={{ ...headerScreenOptions, title: "Panel Visualización" }}
        />
        <Stack.Screen
          name="(test)"
          options={{ ...headerScreenOptions, title: "Panel Test" }}
        />
        <Stack.Screen
          name="modal"
          options={{
            ...headerScreenOptions,
            presentation: "modal",
            title: "Modal",
          }}
        />
      </Stack>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <TamaguiProvider config={config} defaultTheme="light">
      <Theme name={colorScheme === "dark" ? "dark" : "light"}>
        <SQLiteProvider databaseName="elmore.db" onInit={migrateDbIfNeeded}>
          <AppStack />
        </SQLiteProvider>
      </Theme>
    </TamaguiProvider>
  );
}
