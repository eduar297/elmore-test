export type SaleMode = "UNIT" | "VARIABLE";

export interface Product {
  id: number;
  name: string;
  barcode: string;
  pricePerBaseUnit: number;
  baseUnitId: number;
  stockBaseQty: number;
  saleMode: SaleMode;
}

export type CreateProductInput = Omit<Product, "id">;
export type UpdateProductInput = Partial<Omit<Product, "id">>;
