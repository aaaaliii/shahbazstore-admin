import api from './api';

// Type guard for File objects
const isFile = (obj: unknown): obj is File => {
  return typeof window !== 'undefined' && obj instanceof File;
};

export interface Product {
  _id?: string;
  id?: string;
  name: string;
  slug: string;
  price: number;
  oldPrice?: number;
  image?: string;
  images?: string[];
  category: string | { _id: string; name: string; slug: string };
  rating?: number;
  averageRating?: number;
  description?: string;
  shortDescription?: string;
  inStock?: boolean;
  stock?: number;
  sku?: string;
  variants?: ProductVariant[] | Map<string, any>;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
  isActive?: boolean;
}

export interface ProductVariant {
  id: string;
  name: string;
  value: string;
  price: number;
  priceModifier?: number;
  inStock: boolean;
  stock?: number;
  sku?: string;
  attributes?: Record<string, string>;
}

export interface ProductsResponse {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Helper function to format image URLs with backend base URL
const formatImageUrl = (imagePath: string): string => {
  if (!imagePath) return '';
  
  // If already a full URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // Get base URL for images
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
  const BACKEND_BASE_URL = API_BASE_URL.replace('/api', '');
  
  // If starts with /, it's a server path - prepend backend URL
  if (imagePath.startsWith('/')) {
    return `${BACKEND_BASE_URL}${imagePath}`;
  }
  
  // Otherwise, assume it's relative to uploads
  return `${BACKEND_BASE_URL}/${imagePath}`;
};

export const productsApi = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    inStock?: string;
  }): Promise<ProductsResponse> => {
    const queryParams: any = {};
    if (params?.page) queryParams.page = params.page;
    if (params?.limit) queryParams.limit = params.limit;
    if (params?.search) queryParams.search = params.search;
    if (params?.category) queryParams.category = params.category;
    if (params?.inStock) queryParams.inStock = params.inStock;

    const response = await api.get('/products', { params: queryParams });
    
    // Backend returns: { success: true, products, pagination }
    const responseData = response.data;
    const products = responseData?.products || [];
    const pagination = responseData?.pagination || {
      page: params?.page || 1,
      limit: params?.limit || 20,
      total: products.length,
      pages: Math.ceil(products.length / (params?.limit || 20)),
    };
    
    if (!Array.isArray(products)) {
      console.error('Products API: Expected array but got:', typeof products, products);
      return {
        products: [],
        pagination: {
          page: params?.page || 1,
          limit: params?.limit || 20,
          total: 0,
          pages: 0,
        },
      };
    }
    
    return {
      products: products.map((p: any) => {
        // Use main image if available, otherwise use first image from array
        const mainImage = p.image || p.images?.[0] || '';
        return {
          ...p,
          id: p._id || p.id,
          image: formatImageUrl(mainImage),
          images: p.images?.map((img: string) => formatImageUrl(img)) || [],
          inStock: p.stock > 0 || !p.trackInventory,
          // Map compareAtPrice to oldPrice for frontend
          oldPrice: p.compareAtPrice,
        };
      }),
      pagination,
    };
  },

  getAllAdmin: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    inStock?: string;
  }): Promise<ProductsResponse> => {
    // Same as getAll for now - backend handles admin filtering
    return productsApi.getAll(params);
  },

  getById: async (id: string): Promise<Product> => {
    const response = await api.get(`/products/${id}`);
    const product = response.data.product || response.data;
    
    // Use main image if available, otherwise use first image from array
    const mainImage = product.image || product.images?.[0] || '';
    
    return {
      ...product,
      id: product._id || product.id,
      image: formatImageUrl(mainImage),
      images: product.images?.map((img: string) => formatImageUrl(img)) || [],
      inStock: product.stock > 0 || !product.trackInventory,
      // Map compareAtPrice to oldPrice for frontend
      oldPrice: product.compareAtPrice,
    };
  },

  getBySlug: async (slug: string): Promise<Product> => {
    const response = await api.get(`/products/${slug}`);
    const product = response.data.product || response.data;
    
    // Use main image if available, otherwise use first image from array
    const mainImage = product.image || product.images?.[0] || '';
    
    return {
      ...product,
      id: product._id || product.id,
      image: formatImageUrl(mainImage),
      images: product.images?.map((img: string) => formatImageUrl(img)) || [],
      inStock: product.stock > 0 || !product.trackInventory,
      // Map compareAtPrice to oldPrice for frontend
      oldPrice: product.compareAtPrice,
    };
  },

  create: async (product: Partial<Product>): Promise<Product> => {
    const formData = new FormData();
    
    // Separate images into files and URLs
    const imageFiles: File[] = [];
    const imageUrls: string[] = [];
    
    // Handle both single image and images array
    if (product.image && typeof product.image === 'string' && product.image.trim() !== '') {
      imageUrls.push(product.image);
    }
    
    if (product.images && Array.isArray(product.images)) {
      product.images.forEach((img) => {
        if (isFile(img)) {
          imageFiles.push(img);
        } else if (typeof img === 'string' && img.trim() !== '') {
          imageUrls.push(img);
        }
      });
    }
    
    // Add text fields (excluding images which will be handled separately)
    const productData: any = { ...product };
    
    // Remove frontend-specific fields
    delete productData.image;
    delete productData.inStock;
    delete productData.id;
    delete productData._id;
    
    // Map oldPrice to compareAtPrice
    if (productData.oldPrice !== undefined) {
      productData.compareAtPrice = productData.oldPrice;
      delete productData.oldPrice;
    }
    
    // Map inStock to stock and trackInventory
    if (product.inStock !== undefined) {
      // If inStock is false, set stock to 0, otherwise keep existing stock or default
      if (!product.inStock) {
        productData.stock = 0;
        productData.trackInventory = true;
      } else {
        // If inStock is true but stock is not set, set a default
        if (productData.stock === undefined || productData.stock === null) {
          productData.stock = 1;
        }
        productData.trackInventory = true;
      }
    }
    
    // Handle category
    if (productData.category) {
      if (typeof productData.category === 'object') {
        productData.category = (productData.category as any)._id || (productData.category as any).id;
      }
    }
    
    // Handle variants - convert to JSON string if it's an object/Map
    if (productData.variants) {
      if (productData.variants instanceof Map) {
        const variantsObj: any = {};
        productData.variants.forEach((value: any, key: string) => {
          variantsObj[key] = value;
        });
        productData.variants = JSON.stringify(variantsObj);
      } else if (typeof productData.variants === 'object') {
        productData.variants = JSON.stringify(productData.variants);
      }
    }
    
    // Add existing image URLs to the body (if any) - backend now supports this
    if (imageUrls.length > 0) {
      productData.images = imageUrls;
    }
    
    // Required fields that must always be sent
    const requiredFields = ['name', 'description', 'price', 'category', 'slug'];
    
    // Add all fields to FormData
    Object.keys(productData).forEach((key) => {
      const value = productData[key];
      
      // Skip undefined, null, and frontend-only fields
      if (value === undefined || value === null || key === 'id' || key === '_id') {
        return;
      }
      
      // Always send required fields, even if empty
      const isRequired = requiredFields.includes(key);
      
      if (key === 'images' && Array.isArray(value)) {
        // For image URLs array, send as JSON string (even if empty)
        formData.append(key, JSON.stringify(value));
      } else if (Array.isArray(value) && key !== 'images') {
        // For arrays like tags, send as JSON (even if empty for required fields)
        if (isRequired || value.length > 0) {
          formData.append(key, JSON.stringify(value));
        }
      } else if (typeof value === 'boolean') {
        // Convert boolean to string
        formData.append(key, value ? 'true' : 'false');
      } else if (typeof value === 'number') {
        // Convert number to string
        formData.append(key, String(value));
      } else if (typeof value === 'string') {
        // Send string if it's required or not empty
        if (isRequired || value.trim() !== '') {
          formData.append(key, value);
        }
      } else if (value !== '' && value !== null) {
        // For other types, convert to string
        formData.append(key, String(value));
      }
    });

    // Add image files
    imageFiles.forEach((file) => {
      formData.append('images', file);
    });

    const response = await api.post('/products', formData);
    const createdProduct = response.data.product || response.data;
    
    // Use main image if available, otherwise use first image from array
    const mainImage = createdProduct.image || createdProduct.images?.[0] || '';
    
    return {
      ...createdProduct,
      id: createdProduct._id || createdProduct.id,
      image: formatImageUrl(mainImage),
      images: createdProduct.images?.map((img: string) => formatImageUrl(img)) || [],
      inStock: createdProduct.stock > 0 || !createdProduct.trackInventory,
    };
  },

  update: async (id: string, product: Partial<Product>): Promise<Product> => {
    const formData = new FormData();
    
    // Separate images into files and URLs
    const imageFiles: File[] = [];
    const imageUrls: string[] = [];
    
    // Handle both single image and images array
    if (product.image && typeof product.image === 'string' && product.image.trim() !== '') {
      imageUrls.push(product.image);
    }
    
    if (product.images && Array.isArray(product.images)) {
      product.images.forEach((img) => {
        if (isFile(img)) {
          imageFiles.push(img);
        } else if (typeof img === 'string' && img.trim() !== '') {
          imageUrls.push(img);
        }
      });
    }
    
    // Add text fields (excluding images which will be handled separately)
    const productData: any = { ...product };
    
    // Remove frontend-specific fields
    delete productData.image;
    delete productData.inStock;
    delete productData.id;
    delete productData._id;
    
    // Map oldPrice to compareAtPrice
    if (productData.oldPrice !== undefined) {
      productData.compareAtPrice = productData.oldPrice;
      delete productData.oldPrice;
    }
    
    // Map inStock to stock and trackInventory
    if (product.inStock !== undefined) {
      // If inStock is false, set stock to 0, otherwise keep existing stock or default
      if (!product.inStock) {
        productData.stock = 0;
        productData.trackInventory = true;
      } else {
        // If inStock is true but stock is not set, set a default
        if (productData.stock === undefined || productData.stock === null) {
          productData.stock = 1;
        }
        productData.trackInventory = true;
      }
    }
    
    // Handle category
    if (productData.category) {
      if (typeof productData.category === 'object') {
        productData.category = (productData.category as any)._id || (productData.category as any).id;
      }
    }
    
    // Handle variants - convert to JSON string if it's an object/Map
    if (productData.variants) {
      if (productData.variants instanceof Map) {
        const variantsObj: any = {};
        productData.variants.forEach((value: any, key: string) => {
          variantsObj[key] = value;
        });
        productData.variants = JSON.stringify(variantsObj);
      } else if (typeof productData.variants === 'object') {
        productData.variants = JSON.stringify(productData.variants);
      }
    }
    
    // Add existing image URLs to the body (if any)
    if (imageUrls.length > 0) {
      productData.images = imageUrls;
    }
    
    // Required fields that must always be sent
    const requiredFields = ['name', 'description', 'price', 'category', 'slug'];
    
    // Add all fields to FormData
    Object.keys(productData).forEach((key) => {
      const value = productData[key];
      
      // Skip undefined, null, and frontend-only fields
      if (value === undefined || value === null || key === 'id' || key === '_id') {
        return;
      }
      
      // Always send required fields, even if empty
      const isRequired = requiredFields.includes(key);
      
      if (key === 'images' && Array.isArray(value)) {
        // For image URLs array, send as JSON string (even if empty)
        formData.append(key, JSON.stringify(value));
      } else if (Array.isArray(value) && key !== 'images') {
        // For arrays like tags, send as JSON (even if empty for required fields)
        if (isRequired || value.length > 0) {
          formData.append(key, JSON.stringify(value));
        }
      } else if (typeof value === 'boolean') {
        // Convert boolean to string
        formData.append(key, value ? 'true' : 'false');
      } else if (typeof value === 'number') {
        // Convert number to string
        formData.append(key, String(value));
      } else if (typeof value === 'string') {
        // Send string if it's required or not empty
        if (isRequired || value.trim() !== '') {
          formData.append(key, value);
        }
      } else if (value !== '' && value !== null) {
        // For other types, convert to string
        formData.append(key, String(value));
      }
    });

    // Add image files
    imageFiles.forEach((file) => {
      formData.append('images', file);
    });

    const response = await api.put(`/products/${id}`, formData);
    const updatedProduct = response.data.product || response.data;
    
    // Use main image if available, otherwise use first image from array
    const mainImage = updatedProduct.image || updatedProduct.images?.[0] || '';
    
    return {
      ...updatedProduct,
      id: updatedProduct._id || updatedProduct.id,
      image: formatImageUrl(mainImage),
      images: updatedProduct.images?.map((img: string) => formatImageUrl(img)) || [],
      inStock: updatedProduct.stock > 0 || !updatedProduct.trackInventory,
    };
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/products/${id}`);
  },
};
