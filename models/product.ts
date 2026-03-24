export type SaleMode = "UNIT" | "VARIABLE";

export interface Product {
  id: number;
  name: string;
  barcode: string;
  pricePerBaseUnit: number;
  baseUnitId: number;
  stockBaseQty: number;
  saleMode: SaleMode;
  /** Local file URI for the product photo (stored as TEXT in SQLite). Null when no photo set. */
  photoUri: string | null;
}

export type CreateProductInput = Omit<Product, "id">;
export type UpdateProductInput = Partial<Omit<Product, "id">>;
