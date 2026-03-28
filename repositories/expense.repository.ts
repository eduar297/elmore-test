import type {
  CreateExpenseInput,
  Expense,
  ExpenseCategory,
} from "@/models/expense";
import type { SQLiteDatabase } from "expo-sqlite";
import { BaseRepository } from "./base.repository";

function currentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export class ExpenseRepository extends BaseRepository<
  Expense,
  CreateExpenseInput,
  Partial<Omit<Expense, "id">>
> {
  constructor(db: SQLiteDatabase, storeId?: number) {
    super(db, "expenses", storeId);
  }

  override findAll(): Promise<Expense[]> {
    return super.findAll("date DESC, createdAt DESC");
  }

  async create(input: CreateExpenseInput): Promise<Expense> {
    const result = await this.db.runAsync(
      `INSERT INTO expenses (category, description, amount, date, storeId) VALUES (?, ?, ?, ?, ?)`,
      input.category,
      input.description,
      input.amount,
      input.date,
      this.storeId ?? 1,
    );
    const created = await this.findById(result.lastInsertRowId);
    if (!created) throw new Error("Gasto creado pero no encontrado");
    return created;
  }

  /** Monthly total grouped by category. Pass YYYY-MM or omit for current. */
  async monthlySummaryByCategory(
    month?: string,
  ): Promise<{ category: ExpenseCategory; total: number }[]> {
    const m = month ?? currentMonth();
    const sFilter = this.storeId !== undefined ? " AND storeId = ?" : "";
    const params: any[] = [m];
    if (this.storeId !== undefined) params.push(this.storeId);
    return this.db.getAllAsync<{ category: ExpenseCategory; total: number }>(
      `SELECT category, COALESCE(SUM(amount), 0) as total
       FROM expenses
       WHERE strftime('%Y-%m', date) = ?${sFilter}
       GROUP BY category
       ORDER BY total DESC`,
      params,
    );
  }

  /** Total expenses for a month. Pass YYYY-MM or omit for current. */
  async monthlyTotal(month?: string): Promise<number> {
    const m = month ?? currentMonth();
    const sFilter = this.storeId !== undefined ? " AND storeId = ?" : "";
    const params: any[] = [m];
    if (this.storeId !== undefined) params.push(this.storeId);
    const row = await this.db.getFirstAsync<{ total: number }>(
      `SELECT COALESCE(SUM(amount), 0) as total
       FROM expenses
       WHERE strftime('%Y-%m', date) = ?${sFilter}`,
      params,
    );
    return row?.total ?? 0;
  }

  /** Total expenses for a specific day. */
  async dayTotal(date: string): Promise<number> {
    const sFilter = this.storeId !== undefined ? " AND storeId = ?" : "";
    const params: any[] = [date];
    if (this.storeId !== undefined) params.push(this.storeId);
    const row = await this.db.getFirstAsync<{ total: number }>(
      `SELECT COALESCE(SUM(amount), 0) as total
       FROM expenses
       WHERE date = ?${sFilter}`,
      params,
    );
    return row?.total ?? 0;
  }

  /** Daily expenses by category. */
  async daySummaryByCategory(
    date: string,
  ): Promise<{ category: ExpenseCategory; total: number }[]> {
    const sFilter = this.storeId !== undefined ? " AND storeId = ?" : "";
    const params: any[] = [date];
    if (this.storeId !== undefined) params.push(this.storeId);
    return this.db.getAllAsync<{ category: ExpenseCategory; total: number }>(
      `SELECT category, COALESCE(SUM(amount), 0) as total
       FROM expenses
       WHERE date = ?${sFilter}
       GROUP BY category
       ORDER BY total DESC`,
      params,
    );
  }

  /** Total for a date range. */
  async rangeTotal(from: string, to: string): Promise<number> {
    const sFilter = this.storeId !== undefined ? " AND storeId = ?" : "";
    const params: any[] = [from, to];
    if (this.storeId !== undefined) params.push(this.storeId);
    const row = await this.db.getFirstAsync<{ total: number }>(
      `SELECT COALESCE(SUM(amount), 0) as total
       FROM expenses
       WHERE date BETWEEN ? AND ?${sFilter}`,
      params,
    );
    return row?.total ?? 0;
  }

  /** Category breakdown for a date range. */
  async rangeSummaryByCategory(
    from: string,
    to: string,
  ): Promise<{ category: ExpenseCategory; total: number }[]> {
    const sFilter = this.storeId !== undefined ? " AND storeId = ?" : "";
    const params: any[] = [from, to];
    if (this.storeId !== undefined) params.push(this.storeId);
    return this.db.getAllAsync(
      `SELECT category, COALESCE(SUM(amount), 0) as total
       FROM expenses
       WHERE date BETWEEN ? AND ?${sFilter}
       GROUP BY category
       ORDER BY total DESC`,
      params,
    );
  }

  /** Monthly expense totals for a year (for trend charts). */
  async monthlyTotalsForYear(
    year?: string,
  ): Promise<{ month: number; total: number }[]> {
    const y = year ?? String(new Date().getFullYear());
    const sFilter = this.storeId !== undefined ? " AND storeId = ?" : "";
    const params: any[] = [y];
    if (this.storeId !== undefined) params.push(this.storeId);
    return this.db.getAllAsync(
      `SELECT CAST(strftime('%m', date) AS INTEGER) as month,
              COALESCE(SUM(amount), 0) as total
       FROM expenses
       WHERE strftime('%Y', date) = ?${sFilter}
       GROUP BY month
       ORDER BY month`,
      params,
    );
  }

  /** Expenses for a specific day. */
  findByDay(date: string): Promise<Expense[]> {
    const sFilter = this.storeId !== undefined ? " AND storeId = ?" : "";
    const params: any[] = [date];
    if (this.storeId !== undefined) params.push(this.storeId);
    return this.db.getAllAsync<Expense>(
      `SELECT * FROM expenses WHERE date = ?${sFilter} ORDER BY createdAt DESC`,
      params,
    );
  }

  /** Expenses for a specific month (YYYY-MM). */
  findByMonth(month: string): Promise<Expense[]> {
    const sFilter = this.storeId !== undefined ? " AND storeId = ?" : "";
    const params: any[] = [month];
    if (this.storeId !== undefined) params.push(this.storeId);
    return this.db.getAllAsync<Expense>(
      `SELECT * FROM expenses WHERE strftime('%Y-%m', date) = ?${sFilter} ORDER BY date DESC, createdAt DESC`,
      params,
    );
  }

  /** Expenses for a specific year. */
  findByYear(year: string): Promise<Expense[]> {
    const sFilter = this.storeId !== undefined ? " AND storeId = ?" : "";
    const params: any[] = [year];
    if (this.storeId !== undefined) params.push(this.storeId);
    return this.db.getAllAsync<Expense>(
      `SELECT * FROM expenses WHERE strftime('%Y', date) = ?${sFilter} ORDER BY date DESC, createdAt DESC`,
      params,
    );
  }

  /** Expenses in a date range [from, to] inclusive (YYYY-MM-DD). */
  findByDateRange(from: string, to: string): Promise<Expense[]> {
    const sFilter = this.storeId !== undefined ? " AND storeId = ?" : "";
    const params: any[] = [from, to];
    if (this.storeId !== undefined) params.push(this.storeId);
    return this.db.getAllAsync<Expense>(
      `SELECT * FROM expenses WHERE date >= ? AND date <= ?${sFilter} ORDER BY date DESC, createdAt DESC`,
      params,
    );
  }
}
