import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { StyleSheet } from "react-native";

export interface ProductDetailProps {
  product: {
    id: number;
    name: string;
    barcode: string;
    pricePerBaseUnit: number;
    stockBaseQty: number;
    saleMode: string;
    baseUnitId: number;
  };
}

export function ProductDetail({ product }: ProductDetailProps) {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">{product.name}</ThemedText>
      <ThemedText>Código: {product.barcode}</ThemedText>
      <ThemedText>Precio: {product.pricePerBaseUnit}</ThemedText>
      <ThemedText>Stock: {product.stockBaseQty}</ThemedText>
      <ThemedText>Modo de venta: {product.saleMode}</ThemedText>
      {/* Puedes agregar más detalles aquí */}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 8,
    marginVertical: 8,
    gap: 8,
  },
});
