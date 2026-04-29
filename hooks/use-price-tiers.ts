import type { Product } from "@/models/product";
import { calculateDetailedPricing, type PricingInfo } from "@/utils/pricing";
import { useMemo } from "react";

/**
 * Hook to calculate detailed pricing information for a product at a given quantity
 */
export function usePriceTiers(
  product: Product,
  currentQuantity: number,
  previousQuantity?: number,
): PricingInfo {
  return useMemo(() => {
    return calculateDetailedPricing(product, currentQuantity, previousQuantity);
  }, [product, currentQuantity, previousQuantity]);
}

/**
 * Simple hook to get just the price for a given quantity
 */
export function useProductPrice(product: Product, quantity: number): number {
  return useMemo(() => {
    const info = calculateDetailedPricing(product, quantity);
    return info.currentPrice;
  }, [product, quantity]);
}
