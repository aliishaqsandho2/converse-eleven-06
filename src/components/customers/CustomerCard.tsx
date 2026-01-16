import { Customer, measurementFields } from '@/types/customer';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Phone, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface CustomerCardProps {
  customer: Customer;
  onEdit: (customer: Customer) => void;
  onDelete: (customer: Customer) => void;
}

export function CustomerCard({ customer, onEdit, onDelete }: CustomerCardProps) {
  const [expanded, setExpanded] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ur-PK', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getMeasurementValue = (key: string) => {
    const value = (customer as any)[key];
    return value !== null && value !== undefined ? value : '-';
  };

  return (
    <Card className="elevated-card animate-fade-in">
      <CardHeader className="p-4 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-urdu font-semibold text-foreground truncate">
              {customer.name}
            </h3>
            <div className="flex flex-col gap-1 mt-1.5 text-muted-foreground">
              {customer.phone && (
                <span className="flex items-center gap-1.5 text-xs">
                  <Phone className="w-3.5 h-3.5 shrink-0" />
                  <span dir="ltr" className="truncate">{customer.phone}</span>
                </span>
              )}
              <span className="flex items-center gap-1.5 text-xs">
                <Calendar className="w-3.5 h-3.5 shrink-0" />
                {formatDate(customer.created_at)}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(customer)}
              className="h-9 w-9 hover:bg-primary/10 hover:text-primary"
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(customer)}
              className="h-9 w-9 hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="px-4 pt-0 pb-4">
        {/* Quick measurements preview */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {customer.qameez_length && (
            <Badge variant="secondary" className="text-xs font-normal px-2 py-0.5">
              قمیص: {customer.qameez_length}
            </Badge>
          )}
          {customer.chest && (
            <Badge variant="secondary" className="text-xs font-normal px-2 py-0.5">
              چھاتی: {customer.chest}
            </Badge>
          )}
          {customer.shalwar_length && (
            <Badge variant="secondary" className="text-xs font-normal px-2 py-0.5">
              شلوار: {customer.shalwar_length}
            </Badge>
          )}
        </div>

        {/* Expand button */}
        <Button
          variant="ghost"
          onClick={() => setExpanded(!expanded)}
          className="w-full h-auto py-2 text-xs text-muted-foreground hover:text-foreground"
        >
          {expanded ? (
            <>
              <ChevronUp className="w-4 h-4 ml-1" />
              چھپائیں
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4 ml-1" />
              تفصیلات
            </>
          )}
        </Button>

        {/* Expanded measurements */}
        <div className={cn(
          'grid grid-cols-2 gap-2 overflow-hidden transition-all duration-300',
          expanded ? 'max-h-[1000px] mt-3 opacity-100' : 'max-h-0 opacity-0'
        )}>
          {measurementFields.map((field) => (
            <div key={field.key} className="bg-muted/50 rounded-lg p-2.5">
              <span className="text-[10px] text-muted-foreground block mb-0.5 leading-tight">
                {field.label}
              </span>
              <span className="font-medium text-foreground text-sm">
                {getMeasurementValue(field.key)}
              </span>
            </div>
          ))}
        </div>

        {customer.notes && expanded && (
          <div className="mt-3 p-2.5 bg-muted/30 rounded-lg border border-border">
            <span className="text-[10px] text-muted-foreground block mb-0.5">نوٹس</span>
            <p className="text-xs text-foreground">{customer.notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
