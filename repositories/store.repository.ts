import type { CreateStoreInput, Store, UpdateStoreInput } from "@/models/store";
import type { SQLiteDatabase } from "expo-sqlite";
import { BaseRepository } from "./base.repository";

export class StoreRepository extends BaseRepository<
  Store,
  CreateStoreInput,
  UpdateStoreInput
> {
  constructor(db: SQLiteDatabase) {
    super(db, "stores");
  }

  findAll(): Promise<Store[]> {
    return super.findAll("name ASC");
  }

  async create(input: CreateStoreInput): Promise<Store> {
    const result = await this.db.runAsync(
      `INSERT INTO stores (name, address, phone, logoUri, color) VALUES (?, ?, ?, ?, ?)`,
      input.name,
      input.address ?? null,
      input.phone ?? null,
      input.logoUri ?? null,
      input.color ?? "#3b82f6",
    );
    const created = await this.findById(result.lastInsertRowId);
    if (!created) throw new Error("Tienda creada pero no encontrada");
    return created;
  }
}
