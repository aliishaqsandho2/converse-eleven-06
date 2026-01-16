import { useNavigate } from 'react-router-dom';
import { useCreateOrder } from '@/hooks/useOrders';
import { OrderForm } from '@/components/orders/OrderForm';
import { OrderFormData } from '@/types/order';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NewOrderPage() {
  const navigate = useNavigate();
  const createOrder = useCreateOrder();

  const handleSubmit = async (data: OrderFormData) => {
    try {
      await createOrder.mutateAsync(data);
      navigate('/orders');
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
          onClick={() => navigate('/orders')}
          className="h-10 w-10"
        >
          <ArrowRight className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl md:text-3xl font-urdu font-bold text-foreground">
            نیا آرڈر
          </h1>
          <p className="text-muted-foreground mt-1">
            گاہک منتخب کریں اور آرڈر کی تفصیلات درج کریں
          </p>
        </div>
      </div>

      {/* Form */}
      <OrderForm
        onSubmit={handleSubmit}
        onCancel={() => navigate('/orders')}
        isLoading={createOrder.isPending}
      />
    </div>
  );
}
