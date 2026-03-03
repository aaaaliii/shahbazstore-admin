import api from './api';

export interface OrderItem {
  product: string | { _id: string; name: string; images?: string[]; slug?: string };
  productId?: string | { _id: string; name: string; image?: string };
  productName?: string;
  productImage?: string;
  quantity: number;
  price: number;
  selectedVariant?: any;
  variantId?: string;
}

export interface ShippingAddress {
  firstName?: string;
  lastName?: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone?: string;
  email?: string;
}

export interface BillingAddress {
  firstName?: string;
  lastName?: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone?: string;
  email?: string;
}

export interface Order {
  _id?: string;
  id?: string;
  user?: { _id: string; name: string; email: string };
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  items: OrderItem[];
  subtotal?: number;
  totalAmount: number;
  total?: number;
  discountAmount?: number;
  discountCode?: { code: string; type: string; value: number };
  deliveryCharges?: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  billingAddress?: BillingAddress;
  shippingAddress: ShippingAddress;
  paymentMethod?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface OrdersResponse {
  orders: Order[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  recentOrders: Order[];
}

export const ordersApi = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<OrdersResponse> => {
    const queryParams: any = {};
    if (params?.page) queryParams.page = params.page;
    if (params?.limit) queryParams.limit = params.limit;
    if (params?.status) queryParams.status = params.status;

    const response = await api.get('/orders', { params: queryParams });
    const { orders, pagination } = response.data;
    
    return {
      orders: orders.map((order: any) => {
        // Extract user information
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
          total: order.totalAmount || order.total || 0,
          subtotal: order.totalAmount - (order.discountAmount || 0),
          items: order.items.map((item: any) => ({
            ...item,
            productId: item.product?._id || item.product || item.productId,
            productName: item.product?.name || item.productName || '',
            productImage: item.product?.images?.[0] || item.productImage || '',
          })),
        };
      }),
      pagination: pagination || {
        page: params?.page || 1,
        limit: params?.limit || 20,
        total: orders.length,
        pages: 1,
      },
    };
  },

  getById: async (id: string): Promise<Order> => {
    const response = await api.get(`/orders/${id}`);
    const order = response.data.order || response.data;
    
    // Extract user information
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
      total: order.totalAmount || order.total || 0,
      subtotal: order.totalAmount - (order.discountAmount || 0),
      items: order.items.map((item: any) => ({
        ...item,
        productId: item.product?._id || item.product || item.productId,
        productName: item.product?.name || item.productName || '',
        productImage: item.product?.images?.[0] || item.productImage || '',
      })),
    };
  },

  updateStatus: async (id: string, status: Order['status']): Promise<Order> => {
    const response = await api.put(`/orders/${id}/status`, { status });
    const order = response.data.order || response.data;
    
    // Extract user information
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
      total: order.totalAmount || order.total || 0,
      subtotal: order.totalAmount - (order.discountAmount || 0),
      items: order.items.map((item: any) => ({
        ...item,
        productId: item.product?._id || item.product || item.productId,
        productName: item.product?.name || item.productName || '',
        productImage: item.product?.images?.[0] || item.productImage || '',
      })),
    };
  },
};
