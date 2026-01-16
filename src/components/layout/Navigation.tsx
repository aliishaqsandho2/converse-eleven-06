import { NavLink } from 'react-router-dom';
import { Users, ClipboardList, Download, LayoutDashboard } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/', label: 'ہوم', icon: LayoutDashboard },
  { to: '/customers', label: 'گاہک', icon: Users },
  { to: '/orders', label: 'آرڈرز', icon: ClipboardList },
  { to: '/backup', label: 'بیک اپ', icon: Download },
];

export function Navigation() {
  return (
    <nav className="bg-card border-b border-border shadow-sm sticky top-0 z-40">
      <div className="container mx-auto px-2">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center gap-1 px-3 py-2 rounded-lg font-medium transition-all duration-200 min-w-0',
                  'hover:bg-muted',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'text-muted-foreground'
                )
              }
            >
              <item.icon className="w-5 h-5 shrink-0" />
              <span className="text-xs whitespace-nowrap">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
}
