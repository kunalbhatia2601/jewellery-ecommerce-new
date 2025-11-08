'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { 
    Package, 
    Loader2, 
    CheckCircle, 
    Clock,
    Truck,
    Box,
    XCircle,
    ChevronDown,
    ChevronUp,
    MapPin,
    Calendar,
    RotateCcw,
    ChevronRight,
    PackageCheck,
    PackageX,
    History,
    AlertCircle,
    ArrowLeft,
    CreditCard
} from 'lucide-react';
import ReturnRequestModal from '../components/ReturnRequestModal';
import ReturnTracker from '../components/ReturnTracker';

const statusConfig = {
    pending: { icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50', label: 'Pending' },
    confirmed: { icon: CheckCircle, color: 'text-blue-600', bg: 'bg-blue-50', label: 'Confirmed' },
    processing: { icon: Package, color: 'text-purple-600', bg: 'bg-purple-50', label: 'Processing' },
    shipped: { icon: Truck, color: 'text-indigo-600', bg: 'bg-indigo-50', label: 'Shipped' },
    delivered: { icon: Box, color: 'text-green-600', bg: 'bg-green-50', label: 'Delivered' },
    returned: { icon: RotateCcw, color: 'text-orange-600', bg: 'bg-orange-50', label: 'Returned' },
    cancelled: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', label: 'Cancelled' }
};

const returnStatusConfig = {
    requested: { color: 'text-yellow-600', bg: 'bg-yellow-50', label: 'Return Requested' },
    pickup_scheduled: { color: 'text-blue-600', bg: 'bg-blue-50', label: 'Pickup Scheduled' },
    in_transit: { color: 'text-indigo-600', bg: 'bg-indigo-50', label: 'In Transit' },
    returned_to_seller: { color: 'text-purple-600', bg: 'bg-purple-50', label: 'Returned to Seller' },
    completed: { color: 'text-green-600', bg: 'bg-green-50', label: 'Completed' },
    cancelled: { color: 'text-red-600', bg: 'bg-red-50', label: 'Cancelled' }
};

const tabs = [
    { id: 'pending', label: 'Pending', icon: Clock },
    { id: 'past', label: 'Past Orders', icon: History },
    { id: 'returns', label: 'Returns', icon: RotateCcw }
];

function OrdersContent() {
    const searchParams = useSearchParams();
    const [activeTab, setActiveTab] = useState('pending');
    const [orders, setOrders] = useState([]);
    const [returns, setReturns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedOrder, setExpandedOrder] = useState(null);
    const [expandedReturn, setExpandedReturn] = useState(null);
    const [showSuccess, setShowSuccess] = useState(false);
    const [orderNumber, setOrderNumber] = useState('');
    const [returnModalOpen, setReturnModalOpen] = useState(false);
    const [selectedOrderForReturn, setSelectedOrderForReturn] = useState(null);

    useEffect(() => {
        fetchData();
        
        if (searchParams.get('success') === 'true') {
            setShowSuccess(true);
            setOrderNumber(searchParams.get('orderNumber') || '');
            setTimeout(() => setShowSuccess(false), 5000);
        }
    }, [searchParams]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [ordersRes, returnsRes] = await Promise.all([
                fetch('/api/orders'),
                fetch('/api/returns')
            ]);
            
            const ordersData = await ordersRes.json();
            const returnsData = await returnsRes.json();
            
            if (ordersRes.ok) setOrders(ordersData.orders);
            if (returnsRes.ok) setReturns(returnsData.returns || []);
        } catch (err) {
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const handleReturnRequest = (order) => {
        setSelectedOrderForReturn(order);
        setReturnModalOpen(true);
    };

    const handleReturnSuccess = () => {
        fetchData();
        setReturnModalOpen(false);
        setSelectedOrderForReturn(null);
    };

    // Filter orders
    const pendingOrders = orders.filter(o => 
        ['pending', 'confirmed', 'processing', 'shipped'].includes(o.status)
    );
    const pastOrders = orders.filter(o => 
        ['delivered', 'cancelled', 'returned'].includes(o.status)
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-10 h-10 animate-spin text-amber-600 mx-auto mb-3" />
                    <p className="text-gray-600 text-sm">Loading your orders...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50 pb-20 sm:pb-0">
            {/* Modern Header with Glass Effect */}
            <div className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50 sticky top-0 z-40 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 sm:gap-4">
                            <div className="p-2 sm:p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl sm:rounded-2xl shadow-lg">
                                <Package className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                                    My Orders
                                </h1>
                                <p className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1 hidden sm:block">
                                    Track and manage your orders & returns
                                </p>
                            </div>
                        </div>
                        <Link
                            href="/products"
                            className="hidden sm:flex items-center gap-2 px-4 py-2.5 text-sm bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 font-medium"
                        >
                            <PackageCheck className="w-4 h-4" />
                            Continue Shopping
                        </Link>
                    </div>

                    {/* Success Message */}
                    <AnimatePresence>
                        {showSuccess && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-4 p-3 sm:p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200/50 rounded-2xl flex items-center gap-3 backdrop-blur-sm"
                            >
                                <div className="p-2 bg-green-100 rounded-xl">
                                    <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-green-900 text-sm sm:text-base">
                                        Order Placed Successfully!
                                    </h3>
                                    <p className="text-xs sm:text-sm text-green-700 truncate">
                                        Order Number: {orderNumber}
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Premium Tabs with Pill Design */}
            <div className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50 sticky top-[72px] sm:top-[96px] z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
                    <div className="flex gap-2 sm:gap-3 overflow-x-auto hide-scrollbar">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            const count = tab.id === 'pending' ? pendingOrders.length :
                                        tab.id === 'past' ? pastOrders.length :
                                        returns.length;
                            
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`
                                        flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 font-medium text-sm sm:text-base
                                        whitespace-nowrap transition-all duration-300 relative rounded-xl sm:rounded-2xl
                                        ${isActive 
                                            ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg shadow-amber-500/30' 
                                            : 'bg-gray-100/80 text-gray-600 hover:bg-gray-200/80 hover:text-gray-900'
                                        }
                                    `}
                                >
                                    <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                                    <span className="hidden sm:inline">{tab.label}</span>
                                    <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                                    {count > 0 && (
                                        <span className={`
                                            px-2 py-0.5 rounded-full text-xs font-bold
                                            ${isActive 
                                                ? 'bg-white/20 text-white' 
                                                : 'bg-gray-200 text-gray-700'
                                            }
                                        `}>
                                            {count}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                <AnimatePresence mode="wait">
                    {activeTab === 'pending' && (
                        <OrdersList
                            key="pending"
                            orders={pendingOrders}
                            expandedOrder={expandedOrder}
                            setExpandedOrder={setExpandedOrder}
                            formatDate={formatDate}
                            handleReturnRequest={handleReturnRequest}
                            emptyMessage="No pending orders"
                            emptyDescription="Your active orders will appear here"
                        />
                    )}
                    
                    {activeTab === 'past' && (
                        <OrdersList
                            key="past"
                            orders={pastOrders}
                            expandedOrder={expandedOrder}
                            setExpandedOrder={setExpandedOrder}
                            formatDate={formatDate}
                            handleReturnRequest={handleReturnRequest}
                            emptyMessage="No past orders"
                            emptyDescription="Your completed orders will appear here"
                        />
                    )}
                    
                    {activeTab === 'returns' && (
                        <ReturnsList
                            key="returns"
                            returns={returns}
                            expandedReturn={expandedReturn}
                            setExpandedReturn={setExpandedReturn}
                            formatDate={formatDate}
                        />
                    )}
                </AnimatePresence>
            </div>

            {/* Return Request Modal */}
            {selectedOrderForReturn && (
                <ReturnRequestModal
                    isOpen={returnModalOpen}
                    onClose={() => {
                        setReturnModalOpen(false);
                        setSelectedOrderForReturn(null);
                    }}
                    order={selectedOrderForReturn}
                    onSuccess={handleReturnSuccess}
                />
            )}
        </div>
    );
}

function OrdersList({ orders, expandedOrder, setExpandedOrder, formatDate, handleReturnRequest, emptyMessage, emptyDescription }) {
    if (orders.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/50 p-8 sm:p-12 text-center"
            >
                <div className="p-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl w-fit mx-auto mb-4">
                    <PackageX className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">{emptyMessage}</h2>
                <p className="text-gray-600 text-sm sm:text-base mb-6">{emptyDescription}</p>
                <Link
                    href="/products"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 text-sm sm:text-base font-medium"
                >
                    <PackageCheck className="w-5 h-5" />
                    Start Shopping
                </Link>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4 sm:space-y-6"
        >
            {orders.map((order, index) => {
                const StatusIcon = statusConfig[order.status].icon;
                const isExpanded = expandedOrder === order._id;

                return (
                    <motion.div
                        key={order._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`
                            bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-lg border border-gray-200/50 
                            overflow-hidden hover:shadow-xl transition-all duration-300
                            ${isExpanded ? 'ring-2 ring-amber-500/20' : ''}
                        `}
                    >
                        {/* Premium Order Header */}
                        <div 
                            className="p-4 sm:p-6 cursor-pointer hover:bg-gradient-to-r hover:from-amber-50/50 hover:to-orange-50/50 transition-all duration-300"
                            onClick={() => setExpandedOrder(isExpanded ? null : order._id)}
                        >
                            <div className="flex items-start justify-between gap-3 sm:gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3">
                                        <h3 className="text-base sm:text-xl font-bold text-gray-900 flex items-center gap-2">
                                            <span className="truncate">{order.orderNumber}</span>
                                        </h3>
                                        <span className={`
                                            inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm font-semibold w-fit
                                            shadow-sm
                                            ${statusConfig[order.status].bg} ${statusConfig[order.status].color}
                                        `}>
                                            <StatusIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                            {statusConfig[order.status].label}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-600">
                                        <span className="flex items-center gap-1.5 font-medium">
                                            <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600" />
                                            {formatDate(order.createdAt)}
                                        </span>
                                        <span className="hidden sm:inline text-gray-300">•</span>
                                        <span className="flex items-center gap-1.5 font-medium">
                                            <Box className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600" />
                                            {order.items.length} item(s)
                                        </span>
                                    </div>
                                </div>
                                <div className="text-right flex-shrink-0">
                                    <p className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                                        ₹{order.totalAmount.toLocaleString()}
                                    </p>
                                    <motion.div
                                        animate={{ rotate: isExpanded ? 180 : 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="mt-1 sm:mt-2 ml-auto w-fit"
                                    >
                                        <ChevronDown className="w-5 h-5 text-gray-400" />
                                    </motion.div>
                                </div>
                            </div>
                        </div>

                        {/* Premium Expanded Details */}
                        <AnimatePresence>
                            {isExpanded && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="border-t border-gray-200/50 bg-gradient-to-b from-gray-50/50 to-white/50"
                                >
                                    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                                        {/* Payment & Tracking Info - Premium Cards */}
                                        <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                                            <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl sm:rounded-2xl border border-amber-200/50 shadow-sm">
                                                <h4 className="font-bold text-gray-900 mb-3 text-sm sm:text-base flex items-center gap-2">
                                                    <div className="p-1.5 bg-amber-100 rounded-lg">
                                                        <CreditCard className="w-4 h-4 text-amber-600" />
                                                    </div>
                                                    Payment Details
                                                </h4>
                                                <p className="text-xs sm:text-sm text-gray-700 mb-2">
                                                    Method: <span className="font-semibold">
                                                        {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
                                                    </span>
                                                </p>
                                                <p className="text-xs sm:text-sm text-gray-700">
                                                    Status: <span className={`font-semibold ${
                                                        order.paymentStatus === 'paid' ? 'text-green-600' :
                                                        order.paymentStatus === 'failed' ? 'text-red-600' :
                                                        'text-yellow-600'
                                                    }`}>
                                                        {order.paymentStatus?.charAt(0).toUpperCase() + order.paymentStatus?.slice(1)}
                                                    </span>
                                                </p>
                                            </div>
                                            {order.awbCode && (
                                                <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl sm:rounded-2xl border border-blue-200/50 shadow-sm">
                                                    <h4 className="font-bold text-gray-900 mb-3 text-sm sm:text-base flex items-center gap-2">
                                                        <div className="p-1.5 bg-blue-100 rounded-lg">
                                                            <Truck className="w-4 h-4 text-blue-600" />
                                                        </div>
                                                        Tracking Info
                                                    </h4>
                                                    <p className="text-xs sm:text-sm text-gray-700 mb-2">
                                                        AWB: <span className="font-semibold">{order.awbCode}</span>
                                                    </p>
                                                    <p className="text-xs sm:text-sm text-gray-700 mb-2">
                                                        Courier: <span className="font-semibold">{order.courierName}</span>
                                                    </p>
                                                    {order.trackingUrl && (
                                                        <a 
                                                            href={order.trackingUrl} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-blue-600 hover:text-blue-700 font-semibold hover:underline"
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            Track Order
                                                            <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                                        </a>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {/* Items - Premium Grid */}
                                        <div>
                                            <h4 className="font-bold text-gray-900 mb-4 text-sm sm:text-base">Order Items</h4>
                                            <div className="space-y-3">
                                                {order.items.map((item, idx) => (
                                                    <div key={idx} className="group flex gap-3 sm:gap-4 p-3 sm:p-4 bg-white rounded-xl sm:rounded-2xl border border-gray-200/50 hover:border-amber-300/50 hover:shadow-md transition-all duration-300">
                                                        <div className="relative flex-shrink-0">
                                                            <img
                                                                src={item.image || '/placeholder.png'}
                                                                alt={item.name}
                                                                className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-xl ring-2 ring-gray-100 group-hover:ring-amber-200 transition-all duration-300"
                                                            />
                                                            <div className="absolute -top-1 -right-1 w-6 h-6 bg-amber-600 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg">
                                                                {item.quantity}
                                                            </div>
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h5 className="font-semibold text-gray-900 text-sm sm:text-base line-clamp-2 mb-1">
                                                                {item.name}
                                                            </h5>
                                                            {item.selectedVariant && (
                                                                <p className="text-xs sm:text-sm text-gray-600 mb-1">
                                                                    <span className="font-medium">{item.selectedVariant.name}:</span> {item.selectedVariant.value}
                                                                </p>
                                                            )}
                                                            <p className="text-xs sm:text-sm text-gray-500">
                                                                ₹{item.price.toLocaleString()} × {item.quantity}
                                                            </p>
                                                        </div>
                                                        <div className="text-right flex-shrink-0 self-center">
                                                            <p className="font-bold text-gray-900 text-sm sm:text-base">
                                                                ₹{(item.price * item.quantity).toLocaleString()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Shipping Address - Premium Card */}
                                        <div>
                                            <h4 className="font-bold text-gray-900 mb-3 text-sm sm:text-base flex items-center gap-2">
                                                <div className="p-1.5 bg-amber-100 rounded-lg">
                                                    <MapPin className="w-4 h-4 text-amber-600" />
                                                </div>
                                                Shipping Address
                                            </h4>
                                            <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl sm:rounded-2xl border border-amber-200/50">
                                                <p className="font-bold text-gray-900 text-sm sm:text-base mb-1">{order.shippingAddress.fullName}</p>
                                                <p className="text-xs sm:text-sm text-gray-600 mb-2">{order.shippingAddress.phone}</p>
                                                <div className="text-xs sm:text-sm text-gray-700 space-y-0.5">
                                                    <p>
                                                        {order.shippingAddress.addressLine1}
                                                        {order.shippingAddress.addressLine2 && `, ${order.shippingAddress.addressLine2}`}
                                                    </p>
                                                    <p className="font-medium">
                                                        {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Notes */}
                                        {order.notes && (
                                            <div>
                                                <h4 className="font-bold text-gray-900 mb-2 text-sm sm:text-base">Order Notes</h4>
                                                <p className="text-xs sm:text-sm text-gray-700 p-3 sm:p-4 bg-white rounded-xl border border-gray-200/50">
                                                    {order.notes}
                                                </p>
                                            </div>
                                        )}

                                        {/* Return Button - Premium Style */}
                                        {order.status === 'delivered' && order.status !== 'returned' && (
                                            <div className="pt-4 border-t border-gray-200/50">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleReturnRequest(order);
                                                    }}
                                                    className="w-full sm:w-auto px-5 sm:px-7 py-3 sm:py-3.5 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl hover:shadow-lg hover:shadow-orange-500/30 transition-all duration-300 font-semibold flex items-center justify-center gap-2.5 text-sm sm:text-base group"
                                                >
                                                    <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5 group-hover:rotate-180 transition-transform duration-500" />
                                                    Request Return
                                                </button>
                                                <p className="text-xs text-gray-500 mt-2.5 text-center sm:text-left">
                                                    You can request a return for this delivered order
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                );
            })}
        </motion.div>
    );
}

function ReturnsList({ returns, expandedReturn, setExpandedReturn, formatDate }) {
    if (returns.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/50 p-8 sm:p-12 text-center"
            >
                <div className="p-4 bg-gradient-to-br from-orange-100 to-red-100 rounded-2xl w-fit mx-auto mb-4">
                    <RotateCcw className="w-12 h-12 sm:w-16 sm:h-16 text-orange-600" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">No Returns Yet</h2>
                <p className="text-gray-600 text-sm sm:text-base mb-6">You haven&apos;t requested any returns</p>
                <button
                    onClick={() => window.location.href = '#'}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 text-sm sm:text-base font-medium"
                >
                    View Orders
                </button>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
        >
            {returns.map((returnItem, index) => {
                const isExpanded = expandedReturn === returnItem._id;
                
                return (
                    <motion.div
                        key={returnItem._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="space-y-4"
                    >
                        {/* Return Tracker - Premium Card */}
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-lg border border-gray-200/50 overflow-hidden">
                            <ReturnTracker returnData={returnItem} />
                        </div>

                        {/* Return Details - Premium Card */}
                        <div className={`
                            bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-lg border border-gray-200/50 
                            overflow-hidden hover:shadow-xl transition-all duration-300
                            ${isExpanded ? 'ring-2 ring-orange-500/20' : ''}
                        `}>
                            <div 
                                className="p-4 sm:p-6 cursor-pointer hover:bg-gradient-to-r hover:from-orange-50/50 hover:to-red-50/50 transition-all duration-300"
                                onClick={() => setExpandedReturn(isExpanded ? null : returnItem._id)}
                            >
                                <div className="flex items-start justify-between gap-3 sm:gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3">
                                            <h3 className="text-base sm:text-xl font-bold text-gray-900 flex items-center gap-2">
                                                <span className="truncate">{returnItem.returnNumber}</span>
                                            </h3>
                                            <span className={`
                                                inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm font-semibold w-fit
                                                shadow-sm
                                                ${returnStatusConfig[returnItem.status].bg} ${returnStatusConfig[returnItem.status].color}
                                            `}>
                                                {returnStatusConfig[returnItem.status].label}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-600">
                                            <span className="flex items-center gap-1.5 font-medium">
                                                <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-600" />
                                                {formatDate(returnItem.createdAt)}
                                            </span>
                                            <span className="hidden sm:inline text-gray-300">•</span>
                                            <span className="flex items-center gap-1.5 font-medium">
                                                <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-600" />
                                                {returnItem.items?.length || 0} item(s)
                                            </span>
                                        </div>
                                    </div>
                                    <motion.div
                                        animate={{ rotate: isExpanded ? 180 : 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="flex-shrink-0"
                                    >
                                        <ChevronDown className="w-5 h-5 text-gray-400" />
                                    </motion.div>
                                </div>
                            </div>

                            {/* Expanded Return Details */}
                            <AnimatePresence>
                                {isExpanded && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="border-t border-gray-200/50 bg-gradient-to-b from-gray-50/50 to-white/50"
                                    >
                                        <div className="p-4 sm:p-6 space-y-4">
                                            {/* Return Items */}
                                            <div>
                                                <h4 className="font-bold text-gray-900 mb-3 text-sm sm:text-base">Return Items</h4>
                                                <div className="space-y-3">
                                                    {returnItem.items?.map((item, idx) => (
                                                        <div key={idx} className="p-3 sm:p-4 bg-white rounded-xl border border-gray-200/50 shadow-sm">
                                                            <h5 className="font-semibold text-gray-900 text-sm sm:text-base mb-2">{item.name}</h5>
                                                            <div className="flex flex-wrap gap-3 text-xs sm:text-sm text-gray-600">
                                                                <span className="inline-flex items-center gap-1">
                                                                    <Box className="w-3.5 h-3.5" />
                                                                    Qty: <span className="font-medium">{item.quantity}</span>
                                                                </span>
                                                                {item.reason && (
                                                                    <span className="inline-flex items-center gap-1">
                                                                        <AlertCircle className="w-3.5 h-3.5" />
                                                                        <span className="capitalize font-medium">{item.reason.replace('_', ' ')}</span>
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Tracking Info */}
                                            {returnItem.shiprocketReturnAwb && (
                                                <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl sm:rounded-2xl border border-blue-200/50 shadow-sm">
                                                    <h4 className="font-bold text-gray-900 mb-3 text-sm sm:text-base flex items-center gap-2">
                                                        <div className="p-1.5 bg-blue-100 rounded-lg">
                                                            <Truck className="w-4 h-4 text-blue-600" />
                                                        </div>
                                                        Return Tracking
                                                    </h4>
                                                    <p className="text-xs sm:text-sm text-gray-700 mb-2">
                                                        AWB: <span className="font-semibold">{returnItem.shiprocketReturnAwb}</span>
                                                    </p>
                                                    {returnItem.courierName && (
                                                        <p className="text-xs sm:text-sm text-gray-700">
                                                            Courier: <span className="font-semibold">{returnItem.courierName}</span>
                                                        </p>
                                                    )}
                                                </div>
                                            )}

                                            {/* Bank Details */}
                                            {returnItem.refundDetails && (
                                                <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl sm:rounded-2xl border border-green-200/50 shadow-sm">
                                                    <h4 className="font-bold text-gray-900 mb-3 text-sm sm:text-base flex items-center gap-2">
                                                        <div className="p-1.5 bg-green-100 rounded-lg">
                                                            <CreditCard className="w-4 h-4 text-green-600" />
                                                        </div>
                                                        Refund Bank Details
                                                    </h4>
                                                    <div className="space-y-1.5 text-xs sm:text-sm text-gray-700">
                                                        <p>
                                                            <span className="font-medium">Name:</span> {returnItem.refundDetails.accountName}
                                                        </p>
                                                        <p>
                                                            <span className="font-medium">Bank:</span> {returnItem.refundDetails.bankName}
                                                        </p>
                                                        <p>
                                                            <span className="font-medium">A/c:</span> {returnItem.refundDetails.accountNumber}
                                                        </p>
                                                        <p>
                                                            <span className="font-medium">IFSC:</span> {returnItem.refundDetails.ifsc}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Notes */}
                                            {returnItem.notes && (
                                                <div>
                                                    <h4 className="font-bold text-gray-900 mb-2 text-sm sm:text-base">Your Notes</h4>
                                                    <p className="text-xs sm:text-sm text-gray-700 p-3 sm:p-4 bg-white rounded-xl border border-gray-200/50">
                                                        {returnItem.notes}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                );
            })}
        </motion.div>
    );
}

export default function OrdersPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50 py-12 px-4">
                <div className="flex items-center justify-center min-h-[60vh]">
                    <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
                </div>
            </div>
        }>
            <OrdersContent />
        </Suspense>
    );
}
