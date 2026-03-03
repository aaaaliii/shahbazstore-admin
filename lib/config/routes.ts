// Valid internal routes for header links
export const VALID_INTERNAL_ROUTES = [
  { value: '/', label: 'Home' },
  { value: '/products', label: 'Products' },
  { value: '/cart', label: 'Cart' },
  { value: '/checkout', label: 'Checkout' },
  { value: '/login', label: 'Login' },
  { value: '/wishlist', label: 'Wishlist' },
  { value: '/account', label: 'My Account' },
  { value: '/orders', label: 'Orders' },
  { value: '/forgot-password', label: 'Forgot Password' },
] as const;

// Route patterns for dynamic routes
export const ROUTE_PATTERNS = {
  product: /^\/product\/[^/]+$/, // /product/[id]
  order: /^\/orders\/[^/]+$/,     // /orders/[id]
} as const;

/**
 * Validate if a URL is a valid internal route
 */
export const isValidInternalRoute = (url: string): boolean => {
  // Check exact matches
  if (VALID_INTERNAL_ROUTES.some(route => route.value === url)) {
    return true;
  }

  // Check dynamic route patterns
  for (const pattern of Object.values(ROUTE_PATTERNS)) {
    if (pattern.test(url)) {
      return true;
    }
  }

  return false;
};

/**
 * Validate if a URL is a valid external URL
 */
export const isValidExternalUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
};

/**
 * Validate header link URL
 */
export const validateHeaderLinkUrl = (
  url: string, 
  openInNewTab: boolean = false
): { valid: boolean; error?: string } => {
  if (!url || typeof url !== 'string') {
    return { valid: false, error: 'URL is required' };
  }

  const trimmedUrl = url.trim();

  // If it's an external URL (starts with http:// or https://)
  if (trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://')) {
    if (!isValidExternalUrl(trimmedUrl)) {
      return { valid: false, error: 'Invalid external URL format' };
    }
    // External URLs should open in new tab for security
    if (!openInNewTab) {
      return { 
        valid: false, 
        error: 'External URLs must open in a new tab for security reasons' 
      };
    }
    return { valid: true };
  }

  // Internal routes must start with /
  if (!trimmedUrl.startsWith('/')) {
    return { valid: false, error: 'Internal routes must start with /' };
  }

  // Validate internal route
  if (!isValidInternalRoute(trimmedUrl)) {
    return { 
      valid: false, 
      error: `Invalid route. Please select from the dropdown or use a valid pattern like /product/[id]` 
    };
  }

  return { valid: true };
};
