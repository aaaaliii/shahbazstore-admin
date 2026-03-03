"use client";

import { useState, useEffect } from "react";
import { settingsApi, Settings, BannerSettings } from "../../../lib/api/settings.api";
import { toast } from "sonner";

interface SettingsClientProps {
  initialSettings: Settings | null;
}

export default function SettingsClient({
  initialSettings,
}: SettingsClientProps) {
  const [settings, setSettings] = useState<Settings | null>(initialSettings);
  const [bannerForm, setBannerForm] = useState<BannerSettings>({
    text: initialSettings?.banner?.text || 'Get 10% OFF at the Shahbaz Kitchen Selection -',
    linkText: initialSettings?.banner?.linkText || 'Shop Now!',
    linkUrl: initialSettings?.banner?.linkUrl || '/products',
    isActive: initialSettings?.banner?.isActive ?? true,
  });
  const [deliveryForm, setDeliveryForm] = useState({
    amount: initialSettings?.deliveryCharges?.amount || 0,
    freeDeliveryThreshold: initialSettings?.deliveryCharges?.freeDeliveryThreshold || 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingDelivery, setIsSavingDelivery] = useState(false);

  useEffect(() => {
    if (initialSettings) {
      setSettings(initialSettings);
      setBannerForm({
        text: initialSettings.banner?.text || 'Get 10% OFF at the Shahbaz Kitchen Selection -',
        linkText: initialSettings.banner?.linkText || 'Shop Now!',
        linkUrl: initialSettings.banner?.linkUrl || '/products',
        isActive: initialSettings.banner?.isActive ?? true,
      });
    }
  }, [initialSettings]);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const fetchedSettings = await settingsApi.get();
      setSettings(fetchedSettings);
      if (fetchedSettings.banner) {
        setBannerForm(fetchedSettings.banner);
      }
      if (fetchedSettings.deliveryCharges) {
        setDeliveryForm({
          amount: fetchedSettings.deliveryCharges.amount || 0,
          freeDeliveryThreshold: fetchedSettings.deliveryCharges.freeDeliveryThreshold || 0,
        });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error("Failed to refresh settings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBannerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!bannerForm.text.trim()) {
      toast.error("Banner text is required");
      return;
    }
    
    try {
      setIsSaving(true);
      const updatedBanner = await settingsApi.updateBanner(bannerForm);
      
      // Update local state
      setSettings(prev => prev ? {
        ...prev,
        banner: updatedBanner
      } : {
        banner: updatedBanner
      } as Settings);
      
      toast.success("Banner settings updated successfully!");
    } catch (error: any) {
      console.error('Error updating banner:', error);
      toast.error(error?.message || "Failed to update banner settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeliverySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (deliveryForm.amount < 0) {
      toast.error("Delivery charges cannot be negative");
      return;
    }
    
    if (deliveryForm.freeDeliveryThreshold < 0) {
      toast.error("Free delivery threshold cannot be negative");
      return;
    }
    
    try {
      setIsSavingDelivery(true);
      const updatedSettings = await settingsApi.update({
        deliveryCharges: deliveryForm
      });
      
      // Update local state
      setSettings(prev => prev ? {
        ...prev,
        deliveryCharges: updatedSettings.deliveryCharges
      } : updatedSettings);
      
      toast.success("Delivery charges settings updated successfully!");
    } catch (error: any) {
      console.error('Error updating delivery charges:', error);
      toast.error(error?.message || "Failed to update delivery charges settings");
    } finally {
      setIsSavingDelivery(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Site Settings</h1>
        <p className="text-gray-600 mt-2">Manage your site-wide settings and configurations</p>
      </div>

      {/* Banner Settings Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Banner Settings</h2>
          <p className="text-sm text-gray-600">
            Configure the promotional banner displayed below the header
          </p>
        </div>

        <form onSubmit={handleBannerSubmit} className="space-y-4">
          <div>
            <label htmlFor="banner-text" className="block text-sm font-medium text-gray-700 mb-1">
              Banner Text *
            </label>
            <input
              type="text"
              id="banner-text"
              value={bannerForm.text}
              onChange={(e) => setBannerForm({ ...bannerForm, text: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              placeholder="Get 10% OFF at the Shahbaz Kitchen Selection -"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="banner-link-text" className="block text-sm font-medium text-gray-700 mb-1">
                Link Text
              </label>
              <input
                type="text"
                id="banner-link-text"
                value={bannerForm.linkText}
                onChange={(e) => setBannerForm({ ...bannerForm, linkText: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="Shop Now!"
              />
            </div>

            <div>
              <label htmlFor="banner-link-url" className="block text-sm font-medium text-gray-700 mb-1">
                Link URL
              </label>
              <input
                type="text"
                id="banner-link-url"
                value={bannerForm.linkUrl}
                onChange={(e) => setBannerForm({ ...bannerForm, linkUrl: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="/products"
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="banner-active"
              checked={bannerForm.isActive}
              onChange={(e) => setBannerForm({ ...bannerForm, isActive: e.target.checked })}
              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
            />
            <label htmlFor="banner-active" className="ml-2 block text-sm text-gray-700">
              Show banner on site
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={fetchSettings}
              disabled={isLoading}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
            >
              {isLoading ? "Refreshing..." : "Refresh"}
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Save Banner Settings"}
            </button>
          </div>
        </form>
      </div>

      {/* Delivery Charges Settings Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Delivery Charges Settings</h2>
          <p className="text-sm text-gray-600">
            Configure delivery charges and free delivery threshold
          </p>
        </div>

        <form onSubmit={handleDeliverySubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="delivery-amount" className="block text-sm font-medium text-gray-700 mb-1">
                Delivery Charges (Rs) *
              </label>
              <input
                type="number"
                id="delivery-amount"
                min="0"
                step="0.01"
                value={deliveryForm.amount}
                onChange={(e) => setDeliveryForm({ ...deliveryForm, amount: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="0.00"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Amount charged for delivery (set to 0 for free delivery)
              </p>
            </div>

            <div>
              <label htmlFor="free-delivery-threshold" className="block text-sm font-medium text-gray-700 mb-1">
                Free Delivery Threshold (Rs) *
              </label>
              <input
                type="number"
                id="free-delivery-threshold"
                min="0"
                step="0.01"
                value={deliveryForm.freeDeliveryThreshold}
                onChange={(e) => setDeliveryForm({ ...deliveryForm, freeDeliveryThreshold: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="0.00"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Minimum order amount for free delivery (set to 0 to disable)
              </p>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <p className="text-sm text-blue-800">
              <strong>How it works:</strong> If the order subtotal (after discounts) is equal to or greater than the free delivery threshold, delivery will be free. Otherwise, the delivery charges will be applied.
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={fetchSettings}
              disabled={isLoading}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
            >
              {isLoading ? "Refreshing..." : "Refresh"}
            </button>
            <button
              type="submit"
              disabled={isSavingDelivery}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
            >
              {isSavingDelivery ? "Saving..." : "Save Delivery Settings"}
            </button>
          </div>
        </form>
      </div>

      {/* Preview Section */}
      {bannerForm.isActive && (
        <div className="bg-gray-50 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Preview</h3>
          <div className="bg-white border border-gray-200 rounded p-4">
            <div className="bg-orange-50 border border-orange-200 rounded p-3">
              <p className="text-center text-sm text-orange-700">
                {bannerForm.text}{" "}
                <a href={bannerForm.linkUrl} className="font-bold underline hover:text-orange-800">
                  {bannerForm.linkText}
                </a>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
