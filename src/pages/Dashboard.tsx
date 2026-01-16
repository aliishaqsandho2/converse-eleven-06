import { useCustomers } from '@/hooks/useCustomers';
import { useOrders } from '@/hooks/useOrders';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  ClipboardList, 
  Clock, 
  CheckCircle2, 
  Plus
} from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const { data: customers } = useCustomers();
  const { data: allOrders } = useOrders();
  const { data: pendingOrders } = useOrders('pending');
  const { data: completedOrders } = useOrders('completed');

  const stats = [
    {
      title: 'کل گاہک',
      value: customers?.length || 0,
      icon: Users,
      color: 'bg-primary/10 text-primary',
      onClick: () => navigate('/customers'),
    },
    {
      title: 'کل آرڈرز',
      value: allOrders?.length || 0,
      icon: ClipboardList,
      color: 'bg-accent/20 text-accent',
      onClick: () => navigate('/orders'),
    },
    {
      title: 'زیر التوا',
      value: pendingOrders?.length || 0,
      icon: Clock,
      color: 'bg-pending/10 text-pending',
      onClick: () => navigate('/orders?status=pending'),
    },
    {
      title: 'مکمل',
      value: completedOrders?.length || 0,
      icon: CheckCircle2,
      color: 'bg-success/10 text-success',
      onClick: () => navigate('/orders?status=completed'),
    },
  ];

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat) => (
          <Card
            key={stat.title}
            className="elevated-card cursor-pointer active:scale-[0.98] transition-transform duration-200"
            onClick={stat.onClick}
          >
            <CardContent className="p-4">
              <div className="flex flex-col items-center text-center gap-2">
                <div className={`p-3 rounded-xl ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <p className="text-2xl font-bold text-foreground" dir="ltr">
                  {stat.value}
                </p>
                <p className="text-xs text-muted-foreground font-medium leading-tight">
                  {stat.title}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-3">
        <Button
          onClick={() => navigate('/customers/new')}
          className="h-14 text-base bg-primary hover:bg-primary/90"
        >
          <Plus className="w-5 h-5 ml-2" />
          نیا گاہک شامل کریں
        </Button>
        <Button
          onClick={() => navigate('/orders/new')}
          variant="outline"
          className="h-14 text-base border-2 border-primary text-primary hover:bg-primary/5"
        >
          <Plus className="w-5 h-5 ml-2" />
          نیا آرڈر بنائیں
        </Button>
      </div>

      {/* Recent Pending Orders */}
      {pendingOrders && pendingOrders.length > 0 && (
        <Card className="elevated-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-5 h-5 text-pending" />
              <h2 className="text-sm font-semibold text-foreground">زیر التوا آرڈرز</h2>
            </div>
            <div className="space-y-2">
              {pendingOrders.slice(0, 5).map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg active:bg-muted transition-colors cursor-pointer gap-3"
                  onClick={() => navigate('/orders')}
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-foreground text-sm truncate">
                      {order.customer?.name || 'نامعلوم گاہک'}
                    </p>
                    <p className="text-xs text-muted-foreground" dir="ltr">
                      #{order.order_number}
                    </p>
                  </div>
                  {order.delivery_date && (
                    <div className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
                      {new Date(order.delivery_date).toLocaleDateString('ur-PK')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
