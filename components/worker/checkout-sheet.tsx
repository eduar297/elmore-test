import type { CartItem } from "@/components/worker/types";
import { OVERLAY } from "@/constants/colors";
import type { PaymentMethod } from "@/models/ticket";
import { Banknote, CreditCard, ShoppingCart } from "@tamagui/lucide-icons";
import { memo } from "react";
import { Button, Card, Sheet, Spinner, Text, XStack, YStack } from "tamagui";

interface CheckoutSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  themeName: string;
  cart: CartItem[];
  cartTotal: number;
  paymentMethod: PaymentMethod;
  onPaymentMethodChange: (method: PaymentMethod) => void;
  confirming: boolean;
  onConfirm: () => void;
}

export const CheckoutSheet = memo(function CheckoutSheet({
  open,
  onOpenChange,
  themeName,
  cart,
  cartTotal,
  paymentMethod,
  onPaymentMethodChange,
  confirming,
  onConfirm,
}: CheckoutSheetProps) {
  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      modal
      snapPoints={[65]}
      dismissOnSnapToBottom
    >
      <Sheet.Overlay
        enterStyle={{ opacity: 0 }}
        exitStyle={{ opacity: 0 }}
        backgroundColor={OVERLAY}
      />
      <Sheet.Frame bg="$background" theme={themeName as any}>
        <Sheet.Handle />
        <YStack p="$4" gap="$4">
          <Text fontSize="$7" fontWeight="bold" color="$color">
            Confirmar venta
          </Text>

          {/* Order summary */}
          <Card
            borderWidth={1}
            borderColor="$borderColor"
            style={{ borderRadius: 14 }}
            overflow="hidden"
            bg="$color2"
            p="$3.5"
            gap="$2.5"
          >
            {cart.map((item) => {
              const subtotal = item.quantity * item.unitPrice;
              return (
                <XStack
                  key={item.product.id}
                  style={{ alignItems: "center" }}
                  justify="space-between"
                >
                  <Text fontSize="$4" color="$color" flex={1} numberOfLines={1}>
                    {item.product.name}
                  </Text>
                  <Text fontSize="$3" color="$color10" mx="$2">
                    x{item.quantity} × ${item.unitPrice.toFixed(2)}
                  </Text>
                  <Text
                    fontSize="$4"
                    fontWeight="bold"
                    color="$green10"
                    width={80}
                    style={{ textAlign: "right" }}
                  >
                    ${subtotal.toFixed(2)}
                  </Text>
                </XStack>
              );
            })}
          </Card>

          {/* Payment method */}
          <YStack gap="$2.5">
            <Text fontSize="$5" fontWeight="bold" color="$color">
              Método de pago
            </Text>
            <XStack gap="$3">
              <Button
                flex={1}
                size="$6"
                icon={Banknote}
                theme={paymentMethod === "CASH" ? "green" : undefined}
                variant={paymentMethod === "CASH" ? undefined : "outlined"}
                onPress={() => onPaymentMethodChange("CASH")}
              >
                Efectivo
              </Button>
              <Button
                flex={1}
                size="$6"
                icon={CreditCard}
                theme={paymentMethod === "CARD" ? "blue" : undefined}
                variant={paymentMethod === "CARD" ? undefined : "outlined"}
                onPress={() => onPaymentMethodChange("CARD")}
              >
                Tarjeta
              </Button>
            </XStack>
          </YStack>

          {/* Total */}
          <XStack
            style={{
              justifyContent: "space-between",
              alignItems: "center",
            }}
            py="$2"
            borderTopWidth={1}
            borderColor="$borderColor"
          >
            <Text fontSize="$7" fontWeight="bold" color="$color">
              Total
            </Text>
            <Text fontSize="$9" fontWeight="bold" color="$green10">
              ${cartTotal.toFixed(2)}
            </Text>
          </XStack>

          {/* Confirm */}
          <Button
            size="$6"
            theme="green"
            icon={confirming ? <Spinner /> : ShoppingCart}
            disabled={confirming || cart.length === 0}
            onPress={onConfirm}
          >
            {confirming ? "Registrando..." : "Confirmar venta"}
          </Button>
        </YStack>
      </Sheet.Frame>
    </Sheet>
  );
});
