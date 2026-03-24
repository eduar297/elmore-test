import { ClipboardList, Receipt } from "@tamagui/lucide-icons";
import { ScrollView } from "react-native";
import { Card, Separator, Text, XStack, YStack } from "tamagui";

// Placeholder sale entry type — will be wired to DB in a future iteration
interface SaleEntry {
  id: number;
  productName: string;
  qty: number;
  total: number;
  timestamp: string;
}

// Placeholder data until sales are persisted
const PLACEHOLDER_SALES: SaleEntry[] = [];

function SaleRow({ sale }: { sale: SaleEntry }) {
  return (
    <XStack px="$4" py="$3" style={{ alignItems: "center" }} gap="$3">
      <Receipt size={20} color="$green10" />
      <YStack flex={1}>
        <Text fontSize="$4" fontWeight="bold" color="$color">
          {sale.productName}
        </Text>
        <Text fontSize="$2" color="$color10">
          {sale.timestamp}
        </Text>
      </YStack>
      <YStack style={{ alignItems: "flex-end" }}>
        <Text fontSize="$4" fontWeight="600" color="$green10">
          ${sale.total.toFixed(2)}
        </Text>
        <Text fontSize="$2" color="$color10">
          x{sale.qty}
        </Text>
      </YStack>
    </XStack>
  );
}

export default function RegisterScreen() {
  return (
    <ScrollView>
      <YStack bg="$background" p="$4" gap="$5" pb="$8">
        {/* Header */}
        <XStack gap="$3" mt="$2" style={{ alignItems: "center" }}>
          <ClipboardList size={26} color="$green10" />
          <YStack>
            <Text fontSize="$6" fontWeight="bold" color="$color">
              Registro de ventas
            </Text>
            <Text fontSize="$3" color="$color10">
              Registro de transacciones del día
            </Text>
          </YStack>
        </XStack>

        {/* Sales list */}
        <Card
          bg="$background"
          borderWidth={1}
          borderColor="$borderColor"
          style={{ borderRadius: 14 }}
          overflow="hidden"
        >
          {PLACEHOLDER_SALES.length === 0 ? (
            <YStack p="$6" style={{ alignItems: "center" }} gap="$3">
              <ClipboardList size={44} color="$color8" />
              <Text fontSize="$5" fontWeight="bold" color="$color">
                Sin ventas hoy
              </Text>
              <Text color="$color10" style={{ textAlign: "center" }}>
                Las ventas registradas desde la pestaña &quot;Ventas&quot;
                aparecerán aquí.
              </Text>
            </YStack>
          ) : (
            PLACEHOLDER_SALES.map((sale, idx) => (
              <YStack key={sale.id}>
                {idx > 0 && <Separator />}
                <SaleRow sale={sale} />
              </YStack>
            ))
          )}
        </Card>
      </YStack>
    </ScrollView>
  );
}
