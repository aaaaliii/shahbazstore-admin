// Server-side API client (for use in Server Components)
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const url = `${API_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    cache: 'no-store', // Always fetch fresh data on server
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }

  return response.json();
}

// Admin routes require token - we'll handle this differently for server components
// For now, we can pass token from server actions or use API routes as middleware

export const serverApi = {
  // Public routes (no auth needed)
  products: {
    getAll: async (params?: {
      page?: number;
      limit?: number;
      search?: string;
      category?: string;
      inStock?: string;
    }) => {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.search) queryParams.append('search', params.search);
      if (params?.category) queryParams.append('category', params.category);
      if (params?.inStock) queryParams.append('inStock', params.inStock);
      
      const query = queryParams.toString();
      return fetchAPI(`/products${query ? `?${query}` : ''}`);
    },
    getById: async (id: string) => fetchAPI(`/products/${id}`),
    getBySlug: async (slug: string) => fetchAPI(`/products/slug/${slug}`),
  },

  categories: {
    getAll: async () => fetchAPI('/categories'),
    getById: async (id: string) => fetchAPI(`/categories/${id}`),
  },
  settings: {
    get: async () => {
      const response = await fetchAPI('/settings');
      return response.settings || null;
    },
  },
};

// Server-side API client with authentication (for use in Server Components)
async function fetchAPIWithAuth(endpoint: string, options: RequestInit = {}) {
  const { cookies } = await import('next/headers');
  const token = (await cookies()).get('adminToken')?.value;
  
  if (!token) {
    throw new Error('Unauthorized: No admin token found');
  }

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
  const url = `${API_URL}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
    cache: 'no-store', // Always fetch fresh data on server
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(`API Error: ${errorData.message || response.statusText}`);
  }

  return response.json();
}

export const serverApiWithAuth = {
  headerLinks: {
    getAll: async () => {
      const response = await fetchAPIWithAuth('/header-links/all');
      return response.links || [];
    },
  },
};
