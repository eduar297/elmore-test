import { useColorScheme } from "@/hooks/use-color-scheme";
import React from "react";
import { Pressable } from "react-native";
import { Text, XStack, YStack } from "tamagui";

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
  const inactiveColor = dark ? "#6b7280" : "#9ca3af";
  const indicatorBg = dark ? "#0f172a" : "#f1f5f9";
  const borderColor = dark ? "#27272a" : "#e4e4e7";
  const activeBg = dark ? "#1e3a5f" : "#dbeafe";

  return (
    <XStack
      mx="$4"
      mt="$2"
      mb="$3"
      style={{
        borderRadius: 16,
        backgroundColor: indicatorBg,
        borderWidth: 1,
        borderColor,
        overflow: "hidden",
      }}
    >
      {tabs.map((tab, i) => {
        const isActive = active === tab.key;
        const isLast = i === tabs.length - 1;
        return (
          <Pressable
            key={tab.key}
            onPress={() => onSelect(tab.key)}
            style={{
              flex: 1,
              paddingVertical: 10,
              alignItems: "center",
              gap: 4,
              borderRightWidth: isLast ? 0 : 1,
              borderRightColor: borderColor,
              backgroundColor: isActive ? activeBg : "transparent",
            }}
          >
            <tab.Icon
              size={18}
              color={isActive ? accentColor : inactiveColor}
            />
            <Text
              fontSize={10}
              fontWeight={isActive ? "700" : "500"}
              style={{
                color: isActive ? accentColor : inactiveColor,
                letterSpacing: 0.2,
              }}
            >
              {tab.label}
            </Text>
            {isActive && (
              <YStack
                style={{
                  position: "absolute",
                  bottom: 4,
                  width: 4,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: accentColor,
                }}
              />
            )}
          </Pressable>
        );
      })}
    </XStack>
  );
}
