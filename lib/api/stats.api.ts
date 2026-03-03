import api from './api';
import type { Order } from './orders.api';

export interface LowStockProduct {
  _id?: string;
  id?: string;
  name: string;
  slug: string;
  stock: number;
  lowStockThreshold: number;
  image: string;
}

export interface DashboardStats {
  totalProducts: number;
  activeProducts: number;
  totalOrders: number;
  pendingOrders: number;
  confirmedOrders: number;
  totalRevenue: number;
  recentOrders: Order[];
  lowStockProducts: LowStockProduct[];
}

export const statsApi = {
  getStats: async (): Promise<DashboardStats> => {
    const response = await api.get('/analytics/dashboard');
    const stats = response.data.stats || {};
    
    // Transform recent orders to match Order interface
    const recentOrders: Order[] = (stats.recentOrders || []).map((order: any) => {
      const user = order.user;
      const customerName = user?.name || order.customerName || 'N/A';
      const customerEmail = user?.email || order.customerEmail || 'N/A';
      const customerPhone = user?.phone || order.customerPhone;
      
      return {
        ...order,
        id: order._id || order.id,
        customerName,
        customerEmail,
        customerPhone,
        total: order.total || order.totalAmount || 0,
        subtotal: order.subtotal || (order.totalAmount - (order.discountAmount || 0)),
        items: order.items?.map((item: any) => ({
          ...item,
          productId: item.product?._id || item.product || item.productId,
          productName: item.product?.name || item.productName || '',
          productImage: item.product?.images?.[0] || item.productImage || '',
        })) || [],
      };
    });
    
    // Transform low stock products
    const lowStockProducts: LowStockProduct[] = (stats.lowStockProducts || []).map((product: any) => ({
      _id: product._id,
      id: product._id || product.id,
      name: product.name,
      slug: product.slug,
      stock: product.stock,
      lowStockThreshold: product.lowStockThreshold,
      image: product.image || '',
    }));
    
    return {
      totalProducts: stats.totalProducts || 0,
      activeProducts: stats.activeProducts || 0,
      totalOrders: stats.totalOrders || 0,
      pendingOrders: stats.pendingOrders || 0,
      confirmedOrders: stats.confirmedOrders || 0,
      totalRevenue: stats.totalRevenue || 0,
      recentOrders,
      lowStockProducts,
    };
  },
};
