import type {
    CreatePurchaseInput,
    Purchase,
    PurchaseItem,
} from "@/models/purchase";
import type { SQLiteDatabase } from "expo-sqlite";
import { BaseRepository } from "./base.repository";

export class PurchaseRepository extends BaseRepository<
  Purchase,
  CreatePurchaseInput,
  Partial<Omit<Purchase, "id">>
> {
  constructor(db: SQLiteDatabase) {
    super(db, "purchases");
  }

  /** All purchases, newest first. */
  findAll(): Promise<Purchase[]> {
    return super.findAll("createdAt DESC");
  }

  /** Record a purchase, add stock to each product — all in one transaction. */
  async create(input: CreatePurchaseInput): Promise<Purchase> {
    const total = input.items.reduce(
      (sum, i) => sum + i.quantity * i.unitCost,
      0,
    );
    let purchaseId = 0;

    await this.db.withExclusiveTransactionAsync(async (tx) => {
      const result = await tx.runAsync(
        `INSERT INTO purchases (supplierId, supplierName, notes, total, itemCount)
         VALUES (?, ?, ?, ?, ?)`,
        input.supplierId ?? null,
        input.supplierName,
        input.notes ?? null,
        total,
        input.items.length,
      );
      purchaseId = result.lastInsertRowId;

      for (const item of input.items) {
        const subtotal = item.quantity * item.unitCost;
        await tx.runAsync(
          `INSERT INTO purchase_items (purchaseId, productId, productName, quantity, unitCost, subtotal)
           VALUES (?, ?, ?, ?, ?, ?)`,
          purchaseId,
          item.productId,
          item.productName,
          item.quantity,
          item.unitCost,
          subtotal,
        );
        // Add incoming stock to the product
        await tx.runAsync(
          `UPDATE products SET stockBaseQty = stockBaseQty + ? WHERE id = ?`,
          item.quantity,
          item.productId,
        );
      }
    });

    const purchase = await this.findById(purchaseId);
    if (!purchase) throw new Error("Compra creada pero no encontrada");
    return purchase;
  }

  findItemsByPurchaseId(purchaseId: number): Promise<PurchaseItem[]> {
    return this.db.getAllAsync<PurchaseItem>(
      `SELECT * FROM purchase_items WHERE purchaseId = ? ORDER BY id`,
      [purchaseId],
    );
  }

  /** Total spend and purchase count for the current calendar month. */
  async monthlySummary(): Promise<{
    totalSpent: number;
    purchaseCount: number;
  }> {
    const row = await this.db.getFirstAsync<{
      totalSpent: number;
      purchaseCount: number;
    }>(
      `SELECT COALESCE(SUM(total), 0) as totalSpent, COUNT(*) as purchaseCount
       FROM purchases
       WHERE strftime('%Y-%m', createdAt) = strftime('%Y-%m', 'now', 'localtime')`,
    );
    return row ?? { totalSpent: 0, purchaseCount: 0 };
  }
}
