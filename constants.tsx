
import React from 'react';
import { 
  Sparkles,
  Scissors,
} from 'lucide-react';

export const APP_NAME = "Baddieglow";
export const LOCATION = "Akure, Nigeria";

export const CURRENCIES = [
  { code: 'NGN', symbol: '₦', label: 'Naira (NGN)' },
  { code: 'USD', symbol: '$', label: 'US Dollar (USD)' },
  { code: 'GBP', symbol: '£', label: 'British Pound (GBP)' },
  { code: 'EUR', symbol: '€', label: 'Euro (EUR)' },
  { code: 'CAD', symbol: '$', label: 'Canadian Dollar (CAD)' },
  { code: 'AUD', symbol: '$', label: 'Australian Dollar (AUD)' },
  { code: 'GHS', symbol: 'GH₵', label: 'Ghana Cedi (GHS)' },
  { code: 'ZAR', symbol: 'R', label: 'South African Rand (ZAR)' },
  { code: 'AED', symbol: 'د.إ', label: 'UAE Dirham (AED)' }
];

export const SERVICE_ICONS: Record<string, React.ReactNode> = {
  'Lash Extension': <Sparkles className="w-4 h-4" />,
  'Nails': <Scissors className="w-4 h-4" />,
  'Microblading': <Scissors className="w-4 h-4" />,
  'Tattoos': <Scissors className="w-4 h-4" />,
  'Lash Removal': <Scissors className="w-4 h-4" />,
  'Toe Nails': <Scissors className="w-4 h-4" />
};

export const STATUS_COLORS = {
  confirmed: 'bg-green-100 text-green-700 border-green-200',
  pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  completed: 'bg-blue-100 text-blue-700 border-blue-200',
  cancelled: 'bg-red-100 text-red-700 border-red-200'
};
