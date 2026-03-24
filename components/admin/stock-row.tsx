import type { Product } from "@/models/product";
import type { Unit } from "@/models/unit";
import { Text, XStack, YStack } from "tamagui";

export function StockRow({
  product,
  unit,
  rank,
  lowlight,
}: {
  product: Product;
  unit: Unit | undefined;
  rank?: number;
  lowlight?: boolean;
}) {
  const stockColor =
    product.stockBaseQty === 0
      ? "$red10"
      : product.stockBaseQty <= 5
        ? "$orange10"
        : "$green10";

  return (
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
  );
}
