import { Order } from '@/types/order';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Trash2, 
  Calendar, 
  User, 
  Clock, 
  CheckCircle2, 
  Phone,
  Banknote
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface OrderCardProps {
  order: Order;
  onStatusChange: (order: Order, status: 'pending' | 'completed') => void;
  onDelete: (order: Order) => void;
}

export function OrderCard({ order, onStatusChange, onDelete }: OrderCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ur-PK', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ur-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const isPending = order.status === 'pending';
  const remainingAmount = (order.price || 0) - (order.advance_payment || 0);

  return (
    <Card className={cn(
      'elevated-card animate-fade-in',
      isPending ? 'border-r-4 border-r-pending' : 'border-r-4 border-r-success'
    )}>
      <CardHeader className="p-4 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <Badge 
                className={cn(
                  'text-xs px-2 py-0.5',
                  isPending ? 'status-pending' : 'status-completed'
                )}
              >
                {isPending ? (
                  <>
                    <Clock className="w-3 h-3 ml-1" />
                    زیر التوا
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3 h-3 ml-1" />
                    مکمل
                  </>
                )}
              </Badge>
              <span className="text-xs text-muted-foreground" dir="ltr">
                #{order.order_number}
              </span>
            </div>
            
            <div className="flex items-center gap-2 text-base font-semibold text-foreground">
              <User className="w-4 h-4 text-primary shrink-0" />
              <span className="truncate">{order.customer?.name || 'نامعلوم'}</span>
            </div>
            
            {order.customer?.phone && (
              <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
                <Phone className="w-3.5 h-3.5 shrink-0" />
                <span dir="ltr">{order.customer.phone}</span>
              </div>
            )}
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(order)}
            className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive shrink-0"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="px-4 pb-4 space-y-3">
        {order.description && (
          <p className="text-xs text-muted-foreground bg-muted/50 p-2.5 rounded-lg line-clamp-2">
            {order.description}
          </p>
        )}

        {order.fabric_details && (
          <div className="text-xs">
            <span className="text-muted-foreground">کپڑا: </span>
            <span className="font-medium">{order.fabric_details}</span>
          </div>
        )}

        <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs">
          {order.price && (
            <div className="flex items-center gap-1">
              <Banknote className="w-3.5 h-3.5 text-success shrink-0" />
              <span className="text-muted-foreground">کل:</span>
              <span className="font-semibold" dir="ltr">
                {formatCurrency(order.price)}
              </span>
            </div>
          )}
          
          {order.advance_payment && order.advance_payment > 0 && (
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground">پیشگی:</span>
              <span className="font-medium text-primary" dir="ltr">
                {formatCurrency(order.advance_payment)}
              </span>
            </div>
          )}

          {remainingAmount > 0 && order.price && (
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground">باقی:</span>
              <span className="font-semibold text-destructive" dir="ltr">
                {formatCurrency(remainingAmount)}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-border gap-3">
          <div className="flex flex-col gap-1 text-xs text-muted-foreground min-w-0">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 shrink-0" />
              {formatDate(order.created_at)}
            </span>
            
            {order.delivery_date && (
              <span className="flex items-center gap-1">
                <span>ڈلیوری:</span>
                <span className="font-medium text-foreground">
                  {formatDate(order.delivery_date)}
                </span>
              </span>
            )}
          </div>

          <Button
            variant={isPending ? 'default' : 'outline'}
            size="sm"
            onClick={() => onStatusChange(order, isPending ? 'completed' : 'pending')}
            className={cn(
              'h-9 text-xs shrink-0',
              isPending 
                ? 'bg-success hover:bg-success/90 text-success-foreground'
                : ''
            )}
          >
            {isPending ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 ml-1" />
                مکمل
              </>
            ) : (
              <>
                <Clock className="w-3.5 h-3.5 ml-1" />
                زیر التوا
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
