import { FinanceSection } from "@/components/admin/finance-section";
import { InventorySection } from "@/components/admin/inventory-section";
import { OverviewSection } from "@/components/admin/overview-section";
import { SalesSection } from "@/components/admin/sales-section";
import { LayoutDashboard } from "@tamagui/lucide-icons";
import { useState } from "react";
import { Button, Text, XStack, YStack } from "tamagui";

type Section = "overview" | "sales" | "inventory" | "finance";

const SECTIONS: { key: Section; label: string }[] = [
  { key: "overview", label: "Resumen" },
  { key: "sales", label: "Ventas" },
  { key: "inventory", label: "Inventario" },
  { key: "finance", label: "Finanzas" },
];

export default function DashboardScreen() {
  const [section, setSection] = useState<Section>("overview");

  return (
    <YStack flex={1} bg="$background">
      {/* Header + Section Tabs */}
      <YStack px="$4" pt="$4" pb="$2" gap="$3" bg="$background">
        <XStack gap="$3" mt="$2" style={{ alignItems: "center" }}>
          <LayoutDashboard size={26} color="$blue10" />
          <Text fontSize="$6" fontWeight="bold" color="$color">
            Dashboard
          </Text>
        </XStack>

        <XStack bg="$color2" style={{ borderRadius: 10 }} p="$1" gap="$1">
          {SECTIONS.map((s) => (
            <Button
              key={s.key}
              flex={1}
              size="$3"
              bg={section === s.key ? "$blue10" : "transparent"}
              onPress={() => setSection(s.key)}
              style={{ borderRadius: 8 }}
            >
              <Text
                fontSize="$2"
                fontWeight="600"
                color={section === s.key ? "white" : "$color10"}
              >
                {s.label}
              </Text>
            </Button>
          ))}
        </XStack>
      </YStack>

      {/* Active Section */}
      {section === "overview" && <OverviewSection />}
      {section === "sales" && <SalesSection />}
      {section === "inventory" && <InventorySection />}
      {section === "finance" && <FinanceSection />}
    </YStack>
  );
}
