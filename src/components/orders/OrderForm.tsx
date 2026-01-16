import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CustomerSearch } from '@/components/customers/CustomerSearch';
import { CustomerForm } from '@/components/customers/CustomerForm';
import { useCustomers, useCreateCustomer } from '@/hooks/useCustomers';
import { Customer, CustomerFormData } from '@/types/customer';
import { OrderFormData } from '@/types/order';
import { Save, X, Plus, User, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OrderFormProps {
  onSubmit: (data: OrderFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function OrderForm({ onSubmit, onCancel, isLoading }: OrderFormProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showNewCustomerForm, setShowNewCustomerForm] = useState(false);
  const [formData, setFormData] = useState<Omit<OrderFormData, 'customer_id'>>({
    price: undefined,
    advance_payment: undefined,
    delivery_date: '',
  });

  const { data: customers, isLoading: customersLoading } = useCustomers(searchQuery);
  const createCustomer = useCreateCustomer();

  const handleChange = (key: string, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleCustomerCreate = async (data: CustomerFormData) => {
    try {
      const newCustomer = await createCustomer.mutateAsync(data);
      setSelectedCustomer(newCustomer);
      setShowNewCustomerForm(false);
      setSearchQuery('');
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;
    
    onSubmit({
      customer_id: selectedCustomer.id,
      ...formData,
    });
  };

  if (showNewCustomerForm) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowNewCustomerForm(false)}
            className="h-8"
          >
            <X className="w-4 h-4 ml-1" />
            واپس
          </Button>
          <span className="text-sm">نیا گاہک</span>
        </div>
        <CustomerForm
          onSubmit={handleCustomerCreate}
          onCancel={() => setShowNewCustomerForm(false)}
          isLoading={createCustomer.isPending}
        />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 animate-fade-in">
      {/* Customer Selection */}
      <Card className="elevated-card">
        <CardHeader className="pb-3 pt-4 px-4">
          <CardTitle className="text-base font-urdu flex items-center gap-2">
            <div className="bg-primary/10 p-1.5 rounded-lg">
              <User className="w-4 h-4 text-primary" />
            </div>
            گاہک منتخب کریں
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 space-y-3">
          {selectedCustomer ? (
            <div className="flex items-center justify-between p-3 bg-success/10 border border-success/30 rounded-lg gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <div className="bg-success/20 p-1.5 rounded-full shrink-0">
                  <Check className="w-4 h-4 text-success" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-foreground text-sm truncate">{selectedCustomer.name}</p>
                  {selectedCustomer.phone && (
                    <p className="text-xs text-muted-foreground truncate" dir="ltr">
                      {selectedCustomer.phone}
                    </p>
                  )}
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setSelectedCustomer(null)}
                className="h-8 text-xs shrink-0"
              >
                تبدیل
              </Button>
            </div>
          ) : (
            <>
              <CustomerSearch
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="نام یا فون سے تلاش..."
              />
              
              {searchQuery && (
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {customersLoading ? (
                    <p className="text-center text-muted-foreground py-3 text-sm">
                      تلاش ہو رہی ہے...
                    </p>
                  ) : customers && customers.length > 0 ? (
                    customers.map((customer) => (
                      <button
                        key={customer.id}
                        type="button"
                        onClick={() => {
                          setSelectedCustomer(customer);
                          setSearchQuery('');
                        }}
                        className={cn(
                          'w-full text-right p-3 rounded-lg border transition-all',
                          'hover:bg-primary/5 hover:border-primary/30 active:bg-primary/10',
                          'focus:outline-none focus:ring-2 focus:ring-primary/20'
                        )}
                      >
                        <p className="font-medium text-sm">{customer.name}</p>
                        {customer.phone && (
                          <p className="text-xs text-muted-foreground" dir="ltr">
                            {customer.phone}
                          </p>
                        )}
                      </button>
                    ))
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-muted-foreground text-sm mb-2">کوئی نہیں ملا</p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowNewCustomerForm(true)}
                      >
                        <Plus className="w-4 h-4 ml-1" />
                        نیا گاہک
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {!searchQuery && (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-11"
                  onClick={() => setShowNewCustomerForm(true)}
                >
                  <Plus className="w-4 h-4 ml-2" />
                  نیا گاہک شامل کریں
                </Button>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Order Details */}
      <Card className="elevated-card">
        <CardHeader className="pb-3 pt-4 px-4">
          <CardTitle className="text-base font-urdu">آرڈر کی تفصیلات</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="price" className="text-sm font-medium">
                کل رقم
              </Label>
              <Input
                id="price"
                type="number"
                value={formData.price || ''}
                onChange={(e) => handleChange('price', parseFloat(e.target.value) || '')}
                placeholder="0"
                className="h-11 text-sm"
                dir="ltr"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="advance_payment" className="text-sm font-medium">
                پیشگی
              </Label>
              <Input
                id="advance_payment"
                type="number"
                value={formData.advance_payment || ''}
                onChange={(e) => handleChange('advance_payment', parseFloat(e.target.value) || '')}
                placeholder="0"
                className="h-11 text-sm"
                dir="ltr"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="delivery_date" className="text-sm font-medium">
              ڈلیوری کی تاریخ
            </Label>
            <Input
              id="delivery_date"
              type="date"
              value={formData.delivery_date}
              onChange={(e) => handleChange('delivery_date', e.target.value)}
              className="h-11 text-sm"
              dir="ltr"
            />
          </div>
        </CardContent>
      </Card>

      {/* Actions - Sticky at bottom */}
      <div className="sticky bottom-0 bg-background pt-3 pb-2 -mx-3 px-3 border-t border-border">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="flex-1 h-12"
          >
            <X className="w-4 h-4 ml-1" />
            منسوخ
          </Button>
          <Button
            type="submit"
            disabled={isLoading || !selectedCustomer}
            className="flex-1 h-12 bg-primary hover:bg-primary/90"
          >
            <Save className="w-4 h-4 ml-1" />
            {isLoading ? 'محفوظ...' : 'آرڈر بنائیں'}
          </Button>
        </div>
      </div>
    </form>
  );
}
