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
    <YStack flex={1}>
      {/*
       * Camera fills the available Sheet space.
       * No overflow:"hidden" wrapper — that creates a mask layer that
       * disrupts iOS autofocus. borderRadius applied directly on CameraView.
       * zoom not forced so the system picks the best autofocus distance.
       */}
      <CameraView
        style={{ flex: 1 }}
        facing="back"
        barcodeScannerSettings={{
          barcodeTypes: ["ean13", "ean8", "upc_a", "upc_e"],
        }}
        autofocus="on"
        onBarcodeScanned={handleBarcodeScanned}
      />

      <YStack p="$4" gap="$3">
        <Text color="$color10" fontSize="$3" style={{ textAlign: "center" }}>
          Apunta la cámara al código de barras del producto
        </Text>
        <Button theme="red" size="$4" onPress={onCancel}>
          Cancelar
        </Button>
      </YStack>
    </YStack>
  );
}
