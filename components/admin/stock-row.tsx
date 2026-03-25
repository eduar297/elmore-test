import type { Product } from "@/models/product";
import type { Unit } from "@/models/unit";
import { Package } from "@tamagui/lucide-icons";
import { Image, Pressable } from "react-native";
import { Text, XStack, YStack } from "tamagui";

export function StockRow({
  product,
  unit,
  rank,
  lowlight,
  onPress,
}: {
  product: Product;
  unit: Unit | undefined;
  rank?: number;
  lowlight?: boolean;
  onPress?: () => void;
}) {
  const stockColor =
    product.stockBaseQty === 0
      ? "$red10"
      : product.stockBaseQty <= 5
        ? "$orange10"
        : "$green10";

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({ opacity: onPress && pressed ? 0.6 : 1 })}
    >
      <XStack px="$4" py="$3" style={{ alignItems: "center" }} gap="$3">
        {rank !== undefined && (
          <Text
            fontSize="$3"
            color="$color8"
            style={{ width: 20, textAlign: "center" }}
          >
            {rank}
          </Text>
        )}
        {/* Thumbnail */}
        {product.photoUri ? (
          <Image
            source={{ uri: product.photoUri }}
            style={{ width: 40, height: 40, borderRadius: 8 }}
            resizeMode="cover"
          />
        ) : (
          <YStack
            width={40}
            height={40}
            style={{
              borderRadius: 8,
              backgroundColor: "#e5e7eb",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Package size={20} color="$color8" />
          </YStack>
        )}
        <YStack flex={1}>
          <Text
            fontSize="$3"
            fontWeight="600"
            color={lowlight ? "$orange10" : "$color"}
            numberOfLines={1}
          >
            {product.name}
          </Text>
          <Text fontSize="$2" color="$color10">
            {product.barcode}
          </Text>
        </YStack>
        <Text fontSize="$4" fontWeight="bold" color={stockColor as any}>
          {product.stockBaseQty} {unit?.symbol ?? "uds"}
        </Text>
      </XStack>
    </Pressable>
  );
}
