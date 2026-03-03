import api from './api';

export interface Review {
  _id?: string;
  id?: string;
  productId: string;
  product: string | { _id: string; name: string; slug?: string };
  productName: string;
  user?: { _id: string; name: string; email: string };
  customerName: string;
  customerEmail: string;
  rating: number;
  comment: string;
  isApproved?: boolean;
  status: 'pending' | 'approved';
  createdAt: string;
}

export interface ReviewsResponse {
  reviews: Review[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export const reviewsApi = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    isApproved?: boolean;
  }): Promise<ReviewsResponse> => {
    const queryParams: any = {};
    if (params?.page) queryParams.page = params.page;
    if (params?.limit) queryParams.limit = params.limit;
    if (params?.isApproved !== undefined) queryParams.isApproved = params.isApproved;

    const response = await api.get('/reviews', { params: queryParams });
    
    // Backend returns: { success: true, reviews, pagination }
    const responseData = response.data;
    const reviews = responseData?.reviews || [];
    const pagination = responseData?.pagination;

    if (!Array.isArray(reviews)) {
      console.error('Reviews API: Expected array but got:', typeof reviews, reviews);
      return {
        reviews: [],
        pagination: pagination || {
          page: params?.page || 1,
          limit: params?.limit || 20,
          total: 0,
          pages: 0,
        },
      };
    }

    return {
      reviews: reviews.map((review: any) => {
        const product = review.product;
        const user = review.user;
        
        return {
          ...review,
          id: review._id || review.id,
          productId: product?._id || product || review.productId || '',
          productName: product?.name || review.productName || 'Unknown Product',
          customerName: user?.name || review.customerName || 'Anonymous',
          customerEmail: user?.email || review.customerEmail || '',
          status: review.isApproved ? 'approved' : 'pending',
        };
      }),
      pagination,
    };
  },

  approve: async (id: string): Promise<void> => {
    await api.put(`/reviews/${id}/approve`);
  },
};
