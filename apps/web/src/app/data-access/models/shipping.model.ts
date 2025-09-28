export interface ShippingCompany {
  id: string;
  name: string;
}

export interface PickupPoint {
  id: string;
  companyId: string;
  name: string;
}

export interface ShippingData {
  companies: ShippingCompany[];
  pickupPoints: PickupPoint[];
}
