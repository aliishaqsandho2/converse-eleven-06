import { api } from '@/utils/api';
import { toast } from 'sonner';
import { z } from 'zod';

// Define validation schemas for backup data
const CustomerSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(255),
  phone: z.string().max(20).nullable().optional(),
  qameez_length: z.number().nullable().optional(),
  sleeve_length: z.number().nullable().optional(),
  chest: z.number().nullable().optional(),
  neck: z.number().nullable().optional(),
  waist: z.number().nullable().optional(),
  gher: z.number().nullable().optional(),
  collar_size: z.number().nullable().optional(),
  cuff_width: z.number().nullable().optional(),
  placket_width: z.number().nullable().optional(),
  armhole: z.number().nullable().optional(),
  elbow: z.number().nullable().optional(),
  daman: z.number().nullable().optional(),
  bain: z.number().nullable().optional(),
  shalwar_length: z.number().nullable().optional(),
  paicha: z.number().nullable().optional(),
  shalwar_width: z.number().nullable().optional(),
  front_pocket: z.string().max(500).nullable().optional(),
  side_pocket: z.string().max(500).nullable().optional(),
  shalwar_pocket: z.string().max(500).nullable().optional(),
  notes: z.string().max(2000).nullable().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

const OrderSchema = z.object({
  id: z.string().uuid(),
  customer_id: z.string().uuid(),
  order_number: z.string().min(1).max(50),
  status: z.enum(['pending', 'in_progress', 'completed', 'delivered', 'cancelled']).default('pending'),
  price: z.number().nullable().optional(),
  advance_payment: z.number().nullable().optional(),
  delivery_date: z.string().nullable().optional(),
  description: z.string().max(2000).nullable().optional(),
  fabric_details: z.string().max(1000).nullable().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

const BackupSchema = z.object({
  version: z.string(),
  created_at: z.string(),
  customers: z.array(CustomerSchema),
  orders: z.array(OrderSchema),
});

// Max file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export function useRestore() {
  const restoreBackup = async (file: File): Promise<boolean> => {
    try {
      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        toast.error('فائل بہت بڑی ہے (زیادہ سے زیادہ 10MB)');
        return false;
      }

      // Validate file type
      if (!file.name.endsWith('.json')) {
        toast.error('صرف JSON فائل استعمال کریں');
        return false;
      }

      const text = await file.text();

      // Parse JSON safely
      let parsedData: unknown;
      try {
        parsedData = JSON.parse(text);
      } catch {
        toast.error('فائل کا فارمیٹ غلط ہے');
        return false;
      }

      // Validate backup structure with Zod
      const validationResult = BackupSchema.safeParse(parsedData);

      if (!validationResult.success) {
        console.error('Validation errors:', validationResult.error.errors);
        toast.error('بیک اپ ڈیٹا غلط ہے');
        return false;
      }

      const backupData = validationResult.data;

      // Validate that order customer_ids reference valid customers
      const customerIds = new Set(backupData.customers.map(c => c.id));
      const invalidOrders = backupData.orders.filter(o => !customerIds.has(o.customer_id));

      if (invalidOrders.length > 0) {
        toast.error('کچھ آرڈرز کے گاہک نہیں ملے');
        return false;
      }

      // Delete existing data first (WordPress API doesn't have bulk delete all)
      const existingOrders = await api.get('orders');
      for (const order of existingOrders) {
        await api.delete(`orders/${order.id}`);
      }

      const existingCustomers = await api.get('customers');
      for (const customer of existingCustomers) {
        await api.delete(`customers/${customer.id}`);
      }

      // Prepare customers data (sanitize and ensure proper format)
      const sanitizedCustomers = backupData.customers.map(customer => ({
        id: customer.id,
        name: customer.name.trim().substring(0, 255),
        phone: customer.phone?.trim().substring(0, 20) || null,
        qameez_length: customer.qameez_length ?? null,
        sleeve_length: customer.sleeve_length ?? null,
        chest: customer.chest ?? null,
        neck: customer.neck ?? null,
        waist: customer.waist ?? null,
        gher: customer.gher ?? null,
        collar_size: customer.collar_size ?? null,
        cuff_width: customer.cuff_width ?? null,
        placket_width: customer.placket_width ?? null,
        armhole: customer.armhole ?? null,
        elbow: customer.elbow ?? null,
        daman: customer.daman ?? null,
        bain: customer.bain ?? null,
        shalwar_length: customer.shalwar_length ?? null,
        paicha: customer.paicha ?? null,
        shalwar_width: customer.shalwar_width ?? null,
        front_pocket: customer.front_pocket?.substring(0, 500) || null,
        side_pocket: customer.side_pocket?.substring(0, 500) || null,
        shalwar_pocket: customer.shalwar_pocket?.substring(0, 500) || null,
        notes: customer.notes?.substring(0, 2000) || null,
        created_at: customer.created_at || new Date().toISOString(),
        updated_at: customer.updated_at || new Date().toISOString(),
      }));

      // Restore customers
      for (const customer of sanitizedCustomers) {
        await api.post('customers', customer);
      }

      // Prepare orders data (sanitize and ensure proper format)
      const sanitizedOrders = backupData.orders.map(order => ({
        id: order.id,
        customer_id: order.customer_id,
        order_number: order.order_number.trim().substring(0, 50),
        order_status: order.status || 'pending', // Key changed to order_status
        price: order.price ?? null,
        advance_payment: order.advance_payment ?? null,
        delivery_date: order.delivery_date || null,
        description: order.description?.substring(0, 2000) || null,
        fabric_details: order.fabric_details?.substring(0, 1000) || null,
        created_at: order.created_at || new Date().toISOString(),
        updated_at: order.updated_at || new Date().toISOString(),
      }));

      // Restore orders
      for (const order of sanitizedOrders) {
        await api.post('orders', order);
      }

      toast.success(`ڈیٹا واپس آ گیا - ${backupData.customers.length} گاہک، ${backupData.orders.length} آرڈرز`);
      return true;
    } catch (error) {
      console.error('Restore error:', error);
      toast.error('ڈیٹا واپس لانے میں مسئلہ ہوا');
      return false;
    }
  };

  return { restoreBackup };
}