import type { CartItem } from "@/components/worker/types";
import { ICON_BTN_BG } from "@/constants/colors";
import { usePriceTiers } from "@/hooks/use-price-tiers";
import { formatTierRange } from "@/utils/pricing";
import { Minus, Package, Plus, Trash2 } from "@tamagui/lucide-icons";
import { memo, useCallback, useEffect, useState } from "react";
import { Image, Pressable, StyleSheet } from "react-native";
import { Text, XStack, YStack } from "tamagui";

interface EnhancedCartItemRowProps {
  item: CartItem;
  onChangeQty: (qty: number) => void;
  onRemove: () => void;
  onPriceUpdate?: (newPrice: number) => void;
}

export const EnhancedCartItemRow = memo(function EnhancedCartItemRow({
  item,
  onChangeQty,
  onRemove,
  onPriceUpdate,
}: EnhancedCartItemRowProps) {
  const [previousQuantity, setPreviousQuantity] = useState(item.quantity);

  // Get detailed pricing information
  const pricingInfo = usePriceTiers(
    item.product,
    item.quantity,
    previousQuantity,
  );

  // Use calculated price instead of stored unitPrice
  const currentPrice = pricingInfo.currentPrice;
  const subtotal = item.quantity * currentPrice;

  // Update price when it changes
  useEffect(() => {
    if (onPriceUpdate && currentPrice !== item.unitPrice) {
      onPriceUpdate(currentPrice);
    }
  }, [currentPrice, item.unitPrice, onPriceUpdate]);

  const handleQtyChange = useCallback(
    (newQty: number) => {
      setPreviousQuantity(item.quantity);
      onChangeQty(newQty);
    },
    [item.quantity, onChangeQty],
  );

  const handleDecrement = useCallback(() => {
    if (item.quantity > 1) {
      handleQtyChange(item.quantity - 1);
    }
  }, [item.quantity, handleQtyChange]);

  const handleIncrement = useCallback(() => {
    if (item.quantity < item.product.stockBaseQty) {
      handleQtyChange(item.quantity + 1);
    }
  }, [item.quantity, item.product.stockBaseQty, handleQtyChange]);

  return (
    <XStack
      px="$3"
      py="$3"
      gap="$3"
      style={styles.row}
      borderBottomWidth={StyleSheet.hairlineWidth}
      borderColor="$borderColor"
    >
      {/* Photo */}
      {item.product.photoUri ? (
        <Image
          source={{ uri: item.product.photoUri }}
          style={styles.thumb}
          resizeMode="cover"
        />
      ) : (
        <YStack style={styles.thumbPlaceholder}>
          <Package size={20} color="$color8" />
        </YStack>
      )}

      {/* Content */}
      <YStack flex={1} gap="$1">
        <Text fontSize="$4" fontWeight="600" color="$color" numberOfLines={1}>
          {item.product.name}
        </Text>

        {/* Main row: stepper and price */}
        <XStack style={styles.row} gap="$3">
          {/* Stepper */}
          <XStack bg="$color3" style={styles.stepper} height={36}>
            <Pressable
              onPress={handleDecrement}
              style={styles.stepperBtn}
              hitSlop={8}
            >
              <Minus size={16} color="$color11" />
            </Pressable>
            <Text
              fontSize="$3"
              fontWeight="bold"
              color="$color"
              width={28}
              style={styles.qtyText}
            >
              {item.quantity}
            </Text>
            <Pressable
              onPress={handleIncrement}
              style={[
                styles.stepperBtn,
                item.quantity >= item.product.stockBaseQty &&
                  styles.stepperBtnDisabled,
              ]}
              hitSlop={8}
            >
              <Plus
                size={16}
                color={
                  item.quantity >= item.product.stockBaseQty
                    ? "$color6"
                    : "$color11"
                }
              />
            </Pressable>
          </XStack>

          {/* Price - clean display */}
          <XStack style={styles.row} gap="$2" flex={1}>
            <Text fontSize="$3" color="$color10">
              × ${currentPrice.toFixed(2)}
            </Text>
            <Text fontSize="$2" color="$color8">
              Stock: {item.product.stockBaseQty}
            </Text>
          </XStack>
        </XStack>

        {/* Tier info - combined */}
        {(pricingInfo.activeTier || pricingInfo.nextTier) && (
          <XStack gap="$2" style={styles.row}>
            {pricingInfo.activeTier && (
              <Text fontSize="$2" color="$color9">
                {formatTierRange(pricingInfo.activeTier)}
              </Text>
            )}
            {pricingInfo.nextTier && (
              <Text fontSize="$2" color="$orange10">
                {pricingInfo.nextTier.minQty}+ → $
                {pricingInfo.nextTier.price.toFixed(2)}
              </Text>
            )}
          </XStack>
        )}
      </YStack>

      {/* Subtotal + delete */}
      <YStack style={styles.rightCol} gap="$2">
        <Text fontSize="$5" fontWeight="bold" color="$green10">
          ${subtotal.toFixed(2)}
        </Text>
        <Pressable onPress={onRemove} hitSlop={12} style={styles.deleteBtn}>
          <Trash2 size={18} color="$red10" />
        </Pressable>
      </YStack>
    </XStack>
  );
});

const styles = StyleSheet.create({
  row: { alignItems: "center" },
  thumb: { width: 48, height: 48, borderRadius: 12 },
  thumbPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: ICON_BTN_BG,
    alignItems: "center",
    justifyContent: "center",
  },
  stepper: { borderRadius: 8, alignItems: "center" },
  stepperBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  qtyText: { textAlign: "center" },
  rightCol: { alignItems: "flex-end" },
  deleteBtn: { padding: 6 },
  stepperBtnDisabled: { opacity: 0.35 },
});
