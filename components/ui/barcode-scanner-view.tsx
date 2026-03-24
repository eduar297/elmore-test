import {
  BarcodeScanningResult,
  CameraView,
  useCameraPermissions,
} from "expo-camera";
import { useState } from "react";
import { Button, Text, YStack } from "tamagui";

export interface BarcodeScannerViewProps {
  onScanned: (barcode: string) => void;
  onCancel: () => void;
  autoCloseOnScan?: boolean;
}

export function BarcodeScannerView({
  onScanned,
  onCancel,
  autoCloseOnScan = true,
}: BarcodeScannerViewProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  function handleBarcodeScanned(result: BarcodeScanningResult) {
    if (scanned) return;
    setScanned(true);
    onScanned(result.data);
    if (autoCloseOnScan) {
      onCancel();
    }
  }

  if (!permission) {
    return <YStack flex={1} />;
  }

  if (!permission.granted) {
    return (
      <YStack
        flex={1}
        p="$6"
        gap="$4"
        style={{ justifyContent: "center", alignItems: "center" }}
      >
        <Text color="$color" style={{ textAlign: "center" }} fontSize="$4">
          Se necesita acceso a la cámara para escanear códigos de barras.
        </Text>
        <Button theme="blue" size="$4" onPress={requestPermission}>
          Conceder permiso de cámara
        </Button>
      </YStack>
    );
  }

  return (
    <YStack flex={1} p="$4" gap="$4">
      {/* Camera viewport — fixed height to avoid taking the whole screen */}
      <YStack
        style={{
          borderRadius: 16,
          overflow: "hidden",
          height: 300,
          width: "100%",
        }}
      >
        <CameraView
          style={{ flex: 1 }}
          facing="back"
          barcodeScannerSettings={{
            barcodeTypes: ["ean13", "ean8", "upc_a", "upc_e"],
          }}
          autofocus="on"
          zoom={0}
          onBarcodeScanned={handleBarcodeScanned}
        />
      </YStack>

      <Text color="$color10" fontSize="$3" style={{ textAlign: "center" }}>
        Apunta la cámara al código de barras del producto
      </Text>

      <Button theme="red" size="$4" onPress={onCancel}>
        Cancelar
      </Button>
    </YStack>
  );
}
