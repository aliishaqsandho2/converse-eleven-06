import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Customer, CustomerFormData, measurementFields } from '@/types/customer';
import { Save, X, Ruler, Shirt } from 'lucide-react';

interface CustomerFormProps {
  customer?: Customer | null;
  onSubmit: (data: CustomerFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function CustomerForm({ customer, onSubmit, onCancel, isLoading }: CustomerFormProps) {
  const [formData, setFormData] = useState<CustomerFormData>({
    name: '',
    phone: '',
  });

  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name,
        phone: customer.phone || '',
        qameez_length: customer.qameez_length ?? undefined,
        sleeve_length: customer.sleeve_length ?? undefined,
        chest: customer.chest ?? undefined,
        neck: customer.neck ?? undefined,
        waist: customer.waist ?? undefined,
        gher: customer.gher ?? undefined,
        collar_size: customer.collar_size ?? undefined,
        cuff_width: customer.cuff_width ?? undefined,
        placket_width: customer.placket_width ?? undefined,
        front_pocket: customer.front_pocket || '',
        side_pocket: customer.side_pocket || '',
        armhole: customer.armhole ?? undefined,
        elbow: customer.elbow ?? undefined,
        daman: customer.daman ?? undefined,
        bain: customer.bain ?? undefined,
        shalwar_length: customer.shalwar_length ?? undefined,
        paicha: customer.paicha ?? undefined,
        shalwar_pocket: customer.shalwar_pocket || '',
        shalwar_width: customer.shalwar_width ?? undefined,
      });
    }
  }, [customer]);

  const handleChange = (key: string, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const qameezFields = measurementFields.filter(f => 
    !['shalwar_length', 'paicha', 'shalwar_pocket', 'shalwar_width'].includes(f.key)
  );
  
  const shalwarFields = measurementFields.filter(f => 
    ['shalwar_length', 'paicha', 'shalwar_pocket', 'shalwar_width'].includes(f.key)
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4 animate-fade-in">
      {/* Basic Info */}
      <Card className="elevated-card">
        <CardHeader className="pb-3 pt-4 px-4">
          <CardTitle className="text-base font-urdu flex items-center gap-2">
            <div className="bg-primary/10 p-1.5 rounded-lg">
              <Ruler className="w-4 h-4 text-primary" />
            </div>
            بنیادی معلومات
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-sm font-medium">
              نام <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="گاہک کا نام"
              required
              className="h-11 text-base"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone" className="text-sm font-medium">
              فون نمبر
            </Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="0300-0000000"
              className="h-11 text-base"
              dir="ltr"
            />
          </div>
        </CardContent>
      </Card>

      {/* Qameez Measurements */}
      <Card className="elevated-card">
        <CardHeader className="pb-3 pt-4 px-4">
          <CardTitle className="text-base font-urdu flex items-center gap-2">
            <div className="bg-accent/20 p-1.5 rounded-lg">
              <Shirt className="w-4 h-4 text-accent" />
            </div>
            قمیص کے ناپ
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className="grid grid-cols-2 gap-2.5">
            {qameezFields.map((field) => (
              <div key={field.key} className="measurement-field p-2.5">
                <Label htmlFor={field.key} className="text-[11px] font-medium text-muted-foreground block mb-1.5 leading-tight">
                  {field.label}
                </Label>
                {field.type === 'yesno' ? (
                  <Select
                    value={(formData as any)[field.key] || ''}
                    onValueChange={(value) => handleChange(field.key, value)}
                  >
                    <SelectTrigger className="border-0 bg-transparent p-0 h-8 text-base font-medium focus:ring-0">
                      <SelectValue placeholder="منتخب کریں" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ہاں">ہاں</SelectItem>
                      <SelectItem value="نہیں">نہیں</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id={field.key}
                    type={field.type}
                    value={(formData as any)[field.key] || ''}
                    onChange={(e) => 
                      handleChange(
                        field.key, 
                        field.type === 'number' 
                          ? parseFloat(e.target.value) || '' 
                          : e.target.value
                      )
                    }
                    placeholder={field.type === 'number' ? '0' : ''}
                    className="border-0 bg-transparent p-0 h-8 text-base font-medium focus-visible:ring-0"
                    dir={field.type === 'number' ? 'ltr' : 'rtl'}
                  />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Shalwar Measurements */}
      <Card className="elevated-card">
        <CardHeader className="pb-3 pt-4 px-4">
          <CardTitle className="text-base font-urdu flex items-center gap-2">
            <div className="bg-secondary/20 p-1.5 rounded-lg">
              <Ruler className="w-4 h-4 text-secondary" />
            </div>
            شلوار کے ناپ
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className="grid grid-cols-2 gap-2.5">
            {shalwarFields.map((field) => (
              <div key={field.key} className="measurement-field p-2.5">
                <Label htmlFor={field.key} className="text-[11px] font-medium text-muted-foreground block mb-1.5 leading-tight">
                  {field.label}
                </Label>
                {field.type === 'yesno' ? (
                  <Select
                    value={(formData as any)[field.key] || ''}
                    onValueChange={(value) => handleChange(field.key, value)}
                  >
                    <SelectTrigger className="border-0 bg-transparent p-0 h-8 text-base font-medium focus:ring-0">
                      <SelectValue placeholder="منتخب کریں" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ہاں">ہاں</SelectItem>
                      <SelectItem value="نہیں">نہیں</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id={field.key}
                    type={field.type}
                    value={(formData as any)[field.key] || ''}
                    onChange={(e) => 
                      handleChange(
                        field.key, 
                        field.type === 'number' 
                          ? parseFloat(e.target.value) || '' 
                          : e.target.value
                      )
                    }
                    placeholder={field.type === 'number' ? '0' : ''}
                    className="border-0 bg-transparent p-0 h-8 text-base font-medium focus-visible:ring-0"
                    dir={field.type === 'number' ? 'ltr' : 'rtl'}
                  />
                )}
              </div>
            ))}
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
            disabled={isLoading || !formData.name.trim()}
            className="flex-1 h-12 bg-primary hover:bg-primary/90"
          >
            <Save className="w-4 h-4 ml-1" />
            {isLoading ? 'محفوظ...' : 'محفوظ کریں'}
          </Button>
        </div>
      </div>
    </form>
  );
}
