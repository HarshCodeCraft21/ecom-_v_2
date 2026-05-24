import React, { useEffect, useState } from 'react';
import { 
  getCoupons, 
  createCoupon, 
  updateCoupon, 
  deleteCoupon 
} from '../../services/coupon.service.js';
import { Modal } from '../../components/Modal.jsx';
import { Plus, Edit2, Trash2, Loader2, Tag, Calendar, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

export const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal Control States
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form States
  const [formData, setFormData] = useState({
    code: '',
    discountType: 'percentage',
    discountValue: '',
    minCartAmount: '',
    expiryDate: '',
    isActive: true
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitLoading, setSubmitLoading] = useState(false);

  const fetchCouponsList = async () => {
    setLoading(true);
    try {
      const response = await getCoupons();
      if (response && response.success) {
        setCoupons(response.data || []);
      }
    } catch (err) {
      toast.error('Failed to fetch coupons.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCouponsList();
  }, []);

  const handleOpenCreateModal = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormData({
      code: '',
      discountType: 'percentage',
      discountValue: '',
      minCartAmount: '0',
      expiryDate: '',
      isActive: true
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const handleOpenEditModal = (coupon) => {
    setIsEditing(true);
    setEditingId(coupon._id);
    
    // Format date string for HTML input (YYYY-MM-DD)
    let formattedDate = '';
    if (coupon.expiryDate) {
      formattedDate = new Date(coupon.expiryDate).toISOString().split('T')[0];
    }

    setFormData({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue.toString(),
      minCartAmount: coupon.minCartAmount.toString(),
      expiryDate: formattedDate,
      isActive: coupon.isActive
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.code.trim()) errors.code = 'Coupon code is required';
    if (formData.code.trim().length > 20) errors.code = 'Coupon code must be under 20 characters';
    
    if (!formData.discountValue || Number(formData.discountValue) < 0) {
      errors.discountValue = 'Discount value cannot be negative';
    }
    if (formData.discountType === 'percentage' && Number(formData.discountValue) > 100) {
      errors.discountValue = 'Percentage discount cannot exceed 100%';
    }

    if (formData.minCartAmount && Number(formData.minCartAmount) < 0) {
      errors.minCartAmount = 'Minimum order amount cannot be negative';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitLoading(true);
    const dataToSend = {
      code: formData.code.trim().toUpperCase(),
      discountType: formData.discountType,
      discountValue: Number(formData.discountValue),
      minCartAmount: formData.minCartAmount ? Number(formData.minCartAmount) : 0,
      expiryDate: formData.expiryDate || null,
      isActive: formData.isActive
    };

    try {
      let response;
      if (isEditing) {
        response = await updateCoupon(editingId, dataToSend);
      } else {
        response = await createCoupon(dataToSend);
      }

      if (response && response.success) {
        toast.success(isEditing ? 'Coupon updated successfully' : 'Coupon created successfully');
        setModalOpen(false);
        fetchCouponsList();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Operation failed';
      toast.error(msg);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (coupon) => {
    if (window.confirm(`Are you sure you want to delete coupon "${coupon.code}"?`)) {
      try {
        const response = await deleteCoupon(coupon._id);
        if (response && response.success) {
          toast.success('Coupon deleted successfully');
          fetchCouponsList();
        }
      } catch (err) {
        toast.error('Failed to delete coupon.');
      }
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold uppercase tracking-wider text-lux-dark">Coupons Registry</h2>
          <p className="text-xs text-lux-dark/50">Create, edit, or remove storefront promotional discount codes.</p>
        </div>
        
        <button
          onClick={handleOpenCreateModal}
          className="flex items-center gap-2 rounded-2xl bg-lux-dark px-4 py-2.5 font-sans text-xs font-bold uppercase tracking-wider text-white hover:bg-lux-dark-hover shadow-md transition-all duration-300"
        >
          <Plus className="h-4 w-4" />
          Add Coupon
        </button>
      </div>

      {/* Coupons Table */}
      {loading ? (
        <div className="space-y-4 animate-pulse">
          <div className="h-10 w-full bg-lux-100 rounded-xl" />
          <div className="h-40 w-full bg-lux-100/50 rounded-xl" />
        </div>
      ) : coupons.length > 0 ? (
        <div className="overflow-hidden rounded-2xl border border-white/60 bg-white/40 shadow-soft backdrop-blur-md">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-lux-100 bg-white/30 text-[10px] font-bold uppercase tracking-wider text-lux-dark/45">
                  <th className="px-6 py-4">Coupon Code</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Discount Value</th>
                  <th className="px-6 py-4">Min. Spend required</th>
                  <th className="px-6 py-4">Expiry Date</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-lux-100/40 text-xs font-semibold text-lux-dark">
                {coupons.map((coupon) => (
                  <tr key={coupon._id} className="hover:bg-white/20 transition-all">
                    <td className="px-6 py-4 font-mono font-bold tracking-wider text-lux-primary">
                      <div className="flex items-center gap-2">
                        <Tag className="h-3.5 w-3.5" />
                        {coupon.code}
                      </div>
                    </td>
                    <td className="px-6 py-4 uppercase text-[10px] tracking-wider text-lux-dark/65">
                      {coupon.discountType}
                    </td>
                    <td className="px-6 py-4 font-mono font-bold">
                      {coupon.discountType === 'percentage' 
                        ? `${coupon.discountValue}%` 
                        : `₹${coupon.discountValue.toFixed(2)}`
                      }
                    </td>
                    <td className="px-6 py-4 font-mono">
                      ₹{coupon.minCartAmount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-lux-dark/60 font-sans">
                      {coupon.expiryDate ? (
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-lux-dark/35" />
                          {new Date(coupon.expiryDate).toLocaleDateString()}
                        </div>
                      ) : (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-lux-dark/30">Never Expires</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                        coupon.isActive 
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                          : 'bg-red-50 text-red-500 border border-red-100'
                      }`}>
                        {coupon.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenEditModal(coupon)}
                          className="flex h-8 w-8 items-center justify-center rounded-xl bg-lux-100 text-lux-dark hover:bg-lux-primary hover:text-white transition-all shadow-sm"
                          title="Edit Coupon"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(coupon)}
                          className="flex h-8 w-8 items-center justify-center rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm"
                          title="Delete Coupon"
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
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-lux-200 bg-white/20 p-12 text-center">
          <p className="font-sans text-xs text-lux-dark/50">No coupon codes registered in database yet.</p>
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={isEditing ? 'Edit Coupon Code' : 'Create Promotional Coupon'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Coupon Code */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-lux-dark/60">Coupon Code</label>
            <input
              type="text"
              name="code"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              placeholder="e.g. WELCOME10"
              disabled={isEditing} // Prevent code modification on update
              className={`w-full rounded-xl border bg-white px-3.5 py-2.5 font-mono text-xs focus:outline-none uppercase ${
                formErrors.code ? 'border-red-400 focus:border-red-500' : 'border-lux-200 focus:border-lux-primary'
              }`}
            />
            {formErrors.code && <span className="text-[10px] font-bold text-red-500">{formErrors.code}</span>}
          </div>

          {/* Discount Configuration */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-lux-dark/60">Discount Type</label>
              <select
                name="discountType"
                value={formData.discountType}
                onChange={(e) => setFormData({ ...formData, discountType: e.target.value, discountValue: '' })}
                className="w-full rounded-xl border border-lux-200 bg-white px-3 py-2.5 font-sans text-xs focus:outline-none focus:border-lux-primary"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="flat">Flat Amount (₹)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-lux-dark/60">
                {formData.discountType === 'percentage' ? 'Discount Percentage' : 'Discount Amount (₹)'}
              </label>
              <input
                type="number"
                name="discountValue"
                value={formData.discountValue}
                onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                placeholder={formData.discountType === 'percentage' ? 'e.g. 10' : 'e.g. 250'}
                className={`w-full rounded-xl border bg-white px-3 py-2.5 font-sans text-xs focus:outline-none ${
                  formErrors.discountValue ? 'border-red-400 focus:border-red-500' : 'border-lux-200 focus:border-lux-primary'
                }`}
              />
              {formErrors.discountValue && <span className="text-[10px] font-bold text-red-500">{formErrors.discountValue}</span>}
            </div>
          </div>

          {/* Rules / Min Order & Expiry */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-lux-dark/60">Min. Spend Limit (₹)</label>
              <input
                type="number"
                name="minCartAmount"
                value={formData.minCartAmount}
                onChange={(e) => setFormData({ ...formData, minCartAmount: e.target.value })}
                placeholder="e.g. 1000"
                className={`w-full rounded-xl border bg-white px-3 py-2.5 font-sans text-xs focus:outline-none ${
                  formErrors.minCartAmount ? 'border-red-400 focus:border-red-500' : 'border-lux-200 focus:border-lux-primary'
                }`}
              />
              {formErrors.minCartAmount && <span className="text-[10px] font-bold text-red-500">{formErrors.minCartAmount}</span>}
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-lux-dark/60">Expiry Date</label>
              <input
                type="date"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                className="w-full rounded-xl border border-lux-200 bg-white px-3 py-2.5 font-sans text-xs focus:outline-none focus:border-lux-primary"
              />
            </div>
          </div>

          {/* Active / Inactive Status */}
          <div className="flex items-center gap-3 pt-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="h-4 w-4 rounded border-lux-200 text-lux-dark focus:ring-lux-primary"
            />
            <label htmlFor="isActive" className="text-[11px] font-bold uppercase tracking-wider text-lux-dark/70 cursor-pointer">
              Active (Make this coupon ready for customer checkouts)
            </label>
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
              'Save Coupon changes'
            ) : (
              'Create Coupon Code'
            )}
          </button>

        </form>
      </Modal>

    </div>
  );
};
