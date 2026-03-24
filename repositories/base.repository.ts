import type { SQLiteDatabase } from "expo-sqlite";

export abstract class BaseRepository<
  T extends { id: number },
  CreateInput,
  UpdateInput extends Partial<Omit<T, "id">>,
> {
  constructor(
    protected readonly db: SQLiteDatabase,
    protected readonly table: string,
  ) {}

  findById(id: number): Promise<T | null> {
    return this.db.getFirstAsync<T>(
      `SELECT * FROM ${this.table} WHERE id = ?`,
      [id],
    );
  }

  findAll(orderBy = "id ASC"): Promise<T[]> {
    return this.db.getAllAsync<T>(
      `SELECT * FROM ${this.table} ORDER BY ${orderBy}`,
    );
  }

  abstract create(input: CreateInput): Promise<T>;

  async update(id: number, input: UpdateInput): Promise<T> {
    const fields = (Object.keys(input) as (keyof UpdateInput)[]).filter(
      (f) => input[f] !== undefined,
    );
    const setClause = fields.map((f) => `${String(f)} = ?`).join(", ");
    const values = fields.map((f) => input[f] as string | number);
    await this.db.runAsync(
      `UPDATE ${this.table} SET ${setClause} WHERE id = ?`,
      ...values,
      id,
    );
    const updated = await this.findById(id);
    if (!updated)
      throw new Error(`${this.table}: registro no encontrado tras actualizar`);
    return updated;
  }

  async delete(id: number): Promise<void> {
    await this.db.runAsync(`DELETE FROM ${this.table} WHERE id = ?`, [id]);
  }
}
