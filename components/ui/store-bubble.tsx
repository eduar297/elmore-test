import { usePreferences } from "@/contexts/preferences-context";
import { useStore } from "@/contexts/store-context";
import { Store as StoreIcon } from "@tamagui/lucide-icons";
import React, { useRef } from "react";
import {
    Animated,
    Dimensions,
    Image,
    PanResponder,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const BUBBLE_SIZE = 44;
const EDGE_MARGIN = 8;

export function StoreBubble() {
  const { showStoreBubble } = usePreferences();
  const { currentStore } = useStore();
  const insets = useSafeAreaInsets();

  const pan = useRef(new Animated.ValueXY({ x: EDGE_MARGIN, y: 120 })).current;
  const lastPos = useRef({ x: EDGE_MARGIN, y: 120 });

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, g) =>
        Math.abs(g.dx) > 4 || Math.abs(g.dy) > 4,
      onPanResponderGrant: () => {
        pan.setOffset({ x: lastPos.current.x, y: lastPos.current.y });
        pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: (_, g) => {
        pan.flattenOffset();
        const { width: sw, height: sh } = Dimensions.get("window");
        const cx = lastPos.current.x + g.dx + BUBBLE_SIZE / 2;
        const rawY = lastPos.current.y + g.dy;

        const minY = insets.top + EDGE_MARGIN;
        const maxY = sh - insets.bottom - BUBBLE_SIZE - EDGE_MARGIN;

        const snapX =
          cx < sw / 2 ? EDGE_MARGIN : sw - BUBBLE_SIZE - EDGE_MARGIN;
        const snapY = Math.max(minY, Math.min(rawY, maxY));

        lastPos.current = { x: snapX, y: snapY };

        Animated.spring(pan, {
          toValue: { x: snapX, y: snapY },
          useNativeDriver: false,
          tension: 60,
          friction: 8,
        }).start();
      },
    }),
  ).current;

  if (!showStoreBubble || !currentStore) return null;

  const storeColor = currentStore.color ?? "#3b82f6";

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={[
        styles.bubble,
        {
          backgroundColor: storeColor,
          transform: pan.getTranslateTransform(),
        },
      ]}
    >
      {currentStore.logoUri ? (
        <Image
          source={{ uri: currentStore.logoUri }}
          style={styles.bubbleLogo}
        />
      ) : (
        <StoreIcon size={18} color="white" />
      )}
      <View style={styles.nameTag}>
        <Text style={styles.nameText} numberOfLines={1}>
          {currentStore.name}
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  bubble: {
    position: "absolute",
    width: BUBBLE_SIZE,
    height: BUBBLE_SIZE,
    borderRadius: BUBBLE_SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 8,
    zIndex: 9999,
  },
  bubbleLogo: {
    width: BUBBLE_SIZE - 6,
    height: BUBBLE_SIZE - 6,
    borderRadius: (BUBBLE_SIZE - 6) / 2,
  },
  nameTag: {
    position: "absolute",
    top: BUBBLE_SIZE + 2,
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    maxWidth: 100,
  },
  nameText: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "600",
    textAlign: "center",
  },
});
