import type { Unit, UnitCategory } from "@/models/unit";
import type { SQLiteDatabase } from "expo-sqlite";
import { BaseRepository } from "./base.repository";

export class UnitRepository extends BaseRepository<
  Unit,
  never,
  Partial<Omit<Unit, "id">>
> {
  constructor(db: SQLiteDatabase) {
    super(db, "units");
  }

  findAll(): Promise<Unit[]> {
    return super.findAll("name ASC");
  }

  // Units are seeded, not created from the app
  create(): Promise<Unit> {
    throw new Error("Units are read-only");
  }

  findByCategory(categoryId: number): Promise<Unit[]> {
    return this.db.getAllAsync<Unit>(
      "SELECT * FROM units WHERE categoryId = ? ORDER BY name ASC",
      [categoryId],
    );
  }

  findAllCategories(): Promise<UnitCategory[]> {
    return this.db.getAllAsync<UnitCategory>(
      "SELECT * FROM unit_categories ORDER BY name ASC",
    );
  }
}
