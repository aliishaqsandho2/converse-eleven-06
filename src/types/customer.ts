export interface Customer {
  id: string;
  name: string;
  phone?: string | null;
  // Qameez measurements
  qameez_length?: number | null;
  sleeve_length?: number | null;
  chest?: number | null;
  neck?: number | null;
  waist?: number | null;
  gher?: number | null;
  collar_size?: number | null;
  cuff_width?: number | null;
  placket_width?: number | null;
  front_pocket?: string | null;
  side_pocket?: string | null;
  armhole?: number | null;
  elbow?: number | null;
  daman?: number | null;
  bain?: number | null;
  // Shalwar measurements
  shalwar_length?: number | null;
  paicha?: number | null;
  shalwar_pocket?: string | null;
  shalwar_width?: number | null;
  // Metadata
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CustomerFormData {
  name: string;
  phone?: string;
  qameez_length?: number;
  sleeve_length?: number;
  chest?: number;
  neck?: number;
  waist?: number;
  gher?: number;
  collar_size?: number;
  cuff_width?: number;
  placket_width?: number;
  front_pocket?: string;
  side_pocket?: string;
  armhole?: number;
  elbow?: number;
  daman?: number;
  bain?: number;
  shalwar_length?: number;
  paicha?: number;
  shalwar_pocket?: string;
  shalwar_width?: number;
  notes?: string;
}

export const measurementFields = [
  { key: 'qameez_length', label: 'لمبائی قمیص', type: 'number' },
  { key: 'sleeve_length', label: 'بازو', type: 'number' },
  { key: 'chest', label: 'تیرا / چھاتی', type: 'number' },
  { key: 'neck', label: 'گلا', type: 'number' },
  { key: 'waist', label: 'کمر', type: 'number' },
  { key: 'gher', label: 'گھیر', type: 'number' },
  { key: 'collar_size', label: 'کالر گز', type: 'number' },
  { key: 'cuff_width', label: 'کف چوڑائی', type: 'number' },
  { key: 'placket_width', label: 'پٹی چوڑائی', type: 'number' },
  { key: 'front_pocket', label: 'سامنے پاکٹ', type: 'yesno' },
  { key: 'side_pocket', label: 'سائیڈ پاکٹ', type: 'yesno' },
  { key: 'armhole', label: 'آرمول', type: 'number' },
  { key: 'elbow', label: 'کہنی', type: 'number' },
  { key: 'daman', label: 'دامن', type: 'number' },
  { key: 'bain', label: 'بائن', type: 'number' },
  { key: 'shalwar_length', label: 'شلوار لمبائی', type: 'number' },
  { key: 'paicha', label: 'پائچہ', type: 'number' },
  { key: 'shalwar_pocket', label: 'شلوار پاکٹ', type: 'yesno' },
  { key: 'shalwar_width', label: 'شلوار چوڑائی', type: 'number' },
] as const;
