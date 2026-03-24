import { MonthSelector } from "@/components/admin/month-selector";
import { StatCard } from "@/components/admin/stat-card";
import { useExpenseRepository } from "@/hooks/use-expense-repository";
import { useProductRepository } from "@/hooks/use-product-repository";
import { usePurchaseRepository } from "@/hooks/use-purchase-repository";
import { useTicketRepository } from "@/hooks/use-ticket-repository";
import {
    currentYearMonth,
    daysInMonth,
    fmtMoney,
    monthLabel,
    shiftMonth,
} from "@/utils/format";
import {
    BarChart3,
    DollarSign,
    Package,
    TrendingUp,
} from "@tamagui/lucide-icons";
import { useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Dimensions, ScrollView } from "react-native";
import { BarChart } from "react-native-gifted-charts";
import { Card, Separator, Spinner, Text, XStack, YStack } from "tamagui";

const SCREEN_W = Dimensions.get("window").width;

export function OverviewSection() {
  const ticketRepo = useTicketRepository();
  const purchaseRepo = usePurchaseRepository();
  const expenseRepo = useExpenseRepository();
  const productRepo = useProductRepository();

  const [selectedMonth, setSelectedMonth] = useState(currentYearMonth);
  const isCurrentMonth = selectedMonth === currentYearMonth();
  const [loading, setLoading] = useState(true);

  const [todaySales, setTodaySales] = useState({
    totalSales: 0,
    ticketCount: 0,
  });
  const [monthlySales, setMonthlySales] = useState({
    totalSales: 0,
    ticketCount: 0,
  });
  const [dailySalesData, setDailySalesData] = useState<
    { day: number; total: number }[]
  >([]);
  const [monthlyPurchases, setMonthlyPurchases] = useState({
    totalSpent: 0,
    totalTransport: 0,
    purchaseCount: 0,
  });
  const [monthlyExpenseTotal, setMonthlyExpenseTotal] = useState(0);
  const [productCount, setProductCount] = useState(0);
  const [inventoryValue, setInventoryValue] = useState(0);

  const loadData = useCallback(
    async (month: string) => {
      setLoading(true);
      try {
        const [todayS, monthS, daily, monthP, monthE, prods] =
          await Promise.all([
            ticketRepo.todaySummary(),
            ticketRepo.monthlySummary(month),
            ticketRepo.dailySales(month),
            purchaseRepo.monthlySummary(month),
            expenseRepo.monthlyTotal(month),
            productRepo.findAll(),
          ]);
        setTodaySales(todayS);
        setMonthlySales(monthS);
        setDailySalesData(daily);
        setMonthlyPurchases(monthP);
        setMonthlyExpenseTotal(monthE);
        setProductCount(prods.length);
        setInventoryValue(
          prods.reduce(
            (sum, p) => sum + p.pricePerBaseUnit * p.stockBaseQty,
            0,
          ),
        );
      } finally {
        setLoading(false);
      }
    },
    [ticketRepo, purchaseRepo, expenseRepo, productRepo],
  );

  useFocusEffect(
    useCallback(() => {
      loadData(selectedMonth);
    }, [loadData, selectedMonth]),
  );

  const goPrevMonth = () => setSelectedMonth((m) => shiftMonth(m, -1));
  const goNextMonth = () => {
    const next = shiftMonth(selectedMonth, 1);
    if (next <= currentYearMonth()) setSelectedMonth(next);
  };

  const totalEgresos = monthlyPurchases.totalSpent + monthlyExpenseTotal;
  const profit = monthlySales.totalSales - totalEgresos;

  // Daily chart data
  const days = daysInMonth(selectedMonth);
  const chartW = SCREEN_W - 80;
  const barW = Math.max(3, Math.min(14, chartW / days / 1.6));
  const gap = Math.max(1, Math.min(4, chartW / days / 4));

  const barData = useMemo(() => {
    const dataMap = new Map(dailySalesData.map((d) => [d.day, d.total]));
    return Array.from({ length: days }, (_, i) => ({
      value: dataMap.get(i + 1) ?? 0,
      label:
        i === 0 || (i + 1) % 5 === 0 || i === days - 1 ? String(i + 1) : "",
      frontColor: (dataMap.get(i + 1) ?? 0) > 0 ? "#22c55e" : "#555555",
      labelTextStyle: { fontSize: 8, color: "#888" },
    }));
  }, [dailySalesData, days]);

  if (loading) {
    return (
      <YStack
        flex={1}
        style={{ justifyContent: "center", alignItems: "center" }}
        gap="$3"
      >
        <Spinner size="large" color="$blue10" />
        <Text color="$color10">Cargando…</Text>
      </YStack>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <YStack p="$4" gap="$4" pb="$10">
        <MonthSelector
          label={monthLabel(selectedMonth)}
          onPrev={goPrevMonth}
          onNext={goNextMonth}
          canGoForward={!isCurrentMonth}
        />

        {/* KPI Row */}
        <XStack gap="$3">
          {isCurrentMonth && (
            <StatCard
              label="Hoy"
              value={`$${fmtMoney(todaySales.totalSales)}`}
              color="$green10"
              icon={<DollarSign size={16} color="$green10" />}
            />
          )}
          <StatCard
            label="Ventas mes"
            value={`$${fmtMoney(monthlySales.totalSales)}`}
            color="$blue10"
            icon={<TrendingUp size={16} color="$blue10" />}
          />
          <StatCard
            label="Inventario"
            value={`$${fmtMoney(inventoryValue)}`}
            color="$purple10"
            icon={<Package size={16} color="$purple10" />}
          />
        </XStack>

        {/* Daily sales chart */}
        <Card
          bg="$color1"
          borderWidth={1}
          borderColor="$borderColor"
          style={{ borderRadius: 14 }}
          p="$4"
        >
          <YStack gap="$3">
            <XStack gap="$2" style={{ alignItems: "center" }}>
              <BarChart3 size={18} color="$blue10" />
              <Text fontSize="$4" fontWeight="bold" color="$color">
                Ventas diarias
              </Text>
            </XStack>
            {dailySalesData.length > 0 ? (
              <BarChart
                data={barData}
                height={110}
                barWidth={barW}
                spacing={gap}
                noOfSections={3}
                hideRules
                yAxisTextStyle={{ fontSize: 9, color: "#888" }}
                yAxisThickness={0}
                xAxisThickness={0}
                isAnimated
                animationDuration={400}
                barBorderRadius={2}
              />
            ) : (
              <YStack py="$4" style={{ alignItems: "center" }}>
                <Text color="$color8" fontSize="$3">
                  Sin ventas en este período
                </Text>
              </YStack>
            )}
          </YStack>
        </Card>

        {/* Balance card */}
        <Card
          bg={profit >= 0 ? "$green2" : "$red2"}
          borderWidth={1}
          borderColor={profit >= 0 ? "$green6" : "$red6"}
          style={{ borderRadius: 14 }}
          p="$4"
        >
          <YStack gap="$3">
            <XStack gap="$2" style={{ alignItems: "center" }}>
              <TrendingUp
                size={18}
                color={profit >= 0 ? "$green10" : "$red10"}
              />
              <Text fontSize="$5" fontWeight="bold" color="$color">
                Balance del mes
              </Text>
            </XStack>

            <XStack
              style={{
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text fontSize="$3" color="$color10">
                Ingresos (ventas)
              </Text>
              <Text fontSize="$4" fontWeight="600" color="$green10">
                +${fmtMoney(monthlySales.totalSales)}
              </Text>
            </XStack>

            {monthlyPurchases.totalSpent > 0 && (
              <XStack
                style={{
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text fontSize="$3" color="$color10">
                  Compras
                </Text>
                <Text fontSize="$4" fontWeight="600" color="$red10">
                  -${fmtMoney(monthlyPurchases.totalSpent)}
                </Text>
              </XStack>
            )}

            {monthlyExpenseTotal > 0 && (
              <XStack
                style={{
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text fontSize="$3" color="$color10">
                  Gastos operativos
                </Text>
                <Text fontSize="$4" fontWeight="600" color="$red10">
                  -${fmtMoney(monthlyExpenseTotal)}
                </Text>
              </XStack>
            )}

            <Separator />

            <XStack
              style={{
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text fontSize="$5" fontWeight="bold" color="$color">
                {profit >= 0 ? "Ganancia" : "Pérdida"}
              </Text>
              <Text
                fontSize="$7"
                fontWeight="bold"
                color={profit >= 0 ? "$green10" : "$red10"}
              >
                {profit >= 0 ? "+" : "-"}${fmtMoney(Math.abs(profit))}
              </Text>
            </XStack>
          </YStack>
        </Card>

        {/* Quick stats */}
        <XStack gap="$3">
          <StatCard
            label="Tickets hoy"
            value={todaySales.ticketCount}
            color="$blue10"
            icon={<BarChart3 size={16} color="$blue10" />}
          />
          <StatCard
            label="Tickets mes"
            value={monthlySales.ticketCount}
            color="$green10"
            icon={<BarChart3 size={16} color="$green10" />}
          />
          <StatCard
            label="Productos"
            value={productCount}
            color="$purple10"
            icon={<Package size={16} color="$purple10" />}
          />
        </XStack>
      </YStack>
    </ScrollView>
  );
}
