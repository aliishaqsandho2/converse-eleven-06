import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/utils/api';
import { Order, OrderFormData } from '@/types/order';
import { toast } from 'sonner';

export function useOrders(status?: 'pending' | 'completed') {
  return useQuery({
    queryKey: ['orders', status],
    queryFn: async (): Promise<Order[]> => {
      const params: Record<string, string> = {};
      if (status) {
        params.order_status = status; // Changed from status to order_status
      }
      return api.get('orders', params);
    },
    staleTime: 1000 * 60,
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: ['order', id],
    queryFn: async (): Promise<Order | null> => {
      try {
        return await api.get(`orders/${id}`);
      } catch (error) {
        if (error instanceof Error && error.message.includes('404')) return null;
        throw error;
      }
    },
    enabled: !!id,
  });
}

async function generateOrderNumber(): Promise<string> {
  const today = new Date();
  const datePrefix = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;

  // Fetch orders for today to count them
  const orders = await api.get('orders');
  const todaysOrders = orders.filter((o: Order) => o.order_number.startsWith(datePrefix));

  const orderNum = todaysOrders.length + 1;
  return `${datePrefix}-${String(orderNum).padStart(3, '0')}`;
}

export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: OrderFormData): Promise<Order> => {
      const orderNumber = await generateOrderNumber();

      const response = await api.post('orders', {
        ...data,
        order_number: orderNumber,
        order_status: 'pending', // Changed from status
      });

      // Fetch the full order to get nested customer data if needed, 
      // or assume the response/local data is enough
      const newOrder = await api.get(`orders/${response.id}`);
      return newOrder as Order;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('آرڈر کامیابی سے بن گیا');
    },
    onError: (error) => {
      console.error('Error creating order:', error);
      toast.error('آرڈر بنانے میں مسئلہ ہوا');
    },
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'pending' | 'completed' }): Promise<void> => {
      await api.put(`orders/${id}`, { order_status: status }); // Changed from status
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      const message = 'آرڈر کی حیثیت تبدیل ہو گئی';
      toast.success(message);
    },
    onError: (error) => {
      console.error('Error updating order status:', error);
      toast.error('حیثیت تبدیل کرنے میں مسئلہ ہوا');
    },
  });
}

export function useDeleteOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await api.delete(`orders/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('آرڈر کامیابی سے حذف ہو گیا');
    },
    onError: (error) => {
      console.error('Error deleting order:', error);
      toast.error('آرڈر حذف کرنے میں مسئلہ ہوا');
    },
  });
}
