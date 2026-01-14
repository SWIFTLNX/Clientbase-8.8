
export enum ServiceType {
  LASH_EXTENSION = 'Lash Extension',
  NAILS = 'Nails',
  MICROBLADING = 'Microblading',
  TATTOOS = 'Tattoos',
  LASH_REMOVAL = 'Lash Removal',
  TOE_NAILS = 'Toe Nails'
}

export type LeadSource = 'Instagram' | 'TikTok' | 'Threads' | 'Snapchat' | 'Pinterest' | 'Referral' | 'Other';

export interface Appointment {
  id: string;
  clientId: string;
  clientName: string;
  clientPhone: string;
  socialContactName?: string;
  leadSource: LeadSource;
  referralBy?: string;
  paymentAccountName?: string;
  service: ServiceType;
  date: string;
  time: string;
  amountPaid: number;
  totalPrice: number;
  notes?: string;
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled';
}

export type View = 'dashboard' | 'calendar' | 'clients' | 'booking' | 'ai-insights' | 'settings' | 'reports';

export interface EmpireSettings {
  passcode: string;
  ownerEmail: string;
  ownerPhone: string; // For WhatsApp
  lastBackupDate: string;
}
