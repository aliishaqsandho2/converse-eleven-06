export interface Order {
  id: string;
  customer_id: string;
  order_number: string;
  description?: string | null;
  fabric_details?: string | null;
  price?: number | null;
  advance_payment?: number | null;
  status: 'pending' | 'completed';
  delivery_date?: string | null;
  created_at: string;
  updated_at: string;
  customer?: {
    id: string;
    name: string;
    phone?: string | null;
  };
}

export interface OrderFormData {
  customer_id: string;
  description?: string;
  fabric_details?: string;
  price?: number;
  advance_payment?: number;
  delivery_date?: string;
}
