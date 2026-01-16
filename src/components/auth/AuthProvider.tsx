import { ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { PinScreen } from './PinScreen';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { isAuthenticated, hasPin, isLoading, setPin, verifyPin } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // No PIN set yet - show setup screen
  if (!hasPin) {
    return <PinScreen mode="setup" onSubmit={setPin} />;
  }

  // Not authenticated - show login screen
  if (!isAuthenticated) {
    return <PinScreen mode="login" onSubmit={verifyPin} />;
  }

  // Authenticated - show app
  return <>{children}</>;
}
