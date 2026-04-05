export interface Supplier {
  id: number;
  name: string;
  contactName: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  notes: string | null;
  storeId: number;
  createdAt: string;
  updatedAt: string;
}

export type CreateSupplierInput = Omit<
  Supplier,
  "id" | "createdAt" | "updatedAt" | "storeId"
>;
export type UpdateSupplierInput = Partial<CreateSupplierInput>;
