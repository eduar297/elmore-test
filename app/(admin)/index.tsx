import { FinanceSection } from "@/components/admin/finance-section";
import { InventorySection } from "@/components/admin/inventory-section";
import { OverviewSection } from "@/components/admin/overview-section";
import { SalesSection } from "@/components/admin/sales-section";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  TrendingUp,
} from "@tamagui/lucide-icons";
import { useState } from "react";
import { Pressable, useColorScheme } from "react-native";
import { Text, XStack, YStack } from "tamagui";

type Section = "overview" | "sales" | "inventory" | "finance";

const SECTIONS: {
  key: Section;
  label: string;

  Icon: React.ComponentType<any>;
}[] = [
  { key: "overview", label: "Resumen", Icon: LayoutDashboard },
  { key: "sales", label: "Ventas", Icon: ShoppingCart },
  { key: "inventory", label: "Inventario", Icon: Package },
  { key: "finance", label: "Finanzas", Icon: TrendingUp },
];

export default function DashboardScreen() {
  const [section, setSection] = useState<Section>("overview");
  const dark = useColorScheme() === "dark";

  const activeColor = "#2563eb";
  const inactiveColor = dark ? "#6b7280" : "#9ca3af";
  const indicatorBg = dark ? "#0f172a" : "#f1f5f9";
  const borderColor = dark ? "#27272a" : "#e4e4e7";

  return (
    <YStack flex={1} bg="$background">
      {/* Section tabs */}
      <XStack
        mx="$4"
        mb="$3"
        style={{
          borderRadius: 16,
          backgroundColor: indicatorBg,
          borderWidth: 1,
          borderColor,
          overflow: "hidden",
        }}
      >
        {SECTIONS.map((s, i) => {
          const active = section === s.key;
          const isLast = i === SECTIONS.length - 1;
          return (
            <Pressable
              key={s.key}
              onPress={() => setSection(s.key)}
              style={{
                flex: 1,
                paddingVertical: 10,
                alignItems: "center",
                gap: 4,
                borderRightWidth: isLast ? 0 : 1,
                borderRightColor: borderColor,
                backgroundColor: active
                  ? dark
                    ? "#1e3a5f"
                    : "#dbeafe"
                  : "transparent",
              }}
            >
              <s.Icon size={18} color={active ? activeColor : inactiveColor} />
              <Text
                fontSize={10}
                fontWeight={active ? "700" : "500"}
                color={active ? activeColor : inactiveColor}
                style={{ letterSpacing: 0.2 }}
              >
                {s.label}
              </Text>
              {/* Active indicator dot */}
              {active && (
                <YStack
                  style={{
                    position: "absolute",
                    bottom: 4,
                    width: 4,
                    height: 4,
                    borderRadius: 2,
                    backgroundColor: activeColor,
                  }}
                />
              )}
            </Pressable>
          );
        })}
      </XStack>

      {/* Active Section */}
      {section === "overview" && <OverviewSection />}
      {section === "sales" && <SalesSection />}
      {section === "inventory" && <InventorySection />}
      {section === "finance" && <FinanceSection />}
    </YStack>
  );
}
