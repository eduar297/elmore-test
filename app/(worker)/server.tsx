import { useLan } from "@/contexts/lan-context";
import { LAN_PORT } from "@/services/lan/protocol";
import {
    Copy,
    Monitor,
    MonitorOff,
    Wifi,
    WifiOff,
} from "@tamagui/lucide-icons";
import * as Clipboard from "expo-clipboard";
import { Alert, ScrollView } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { Button, Text, XStack, YStack } from "tamagui";

export default function ServerScreen() {
  const {
    serverRunning,
    startServer,
    stopServer,
    pairingCode,
    serverIp,
    serverIps,
    connectedDisplays,
  } = useLan();

  const handleToggle = async () => {
    if (serverRunning) {
      Alert.alert(
        "Detener servidor",
        "Las pantallas conectadas se desconectarán.",
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Detener",
            style: "destructive",
            onPress: () => stopServer(),
          },
        ],
      );
    } else {
      await startServer();
    }
  };

  const handleCopyCode = async () => {
    try {
      await Clipboard.setStringAsync(pairingCode);
      Alert.alert("Copiado", "Código copiado al portapapeles");
    } catch {
      // Clipboard may not be available
    }
  };

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
      style={{ flex: 1 }}
    >
      <YStack flex={1} bg="$background" p="$4" gap="$4">
        {/* Status card */}
        <XStack
          bg={serverRunning ? "$green2" : "$color2"}
          p="$4"
          style={{ borderRadius: 14, alignItems: "center" }}
          gap="$3"
          borderWidth={1}
          borderColor={serverRunning ? "$green5" : "$borderColor"}
        >
          {serverRunning ? (
            <Monitor size={32} color="$green10" />
          ) : (
            <MonitorOff size={32} color="$color10" />
          )}
          <YStack flex={1}>
            <Text fontSize="$5" fontWeight="bold" color="$color">
              {serverRunning ? "Servidor activo" : "Servidor apagado"}
            </Text>
            {serverRunning && (
              <YStack gap="$1">
                <Text fontSize="$3" color="$color10">
                  {connectedDisplays} pantalla
                  {connectedDisplays !== 1 ? "s" : ""} conectada
                  {connectedDisplays !== 1 ? "s" : ""}
                </Text>
                {serverIps.length > 1 ? (
                  <YStack gap="$0.5">
                    <Text fontSize="$2" fontWeight="600" color="$color10">
                      IPs disponibles:
                    </Text>
                    {serverIps.map((ip, index) => (
                      <Text key={ip} fontSize="$2" color="$color10">
                        • {ip}
                        {index === 0 ? " (principal)" : ""}
                      </Text>
                    ))}
                  </YStack>
                ) : (
                  <Text fontSize="$3" color="$color10">
                    IP: {serverIp}
                  </Text>
                )}
              </YStack>
            )}
          </YStack>
        </XStack>

        {/* Pairing QR + Code */}
        {serverRunning && (
          <YStack
            bg="$blue2"
            p="$4"
            style={{ borderRadius: 14, alignItems: "center" }}
            gap="$4"
            borderWidth={1}
            borderColor="$blue5"
          >
            <Text fontSize="$4" color="$blue10" fontWeight="600">
              Código de emparejamiento
            </Text>

            {/* QR Code */}
            <YStack bg="white" p="$3" style={{ borderRadius: 12 }}>
              <QRCode
                value={`morehub://${serverIp}:${LAN_PORT}/${pairingCode}`}
                size={180}
                backgroundColor="white"
                color="black"
              />
            </YStack>

            <Text
              fontSize="$3"
              color="$color10"
              style={{ textAlign: "center" }}
            >
              Escanea el QR
            </Text>

            {/* Manual code fallback */}
            <YStack
              bg="$blue3"
              px="$4"
              py="$3"
              style={{ borderRadius: 12, alignItems: "center" }}
              gap="$1.5"
            >
              <Text fontSize="$2" color="$color10">
                O ingresa el código manualmente
              </Text>
              <XStack style={{ alignItems: "center" }} gap="$3">
                <Text
                  fontSize={36}
                  fontWeight="900"
                  color="$blue10"
                  letterSpacing={8}
                >
                  {pairingCode}
                </Text>
                <Button
                  size="$4"
                  circular
                  chromeless
                  icon={<Copy size={20} />}
                  onPress={handleCopyCode}
                />
              </XStack>
            </YStack>

            {/* Connection info for multiple IPs */}
            {serverIps.length > 1 && (
              <YStack
                bg="$color2"
                px="$4"
                py="$3"
                style={{ borderRadius: 12 }}
                gap="$2"
              >
                <Text
                  fontSize="$3"
                  fontWeight="600"
                  color="$color"
                  style={{ textAlign: "center" }}
                >
                  Conexión manual
                </Text>
                <Text
                  fontSize="$2"
                  color="$color10"
                  style={{ textAlign: "center" }}
                >
                  Utiliza cualquiera de estas IPs:
                </Text>
                {serverIps.map((ip, index) => (
                  <Text
                    key={ip}
                    fontSize="$2"
                    color="$color10"
                    style={{ textAlign: "center" }}
                  >
                    {ip}:{LAN_PORT}
                    {index === 0 ? " (principal)" : ""}
                  </Text>
                ))}
              </YStack>
            )}
          </YStack>
        )}

        {/* Not running message */}
        {!serverRunning && (
          <YStack
            flex={1}
            style={{ alignItems: "center", justifyContent: "center" }}
            gap="$3"
            p="$6"
          >
            <WifiOff size={64} color="$color8" />
            <Text
              color="$color10"
              fontSize="$4"
              style={{ textAlign: "center" }}
            >
              Inicia el servidor para conectar pantallas display
            </Text>
          </YStack>
        )}

        {/* Toggle button */}
        <Button
          size="$6"
          theme={serverRunning ? "red" : "green"}
          icon={serverRunning ? WifiOff : Wifi}
          onPress={handleToggle}
        >
          {serverRunning ? "Detener servidor" : "Iniciar servidor LAN"}
        </Button>
      </YStack>
    </ScrollView>
  );
}
