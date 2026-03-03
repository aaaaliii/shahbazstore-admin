import ProductsClient from './ProductsClient';
import { productsApi } from '../../../lib/api/products.api';
import { categoriesApi } from '../../../lib/api/categories.api';

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page || '1');
  
  try {
    const [productsData, categories] = await Promise.all([
      productsApi.getAll({ page, limit: 20 }),
      categoriesApi.getAll(),
    ]);

    console.log('Products data:', productsData);
    console.log('Categories data:', categories);

    return (
      <ProductsClient
        initialProducts={productsData.products || []}
        initialCategories={categories || []}
        initialPagination={productsData.pagination || { page: 1, limit: 20, total: 0, pages: 0 }}
      />
    );
  } catch (error: any) {
    console.error('Error fetching products:', error);
    console.error('Error details:', error.response?.data || error.message);
    // Fallback to empty data on error
    return (
      <ProductsClient
        initialProducts={[]}
        initialCategories={[]}
        initialPagination={{ page: 1, limit: 20, total: 0, pages: 0 }}
      />
    );
  }
}
