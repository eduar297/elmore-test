import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useState } from "react";
import { Button, StyleSheet, TextInput } from "react-native";

export interface ProductFormProps {
  barcode: string;
  onSubmit: (data: Omit<ProductFormData, "id">) => void;
  loading?: boolean;
}

export interface ProductFormData {
  id?: number;
  name: string;
  barcode: string;
  pricePerBaseUnit: number;
  stockBaseQty: number;
  saleMode: string;
  baseUnitId: number;
}

export function ProductForm({ barcode, onSubmit, loading }: ProductFormProps) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [saleMode, setSaleMode] = useState("UNIT");
  const [baseUnitId, setBaseUnitId] = useState("");

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Crear producto</ThemedText>
      <TextInput
        style={styles.input}
        placeholder="Nombre"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Precio"
        value={price}
        onChangeText={setPrice}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Stock inicial"
        value={stock}
        onChangeText={setStock}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="ID unidad base"
        value={baseUnitId}
        onChangeText={setBaseUnitId}
        keyboardType="numeric"
      />
      {/* Aquí podrías poner un picker para saleMode y baseUnitId */}
      <Button
        title={loading ? "Guardando..." : "Crear"}
        onPress={() =>
          onSubmit({
            name,
            barcode,
            pricePerBaseUnit: parseFloat(price),
            stockBaseQty: parseFloat(stock),
            saleMode,
            baseUnitId: parseInt(baseUnitId, 10),
          })
        }
        disabled={loading}
      />
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
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    padding: 8,
    marginBottom: 8,
    backgroundColor: "transparent",
    color: undefined, // Let system theme override this if needed
  },
});
