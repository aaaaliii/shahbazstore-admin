import api from './api';

export interface DiscountCode {
  id?: string;
  code: string;
  type: 'percent' | 'fixed';
  value: number;
  minOrder?: number;
  maxUses?: number;
  usedCount?: number;
  startDate: string;
  endDate: string;
  active: boolean;
}

// Backend interface (what the API returns)
interface BackendDiscountCode {
  _id?: string;
  id?: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minPurchase?: number;
  maxUses?: number;
  usedCount?: number;
  expiryDate?: string | Date;
  isActive: boolean;
  createdAt?: string | Date;
}

// Transform backend response to frontend format
const transformFromBackend = (backend: BackendDiscountCode): DiscountCode => {
  return {
    id: backend._id || backend.id,
    code: backend.code,
    type: backend.type === 'percentage' ? 'percent' : backend.type,
    value: backend.value,
    minOrder: backend.minPurchase,
    maxUses: backend.maxUses,
    usedCount: backend.usedCount || 0,
    // Backend only has expiryDate, use createdAt as startDate
    startDate: backend.createdAt 
      ? new Date(backend.createdAt).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0],
    // If no expiryDate, set to far future (no expiry)
    endDate: backend.expiryDate
      ? new Date(backend.expiryDate).toISOString().split('T')[0]
      : '2099-12-31',
    active: backend.isActive,
  };
};

// Transform frontend format to backend format
const transformToBackend = (frontend: Partial<DiscountCode>): Partial<BackendDiscountCode> => {
  const backend: Partial<BackendDiscountCode> = {};
  
  if (frontend.code !== undefined) backend.code = frontend.code;
  if (frontend.type !== undefined) {
    backend.type = frontend.type === 'percent' ? 'percentage' : frontend.type;
  }
  if (frontend.value !== undefined) backend.value = frontend.value;
  if (frontend.minOrder !== undefined) backend.minPurchase = frontend.minOrder;
  if (frontend.maxUses !== undefined) backend.maxUses = frontend.maxUses;
  if (frontend.active !== undefined) backend.isActive = frontend.active;
  // Use endDate as expiryDate (backend doesn't have startDate)
  if (frontend.endDate !== undefined) {
    backend.expiryDate = frontend.endDate ? new Date(frontend.endDate) : undefined;
  }
  
  return backend;
};

export const discountCodesApi = {
  getAll: async (): Promise<DiscountCode[]> => {
    const response = await api.get('/discount-codes');
    const discountCodes = response.data.discountCodes || [];
    return discountCodes.map(transformFromBackend);
  },

  create: async (data: Omit<DiscountCode, 'id'>): Promise<DiscountCode> => {
    const backendData = transformToBackend(data);
    const response = await api.post('/discount-codes', backendData);
    return transformFromBackend(response.data.discountCode);
  },

  update: async (id: string, data: Partial<DiscountCode>): Promise<DiscountCode> => {
    const backendData = transformToBackend(data);
    const response = await api.put(`/discount-codes/${id}`, backendData);
    return transformFromBackend(response.data.discountCode);
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/discount-codes/${id}`);
  },
};
