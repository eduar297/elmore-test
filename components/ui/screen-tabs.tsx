import { useColorScheme } from "@/hooks/use-color-scheme";
import React from "react";
import { Pressable } from "react-native";
import { Text, XStack } from "tamagui";

export interface TabDef<T extends string = string> {
  key: T;
  label: string;
  Icon: React.ComponentType<any>;
}

interface ScreenTabsProps<T extends string> {
  tabs: TabDef<T>[];
  active: T;
  onSelect: (key: T) => void;
  accentColor?: string;
}

export function ScreenTabs<T extends string>({
  tabs,
  active,
  onSelect,
  accentColor = "#2563eb",
}: ScreenTabsProps<T>) {
  const dark = useColorScheme() === "dark";

  // Track background: subtle pill on the outer rail
  const railBg = dark ? "#18181b" : "#f4f4f5";
  const railBorder = dark ? "#3f3f46" : "#e4e4e7";

  // Active pill gets a solid white (light) or zinc-800 (dark) card feel
  const activePillBg = dark ? "#27272a" : "#ffffff";
  const activePillShadow = dark ? "transparent" : "#00000014";

  // Text / icon colors — high contrast
  const activeTextColor = accentColor;
  const inactiveTextColor = dark ? "#71717a" : "#a1a1aa";

  return (
    <XStack
      mx="$4"
      mt="$2"
      mb="$3"
      style={{
        borderRadius: 14,
        backgroundColor: railBg,
        borderWidth: 1,
        borderColor: railBorder,
        padding: 3,
        gap: 3,
      }}
    >
      {tabs.map((tab) => {
        const isActive = active === tab.key;
        return (
          <Pressable
            key={tab.key}
            onPress={() => onSelect(tab.key)}
            style={{
              flex: 1,
              paddingVertical: 9,
              paddingHorizontal: 4,
              alignItems: "center",
              gap: 4,
              borderRadius: 11,
              backgroundColor: isActive ? activePillBg : "transparent",
              // subtle lift shadow on active (iOS)
              shadowColor: isActive ? activePillShadow : "transparent",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: isActive ? 1 : 0,
              shadowRadius: 3,
              elevation: isActive ? 2 : 0,
            }}
          >
            <tab.Icon
              size={17}
              color={isActive ? activeTextColor : inactiveTextColor}
            />
            <Text
              fontSize={11}
              fontWeight={isActive ? "700" : "400"}
              style={{
                color: isActive ? activeTextColor : inactiveTextColor,
                letterSpacing: isActive ? 0.1 : 0,
              }}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </XStack>
  );
}
