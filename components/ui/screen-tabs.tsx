import * as Haptics from "expo-haptics";
import React, { Fragment, useCallback, useRef } from "react";
import { Pressable, ScrollView, useWindowDimensions } from "react-native";
import { Text, useTheme, View } from "tamagui";

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

const TAB_WIDTH = 76;
const RAIL_H_PADDING = 16;
const RAIL_INNER_PAD_H = 12;
const RAIL_INNER_PAD_V = 3;
const TAB_GAP = 8;
const DIVIDER_WIDTH = 1;
const DIVIDER_TOTAL = DIVIDER_WIDTH + TAB_GAP * 2; // 1px line + 8px margin each side = 17px

export function ScreenTabs<T extends string>({
  tabs,
  active,
  onSelect,
  accentColor,
}: ScreenTabsProps<T>) {
  const theme = useTheme();
  const { width: screenWidth } = useWindowDimensions();
  const scrollRef = useRef<ScrollView>(null);

  const accent = accentColor ?? theme.blue10?.val;
  const railBg = theme.color2?.val;
  const railBorder = theme.borderColor?.val;
  const activePillBg = theme.background?.val;
  const inactiveText = theme.color8?.val;
  const dividerColor = theme.color6?.val;
  const shadowColor = theme.shadowColor?.val;

  const availableWidth = screenWidth - RAIL_H_PADDING * 2;
  const innerWidth =
    availableWidth - RAIL_INNER_PAD_H * 2 - DIVIDER_TOTAL * (tabs.length - 1);
  const fitsInline = tabs.length * TAB_WIDTH <= innerWidth;
  const tabWidth = fitsInline ? innerWidth / tabs.length : TAB_WIDTH;

  const handleSelect = useCallback(
    (key: T, index: number) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onSelect(key);
      if (!fitsInline) {
        const x =
          index * (tabWidth + DIVIDER_TOTAL) -
          availableWidth / 2 +
          tabWidth / 2;
        scrollRef.current?.scrollTo({ x: Math.max(0, x), animated: true });
      }
    },
    [onSelect, fitsInline, tabWidth, availableWidth],
  );

  const rail = (
    <View
      style={{
        flexDirection: "row",
        paddingHorizontal: RAIL_INNER_PAD_H,
        paddingVertical: RAIL_INNER_PAD_V,
        alignItems: "stretch",
      }}
    >
      {tabs.map((tab, i) => {
        const isActive = active === tab.key;
        return (
          <Fragment key={tab.key}>
            <Pressable
              onPress={() => handleSelect(tab.key, i)}
              style={{
                width: tabWidth,
                minHeight: 40,
                paddingVertical: 9,
                paddingHorizontal: 4,
                alignItems: "center",
                justifyContent: "center",
                gap: 4,
                borderRadius: 11,
                borderWidth: 1,
                borderColor: isActive ? accent : "transparent",
                backgroundColor: isActive ? activePillBg : "transparent",
                shadowColor: shadowColor,
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: isActive ? 1 : 0,
                shadowRadius: 3,
                elevation: isActive ? 2 : 0,
              }}
            >
              <tab.Icon size={17} color={isActive ? accent : inactiveText} />
              <Text
                fontSize={11}
                fontWeight={isActive ? "700" : "400"}
                numberOfLines={1}
                style={{
                  color: isActive ? accent : inactiveText,
                  letterSpacing: isActive ? 0.1 : 0,
                }}
              >
                {tab.label}
              </Text>
            </Pressable>
            {i < tabs.length - 1 ? (
              <View
                style={{
                  width: 1,
                  marginHorizontal: TAB_GAP,
                  marginVertical: 8,
                  borderRadius: 999,
                  backgroundColor: dividerColor,
                  opacity: 0.6,
                }}
              />
            ) : null}
          </Fragment>
        );
      })}
    </View>
  );

  return (
    <View
      mx="$4"
      mt="$2"
      mb="$3"
      style={{
        borderRadius: 14,
        backgroundColor: railBg,
        borderWidth: 1,
        borderColor: railBorder,
        overflow: "hidden",
      }}
    >
      {fitsInline ? (
        rail
      ) : (
        <ScrollView
          ref={scrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 0 }}
        >
          {rail}
        </ScrollView>
      )}
    </View>
  );
}
