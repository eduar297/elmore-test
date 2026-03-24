import type {
    CreateProductInput,
    Product,
    UpdateProductInput,
} from "@/models/product";
import type { SQLiteDatabase } from "expo-sqlite";
import { BaseRepository } from "./base.repository";

export class ProductRepository extends BaseRepository<
  Product,
  CreateProductInput,
  UpdateProductInput
> {
  constructor(db: SQLiteDatabase) {
    super(db, "products");
  }

  findAll(): Promise<Product[]> {
    return super.findAll("name ASC");
  }

  findByBarcode(barcode: string): Promise<Product | null> {
    return this.db.getFirstAsync<Product>(
      "SELECT * FROM products WHERE barcode = ?",
      [barcode],
    );
  }

  async create(input: CreateProductInput): Promise<Product> {
    await this.db.runAsync(
      `INSERT INTO products (name, barcode, pricePerBaseUnit, baseUnitId, stockBaseQty, saleMode, photoUri)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      input.name,
      input.barcode,
      input.pricePerBaseUnit,
      input.baseUnitId,
      input.stockBaseQty,
      input.saleMode,
      input.photoUri ?? null,
    );
    const created = await this.findByBarcode(input.barcode);
    if (!created) throw new Error("Producto creado pero no encontrado");
    return created;
  }
}
