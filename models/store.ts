export interface Store {
  id: number;
  name: string;
  address: string | null;
  phone: string | null;
  logoUri: string | null;
  createdAt: string;
}

export type CreateStoreInput = Omit<Store, "id" | "createdAt">;
export type UpdateStoreInput = Partial<CreateStoreInput>;
