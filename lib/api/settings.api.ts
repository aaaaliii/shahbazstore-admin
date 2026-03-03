import api from './api';

export interface BannerSettings {
  text: string;
  linkText: string;
  linkUrl: string;
  isActive: boolean;
}

export interface Settings {
  _id?: string;
  id?: string;
  banner: BannerSettings;
  site?: {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
  };
  social?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
  };
  deliveryCharges?: {
    amount: number;
    freeDeliveryThreshold: number;
  };
}

export interface SettingsResponse {
  success: boolean;
  settings: Settings;
}

export interface BannerResponse {
  success: boolean;
  banner: BannerSettings;
}

export const settingsApi = {
  get: async (): Promise<Settings> => {
    const response = await api.get('/settings');
    return response.data.settings;
  },
  
  updateBanner: async (banner: Partial<BannerSettings>): Promise<BannerSettings> => {
    const response = await api.put('/settings/banner', banner);
    return response.data.banner;
  },
  
  update: async (settings: Partial<Settings>): Promise<Settings> => {
    const response = await api.put('/settings', settings);
    return response.data.settings;
  },
};
