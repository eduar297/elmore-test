import type { PriceTier, Product } from "@/models/product";

// ── Types ────────────────────────────────────────────────────────────────────

export interface PricingInfo {
  currentPrice: number;
  previousPrice: number | null;
  activeTier: PriceTier | null;
  nextTier: PriceTier | null;
  hasDiscountFromBase: boolean;
  discountPercentage: number;
  priceChangeReason: string | null;
  maxDiscount: number;
  allTiers: PriceTier[];
}

// ── Pricing Functions ────────────────────────────────────────────────────────

/**
 * Legacy function for backward compatibility - just returns the price
 */
export function getTieredPrice(product: Product, quantity: number): number {
  const qty = Math.max(1, quantity);
  const tiers = [...(product.priceTiers ?? [])].sort(
    (a, b) => a.minQty - b.minQty,
  );

  for (const tier of tiers) {
    const minQty = tier.minQty;
    const maxQty = tier.maxQty ?? Number.POSITIVE_INFINITY;
    if (qty >= minQty && qty <= maxQty) {
      return tier.price;
    }
  }

  return product.salePrice;
}

/**
 * Calculate detailed pricing information including tier data and explanations
 */
export function calculateDetailedPricing(
  product: Product,
  currentQuantity: number,
  previousQuantity?: number,
): PricingInfo {
  const qty = Math.max(1, currentQuantity);
  const prevQty = previousQuantity ? Math.max(1, previousQuantity) : null;

  const tiers = [...(product.priceTiers ?? [])].sort(
    (a, b) => a.minQty - b.minQty,
  );

  // Find active tier for current quantity
  let activeTier: PriceTier | null = null;
  for (const tier of tiers) {
    const minQty = tier.minQty;
    const maxQty = tier.maxQty ?? Number.POSITIVE_INFINITY;
    if (qty >= minQty && qty <= maxQty) {
      activeTier = tier;
      break;
    }
  }

  // Find next tier (higher quantity threshold)
  let nextTier: PriceTier | null = null;
  for (const tier of tiers) {
    if (tier.minQty > qty) {
      nextTier = tier;
      break;
    }
  }

  // Calculate prices
  const currentPrice = activeTier?.price ?? product.salePrice;
  const previousPrice = prevQty ? getTieredPrice(product, prevQty) : null;
  const basePrice = product.salePrice;

  // Calculate discount from base price
  const hasDiscountFromBase = currentPrice < basePrice;
  const discountPercentage = hasDiscountFromBase
    ? Math.round(((basePrice - currentPrice) / basePrice) * 100)
    : 0;

  // Calculate maximum possible discount
  const minPrice =
    tiers.length > 0 ? Math.min(...tiers.map((t) => t.price)) : basePrice;
  const maxDiscount =
    basePrice > minPrice
      ? Math.round(((basePrice - minPrice) / basePrice) * 100)
      : 0;

  // Generate reason for price change
  let priceChangeReason: string | null = null;
  if (previousPrice && previousPrice !== currentPrice) {
    if (activeTier) {
      if (currentPrice < previousPrice) {
        priceChangeReason = `Descuento por volumen: ${activeTier.minQty}+ unidades`;
      } else {
        priceChangeReason = `Precio estándar: menor volumen`;
      }
    } else if (currentPrice > previousPrice) {
      priceChangeReason = `Sin descuento: fuera de rangos`;
    }
  } else if (activeTier && hasDiscountFromBase) {
    priceChangeReason = `Descuento por volumen: ${activeTier.minQty}+ unidades`;
  }

  return {
    currentPrice,
    previousPrice,
    activeTier,
    nextTier,
    hasDiscountFromBase,
    discountPercentage,
    priceChangeReason,
    maxDiscount,
    allTiers: tiers,
  };
}

/**
 * Get formatted tier range text (e.g., "5-9 unidades", "10+ unidades")
 */
export function formatTierRange(tier: PriceTier): string {
  if (tier.maxQty) {
    return `${tier.minQty}-${tier.maxQty} unidades`;
  }
  return `${tier.minQty}+ unidades`;
}

/**
 * Check if a product has price tiers
 */
export function hasVolumePricing(product: Product): boolean {
  return (product.priceTiers?.length ?? 0) > 0;
}

/**
 * Get the best available price for a product (lowest tier price)
 */
export function getBestPrice(product: Product): number {
  const tiers = product.priceTiers ?? [];
  if (tiers.length === 0) return product.salePrice;

  return Math.min(product.salePrice, ...tiers.map((t) => t.price));
}

/**
 * Get preview of first few tiers for display
 */
export function getTierPreview(product: Product, maxTiers = 3): PriceTier[] {
  const tiers = [...(product.priceTiers ?? [])].sort(
    (a, b) => a.minQty - b.minQty,
  );
  return tiers.slice(0, maxTiers);
}
