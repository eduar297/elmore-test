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

  /** Map SQLite integer (0/1) to boolean for `visible` field. */
  private mapRow(row: any): Product {
    return { ...row, visible: !!row.visible };
  }

  async findAll(orderBy?: string): Promise<Product[]> {
    const rows = await this.db.getAllAsync<any>(
      `SELECT * FROM products ORDER BY ${orderBy ?? "name ASC"}`,
    );
    return rows.map(this.mapRow);
  }

  /** Only visible products, sorted by name. Used for worker views. */
  async findAllVisible(): Promise<Product[]> {
    const rows = await this.db.getAllAsync<any>(
      "SELECT * FROM products WHERE visible = 1 ORDER BY name ASC",
    );
    return rows.map(this.mapRow);
  }

  async findById(id: number): Promise<Product | null> {
    const row = await this.db.getFirstAsync<any>(
      "SELECT * FROM products WHERE id = ?",
      [id],
    );
    return row ? this.mapRow(row) : null;
  }

  async findByBarcode(barcode: string): Promise<Product | null> {
    const row = await this.db.getFirstAsync<any>(
      "SELECT * FROM products WHERE barcode = ?",
      [barcode],
    );
    return row ? this.mapRow(row) : null;
  }

  /** Find a visible product by barcode (for worker scanner). */
  async findVisibleByBarcode(barcode: string): Promise<Product | null> {
    const row = await this.db.getFirstAsync<any>(
      "SELECT * FROM products WHERE barcode = ? AND visible = 1",
      [barcode],
    );
    return row ? this.mapRow(row) : null;
  }

  async create(input: CreateProductInput): Promise<Product> {
    await this.db.runAsync(
      `INSERT INTO products (name, barcode, pricePerBaseUnit, costPrice, salePrice, visible, baseUnitId, stockBaseQty, saleMode, photoUri)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      input.name,
      input.barcode,
      input.costPrice,
      input.costPrice,
      input.salePrice,
      input.visible ? 1 : 0,
      input.baseUnitId,
      input.stockBaseQty,
      input.saleMode,
      input.photoUri ?? null,
    );
    const created = await this.findByBarcode(input.barcode);
    if (!created) throw new Error("Producto creado pero no encontrado");
    return created;
  }

  async update(id: number, input: UpdateProductInput): Promise<Product> {
    const sets: string[] = [];
    const vals: any[] = [];

    const map: Record<string, string> = {
      name: "name",
      barcode: "barcode",
      costPrice: "costPrice",
      salePrice: "salePrice",
      pricePerBaseUnit: "pricePerBaseUnit",
      baseUnitId: "baseUnitId",
      stockBaseQty: "stockBaseQty",
      saleMode: "saleMode",
      photoUri: "photoUri",
    };

    for (const [key, col] of Object.entries(map)) {
      if ((input as any)[key] !== undefined) {
        sets.push(`${col} = ?`);
        vals.push((input as any)[key]);
      }
    }

    if (input.visible !== undefined) {
      sets.push("visible = ?");
      vals.push(input.visible ? 1 : 0);
    }

    // Keep pricePerBaseUnit in sync with costPrice for backward compat
    if (input.costPrice !== undefined && input.pricePerBaseUnit === undefined) {
      sets.push("pricePerBaseUnit = ?");
      vals.push(input.costPrice);
    }

    if (sets.length > 0) {
      vals.push(id);
      await this.db.runAsync(
        `UPDATE products SET ${sets.join(", ")} WHERE id = ?`,
        ...vals,
      );
    }

    const updated = await this.findById(id);
    if (!updated) throw new Error("Producto no encontrado");
    return updated;
  }

  /** Bulk-update sale prices for multiple products. */
  async bulkUpdateSalePrice(
    updates: { id: number; salePrice: number }[],
  ): Promise<void> {
    for (const u of updates) {
      await this.db.runAsync(
        "UPDATE products SET salePrice = ? WHERE id = ?",
        u.salePrice,
        u.id,
      );
    }
  }
}
