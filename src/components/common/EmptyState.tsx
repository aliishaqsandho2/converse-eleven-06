import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center py-10 px-4 text-center',
      className
    )}>
      <div className="bg-muted/50 p-4 rounded-full mb-3">
        {icon}
      </div>
      <h3 className="text-base font-urdu font-semibold text-foreground mb-1">
        {title}
      </h3>
      {description && (
        <p className="text-xs text-muted-foreground max-w-xs mb-4 leading-relaxed">
          {description}
        </p>
      )}
      {action}
    </div>
  );
}
