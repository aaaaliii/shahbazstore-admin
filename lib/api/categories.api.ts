import api from './api';

export interface Category {
  _id?: string;
  id?: string;
  name: string;
  slug: string;
  parentId?: string | null;
  parent?: Category | null;
  children?: Category[];
  createdAt?: string;
  updatedAt?: string;
}

export const categoriesApi = {
  getAll: async (): Promise<Category[]> => {
    const response = await api.get('/categories');
    
    // Backend returns: { success: true, categories }
    const responseData = response.data;
    const categories = responseData?.categories || [];
    
    if (!Array.isArray(categories)) {
      console.error('Categories API: Expected array but got:', typeof categories, categories);
      return [];
    }
    
    return categories.map((cat: any) => ({
      ...cat,
      id: cat._id || cat.id,
      parentId: cat.parent?._id || cat.parent || cat.parentId || null,
    }));
  },

  getById: async (id: string): Promise<Category> => {
    const response = await api.get(`/categories/${id}`);
    const category = response.data.category || response.data;
    
    return {
      ...category,
      id: category._id || category.id,
      parentId: category.parent?._id || category.parent || category.parentId || null,
    };
  },

  create: async (category: Partial<Category>): Promise<Category> => {
    const categoryData: any = { ...category };
    
    // Handle parentId
    if (categoryData.parentId === null || categoryData.parentId === '') {
      categoryData.parent = null;
    } else if (categoryData.parentId) {
      categoryData.parent = categoryData.parentId;
    }
    delete categoryData.parentId;
    
    const response = await api.post('/categories', categoryData);
    const createdCategory = response.data.category || response.data;
    
    return {
      ...createdCategory,
      id: createdCategory._id || createdCategory.id,
      parentId: createdCategory.parent?._id || createdCategory.parent || null,
    };
  },

  update: async (id: string, category: Partial<Category>): Promise<Category> => {
    const categoryData: any = { ...category };
    
    // Handle parentId
    if (categoryData.parentId === null || categoryData.parentId === '') {
      categoryData.parent = null;
    } else if (categoryData.parentId) {
      categoryData.parent = categoryData.parentId;
    }
    delete categoryData.parentId;
    
    const response = await api.put(`/categories/${id}`, categoryData);
    const updatedCategory = response.data.category || response.data;
    
    return {
      ...updatedCategory,
      id: updatedCategory._id || updatedCategory.id,
      parentId: updatedCategory.parent?._id || updatedCategory.parent || null,
    };
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/categories/${id}`);
  },
};
