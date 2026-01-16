import { api } from '@/utils/api';
import { toast } from 'sonner';

export function useBackup() {
  const createBackup = async () => {
    try {
      // Fetch all customers via WordPress API
      const customers = await api.get('customers');

      // Fetch all orders via WordPress API
      const orders = await api.get('orders');

      const backupData = {
        version: '1.0',
        created_at: new Date().toISOString(),
        customers,
        orders,
      };

      return backupData;
    } catch (error) {
      console.error('Error creating backup:', error);
      throw error;
    }
  };

  const downloadBackup = async () => {
    try {
      const backupData = await createBackup();
      const jsonString = JSON.stringify(backupData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const date = new Date().toISOString().split('T')[0];
      const filename = `tailor-backup-${date}.json`;

      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('بیک اپ ڈاؤن لوڈ ہو گیا');
      return backupData;
    } catch (error) {
      toast.error('بیک اپ بنانے میں مسئلہ ہوا');
      throw error;
    }
  };

  const shareViaWhatsApp = async () => {
    try {
      const backupData = await createBackup();
      const jsonString = JSON.stringify(backupData);

      // Create a message with backup summary
      const customerCount = backupData.customers?.length || 0;
      const orderCount = backupData.orders?.length || 0;
      const date = new Date().toLocaleDateString('ur-PK');

      // For WhatsApp, we'll share a summary since full JSON might be too long
      // We'll also download the file
      await downloadBackup();

      const message = encodeURIComponent(
        `📋 ٹیلر شاپ بیک اپ\n` +
        `📅 تاریخ: ${date}\n` +
        `👥 گاہک: ${customerCount}\n` +
        `📦 آرڈرز: ${orderCount}\n\n` +
        `بیک اپ فائل ڈاؤن لوڈ ہو گئی ہے۔`
      );

      const phoneNumber = '923475202343';
      const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

      window.open(whatsappUrl, '_blank');
      toast.success('واٹس ایپ کھل گیا');
    } catch (error) {
      toast.error('واٹس ایپ شیئر میں مسئلہ ہوا');
      throw error;
    }
  };

  return {
    downloadBackup,
    shareViaWhatsApp,
  };
}
