import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import {
  BarcodeScanningResult,
  CameraView,
  useCameraPermissions,
} from "expo-camera";
import { useState } from "react";
import { Button, StyleSheet, View } from "react-native";

export default function AdminScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [barcode, setBarcode] = useState<string | null>(null);
  const [showScanner, setShowScanner] = useState(false);

  function handleBarcodeScanned(result: BarcodeScanningResult) {
    setScanned(true);
    setBarcode(result.data);
    setShowScanner(false);
  }

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
          <CameraView
            style={{ flex: 1, width: "100%" }}
            facing="back"
            barcodeScannerSettings={{
              barcodeTypes: ["ean13", "ean8", "upc_a", "upc_e", "code128"],
            }}
            autofocus="on"
            ratio="16:9"
            onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
          />
          <Button title="Cancelar" onPress={() => setShowScanner(false)} />
        </View>
      )}
      {barcode && (
        <ThemedText type="default">Código escaneado: {barcode}</ThemedText>
      )}
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
