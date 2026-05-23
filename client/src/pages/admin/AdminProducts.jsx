import React, { useEffect, useState } from 'react';
import { useProducts } from '../../hooks/useProducts.js';
import { useCategories } from '../../hooks/useCategories.js';
import { Modal } from '../../components/Modal.jsx';
import { DashboardTableSkeleton } from '../../components/Skeleton.jsx';
import { Plus, Edit2, Trash2, Upload, Loader2, Search, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'react-hot-toast';

export const AdminProducts = () => {
  const { products, pagination, loading, error, fetchProducts, addProduct, editProduct, removeProduct } = useProducts();
  const { categories, fetchCategories } = useCategories();

  // Modal Control States
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // Table filters/search
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState('latest');

  // Form States
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    discountedPrice: '',
    category: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [existingImage, setExistingImage] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    fetchProducts({ page, limit: 6, search, sort });
    fetchCategories();
  }, [fetchProducts, fetchCategories, page, search, sort]);

  const handleOpenCreateModal = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormData({
      title: '',
      description: '',
      price: '',
      discountedPrice: '',
      category: categories[0]?._id || ''
    });
    setImageFile(null);
    setImagePreview('');
    setExistingImage('');
    setFormErrors({});
    setModalOpen(true);
  };

  const handleOpenEditModal = (product) => {
    setIsEditing(true);
    setEditingId(product._id);
    setFormData({
      title: product.title,
      description: product.description,
      price: product.price,
      discountedPrice: product.discountedPrice || '',
      category: product.category?._id || ''
    });
    setImageFile(null);
    setImagePreview('');
    setExistingImage(product.image);
    setFormErrors({});
    setModalOpen(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.title.trim()) errors.title = 'Title is required';
    if (!formData.description.trim()) errors.description = 'Description is required';
    if (!formData.price || Number(formData.price) <= 0) {
      errors.price = 'Price must be greater than 0';
    }
    if (formData.discountedPrice && Number(formData.discountedPrice) >= Number(formData.price)) {
      errors.discountedPrice = 'Discounted price must be strictly less than the original price';
    }
    if (formData.discountedPrice && Number(formData.discountedPrice) < 0) {
      errors.discountedPrice = 'Discounted price cannot be negative';
    }
    if (!formData.category) errors.category = 'Category is required';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitLoading(true);
    
    // Create multipart FormData
    const data = new FormData();
    data.append('title', formData.title.trim());
    data.append('description', formData.description.trim());
    data.append('price', Number(formData.price));
    data.append('discountedPrice', formData.discountedPrice ? Number(formData.discountedPrice) : 0);
    data.append('category', formData.category);
    if (imageFile) {
      data.append('image', imageFile);
    }

    let response;
    if (isEditing) {
      response = await editProduct(editingId, data);
    } else {
      response = await addProduct(data);
    }

    setSubmitLoading(false);

    if (response.success) {
      toast.success(isEditing ? 'Product updated successfully' : 'Product created successfully');
      setModalOpen(false);
      fetchProducts({ page, limit: 6, search, sort });
    } else {
      toast.error(response.error || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      const response = await removeProduct(id);
      if (response.success) {
        toast.success('Product deleted successfully');
        // Refresh products list
        fetchProducts({ page, limit: 6, search, sort });
      } else {
        toast.error(response.error || 'Delete failed');
      }
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold uppercase tracking-wider text-lux-dark">Products Catalog</h2>
          <p className="text-xs text-lux-dark/50">Add, edit, or remove catalog items.</p>
        </div>
        
        <button
          onClick={handleOpenCreateModal}
          className="flex items-center gap-2 rounded-2xl bg-lux-dark px-4 py-2.5 font-sans text-xs font-bold uppercase tracking-wider text-white hover:bg-lux-dark-hover shadow-md transition-all duration-300"
        >
          <Plus className="h-4 w-4" />
          Add Product
        </button>
      </div>

      {/* Filters bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center rounded-2xl border border-white/60 bg-white/40 p-4 shadow-soft">
        
        {/* Search */}
        <div className="relative flex-1 w-full">
          <input
            type="text"
            placeholder="Search catalog..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-full border border-lux-200 bg-white px-4 py-2 pl-10 font-sans text-xs text-lux-dark focus:outline-none"
          />
          <Search className="absolute left-3.5 top-2.5 h-3.5 w-3.5 text-lux-dark/45" />
        </div>

        {/* Sort */}
        <div className="relative w-full sm:w-48">
          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value);
              setPage(1);
            }}
            className="w-full appearance-none rounded-full border border-lux-200 bg-white px-4 py-2 pr-10 font-sans text-xs text-lux-dark focus:outline-none"
          >
            <option value="latest">Sort: Latest</option>
            <option value="oldest">Sort: Oldest</option>
            <option value="priceAsc">Sort: Price ↑</option>
            <option value="priceDesc">Sort: Price ↓</option>
          </select>
          <ArrowUpDown className="pointer-events-none absolute right-4 top-2.5 h-3.5 w-3.5 text-lux-dark/40" />
        </div>
      </div>

      {/* Products Table */}
      {loading ? (
        <DashboardTableSkeleton />
      ) : products.length > 0 ? (
        <div className="overflow-hidden rounded-2xl border border-white/60 bg-white/40 shadow-soft backdrop-blur-md">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-lux-100 bg-white/30 text-[10px] font-bold uppercase tracking-wider text-lux-dark/45">
                  <th className="px-6 py-4">Image</th>
                  <th className="px-6 py-4">Title</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Original Price</th>
                  <th className="px-6 py-4">Discount Price</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-lux-100/40 text-xs font-semibold text-lux-dark">
                {products.map((prod) => (
                  <tr key={prod._id} className="hover:bg-white/20 transition-all">
                    <td className="px-6 py-4">
                      <img src={prod.image} className="h-10 w-10 rounded-xl object-cover bg-lux-50 shadow-sm" />
                    </td>
                    <td className="px-6 py-4 truncate max-w-[200px]">{prod.title}</td>
                    <td className="px-6 py-4 text-lux-dark/60">{prod.category?.name || 'Unassigned'}</td>
                    <td className="px-6 py-4">${prod.price.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      {prod.discountedPrice > 0 ? (
                        <span className="text-emerald-600 font-bold">${prod.discountedPrice.toFixed(2)}</span>
                      ) : (
                        <span className="text-lux-dark/40">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenEditModal(prod)}
                          className="flex h-8 w-8 items-center justify-center rounded-xl bg-lux-100 text-lux-dark hover:bg-lux-primary hover:text-white transition-all shadow-sm"
                          title="Edit Product"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(prod._id)}
                          className="flex h-8 w-8 items-center justify-center rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm"
                          title="Delete Product"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-lux-100 bg-white/20 px-6 py-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-lux-dark/50">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  disabled={pagination.currentPage === 1}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-lux-200 bg-white text-lux-dark disabled:opacity-40 disabled:cursor-not-allowed hover:bg-lux-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setPage((prev) => Math.min(pagination.totalPages, prev + 1))}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-lux-200 bg-white text-lux-dark disabled:opacity-40 disabled:cursor-not-allowed hover:bg-lux-50"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-lux-200 bg-white/20 p-12 text-center">
          <p className="font-sans text-sm text-lux-dark/50">No products match your current filters.</p>
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={isEditing ? 'Edit Product Details' : 'Create Product Entry'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Title */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-lux-dark/60">Product Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className={`w-full rounded-xl border bg-white px-3 py-2.5 font-sans text-xs focus:outline-none ${
                formErrors.title ? 'border-red-400 focus:border-red-500' : 'border-lux-200 focus:border-lux-primary'
              }`}
            />
            {formErrors.title && <span className="text-[10px] font-bold text-red-500">{formErrors.title}</span>}
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-lux-dark/60">Description</label>
            <textarea
              name="description"
              rows="3"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className={`w-full rounded-xl border bg-white px-3 py-2.5 font-sans text-xs focus:outline-none ${
                formErrors.description ? 'border-red-400 focus:border-red-500' : 'border-lux-200 focus:border-lux-primary'
              }`}
            />
            {formErrors.description && <span className="text-[10px] font-bold text-red-500">{formErrors.description}</span>}
          </div>

          {/* Prices Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-lux-dark/60">Original Price ($)</label>
              <input
                type="number"
                name="price"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className={`w-full rounded-xl border bg-white px-3 py-2.5 font-sans text-xs focus:outline-none ${
                  formErrors.price ? 'border-red-400 focus:border-red-500' : 'border-lux-200 focus:border-lux-primary'
                }`}
              />
              {formErrors.price && <span className="text-[10px] font-bold text-red-500">{formErrors.price}</span>}
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-lux-dark/60">Discounted Price ($)</label>
              <input
                type="number"
                name="discountedPrice"
                step="0.01"
                value={formData.discountedPrice}
                onChange={(e) => setFormData({ ...formData, discountedPrice: e.target.value })}
                className={`w-full rounded-xl border bg-white px-3 py-2.5 font-sans text-xs focus:outline-none ${
                  formErrors.discountedPrice ? 'border-red-400 focus:border-red-500' : 'border-lux-200 focus:border-lux-primary'
                }`}
              />
              {formErrors.discountedPrice && <span className="text-[10px] font-bold text-red-500">{formErrors.discountedPrice}</span>}
            </div>
          </div>

          {/* Category Select */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-lux-dark/60">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className={`w-full rounded-xl border bg-white px-3 py-2.5 font-sans text-xs focus:outline-none ${
                formErrors.category ? 'border-red-400 focus:border-red-500' : 'border-lux-200 focus:border-lux-primary'
              }`}
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
            {formErrors.category && <span className="text-[10px] font-bold text-red-500">{formErrors.category}</span>}
          </div>

          {/* Image Upload Input */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-lux-dark/60">Product Image</label>
            <div className="flex items-center gap-4">
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-lux-200 rounded-xl cursor-pointer p-4 hover:bg-lux-50/50 w-32 transition-colors">
                <Upload className="h-6 w-6 text-lux-400" />
                <span className="text-[9px] font-bold uppercase tracking-wide text-lux-dark/50 mt-1">Upload</span>
                <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              </label>

              {/* Image previews */}
              {imagePreview ? (
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-lux-dark/45 uppercase">New Preview</span>
                  <img src={imagePreview} className="h-16 w-16 rounded-xl object-cover border border-lux-200" />
                </div>
              ) : existingImage ? (
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-lux-dark/45 uppercase">Cloudinary Image</span>
                  <img src={existingImage} className="h-16 w-16 rounded-xl object-cover border border-lux-200" />
                </div>
              ) : null}
            </div>
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            disabled={submitLoading}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-lux-dark py-3 font-sans text-xs font-bold uppercase tracking-wider text-white hover:bg-lux-dark-hover transition-colors disabled:opacity-50"
          >
            {submitLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isEditing ? (
              'Save Product'
            ) : (
              'Create Product'
            )}
          </button>

        </form>
      </Modal>

    </div>
  );
};
