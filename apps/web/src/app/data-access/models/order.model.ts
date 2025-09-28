export type Language = 'az' | 'en' | 'ru';

export type CountryCode = 'AZ';

export interface ProductLink {
  url: string;
  size?: string;
  color?: string;
  price?: number;
  notes?: string;
}

export interface OrderDraft {
  language: Language;
  country: CountryCode;
  items: ProductLink[];
}

export interface DeliveryInfo {
  recipientName: string;
  method: 'courier' | 'pickup';
  companyId: string;
  companyName: string;
  pickupPointId?: string;
  pickupPointName?: string;
  addressLine?: string;
  customerCode: string;
}

export type PaymentStatus = 'idle' | 'initiated' | 'approved' | 'failed';

export interface OrderSubmission {
  id: string;
  draft: OrderDraft;
  delivery: DeliveryInfo;
  createdAt: string;
  total: number;
  payment: PaymentStatus;
}
