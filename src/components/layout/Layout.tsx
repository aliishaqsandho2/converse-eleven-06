import { ReactNode } from 'react';
import { Header } from './Header';
import { Navigation } from './Navigation';

interface LayoutProps {
  children: ReactNode;
  onLogout?: () => void;
}

export function Layout({ children, onLogout }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Header onLogout={onLogout} />
      <Navigation />
      <main className="container mx-auto px-3 py-4 pb-24">
        {children}
      </main>
    </div>
  );
}
