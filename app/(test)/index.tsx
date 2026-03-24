import { FlaskConical, Palette, Zap } from "@tamagui/lucide-icons";
import { Button, Card, H2, Separator, Text, XStack, YStack } from "tamagui";

export default function TestScreen() {
  return (
    <YStack flex={1} bg="$background" p="$5" gap="$4">
      {/* Header */}
      <XStack gap="$3" mb="$2" style={{ alignItems: "center" }}>
        <FlaskConical size={28} color="$orange10" />
        <YStack>
          <Text fontSize="$6" fontWeight="bold" color="$color">
            Panel de pruebas
          </Text>
          <Text fontSize="$3" color="$color10">
            Zona de experimentación UI
          </Text>
        </YStack>
      </XStack>

      {/* Color tokens */}
      <Card borderWidth={1} borderColor="$borderColor" p="$4" bg="$background">
        <XStack gap="$2" mb="$3" style={{ alignItems: "center" }}>
          <Palette size={18} color="$color10" />
          <H2 color="$color" fontSize="$5">
            Colores del tema
          </H2>
        </XStack>
        <Separator mb="$3" />
        <XStack gap="$2" flexWrap="wrap">
          {(
            [
              ["$blue10", "$blue2"],
              ["$green10", "$green2"],
              ["$purple10", "$purple2"],
              ["$orange10", "$orange2"],
              ["$red10", "$red2"],
            ] as const
          ).map(([fg, bg]) => (
            <YStack
              key={fg}
              bg={bg}
              px="$3"
              py="$2"
              style={{ borderRadius: 8 }}
            >
              <Text color={fg} fontSize="$2" fontWeight="600">
                {fg}
              </Text>
            </YStack>
          ))}
        </XStack>
      </Card>

      {/* Button variants */}
      <Card borderWidth={1} borderColor="$borderColor" p="$4" bg="$background">
        <XStack gap="$2" mb="$3" style={{ alignItems: "center" }}>
          <Zap size={18} color="$color10" />
          <H2 color="$color" fontSize="$5">
            Botones
          </H2>
        </XStack>
        <Separator mb="$3" />
        <YStack gap="$3">
          <XStack gap="$2" flexWrap="wrap">
            <Button theme="blue" size="$4">
              Azul
            </Button>
            <Button theme="green" size="$4">
              Verde
            </Button>
            <Button theme="red" size="$4">
              Rojo
            </Button>
          </XStack>
          <XStack gap="$2" flexWrap="wrap">
            <Button size="$3" variant="outlined">
              Outlined
            </Button>
            <Button size="$3" disabled opacity={0.5}>
              Disabled
            </Button>
          </XStack>
        </YStack>
      </Card>

      {/* Typography */}
      <Card borderWidth={1} borderColor="$borderColor" p="$4" bg="$background">
        <H2 color="$color" fontSize="$5" mb="$3">
          Tipografía
        </H2>
        <Separator mb="$3" />
        <YStack gap="$2">
          <Text fontSize="$8" fontWeight="900" color="$color">
            Heading
          </Text>
          <Text fontSize="$5" fontWeight="600" color="$color">
            Subheading
          </Text>
          <Text fontSize="$4" color="$color">
            Body normal
          </Text>
          <Text fontSize="$3" color="$color10">
            Caption / secundario
          </Text>
        </YStack>
      </Card>
    </YStack>
  );
}
