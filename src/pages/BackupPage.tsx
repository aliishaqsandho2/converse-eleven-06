import { useState, useRef } from 'react';
import { useBackup } from '@/hooks/useBackup';
import { useRestore } from '@/hooks/useRestore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, MessageCircle, Upload, Loader2, AlertTriangle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function BackupPage() {
  const { downloadBackup, shareViaWhatsApp } = useBackup();
  const { restoreBackup } = useRestore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await downloadBackup();
    } finally {
      setIsDownloading(false);
    }
  };

  const handleWhatsAppShare = async () => {
    setIsSharing(true);
    try {
      await shareViaWhatsApp();
    } finally {
      setIsSharing(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.endsWith('.json')) {
        return;
      }
      setSelectedFile(file);
      setShowRestoreDialog(true);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRestore = async () => {
    if (!selectedFile) return;
    
    setIsRestoring(true);
    setShowRestoreDialog(false);
    
    try {
      await restoreBackup(selectedFile);
      // Reload page to refresh data
      window.location.reload();
    } finally {
      setIsRestoring(false);
      setSelectedFile(null);
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Download */}
      <Card className="elevated-card">
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-success/10 p-2.5 rounded-xl shrink-0">
              <Download className="w-5 h-5 text-success" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-semibold text-foreground">ڈاؤن لوڈ</h3>
              <p className="text-xs text-muted-foreground">JSON فائل محفوظ کریں</p>
            </div>
          </div>
          <Button
            onClick={handleDownload}
            disabled={isDownloading}
            className="w-full h-12 text-sm bg-success hover:bg-success/90 text-success-foreground"
          >
            {isDownloading ? (
              <Loader2 className="w-4 h-4 ml-2 animate-spin" />
            ) : (
              <Download className="w-4 h-4 ml-2" />
            )}
            {isDownloading ? 'ڈاؤن لوڈ...' : 'ڈاؤن لوڈ کریں'}
          </Button>
        </CardContent>
      </Card>

      {/* WhatsApp */}
      <Card className="elevated-card">
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-[#25D366]/10 p-2.5 rounded-xl shrink-0">
              <MessageCircle className="w-5 h-5 text-[#25D366]" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-semibold text-foreground">واٹس ایپ</h3>
              <p className="text-xs text-muted-foreground">بیک اپ بھیجیں</p>
            </div>
          </div>
          <Button
            onClick={handleWhatsAppShare}
            disabled={isSharing}
            className="w-full h-12 text-sm bg-[#25D366] hover:bg-[#25D366]/90 text-white"
          >
            {isSharing ? (
              <Loader2 className="w-4 h-4 ml-2 animate-spin" />
            ) : (
              <MessageCircle className="w-4 h-4 ml-2" />
            )}
            {isSharing ? 'بھیج رہا ہے...' : 'واٹس ایپ پر بھیجیں'}
          </Button>
        </CardContent>
      </Card>

      {/* Restore */}
      <Card className="elevated-card border-2 border-dashed border-muted-foreground/30">
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-accent/20 p-2.5 rounded-xl shrink-0">
              <Upload className="w-5 h-5 text-accent" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-semibold text-foreground">ری سٹور</h3>
              <p className="text-xs text-muted-foreground">بیک اپ فائل سے ڈیٹا واپس لائیں</p>
            </div>
          </div>
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={isRestoring}
            variant="outline"
            className="w-full h-12 text-sm border-accent text-accent hover:bg-accent/5"
          >
            {isRestoring ? (
              <Loader2 className="w-4 h-4 ml-2 animate-spin" />
            ) : (
              <Upload className="w-4 h-4 ml-2" />
            )}
            {isRestoring ? 'ری سٹور ہو رہا ہے...' : 'JSON فائل منتخب کریں'}
          </Button>
        </CardContent>
      </Card>

      {/* Restore Confirmation Dialog */}
      <AlertDialog open={showRestoreDialog} onOpenChange={setShowRestoreDialog}>
        <AlertDialogContent className="max-w-[90vw] rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              تصدیق کریں
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm leading-relaxed">
              موجودہ تمام ڈیٹا ڈیلیٹ ہو جائے گا اور بیک اپ فائل کا ڈیٹا آ جائے گا۔ کیا آپ واقعی یہ کرنا چاہتے ہیں؟
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row gap-2">
            <AlertDialogCancel className="flex-1 m-0">نہیں</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRestore}
              className="flex-1 m-0 bg-destructive hover:bg-destructive/90"
            >
              ہاں، ری سٹور کریں
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
