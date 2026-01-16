import { useNavigate, useParams } from 'react-router-dom';
import { useCustomer, useUpdateCustomer } from '@/hooks/useCustomers';
import { CustomerForm } from '@/components/customers/CustomerForm';
import { CustomerFormData } from '@/types/customer';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { ArrowRight, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function EditCustomerPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data: customer, isLoading, error } = useCustomer(id || '');
  const updateCustomer = useUpdateCustomer();

  const handleSubmit = async (data: CustomerFormData) => {
    if (!id) return;
    try {
      await updateCustomer.mutateAsync({ id, data });
      navigate('/customers');
    } catch (error) {
      // Error handled in hook
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error || !customer) {
    return (
      <EmptyState
        icon={<User className="w-12 h-12 text-destructive" />}
        title="گاہک نہیں ملا"
        description="یہ گاہک موجود نہیں ہے یا حذف ہو چکا ہے۔"
        action={
          <Button onClick={() => navigate('/customers')}>
            گاہکوں کی فہرست
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/customers')}
          className="h-10 w-10"
        >
          <ArrowRight className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl md:text-3xl font-urdu font-bold text-foreground">
            ترمیم: {customer.name}
          </h1>
          <p className="text-muted-foreground mt-1">
            گاہک کی معلومات میں تبدیلی کریں
          </p>
        </div>
      </div>

      {/* Form */}
      <CustomerForm
        customer={customer}
        onSubmit={handleSubmit}
        onCancel={() => navigate('/customers')}
        isLoading={updateCustomer.isPending}
      />
    </div>
  );
}
