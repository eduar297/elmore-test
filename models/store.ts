export interface Store {
  id: number;
  name: string;
  address: string | null;
  phone: string | null;
  logoUri: string | null;
  color: string;
  /** HH:mm format, e.g. "08:00" */
  openingTime: string | null;
  /** HH:mm format, e.g. "18:00" */
  closingTime: string | null;
  createdAt: string;
}

export type CreateStoreInput = Omit<Store, "id" | "createdAt">;
export type UpdateStoreInput = Partial<CreateStoreInput>;
