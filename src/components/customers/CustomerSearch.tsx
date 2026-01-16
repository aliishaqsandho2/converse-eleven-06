import { Input } from '@/components/ui/input';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CustomerSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function CustomerSearch({ value, onChange, placeholder = 'تلاش کریں...' }: CustomerSearchProps) {
  return (
    <div className="relative">
      <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-11 pr-10 pl-10 text-sm"
      />
      {value && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => onChange('')}
          className="absolute left-1 top-1/2 -translate-y-1/2 h-8 w-8 hover:bg-muted"
        >
          <X className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}
