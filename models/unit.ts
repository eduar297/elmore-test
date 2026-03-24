export interface UnitCategory {
  id: number;
  name: string;
}

export interface Unit {
  id: number;
  name: string;
  symbol: string;
  categoryId: number;
  toBaseFactor: number;
}
