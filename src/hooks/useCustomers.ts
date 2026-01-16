import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/utils/api';
import { Customer, CustomerFormData } from '@/types/customer';
import { toast } from 'sonner';

export function useCustomers(searchQuery: string = '') {
  return useQuery({
    queryKey: ['customers', searchQuery],
    queryFn: async (): Promise<Customer[]> => {
      const params: Record<string, string> = {};
      if (searchQuery.trim()) {
        params.search = searchQuery;
      }
      return api.get('customers', params);
    },
    staleTime: 1000 * 60,
  });
}

export function useCustomer(id: string) {
  return useQuery({
    queryKey: ['customer', id],
    queryFn: async (): Promise<Customer | null> => {
      try {
        return await api.get(`customers/${id}`);
      } catch (error) {
        if (error instanceof Error && error.message.includes('404')) return null;
        throw error;
      }
    },
    enabled: !!id,
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CustomerFormData): Promise<Customer> => {
      const response = await api.post('customers', data);
      return { ...data, id: response.id } as Customer;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success('گاہک کامیابی سے شامل ہو گیا');
    },
    onError: (error) => {
      console.error('Error creating customer:', error);
      toast.error('گاہک شامل کرنے میں مسئلہ ہوا');
    },
  });
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CustomerFormData> }): Promise<void> => {
      await api.put(`customers/${id}`, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customer', variables.id] });
      toast.success('گاہک کی معلومات اپڈیٹ ہو گئیں');
    },
    onError: (error) => {
      console.error('Error updating customer:', error);
      toast.error('معلومات اپڈیٹ کرنے میں مسئلہ ہوا');
    },
  });
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await api.delete(`customers/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success('گاہک کامیابی سے حذف ہو گیا');
    },
    onError: (error) => {
      console.error('Error deleting customer:', error);
      toast.error('گاہک حذف کرنے میں مسئلہ ہوا');
    },
  });
}
