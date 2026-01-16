import { useNavigate } from 'react-router-dom';
import { useCreateCustomer } from '@/hooks/useCustomers';
import { CustomerForm } from '@/components/customers/CustomerForm';
import { CustomerFormData } from '@/types/customer';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NewCustomerPage() {
  const navigate = useNavigate();
  const createCustomer = useCreateCustomer();

  const handleSubmit = async (data: CustomerFormData) => {
    try {
      await createCustomer.mutateAsync(data);
      navigate('/customers');
    } catch (error) {
      // Error handled in hook
    }
  };

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
            نیا گاہک
          </h1>
          <p className="text-muted-foreground mt-1">
            گاہک کی معلومات اور ناپ درج کریں
          </p>
        </div>
      </div>

      {/* Form */}
      <CustomerForm
        onSubmit={handleSubmit}
        onCancel={() => navigate('/customers')}
        isLoading={createCustomer.isPending}
      />
    </div>
  );
}
