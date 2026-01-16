import { Scissors, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  onLogout?: () => void;
}

export function Header({ onLogout }: HeaderProps) {
  return (
    <header className="gradient-header text-primary-foreground py-3 px-4 shadow-lg">
      <div className="container mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-accent/20 p-2 rounded-xl shrink-0">
              <Scissors className="w-5 h-5" />
            </div>
            <h1 className="text-lg font-urdu font-bold">
              ٹیلر ماسٹر
            </h1>
          </div>
          {onLogout && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onLogout}
              className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-white/10 h-9 w-9 p-0"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
