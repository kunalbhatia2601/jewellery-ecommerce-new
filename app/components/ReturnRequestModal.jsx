'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Package, CreditCard, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function ReturnRequestModal({ isOpen, onClose, order, onSuccess }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [existingReturnNumber, setExistingReturnNumber] = useState('');
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState({
        reason: '',
        accountName: '',
        accountNumber: '',
        ifsc: '',
        bankName: '',
        notes: ''
    });

    const handleClose = () => {
        setError('');
        setExistingReturnNumber('');
        setSuccess(false);
        onClose();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setExistingReturnNumber('');

        try {
            const res = await fetch('/api/returns', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    orderId: order._id,
                    items: order.items.map(item => ({
                        productId: item.productId,
                        name: item.name,
                        quantity: item.quantity,
                        reason: formData.reason
                    })),
                    reason: formData.reason,
                    refundDetails: {
                        accountName: formData.accountName,
                        accountNumber: formData.accountNumber,
                        ifsc: formData.ifsc,
                        bankName: formData.bankName
                    },
                    notes: formData.notes
                })
            });

            const data = await res.json();

            if (res.ok) {
                setSuccess(true);
                setTimeout(() => {
                    onSuccess && onSuccess();
                    handleClose();
                }, 2000);
            } else {
                // Handle duplicate return case
                if (data.returnNumber) {
                    setExistingReturnNumber(data.returnNumber);
                    setError(data.error || 'A return request already exists for this order');
                } else {
                    setError(data.error || 'Failed to submit return request');
                }
            }
        } catch (err) {
            console.error('Return request error:', err);
            setError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
                <motion.div
                    initial={{ opacity: 0, y: 100, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 100, scale: 0.95 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] sm:max-h-[90vh] overflow-y-auto mb-0 sm:mb-0"
                    style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
                >
                    {/* Header */}
                    <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Package className="w-6 h-6 text-amber-600" />
                            <h2 className="text-2xl font-bold text-gray-900">Return Request</h2>
                        </div>
                        <button
                            onClick={handleClose}
                            className="p-2 hover:bg-gray-100 rounded-full transition"
                        >
                            <X className="w-6 h-6 text-gray-500" />
                        </button>
                    </div>

                    {success ? (
                        <div className="p-8 text-center">
                            <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Return Request Submitted!</h3>
                            <p className="text-gray-600">We'll process your return shortly. You'll receive updates via email.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            {/* Order Info */}
                            <div className="bg-amber-50 rounded-lg p-4">
                                <h3 className="font-semibold text-gray-900 mb-2">Order: {order.orderNumber}</h3>
                                <p className="text-sm text-gray-700">
                                    Total Amount: <span className="font-semibold">₹{order.totalAmount.toLocaleString()}</span>
                                </p>
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                    <div className="flex items-start gap-3">
                                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                        <div className="flex-1">
                                            <p className="text-sm text-red-700 font-medium">{error}</p>
                                            {existingReturnNumber && (
                                                <div className="mt-3">
                                                    <a 
                                                        href="/returns" 
                                                        className="inline-flex items-center gap-2 text-sm text-amber-700 hover:text-amber-800 font-medium underline"
                                                        onClick={handleClose}
                                                    >
                                                        View existing return ({existingReturnNumber})
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                        </svg>
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Return Reason */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-2">
                                    Reason for Return *
                                </label>
                                <select
                                    required
                                    value={formData.reason}
                                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                >
                                    <option value="">Select a reason</option>
                                    <option value="defective">Defective/Damaged Product</option>
                                    <option value="wrong_item">Wrong Item Received</option>
                                    <option value="not_as_described">Not as Described</option>
                                    <option value="quality_issues">Quality Issues</option>
                                    <option value="changed_mind">Changed Mind</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            {/* Bank Details Section */}
                            <div className="border-t border-gray-200 pt-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <CreditCard className="w-5 h-5 text-amber-600" />
                                    <h3 className="font-semibold text-gray-900">Refund Bank Details</h3>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Account Holder Name *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.accountName}
                                            onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                            placeholder="John Doe"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Bank Name *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.bankName}
                                            onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                            placeholder="State Bank of India"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Account Number *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.accountNumber}
                                            onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                            placeholder="1234567890"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            IFSC Code *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.ifsc}
                                            onChange={(e) => setFormData({ ...formData, ifsc: e.target.value.toUpperCase() })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                            placeholder="SBIN0001234"
                                            maxLength={11}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Additional Notes */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Additional Notes (Optional)
                                </label>
                                <textarea
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    rows={3}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
                                    placeholder="Any additional information about the return..."
                                />
                            </div>

                            {/* Submit Button */}
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Submitting...' : 'Submit Return Request'}
                                </button>
                            </div>
                        </form>
                    )}
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
