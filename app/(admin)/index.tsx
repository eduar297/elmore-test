import { ProductDetail } from "@/components/product/product-detail";
import { ProductForm } from "@/components/product/product-form";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { BarcodeScannerView } from "@/components/ui/barcode-scanner-view";
import { useCameraPermissions } from "expo-camera";
import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useState } from "react";
import { Button, Modal, StyleSheet, View } from "react-native";

export default function AdminScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const db = useSQLiteContext();
  const [scanned, setScanned] = useState(false);
  const [barcode, setBarcode] = useState<string | null>(null);
  const [showScanner, setShowScanner] = useState(false);
  const [product, setProduct] = useState<any | null>(null);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);

  const handleBarcodeScanned = useCallback(
    async (barcode: string) => {
      if (scanned) return;
      setScanned(true);
      setBarcode(barcode);
      setShowScanner(false);
      setProduct(null);
      setLookupError(null);
      try {
        const found = await db.getFirstAsync<any>(
          "SELECT * FROM products WHERE barcode = ?",
          [barcode],
        );
        if (found) {
          setProduct(found);
        } else {
          setProduct(null);
          setShowCreateModal(true);
        }
      } catch (e) {
        setProduct(null);
        setLookupError("Error buscando producto: " + (e as Error).message);
      }
    },
    [db, scanned],
  );

  if (!permission) {
    // Permisos cargando
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <ThemedText type="title">👤 Panel Administrador</ThemedText>
        <ThemedText>
          Se requiere permiso de cámara para escanear productos.
        </ThemedText>
        <Button onPress={requestPermission} title="Conceder permiso" />
      </View>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">👤 Panel Administrador</ThemedText>
      <ThemedText>
        Aquí podrás escanear productos, crearlos y editarlos.
      </ThemedText>
      <Button
        title="Escanear código de barras"
        onPress={() => {
          setShowScanner(true);
          setScanned(false);
          setBarcode(null);
        }}
      />
      {showScanner && (
        <View style={{ flex: 1, minHeight: 300, marginVertical: 16 }}>
          <BarcodeScannerView
            onScanned={handleBarcodeScanned}
            onCancel={() => setShowScanner(false)}
          />
        </View>
      )}
      {barcode && product && (
        <>
          <ThemedText type="default">Código escaneado: {barcode}</ThemedText>
          <ProductDetail product={product} />
          {lookupError && (
            <ThemedText type="subtitle" style={{ color: "red", marginTop: 8 }}>
              {lookupError}
            </ThemedText>
          )}
        </>
      )}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        onRequestClose={() => setShowCreateModal(false)}
        presentationStyle="formSheet"
      >
        <ProductForm
          barcode={barcode || ""}
          loading={creating}
          onSubmit={async (data) => {
            setCreating(true);
            try {
              await db.runAsync(
                `INSERT INTO products (name, barcode, pricePerBaseUnit, baseUnitId, stockBaseQty, saleMode) VALUES (?, ?, ?, ?, ?, ?)`,
                data.name,
                data.barcode,
                data.pricePerBaseUnit,
                data.baseUnitId,
                data.stockBaseQty,
                data.saleMode,
              );
              // Buscar el producto recién creado para mostrarlo
              const created = await db.getFirstAsync<any>(
                "SELECT * FROM products WHERE barcode = ?",
                [data.barcode],
              );
              setProduct(created);
              setShowCreateModal(false);
              setLookupError(null);
            } catch (e) {
              setLookupError("Error creando producto: " + (e as Error).message);
            } finally {
              setCreating(false);
            }
          }}
        />
        {lookupError && (
          <ThemedText type="subtitle" style={{ color: "red", margin: 16 }}>
            {lookupError}
          </ThemedText>
        )}
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    gap: 16,
  },
});
