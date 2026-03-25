import { Tabs } from "expo-router";
import React from "react";

import { HapticTab } from "@/components/haptic-tab";
import { useColorScheme } from "@/hooks/use-color-scheme";
import {
  LayoutDashboard,
  PackageSearch,
  Receipt,
  ShoppingBag,
  Users,
} from "@tamagui/lucide-icons";
import { useTheme } from "tamagui";

export default function AdminLayout() {
  const colorScheme = useColorScheme();
  const theme = useTheme();
  const tint = theme.blue10?.val ?? "#0a7ea4";

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: colorScheme === "dark" ? "#151718" : "#ffffff",
        },
        headerTintColor: colorScheme === "dark" ? "#f2f2f7" : "#18181b",
        headerShadowVisible: false,
        tabBarActiveTintColor: tint,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: colorScheme === "dark" ? "#151718" : "#ffffff",
          borderTopColor: colorScheme === "dark" ? "#2a2a2a" : "#e5e5e5",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Inicio",
          tabBarIcon: ({ color }) => (
            <LayoutDashboard size={26} color={color as any} />
          ),
        }}
      />
      <Tabs.Screen
        name="products"
        options={{
          title: "Catálogo",
          tabBarIcon: ({ color }) => (
            <PackageSearch size={26} color={color as any} />
          ),
        }}
      />
      <Tabs.Screen
        name="purchases"
        options={{
          title: "Compras",
          tabBarIcon: ({ color }) => (
            <ShoppingBag size={26} color={color as any} />
          ),
        }}
      />
      <Tabs.Screen
        name="expenses"
        options={{
          title: "Gastos",
          tabBarIcon: ({ color }) => <Receipt size={26} color={color as any} />,
        }}
      />
      <Tabs.Screen
        name="team"
        options={{
          title: "Equipo",
          tabBarIcon: ({ color }) => <Users size={26} color={color as any} />,
        }}
      />
      {/* Hidden routes */}
      <Tabs.Screen name="suppliers" options={{ href: null }} />
    </Tabs>
  );
}
