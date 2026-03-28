import type {
  CreateSupplierInput,
  Supplier,
  UpdateSupplierInput,
} from "@/models/supplier";
import type { SQLiteDatabase } from "expo-sqlite";
import { BaseRepository } from "./base.repository";

export class SupplierRepository extends BaseRepository<
  Supplier,
  CreateSupplierInput,
  UpdateSupplierInput
> {
  constructor(db: SQLiteDatabase, storeId?: number) {
    super(db, "suppliers", storeId);
  }

  findAll(): Promise<Supplier[]> {
    return super.findAll("name ASC");
  }

  async create(input: CreateSupplierInput): Promise<Supplier> {
    const result = await this.db.runAsync(
      `INSERT INTO suppliers (name, contactName, phone, email, address, notes, storeId)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      input.name,
      input.contactName ?? null,
      input.phone ?? null,
      input.email ?? null,
      input.address ?? null,
      input.notes ?? null,
      this.storeId ?? 1,
    );
    const created = await this.findById(result.lastInsertRowId);
    if (!created) throw new Error("Proveedor creado pero no encontrado");
    return created;
  }
}
