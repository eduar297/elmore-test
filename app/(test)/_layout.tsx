import { Tabs } from "expo-router";
import React from "react";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function TestLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Index",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="house.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="ios"
        options={{
          title: "iOS",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="flask.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="android"
        options={{
          title: "Android",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="flask.fill" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
