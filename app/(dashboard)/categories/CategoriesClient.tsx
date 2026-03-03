"use client";

import { useState } from "react";
import { categoriesApi, Category } from "../../../lib/api/categories.api";
import { uploadApi } from "../../../lib/api/upload.api";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import ImageUpload from "../../../components/ImageUpload";

interface CategoriesClientProps {
  initialCategories: Category[];
}

export default function CategoriesClient({ initialCategories }: CategoriesClientProps) {
  const router = useRouter();
  const categories = initialCategories; // Use props directly, will update on refresh
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({ name: "", slug: "", parentId: "", image: "" });

  const refreshCategories = () => {
    router.refresh();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await categoriesApi.update(editingCategory._id || editingCategory.id || "", formData);
        toast.success("Category updated successfully!");
      } else {
        await categoriesApi.create({
          ...formData,
          parentId: formData.parentId || undefined,
        });
        toast.success("Category created successfully!");
      }
      setIsModalOpen(false);
      setEditingCategory(null);
      setFormData({ name: "", slug: "", parentId: "", image: "" });
      refreshCategories();
    } catch (error: any) {
      console.error("Error saving category:", error);
      toast.error(error.response?.data?.error || "Failed to save category");
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      parentId: category.parentId?.toString() || "",
      image: category.image || "",
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return;
    try {
      await categoriesApi.delete(id);
      toast.success("Category deleted successfully!");
      refreshCategories();
    } catch (error: any) {
      console.error("Error deleting category:", error);
      toast.error(error.response?.data?.error || "Failed to delete category");
    }
  };

  const getParentName = (parentId?: string | null) => {
    if (!parentId) return "None";
    const parent = categories.find((c) => c._id === parentId || c.id === parentId);
    return parent?.name || "Unknown";
  };

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

  const handleImageUpload = async (url: string) => {
    setFormData({ ...formData, image: url });
  };

  const handleCustomImageUpload = async (file: File) => {
    const response = await uploadApi.uploadCategoryImage(file);
    return {
      url: response.url,
      publicId: response.publicId || response.url,
    };
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Categories</h1>
        <button
          onClick={() => {
            setEditingCategory(null);
            setFormData({ name: "", slug: "", parentId: "", image: "" });
            setIsModalOpen(true);
          }}
          className="bg-custom-blue text-white px-4 py-2 rounded-md hover:bg-custom-blue-light transition-colors"
        >
          Add Category
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
                Slug
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Parent
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {categories
              .sort((a, b) => {
                // Sort: top-level categories first, then by name
                if (!a.parentId && b.parentId) return -1;
                if (a.parentId && !b.parentId) return 1;
                return a.name.localeCompare(b.name);
              })
              .map((category) => (
                <tr 
                  key={category._id || category.id}
                  className={category.parentId ? 'bg-gray-50' : ''}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    {category.image ? (
                      <img
                        src={formatImageUrl(category.image)}
                        alt={category.name}
                        className="h-12 w-12 object-cover rounded border border-gray-300"
                      />
                    ) : (
                      <div className="h-12 w-12 bg-gray-200 rounded border border-gray-300 flex items-center justify-center text-gray-400 text-xs">
                        No Image
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {category.parentId && <span className="text-gray-400 mr-2">└─</span>}
                    {category.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {category.slug}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {getParentName(category.parentId)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEdit(category)}
                      className="text-custom-blue hover:text-custom-blue-light mr-4"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(category._id || category.id || "")}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">
              {editingCategory ? "Edit Category" : "Add Category"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Slug
                </label>
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Parent Category
                </label>
                <select
                  value={formData.parentId}
                  onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">None (Top Level)</option>
                  {categories
                    .filter((c) => {
                      // Exclude the category being edited
                      if (c._id === editingCategory?._id || c.id === editingCategory?.id) {
                        return false;
                      }
                      // Only show top-level categories (categories without parents) as parent options
                      // This maintains the 2-level hierarchy limit
                      return !c.parentId;
                    })
                    .map((cat) => (
                      <option key={cat._id || cat.id} value={cat._id || cat.id}>
                        {cat.name}
                      </option>
                    ))}
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  Only top-level categories can be selected as parents (max 2 levels deep)
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category Image
                </label>
                <ImageUpload
                  onUpload={handleImageUpload}
                  currentImage={formData.image}
                  label="Upload Category Image"
                  customUploadFn={handleCustomImageUpload}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Upload a single image for this category (JPG, PNG, GIF, WebP - Max 5MB)
                </p>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-custom-blue text-white rounded"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

