import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCustomers, useDeleteCustomer } from '@/hooks/useCustomers';
import { CustomerCard } from '@/components/customers/CustomerCard';
import { CustomerSearch } from '@/components/customers/CustomerSearch';
import { DeleteConfirmDialog } from '@/components/common/DeleteConfirmDialog';
import { EmptyState } from '@/components/common/EmptyState';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { Customer } from '@/types/customer';
import { Plus, Users } from 'lucide-react';

export default function CustomersPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
  
  const { data: customers, isLoading, error } = useCustomers(searchQuery);
  const deleteCustomer = useDeleteCustomer();

  const handleEdit = (customer: Customer) => {
    navigate(`/customers/${customer.id}/edit`);
  };

  const handleDelete = (customer: Customer) => {
    setCustomerToDelete(customer);
  };

  const confirmDelete = async () => {
    if (customerToDelete) {
      await deleteCustomer.mutateAsync(customerToDelete.id);
      setCustomerToDelete(null);
    }
  };

  if (error) {
    return (
      <EmptyState
        icon={<Users className="w-10 h-10 text-destructive" />}
        title="مسئلہ پیش آیا"
        description="براہ کرم دوبارہ کوشش کریں"
      />
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl font-urdu font-bold text-foreground">
            گاہک
          </h1>
          <p className="text-xs text-muted-foreground">
            {customers?.length || 0} رجسٹرڈ
          </p>
        </div>
        <Button
          onClick={() => navigate('/customers/new')}
          className="h-10 px-4 bg-primary hover:bg-primary/90 shrink-0"
        >
          <Plus className="w-4 h-4 ml-1" />
          نیا گاہک
        </Button>
      </div>

      {/* Search */}
      <CustomerSearch
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="نام یا فون سے تلاش..."
      />

      {/* Content */}
      {isLoading ? (
        <LoadingSpinner />
      ) : customers && customers.length > 0 ? (
        <div className="space-y-3">
          {customers.map((customer) => (
            <CustomerCard
              key={customer.id}
              customer={customer}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : searchQuery ? (
        <EmptyState
          icon={<Users className="w-10 h-10 text-muted-foreground" />}
          title="کوئی نہیں ملا"
          description={`"${searchQuery}" سے کوئی گاہک نہیں ملا`}
        />
      ) : (
        <EmptyState
          icon={<Users className="w-10 h-10 text-muted-foreground" />}
          title="ابھی کوئی گاہک نہیں"
          description="اپنا پہلا گاہک شامل کریں"
          action={
            <Button
              onClick={() => navigate('/customers/new')}
              className="bg-primary hover:bg-primary/90"
            >
              <Plus className="w-4 h-4 ml-1" />
              نیا گاہک
            </Button>
          }
        />
      )}

      {/* Delete Confirmation */}
      <DeleteConfirmDialog
        open={!!customerToDelete}
        onOpenChange={(open) => !open && setCustomerToDelete(null)}
        onConfirm={confirmDelete}
        title="گاہک حذف کریں"
        description={`کیا آپ واقعی "${customerToDelete?.name}" کو حذف کرنا چاہتے ہیں؟`}
      />
    </div>
  );
}
