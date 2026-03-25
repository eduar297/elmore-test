export type PaymentMethod = "CASH" | "CARD";

export interface Ticket {
  id: number;
  createdAt: string;
  paymentMethod: PaymentMethod;
  total: number;
  itemCount: number;
  workerId: number | null;
  workerName: string | null;
}

export interface TicketItem {
  id: number;
  ticketId: number;
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  barcode: string | null;
  photoUri: string | null;
  originalPrice: number | null;
}

export interface CreateTicketInput {
  paymentMethod: PaymentMethod;
  workerId?: number | null;
  workerName?: string | null;
  items: {
    productId: number;
    productName: string;
    quantity: number;
    unitPrice: number;
  }[];
}
