import CategoriesClient from "./CategoriesClient";
import { categoriesApi } from "../../../lib/api/categories.api";

export default async function CategoriesPage() {
  try {
    const categories = await categoriesApi.getAll();
    
    console.log('Categories fetched:', categories);

    return (
      <CategoriesClient
        initialCategories={categories || []}
      />
    );
  } catch (error: any) {
    console.error('Error fetching categories:', error);
    console.error('Error details:', error.response?.data || error.message);
    // Fallback to empty data on error
    return (
      <CategoriesClient
        initialCategories={[]}
      />
    );
  }
}
