"use client";

import { useState, useEffect } from "react";
import { productsApi, Product } from "../../../lib/api/products.api";
import { categoriesApi, Category } from "../../../lib/api/categories.api";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import ImageUpload from "../../../components/ImageUpload";

interface ProductsClientProps {
  initialProducts: Product[];
  initialCategories: Category[];
  initialPagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export default function ProductsClient({
  initialProducts,
  initialCategories,
  initialPagination,
}: ProductsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [page, setPage] = useState(initialPagination.page);
  const [totalPages, setTotalPages] = useState(initialPagination.pages);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // Sync props when they change (from router.refresh())
  useEffect(() => {
    setProducts(initialProducts);
    setCategories(initialCategories);
    setTotalPages(initialPagination.pages);
    setPage(initialPagination.page);
  }, [initialProducts, initialCategories, initialPagination]);

  // Fetch all products for related products selector
  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        setLoadingProducts(true);
        // Fetch all products with a high limit, or fetch in batches if needed
        let allFetchedProducts: Product[] = [];
        let currentPage = 1;
        let hasMore = true;
        
        while (hasMore) {
          const response = await productsApi.getAll({ page: currentPage, limit: 100 });
          allFetchedProducts = [...allFetchedProducts, ...response.products];
          
          if (response.products.length < 100 || currentPage >= response.pagination.pages) {
            hasMore = false;
          } else {
            currentPage++;
          }
        }
        
        setAllProducts(allFetchedProducts);
      } catch (error) {
        console.error("Error fetching products for selector:", error);
        toast.error("Failed to load products for related products selector");
      } finally {
        setLoadingProducts(false);
      }
    };
    if (isModalOpen) {
      fetchAllProducts();
    }
  }, [isModalOpen]);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    price: 0,
    oldPrice: "",
    images: [] as string[],
    category: "",
    description: "",
    shortDescription: "",
    stock: 0,
    trackInventory: true,
    lowStockThreshold: 10,
    isActive: true,
    featured: false,
    sku: "",
    barcode: "",
    tags: [] as string[],
    relatedProducts: [] as string[],
    variants: {} as Record<string, any>,
  });
  const [newTag, setNewTag] = useState("");

  // Variant option type
  interface VariantOption {
    name: string;
    value: string;
    priceModifier: number;
    stock: number;
    sku: string;
    barcode: string;
    image: string;
  }

  // Helper function to convert backend variants (Map) to form format
  const convertVariantsFromBackend = (variants: unknown): Record<string, VariantOption[]> => {
    if (!variants) return {};
    
    // If it's already an object, return as is
    if (typeof variants === 'object' && variants !== null && !(variants instanceof Map)) {
      return variants as Record<string, VariantOption[]>;
    }
    
    // If it's a Map, convert to object
    if (variants instanceof Map) {
      const result: Record<string, VariantOption[]> = {};
      variants.forEach((value, key) => {
        result[key] = Array.isArray(value) ? value as VariantOption[] : [];
      });
      return result;
    }
    
    return {};
  };

  // Helper function to convert form variants to backend format
  const convertVariantsToBackend = (variants: Record<string, VariantOption[]>): Record<string, VariantOption[]> => {
    if (!variants || Object.keys(variants).length === 0) {
      return {};
    }
    
    // Ensure each variant option has required fields
    const cleaned: Record<string, any[]> = {};
    Object.entries(variants).forEach(([variantType, options]) => {
      if (Array.isArray(options) && options.length > 0) {
        cleaned[variantType] = options.map((option: VariantOption) => ({
          name: variantType,
          value: option.value || '',
          priceModifier: parseFloat(option.priceModifier?.toString() || '0') || 0,
          stock: parseFloat(option.stock?.toString() || '0') || 0,
          sku: option.sku || '',
          barcode: option.barcode || '',
          image: option.image || ''
        }));
      }
    });
    
    return cleaned;
  };

  // Variant management functions
  const addVariantType = () => {
    const typeName = prompt("Enter variant type name (e.g., Size, Color):");
    if (typeName && typeName.trim()) {
      const trimmedName = typeName.trim();
      if (formData.variants[trimmedName]) {
        toast.error("Variant type already exists");
        return;
      }
      setFormData({
        ...formData,
        variants: {
          ...formData.variants,
          [trimmedName]: []
        }
      });
    }
  };

  const removeVariantType = (typeName: string) => {
    if (confirm(`Remove variant type "${typeName}" and all its options?`)) {
      const newVariants = { ...formData.variants };
      delete newVariants[typeName];
      setFormData({
        ...formData,
        variants: newVariants
      });
    }
  };

  const addVariantOption = (typeName: string) => {
    const newOption = {
      name: typeName,
      value: "",
      priceModifier: 0,
      stock: 0,
      sku: "",
      barcode: "",
      image: ""
    };
    
    setFormData({
      ...formData,
      variants: {
        ...formData.variants,
        [typeName]: [...(formData.variants[typeName] || []), newOption]
      }
    });
  };

  const removeVariantOption = (typeName: string, index: number) => {
    if (confirm("Remove this variant option?")) {
      const newOptions = [...(formData.variants[typeName] || [])];
      newOptions.splice(index, 1);
      setFormData({
        ...formData,
        variants: {
          ...formData.variants,
          [typeName]: newOptions
        }
      });
    }
  };

  const updateVariantOption = (typeName: string, index: number, field: keyof VariantOption, value: string | number) => {
    const newOptions = [...(formData.variants[typeName] || [])];
    newOptions[index] = {
      ...newOptions[index],
      [field]: value
    };
    setFormData({
      ...formData,
      variants: {
        ...formData.variants,
        [typeName]: newOptions
      }
    });
  };

  const refreshProducts = () => {
    router.push(`/products?page=${page}`);
    router.refresh();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Validate required fields
      if (!formData.name || !formData.name.trim()) {
        toast.error("Product name is required");
        return;
      }
      if (!formData.description || formData.description.trim().length < 10) {
        toast.error("Description is required and must be at least 10 characters");
        return;
      }
      if (!formData.category) {
        toast.error("Category is required");
        return;
      }
      // Validate price
      if (formData.price === undefined || formData.price === null || formData.price < 0) {
        toast.error("Price is required and must be 0 or greater");
        return;
      }
      // Slug is auto-generated by backend if not provided
      
      // Filter out empty images - backend will use first image as main image
      const allImages = formData.images.filter((img) => img.trim() !== "");
      
      if (allImages.length === 0) {
        toast.error("At least one product image is required");
        return;
      }
      
      const productData = {
        ...formData,
        slug: formData.slug.trim() || undefined, // Only send if provided, backend will auto-generate
        oldPrice: formData.oldPrice ? parseFloat(formData.oldPrice) : undefined,
        price: parseFloat(formData.price.toString()),
        category: formData.category,
        images: allImages,
        stock: parseFloat(formData.stock.toString()) || 0,
        trackInventory: formData.trackInventory,
        lowStockThreshold: parseFloat(formData.lowStockThreshold.toString()) || 10,
        isActive: formData.isActive,
        featured: formData.featured,
        barcode: formData.barcode.trim() || undefined,
        tags: formData.tags.filter((tag) => tag.trim() !== ""),
        relatedProducts: formData.relatedProducts.filter((id) => id.trim() !== ""),
        variants: Object.keys(formData.variants).length > 0 ? convertVariantsToBackend(formData.variants) as unknown as Record<string, any[]> : undefined,
        description: formData.description.trim(), // Ensure description is trimmed
      };

      // Debug logging
      console.log("Product data being sent:", {
        name: productData.name,
        description: productData.description,
        descriptionLength: productData.description?.length,
        category: productData.category,
        price: productData.price,
        slug: productData.slug,
      });

      if (editingProduct) {
        await productsApi.update(
          editingProduct._id || editingProduct.id || "",
          productData as any, // Type assertion needed due to variant format conversion
        );
        toast.success("Product updated successfully!");
      } else {
        await productsApi.create(productData as any); // Type assertion needed due to variant format conversion
        toast.success("Product created successfully!");
      }
      setIsModalOpen(false);
      setEditingProduct(null);
      resetForm();
      refreshProducts();
    } catch (error: any) {
      console.error("Error saving product:", error);
      console.error("Error response:", error.response?.data);
      
      // Extract error message from various possible locations
      let errorMessage = "Failed to save product";
      
      if (error.response?.data) {
        const data = error.response.data;
        
        // Check for validation errors array (from Joi validation)
        if (data.errors && Array.isArray(data.errors) && data.errors.length > 0) {
          errorMessage = data.errors.map((e: any) => {
            const field = e.field || 'field';
            const msg = e.message || 'invalid';
            return `${field}: ${msg}`;
          }).join(', ');
        } 
        // Check for single error message
        else if (data.message) {
          errorMessage = data.message;
        } 
        // Check for error object
        else if (data.error) {
          errorMessage = typeof data.error === 'string' ? data.error : data.error.message || 'Validation error';
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    const categoryId =
      typeof product.category === "object"
        ? (product.category as any)._id || (product.category as any).id
        : product.category;
    
    // Format image URLs for display (they come as paths from backend, need full URLs for preview)
    const formatImageForDisplay = (imgPath: string | undefined): string => {
      if (!imgPath) return '';
      // If already a full URL, return as is
      if (imgPath.startsWith('http://') || imgPath.startsWith('https://')) {
        return imgPath;
      }
      // If it's a path, format it
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const BACKEND_BASE_URL = API_BASE_URL.replace('/api', '');
      return imgPath.startsWith('/') 
        ? `${BACKEND_BASE_URL}${imgPath}`
        : `${BACKEND_BASE_URL}/${imgPath}`;
    };
    
    // Helper to normalize image paths for comparison (remove domain, ensure leading slash)
    const normalizeImagePath = (imgPath: string | undefined): string => {
      if (!imgPath) return '';
      // Remove protocol and domain
      let normalized = imgPath.replace(/^https?:\/\/[^/]+/, '');
      // Ensure leading slash
      if (!normalized.startsWith('/')) {
        normalized = '/' + normalized;
      }
      return normalized;
    };
    
    // Combine main image with images array if main image exists and isn't in array
    // Normalize paths to avoid duplicates
    const allProductImages = [...(product.images || [])];
    const mainImagePath = normalizeImagePath(product.image);
    
    // Check if main image is already in the images array (using normalized paths)
    const mainImageInArray = mainImagePath && allProductImages.some(img => 
      normalizeImagePath(img) === mainImagePath
    );
    
    // Only add main image if it's not already in the array
    // Use the normalized path (without domain) for consistency
    if (mainImagePath && !mainImageInArray) {
      allProductImages.unshift(mainImagePath);
    }
    
    setFormData({
      name: product.name,
      slug: product.slug,
      price: product.price,
      oldPrice: product.oldPrice?.toString() || "",
      // Store the path (not full URL) for saving, but display will use full URL
      images: allProductImages.map(img => normalizeImagePath(img)),
      category: categoryId || "",
      description: product.description || "",
      shortDescription: product.shortDescription || "",
      stock: product.stock ?? 0,
      trackInventory: (product as any).trackInventory ?? true,
      lowStockThreshold: (product as any).lowStockThreshold ?? 10,
      sku: product.sku || "",
      isActive: product.isActive ?? true,
      featured: (product as any).featured ?? false,
      barcode: (product as any).barcode || "",
      tags: product.tags || [],
      relatedProducts: ((product as any).relatedProducts as any[])?.map((p: any) => 
        typeof p === 'string' ? p : ((p as any)._id || (p as any).id || '')
      ) || [],
      variants: convertVariantsFromBackend((product as any).variants),
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      await productsApi.delete(id);
      toast.success("Product deleted successfully!");
      refreshProducts();
    } catch (error: any) {
      console.error("Error deleting product:", error);
      toast.error(error.response?.data?.error || "Failed to delete product");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      slug: "",
      price: 0,
      oldPrice: "",
      images: [],
      category: "",
      description: "",
      shortDescription: "",
      stock: 0,
      trackInventory: true,
      lowStockThreshold: 10,
      isActive: true,
      featured: false,
      sku: "",
      barcode: "",
      tags: [],
      relatedProducts: [],
      variants: {},
    });
    setNewTag("");
  };

  const removeImage = (index: number) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index),
    });
  };

  const addTag = () => {
    if (newTag.trim()) {
      setFormData({ ...formData, tags: [...formData.tags, newTag.trim()] });
      setNewTag("");
    }
  };

  const removeTag = (index: number) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((_, i) => i !== index),
    });
  };

  const handleRelatedProductChange = (productId: string) => {
    if (!productId) return;
    
    const productIdStr = productId.trim();
    // Don't allow adding the current product being edited
    if (editingProduct && (productIdStr === editingProduct._id || productIdStr === editingProduct.id)) {
      toast.error("Cannot add the same product as related product");
      return;
    }
    
    // Check if already added
    if (formData.relatedProducts.includes(productIdStr)) {
      toast.error("Product already added");
      return;
    }
    
    setFormData({
      ...formData,
      relatedProducts: [...formData.relatedProducts, productIdStr],
    });
  };

  const removeRelatedProduct = (index: number) => {
    setFormData({
      ...formData,
      relatedProducts: formData.relatedProducts.filter((_, i) => i !== index),
    });
  };

  const getCategoryName = (
    categoryId: string | { _id: string; name: string },
  ) => {
    if (typeof categoryId === "object") return categoryId.name;
    const cat = categories.find(
      (c) => c._id === categoryId || c.id === categoryId,
    );
    return cat?.name || "Unknown";
  };

  // Format image URL for display
  const formatImageUrl = (imgPath: string | undefined): string => {
    if (!imgPath) return '';
    // If already a full URL, return as is
    if (imgPath.startsWith('http://') || imgPath.startsWith('https://')) {
      return imgPath;
    }
    // If it's a path, format it
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    const BACKEND_BASE_URL = API_BASE_URL.replace('/api', '');
    return imgPath.startsWith('/') 
      ? `${BACKEND_BASE_URL}${imgPath}`
      : `${BACKEND_BASE_URL}/${imgPath}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Products</h1>
        <button
          onClick={() => {
            setEditingProduct(null);
            resetForm();
            setIsModalOpen(true);
          }}
          className="bg-custom-blue text-white px-4 py-2 rounded-md hover:bg-custom-blue-light transition-colors"
        >
          Add Product
        </button>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-custom-blue">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Image
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Stock
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products && products.length > 0 ? (
              products.map((product) => (
                <tr key={product._id || product.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-12 w-12 object-cover rounded border border-gray-200"
                        onError={(e) => {
                          // Replace broken image with placeholder div
                          const target = e.target as HTMLImageElement;
                          const parent = target.parentElement;
                          if (parent) {
                            const placeholder = document.createElement('div');
                            placeholder.className = 'h-12 w-12 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-400 border border-gray-300';
                            placeholder.textContent = 'No Image';
                            parent.replaceChild(placeholder, target);
                          }
                        }}
                      />
                    ) : (
                      <div className="h-12 w-12 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-400 border border-gray-300">
                        No Image
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {product.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {getCategoryName(product.category)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${product.price}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        product.inStock
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {product.inStock ? "In Stock" : "Out of Stock"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEdit(product)}
                      className="text-custom-blue hover:text-custom-blue-light mr-4"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() =>
                        handleDelete(product._id || product.id || "")
                      }
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-4 text-center text-sm text-gray-500"
                >
                  No products found. Click &quot;Add Product&quot; to create your first
                  product.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center space-x-2">
          <button
            onClick={() => {
              const newPage = Math.max(1, page - 1);
              setPage(newPage);
              router.push(`/products?page=${newPage}`);
            }}
            disabled={page === 1}
            className="px-4 py-2 border rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-4 py-2">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => {
              const newPage = Math.min(totalPages, page + 1);
              setPage(newPage);
              router.push(`/products?page=${newPage}`);
            }}
            disabled={page === totalPages}
            className="px-4 py-2 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Product Modal - Keep the same modal code from before */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 !m-0">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                {editingProduct ? "Edit Product" : "Add Product"}
              </h2>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingProduct(null);
                  resetForm();
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Slug
                  </label>
                  <p className="text-xs text-gray-500 mb-2">
                    URL-friendly identifier (auto-generated from name if not provided)
                  </p>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData({ ...formData, slug: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Auto-generated if empty"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {Object.keys(formData.variants).length > 0 ? "Base Price *" : "Price *"}
                  </label>
                  {Object.keys(formData.variants).length > 0 && (
                    <p className="text-xs text-gray-500 mb-2">
                      Base price for all variants. Variant prices = Base Price + Price Modifier
                    </p>
                  )}
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        price: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Old Price
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.oldPrice}
                    onChange={(e) =>
                      setFormData({ ...formData, oldPrice: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat._id || cat.id} value={cat._id || cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Images *
                </label>
                <p className="text-xs text-gray-500 mb-2">
                  Upload product images. The first image will be used as the main product image.
                </p>
                <ImageUpload
                  multiple
                  onUpload={() => {}} // Required prop but not used when multiple is true
                  onMultipleUpload={(urls) => {
                    setFormData({
                      ...formData,
                      images: [...formData.images, ...urls],
                    });
                  }}
                />
                {formData.images.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 mb-2">
                      Image Previews:
                    </p>
                    <div className="grid grid-cols-4 gap-3">
                      {formData.images.map((img, idx) => {
                        const imageUrl = formatImageUrl(img);
                        
                        return (
                          <div key={idx} className="relative group">
                            <img
                              src={imageUrl}
                              alt={`Preview ${idx + 1}`}
                              className="w-full h-24 object-cover rounded border border-gray-300"
                              onError={(e) => {
                                // Fallback if image fails to load
                                const target = e.target as HTMLImageElement;
                                target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect width="100" height="100" fill="%23ddd"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999"%3ENo Image%3C/text%3E%3C/svg%3E';
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(idx)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Remove image"
                            >
                              ×
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Short Description
                </label>
                <textarea
                  value={formData.shortDescription}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      shortDescription: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description * (min 10 characters)
                </label>
                <p className="text-xs text-gray-500 mb-2">
                  Provide a detailed description of the product (at least 10 characters)
                </p>
                <textarea
                  required
                  minLength={10}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SKU
                  </label>
                  <p className="text-xs text-gray-500 mb-2">
                    Stock Keeping Unit (optional)
                  </p>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) =>
                      setFormData({ ...formData, sku: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Product SKU"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Barcode
                  </label>
                  <p className="text-xs text-gray-500 mb-2">
                    Product barcode (auto-generated if not provided)
                  </p>
                  <input
                    type="text"
                    value={formData.barcode}
                    onChange={(e) =>
                      setFormData({ ...formData, barcode: e.target.value.toUpperCase() })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Auto-generated if empty"
                  />
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Inventory Management</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Stock Quantity *
                    </label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={formData.stock}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          stock: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Low Stock Threshold
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.lowStockThreshold}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          lowStockThreshold: parseFloat(e.target.value) || 10,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.trackInventory}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          trackInventory: e.target.checked,
                        })
                      }
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Track Inventory</span>
                  </label>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Product Variants</h3>
                  <button
                    type="button"
                    onClick={addVariantType}
                    className="px-3 py-1 text-sm bg-custom-blue text-white rounded hover:bg-custom-blue-light"
                  >
                    + Add Variant Type
                  </button>
                </div>
                <p className="text-sm text-gray-500 mb-4">
                  Add variant types (e.g., Size, Color) and their options. Each option can have different prices and stock levels.
                </p>

                {Object.keys(formData.variants).length === 0 ? (
                  <p className="text-sm text-gray-400 italic">No variants added. Click &quot;Add Variant Type&quot; to start.</p>
                ) : (
                  <div className="space-y-6">
                    {Object.entries(formData.variants).map(([variantType, options]: [string, VariantOption[]]) => (
                      <div key={variantType} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="text-md font-semibold text-gray-800 capitalize">{variantType}</h4>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => addVariantOption(variantType)}
                              className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
                            >
                              + Add Option
                            </button>
                            <button
                              type="button"
                              onClick={() => removeVariantType(variantType)}
                              className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                            >
                              Remove Type
                            </button>
                          </div>
                        </div>

                        {options.length === 0 ? (
                          <p className="text-sm text-gray-400 italic">No options added for this variant type.</p>
                        ) : (
                          <div className="space-y-3">
                            {options.map((option: VariantOption, index: number) => (
                              <div key={index} className="bg-gray-50 p-3 rounded border border-gray-200">
                                <div className="grid grid-cols-2 gap-3 mb-3">
                                  <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                      Value * (e.g., Small, Red)
                                    </label>
                                    <input
                                      type="text"
                                      required
                                      value={option.value || ""}
                                      onChange={(e) => updateVariantOption(variantType, index, 'value', e.target.value)}
                                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
                                      placeholder="e.g., Small"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                      Price Modifier (Rs)
                                    </label>
                                    <input
                                      type="number"
                                      step="0.01"
                                      value={option.priceModifier || 0}
                                      onChange={(e) => updateVariantOption(variantType, index, 'priceModifier', parseFloat(e.target.value) || 0)}
                                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
                                      placeholder="0.00"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                      Price modifier: Rs {(formData.price || 0).toFixed(2)} + {option.priceModifier >= 0 ? '+' : ''}{option.priceModifier.toFixed(2)} = <strong>Rs {((formData.price || 0) + (option.priceModifier || 0)).toFixed(2)}</strong>
                                    </p>
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 mb-3">
                                  <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                      Stock Quantity
                                    </label>
                                    <input
                                      type="number"
                                      min="0"
                                      value={option.stock || 0}
                                      onChange={(e) => updateVariantOption(variantType, index, 'stock', parseFloat(e.target.value) || 0)}
                                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
                                      placeholder="0"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                      SKU (optional)
                                    </label>
                                    <input
                                      type="text"
                                      value={option.sku || ""}
                                      onChange={(e) => updateVariantOption(variantType, index, 'sku', e.target.value)}
                                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
                                      placeholder="Variant SKU"
                                    />
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 mb-3">
                                  <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                      Barcode (optional, auto-generated if empty)
                                    </label>
                                    <input
                                      type="text"
                                      value={option.barcode || ""}
                                      onChange={(e) => updateVariantOption(variantType, index, 'barcode', e.target.value.toUpperCase())}
                                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
                                      placeholder="Auto-generated"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                      Variant Image URL (optional)
                                    </label>
                                    <input
                                      type="text"
                                      value={option.image || ""}
                                      onChange={(e) => updateVariantOption(variantType, index, 'image', e.target.value)}
                                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
                                      placeholder="Image URL or path"
                                    />
                                  </div>
                                </div>

                                <div className="flex justify-end">
                                  <button
                                    type="button"
                                    onClick={() => removeVariantOption(variantType, index)}
                                    className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                                  >
                                    Remove Option
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t pt-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Product Status</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            isActive: e.target.checked,
                          })
                        }
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Active (visible to customers)</span>
                    </label>
                  </div>
                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.featured}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            featured: e.target.checked,
                          })
                        }
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Featured Product</span>
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Tag name"
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addTag();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(idx)}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Related Products
                </label>
                <p className="text-xs text-gray-500 mb-2">
                  Select products to link as related products
                </p>
                <div className="flex gap-2 mb-2">
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        handleRelatedProductChange(e.target.value);
                        e.target.value = ""; // Reset select
                      }
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                    defaultValue=""
                    disabled={loadingProducts}
                  >
                    <option value="">
                      {loadingProducts ? "Loading products..." : "Select a product to add..."}
                    </option>
                    {!loadingProducts && allProducts.length === 0 && (
                      <option value="" disabled>No products available</option>
                    )}
                    {!loadingProducts && allProducts
                      .filter((p) => {
                        const productId = p._id || p.id || "";
                        // Don't show current product or already added products
                        if (editingProduct && (productId === editingProduct._id || productId === editingProduct.id)) {
                          return false;
                        }
                        return !formData.relatedProducts.includes(productId);
                      })
                      .map((product) => (
                        <option key={product._id || product.id} value={product._id || product.id}>
                          {product.name} (Rs {product.price})
                        </option>
                      ))}
                  </select>
                </div>
                {formData.relatedProducts.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600 mb-2">Selected Related Products:</p>
                    <div className="flex flex-wrap gap-2">
                      {formData.relatedProducts.map((productId, idx) => {
                        const product = allProducts.find(
                          (p) => (p._id || p.id) === productId
                        );
                        return (
                          <span
                            key={idx}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800"
                          >
                            {product ? product.name : productId}
                            <button
                              type="button"
                              onClick={() => removeRelatedProduct(idx)}
                              className="ml-2 text-purple-600 hover:text-purple-800"
                            >
                              ✕
                            </button>
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingProduct(null);
                    resetForm();
                  }}
                  className="px-4 py-2 border rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-custom-blue text-white rounded hover:bg-custom-blue-light"
                >
                  {editingProduct ? "Update" : "Create"} Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
