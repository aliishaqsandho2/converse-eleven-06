import { useState } from 'react';
import { Scissors, Lock, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface PinScreenProps {
  mode: 'setup' | 'login';
  onSubmit: (pin: string) => Promise<boolean>;
}

export function PinScreen({ mode, onSubmit }: PinScreenProps) {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');
    
    if (pin.length < 4) {
      setError('پن کوڈ کم از کم 4 ہندسے کا ہونا چاہیے');
      return;
    }

    if (mode === 'setup' && pin !== confirmPin) {
      setError('پن کوڈ میچ نہیں کر رہا');
      return;
    }

    setIsLoading(true);
    const success = await onSubmit(pin);
    setIsLoading(false);

    if (!success) {
      setPin('');
      setConfirmPin('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center p-4 bg-primary rounded-2xl shadow-lg">
            <Scissors className="w-10 h-10 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-urdu font-bold text-foreground">
              ٹیلر ماسٹر
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {mode === 'setup' ? 'اپنا پن کوڈ بنائیں' : 'پن کوڈ درج کریں'}
            </p>
          </div>
        </div>

        {/* PIN Input */}
        <div className="space-y-4">
          <div className="relative">
            <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type={showPin ? 'text' : 'password'}
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder={mode === 'setup' ? 'نیا پن کوڈ' : 'پن کوڈ'}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
              onKeyPress={handleKeyPress}
              className="h-14 text-center text-xl pr-10 pl-10 tracking-[0.5em] font-mono"
              maxLength={6}
              dir="ltr"
            />
            <button
              type="button"
              onClick={() => setShowPin(!showPin)}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {mode === 'setup' && (
            <div className="relative">
              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type={showPin ? 'text' : 'password'}
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="پن کوڈ دوبارہ"
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                onKeyPress={handleKeyPress}
                className="h-14 text-center text-xl pr-10 pl-10 tracking-[0.5em] font-mono"
                maxLength={6}
                dir="ltr"
              />
            </div>
          )}

          {error && (
            <p className="text-destructive text-sm text-center animate-shake">
              {error}
            </p>
          )}

          <Button
            onClick={handleSubmit}
            disabled={isLoading || pin.length < 4 || (mode === 'setup' && confirmPin.length < 4)}
            className="w-full h-14 text-lg"
          >
            {isLoading ? (
              <span className="animate-pulse">...</span>
            ) : mode === 'setup' ? (
              'پن کوڈ سیٹ کریں'
            ) : (
              'داخل ہوں'
            )}
          </Button>
        </div>

        {/* Help Text */}
        <p className="text-xs text-muted-foreground text-center leading-relaxed">
          {mode === 'setup' 
            ? '4 سے 6 ہندسے کا پن کوڈ بنائیں جو آپ کو یاد رہے'
            : 'اپنا پن کوڈ درج کریں'}
        </p>
      </div>
    </div>
  );
}
