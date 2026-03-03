"use client";

import { useState, useEffect } from "react";
import { headerLinksApi, HeaderLink } from "../../../lib/api/headerLinks.api";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FaArrowUp, FaArrowDown } from "react-icons/fa";
import { VALID_INTERNAL_ROUTES, validateHeaderLinkUrl } from "../../../lib/config/routes";

interface HeaderLinksClientProps {
  initialLinks: HeaderLink[];
}

export default function HeaderLinksClient({
  initialLinks,
}: HeaderLinksClientProps) {
  const router = useRouter();
  const [links, setLinks] = useState<HeaderLink[]>(initialLinks);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<HeaderLink | null>(null);
  const [formData, setFormData] = useState({ label: "", href: "", openInNewTab: false });
  const [urlError, setUrlError] = useState("");
  const [isUrlExternal, setIsUrlExternal] = useState(false);
  const [reorderingId, setReorderingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setLinks(initialLinks);
  }, [initialLinks]);

  const fetchLinks = async () => {
    try {
      setIsLoading(true);
      const fetchedLinks = await headerLinksApi.getAll();
      setLinks(fetchedLinks);
    } catch (error) {
      console.error('Error fetching links:', error);
      toast.error("Failed to refresh links");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ label: "", href: "", openInNewTab: false });
    setEditingLink(null);
    setUrlError("");
    setIsUrlExternal(false);
  };

  const handleUrlChange = (url: string) => {
    setFormData({ ...formData, href: url });
    setUrlError("");
    
    // Check if it's an external URL
    const isExternal = url.startsWith('http://') || url.startsWith('https://');
    setIsUrlExternal(isExternal);
    
    // If external, automatically enable openInNewTab
    if (isExternal) {
      setFormData({ ...formData, href: url, openInNewTab: true });
    }
    
    // Validate URL
    const validation = validateHeaderLinkUrl(url, isExternal || formData.openInNewTab);
    if (!validation.valid && url.trim() !== '') {
      setUrlError(validation.error || "Invalid URL");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate URL before submitting
    const validation = validateHeaderLinkUrl(
      formData.href, 
      isUrlExternal || formData.openInNewTab
    );
    
    if (!validation.valid) {
      setUrlError(validation.error || "Invalid URL");
      toast.error(validation.error || "Please fix the URL before saving");
      return;
    }
    
    try {
      const submitData = {
        label: formData.label,
        href: formData.href,
        openInNewTab: isUrlExternal || formData.openInNewTab
      };
      
      if (editingLink) {
        await headerLinksApi.update(editingLink.id!, submitData);
        toast.success("Header link updated!");
      } else {
        await headerLinksApi.create(submitData);
        toast.success("Header link created!");
      }
      setIsModalOpen(false);
      resetForm();
      await fetchLinks();
      router.refresh();
    } catch (error: any) {
      console.error('Error saving link:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.errors?.[0]?.message || "Failed to save";
      toast.error(errorMessage);
      if (error.response?.data?.errors?.[0]?.field === 'url') {
        setUrlError(error.response.data.errors[0].message);
      }
    }
  };

  const handleEdit = (link: HeaderLink) => {
    setEditingLink(link);
    const isExternal = link.href.startsWith('http://') || link.href.startsWith('https://');
    setFormData({ 
      label: link.label, 
      href: link.href,
      openInNewTab: link.openInNewTab || isExternal
    });
    setIsUrlExternal(isExternal);
    setUrlError("");
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this header link?")) return;
    try {
      await headerLinksApi.delete(id);
      toast.success("Header link removed!");
      await fetchLinks();
      router.refresh();
    } catch (error: any) {
      console.error('Error deleting link:', error);
      toast.error(error.response?.data?.message || "Failed to delete");
    }
  };

  const handleReorder = async (id: string, direction: "up" | "down") => {
    setReorderingId(id);
    try {
      await headerLinksApi.reorder(id, direction);
      await fetchLinks();
      router.refresh();
    } catch (error: any) {
      console.error('Error reordering:', error);
      toast.error(error.response?.data?.message || "Failed to reorder");
    } finally {
      setReorderingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">
          Header Links Management
        </h1>
        <button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="bg-custom-blue text-white px-4 py-2 rounded-md hover:bg-custom-blue-light transition-colors"
        >
          Add Link
        </button>
      </div>

      <p className="text-sm text-gray-500">
        Reorder links with the up/down arrows. Changes apply to the storefront
        header.
      </p>

      {isLoading && (
        <div className="text-center py-4 text-gray-500">Loading...</div>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-custom-blue">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider w-12">
                Order
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Label
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                URL
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {links.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-6 py-4 text-center text-sm text-gray-500"
                >
                  No header links. Add one to get started.
                </td>
              </tr>
            ) : (
              links.map((link, index) => (
                <tr key={link.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleReorder(link.id!, "up")}
                        disabled={index === 0 || reorderingId === link.id || isLoading}
                        className="p-1 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed text-gray-600"
                        title="Move up"
                      >
                        <FaArrowUp className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleReorder(link.id!, "down")}
                        disabled={
                          index === links.length - 1 || reorderingId === link.id || isLoading
                        }
                        className="p-1 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed text-gray-600"
                        title="Move down"
                      >
                        <FaArrowDown className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                    {link.label}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {link.href}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEdit(link)}
                      className="text-custom-blue hover:text-custom-blue-light mr-4"
                      disabled={isLoading}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(link.id!)}
                      className="text-red-600 hover:text-red-900"
                      disabled={isLoading}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 !m-0">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">
              {editingLink ? "Edit Header Link" : "Add Header Link"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Label *
                </label>
                <input
                  type="text"
                  required
                  value={formData.label}
                  onChange={(e) =>
                    setFormData({ ...formData, label: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="e.g. Home"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL *
                </label>
                <div>
                  <select
                    value={formData.href.startsWith('http') ? '' : formData.href}
                    onChange={(e) => {
                      if (e.target.value) {
                        handleUrlChange(e.target.value);
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md mb-2"
                  >
                    <option value="">Select a route or enter custom URL</option>
                    {VALID_INTERNAL_ROUTES.map((route) => (
                      <option key={route.value} value={route.value}>
                        {route.label} ({route.value})
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    required
                    value={formData.href}
                    onChange={(e) => handleUrlChange(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md ${
                      urlError ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="e.g. /products or https://example.com"
                  />
                  {urlError && (
                    <p className="text-red-500 text-sm mt-1">{urlError}</p>
                  )}
                  {isUrlExternal && (
                    <p className="text-blue-500 text-sm mt-1">
                      External URLs will automatically open in a new tab
                    </p>
                  )}
                  <p className="text-gray-500 text-xs mt-1">
                    Valid patterns: /product/[id], /orders/[id]
                  </p>
                </div>
              </div>
              {!isUrlExternal && (
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.openInNewTab}
                      onChange={(e) =>
                        setFormData({ ...formData, openInNewTab: e.target.checked })
                      }
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">
                      Open in new tab
                    </span>
                  </label>
                </div>
              )}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                  className="px-4 py-2 border rounded hover:bg-gray-50"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-custom-blue text-white rounded hover:bg-custom-blue-light disabled:opacity-50"
                  disabled={isLoading}
                >
                  {editingLink ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
