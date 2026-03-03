/**
 * Dummy data for dashboard when no backend API is connected.
 * Uses local types to avoid circular dependency with api modules.
 */

export interface DummyCategory {
  _id?: string;
  id?: string;
  name: string;
  slug: string;
  parentId?: string | null;
}

export interface DummyProduct {
  _id?: string;
  id?: string;
  name: string;
  slug: string;
  price: number;
  oldPrice?: number;
  image: string;
  category: string;
  inStock?: boolean;
  shortDescription?: string;
  description?: string;
  sku?: string;
  tags?: string[];
}

export interface DummyOrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

export interface DummyShippingAddress {
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

export interface DummyOrder {
  _id?: string;
  id?: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  items: DummyOrderItem[];
  subtotal: number;
  total: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: DummyShippingAddress;
  paymentMethod: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DummyStats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  recentOrders: DummyOrder[];
}

export const dummyCategories: DummyCategory[] = [
  { id: 'cat-1', name: 'Doors', slug: 'doors', parentId: null },
  { id: 'cat-2', name: 'Bricks', slug: 'bricks', parentId: null },
  { id: 'cat-3', name: 'Accessories', slug: 'accessories', parentId: null },
  { id: 'cat-4', name: 'Internal Doors', slug: 'internal-doors', parentId: 'cat-1' },
  { id: 'cat-5', name: 'Entry Doors', slug: 'entry-doors', parentId: 'cat-1' },
];

const defaultImage = '/Images/Doors/entry doors1.jpeg';

export const dummyProducts: DummyProduct[] = [
  {
    id: 'prod-1',
    name: 'Classic Oak Entry Door',
    slug: 'classic-oak-entry-door',
    price: 899,
    oldPrice: 999,
    image: defaultImage,
    category: 'cat-1',
    inStock: true,
    shortDescription: 'Solid oak entry door with brass fittings.',
    description: 'Premium solid oak entry door. Weather resistant finish.',
    sku: 'ENT-OAK-01',
    tags: ['oak', 'entry', 'door'],
  },
  {
    id: 'prod-2',
    name: 'Red Clay Brick Pack',
    slug: 'red-clay-brick-pack',
    price: 245,
    image: '/Images/Bricks/Brick (1).jpeg',
    category: 'cat-2',
    inStock: true,
    shortDescription: 'Traditional red clay bricks, 500 per pack.',
    sku: 'BRK-RED-500',
    tags: ['brick', 'clay', 'construction'],
  },
  {
    id: 'prod-3',
    name: 'Chrome Basin Mixer',
    slug: 'chrome-basin-mixer',
    price: 89,
    oldPrice: 119,
    image: '/Images/accessories/basin-mixers (1).jpeg',
    category: 'cat-3',
    inStock: true,
    shortDescription: 'Modern chrome basin mixer tap.',
    sku: 'ACC-BASIN-01',
    tags: ['bathroom', 'chrome', 'mixer'],
  },
  {
    id: 'prod-4',
    name: 'Internal Panel Door',
    slug: 'internal-panel-door',
    price: 320,
    image: '/Images/Internal-doors/internal-doors03.jpeg',
    category: 'cat-4',
    inStock: true,
    shortDescription: 'White internal panel door, standard size.',
    sku: 'INT-PAN-01',
    tags: ['internal', 'door', 'panel'],
  },
  {
    id: 'prod-5',
    name: 'Door Handle Set',
    slug: 'door-handle-set',
    price: 45,
    image: '/Images/accessories/internal-door-handles1.jpeg',
    category: 'cat-3',
    inStock: false,
    shortDescription: 'Stainless steel door handle set.',
    sku: 'ACC-HANDLE-01',
    tags: ['handle', 'hardware'],
  },
];

const dummyShipping: DummyShippingAddress = {
  street: '123 Main St',
  city: 'New York',
  state: 'NY',
  zipCode: '10001',
  country: 'USA',
};

const dummyOrderItems: DummyOrderItem[] = [
  { productId: 'prod-1', productName: 'Classic Oak Entry Door', quantity: 1, price: 899 },
  { productId: 'prod-3', productName: 'Chrome Basin Mixer', quantity: 2, price: 89 },
];

export const dummyOrders: DummyOrder[] = [
  {
    id: 'ord-1',
    customerName: 'John Smith',
    customerEmail: 'john@example.com',
    customerPhone: '+1 555-0100',
    items: dummyOrderItems,
    subtotal: 1077,
    total: 1120,
    status: 'delivered',
    shippingAddress: dummyShipping,
    paymentMethod: 'card',
    createdAt: '2025-02-15T10:30:00Z',
    updatedAt: '2025-02-18T14:00:00Z',
  },
  {
    id: 'ord-2',
    customerName: 'Jane Doe',
    customerEmail: 'jane@example.com',
    items: [{ productId: 'prod-2', productName: 'Red Clay Brick Pack', quantity: 3, price: 245 }],
    subtotal: 735,
    total: 760,
    status: 'confirmed',
    shippingAddress: { ...dummyShipping, street: '456 Oak Ave', city: 'Boston', state: 'MA', zipCode: '02101' },
    paymentMethod: 'paypal',
    createdAt: '2025-02-18T09:15:00Z',
  },
  {
    id: 'ord-3',
    customerName: 'Bob Wilson',
    customerEmail: 'bob@example.com',
    items: [{ productId: 'prod-4', productName: 'Internal Panel Door', quantity: 2, price: 320 }],
    subtotal: 640,
    total: 670,
    status: 'pending',
    shippingAddress: { ...dummyShipping, street: '789 Pine Rd', city: 'Chicago', state: 'IL', zipCode: '60601' },
    paymentMethod: 'card',
    createdAt: '2025-02-19T11:00:00Z',
  },
];

export function getDummyStats(): DummyStats {
  return {
    totalProducts: dummyProducts.length,
    totalOrders: dummyOrders.length,
    totalRevenue: dummyOrders.reduce((sum, o) => sum + o.total, 0),
    recentOrders: [...dummyOrders].sort(
      (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    ).slice(0, 5),
  };
}

export function getDummyProducts(params?: { page?: number; limit?: number; category?: string }) {
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 20;
  let list = [...dummyProducts];
  if (params?.category) {
    list = list.filter((p) => p.category === params.category);
  }
  const total = list.length;
  const pages = Math.max(1, Math.ceil(total / limit));
  const start = (page - 1) * limit;
  const products = list.slice(start, start + limit);
  return {
    products,
    pagination: { page, limit, total, pages },
  };
}

export function getDummyCategories(): DummyCategory[] {
  return [...dummyCategories];
}

export function getDummyOrders(params?: { page?: number; limit?: number; status?: string }) {
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 20;
  let list = [...dummyOrders];
  if (params?.status) {
    list = list.filter((o) => o.status === params.status);
  }
  const total = list.length;
  const pages = Math.max(1, Math.ceil(total / limit));
  const start = (page - 1) * limit;
  const orders = list.slice(start, start + limit);
  return {
    orders,
    pagination: { page, limit, total, pages },
  };
}

// --- Reviews ---
export interface DummyReview {
  id?: string;
  productId: string;
  productName: string;
  customerName: string;
  customerEmail: string;
  rating: number;
  comment: string;
  status: 'pending' | 'approved';
  createdAt: string;
}

const dummyReviewsData: DummyReview[] = [
  { id: 'rev-1', productId: 'prod-1', productName: 'Classic Oak Entry Door', customerName: 'John Smith', customerEmail: 'john@example.com', rating: 5, comment: 'Excellent quality and fast delivery!', status: 'approved', createdAt: '2025-02-10T14:00:00Z' },
  { id: 'rev-2', productId: 'prod-3', productName: 'Chrome Basin Mixer', customerName: 'Jane Doe', customerEmail: 'jane@example.com', rating: 4, comment: 'Good value for money.', status: 'pending', createdAt: '2025-02-18T09:00:00Z' },
  { id: 'rev-3', productId: 'prod-2', productName: 'Red Clay Brick Pack', customerName: 'Bob Wilson', customerEmail: 'bob@example.com', rating: 5, comment: 'Perfect for our project. Will order again.', status: 'pending', createdAt: '2025-02-19T11:30:00Z' },
];

export function getDummyReviews(): DummyReview[] {
  return [...dummyReviewsData];
}

export function setReviewApproved(id: string): void {
  const r = dummyReviewsData.find((x) => x.id === id);
  if (r) r.status = 'approved';
}

// --- Discount Codes ---
export interface DummyDiscountCode {
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

const dummyDiscountCodesData: DummyDiscountCode[] = [
  { id: 'dc-1', code: 'WELCOME10', type: 'percent', value: 10, minOrder: 50, maxUses: 100, usedCount: 23, startDate: '2025-01-01', endDate: '2025-12-31', active: true },
  { id: 'dc-2', code: 'SAVE20', type: 'fixed', value: 20, minOrder: 100, maxUses: 50, usedCount: 12, startDate: '2025-02-01', endDate: '2025-02-28', active: true },
  { id: 'dc-3', code: 'OLDCODE', type: 'percent', value: 5, startDate: '2024-01-01', endDate: '2024-12-31', active: false },
];

export function getDummyDiscountCodes(): DummyDiscountCode[] {
  return [...dummyDiscountCodesData];
}

export function addDummyDiscountCode(item: Omit<DummyDiscountCode, 'id'>): DummyDiscountCode {
  const newItem: DummyDiscountCode = { ...item, id: `dc-${Date.now()}`, usedCount: item.usedCount ?? 0 };
  dummyDiscountCodesData.push(newItem);
  return newItem;
}

export function updateDummyDiscountCode(id: string, updates: Partial<DummyDiscountCode>): DummyDiscountCode | null {
  const i = dummyDiscountCodesData.findIndex((x) => x.id === id);
  if (i === -1) return null;
  dummyDiscountCodesData[i] = { ...dummyDiscountCodesData[i], ...updates };
  return dummyDiscountCodesData[i];
}

export function removeDummyDiscountCode(id: string): void {
  const i = dummyDiscountCodesData.findIndex((x) => x.id === id);
  if (i !== -1) dummyDiscountCodesData.splice(i, 1);
}

// --- Header Links (mutable order) ---
export interface DummyHeaderLink {
  id?: string;
  label: string;
  href: string;
  order: number;
}

const dummyHeaderLinksData: DummyHeaderLink[] = [
  { id: 'hl-1', label: 'Home', href: '/', order: 0 },
  { id: 'hl-2', label: 'Shop', href: '/shop', order: 1 },
  { id: 'hl-3', label: 'Categories', href: '/categories', order: 2 },
  { id: 'hl-4', label: 'About', href: '/about', order: 3 },
  { id: 'hl-5', label: 'Contact', href: '/contact', order: 4 },
];

export function getDummyHeaderLinks(): DummyHeaderLink[] {
  return [...dummyHeaderLinksData].sort((a, b) => a.order - b.order);
}

export function addDummyHeaderLink(item: Omit<DummyHeaderLink, 'id' | 'order'>): DummyHeaderLink {
  const maxOrder = Math.max(0, ...dummyHeaderLinksData.map((x) => x.order));
  const newItem: DummyHeaderLink = { ...item, id: `hl-${Date.now()}`, order: maxOrder + 1 };
  dummyHeaderLinksData.push(newItem);
  return newItem;
}

export function updateDummyHeaderLink(id: string, updates: Partial<DummyHeaderLink>): DummyHeaderLink | null {
  const i = dummyHeaderLinksData.findIndex((x) => x.id === id);
  if (i === -1) return null;
  dummyHeaderLinksData[i] = { ...dummyHeaderLinksData[i], ...updates };
  return dummyHeaderLinksData[i];
}

export function removeDummyHeaderLink(id: string): void {
  const i = dummyHeaderLinksData.findIndex((x) => x.id === id);
  if (i !== -1) dummyHeaderLinksData.splice(i, 1);
}

export function reorderDummyHeaderLinks(id: string, direction: 'up' | 'down'): void {
  const list = getDummyHeaderLinks();
  const idx = list.findIndex((x) => x.id === id);
  if (idx === -1) return;
  if (direction === 'up' && idx > 0) {
    [list[idx], list[idx - 1]] = [list[idx - 1], list[idx]];
  } else if (direction === 'down' && idx < list.length - 1) {
    [list[idx], list[idx + 1]] = [list[idx + 1], list[idx]];
  }
  list.forEach((item, i) => {
    const inData = dummyHeaderLinksData.find((x) => x.id === item.id);
    if (inData) inData.order = i;
  });
}
