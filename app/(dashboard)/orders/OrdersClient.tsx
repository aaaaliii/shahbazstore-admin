"use client";

import { useState, useEffect } from "react";
import { ordersApi, Order } from "../../../lib/api/orders.api";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

interface OrdersClientProps {
  initialOrders: Order[];
  initialPagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  initialStatus: string;
}

// Helper function to get valid next statuses based on current status
const getValidNextStatuses = (currentStatus: Order['status']): Order['status'][] => {
  const validTransitions: Record<Order['status'], Order['status'][]> = {
    'pending': ['confirmed', 'cancelled'],
    'confirmed': ['shipped', 'cancelled'],
    'shipped': ['delivered', 'cancelled'],
    'delivered': [], // Cannot transition from delivered
    'cancelled': [] // Cannot transition from cancelled
  };
  
  return validTransitions[currentStatus] || [];
};

export default function OrdersClient({
  initialOrders,
  initialPagination,
  initialStatus,
}: OrdersClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [page, setPage] = useState(initialPagination.page);
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Sync orders with props when they change (e.g., after router.refresh())
  useEffect(() => {
    setOrders(initialOrders);
  }, [initialOrders]);

  const refreshOrders = () => {
    const params = new URLSearchParams();
    if (page > 1) params.append("page", page.toString());
    if (statusFilter) params.append("status", statusFilter);
    router.push(`/orders?${params.toString()}`);
    router.refresh();
  };

  const handleStatusUpdate = async (
    orderId: string,
    newStatus: Order["status"],
  ) => {
    try {
      await ordersApi.updateStatus(orderId, newStatus);
      
      // Update the order in the local state immediately
      setOrders(prevOrders => 
        prevOrders.map(order => {
          const orderIdMatch = order._id === orderId || order.id === orderId;
          if (orderIdMatch) {
            return { ...order, status: newStatus };
          }
          return order;
        })
      );
      
      // Update selected order if it's the one being updated
      if (selectedOrder?._id === orderId || selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
      
      toast.success("Order status updated successfully!");
      
      // Refresh in the background to ensure data consistency
      refreshOrders();
    } catch (error: any) {
      console.error("Error updating order status:", error);
      
      // Extract error message properly
      let errorMessage = "Failed to update order status";
      if (error.response?.data) {
        // Check for message first (preferred)
        if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } 
        // If error is a string, use it
        else if (typeof error.response.data.error === 'string') {
          errorMessage = error.response.data.error;
        }
        // If error is an object, try to get its message
        else if (error.response.data.error?.message) {
          errorMessage = error.response.data.error.message;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    }
  };

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
    setPage(1);
    const params = new URLSearchParams();
    if (status) params.append("status", status);
    router.push(`/orders?${params.toString()}`);
  };

  const formatCurrency = (amount: number) => {
    return `Rs ${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Orders</h1>
        <select
          value={statusFilter}
          onChange={(e) => handleStatusFilterChange(e.target.value)}
          className="px-4 py-2 border rounded"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-custom-blue">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Order ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Items
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Total
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.map((order) => (
              <tr key={order._id || order.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {(order._id || order.id)?.toString().substring(0, 8)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {order.customerName}
                  </div>
                  <div className="text-sm text-gray-500">
                    {order.customerEmail}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {order.items.length} item(s)
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatCurrency(order.total)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                      order.status,
                    )}`}
                  >
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {order.createdAt
                    ? new Date(order.createdAt).toLocaleDateString()
                    : "-"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="text-custom-blue hover:text-custom-blue-light"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {initialPagination.pages > 1 && (
        <div className="flex justify-center space-x-2">
          <button
            onClick={() => {
              const newPage = Math.max(1, page - 1);
              setPage(newPage);
              const params = new URLSearchParams();
              if (newPage > 1) params.append("page", newPage.toString());
              if (statusFilter) params.append("status", statusFilter);
              router.push(`/orders?${params.toString()}`);
            }}
            disabled={page === 1}
            className="px-4 py-2 border rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-4 py-2">
            Page {page} of {initialPagination.pages}
          </span>
          <button
            onClick={() => {
              const newPage = Math.min(initialPagination.pages, page + 1);
              setPage(newPage);
              const params = new URLSearchParams();
              if (newPage > 1) params.append("page", newPage.toString());
              if (statusFilter) params.append("status", statusFilter);
              router.push(`/orders?${params.toString()}`);
            }}
            disabled={page === initialPagination.pages}
            className="px-4 py-2 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 !m-0">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Order Details</h2>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Order Information</h3>
                <p>Order ID: {(selectedOrder._id || selectedOrder.id)?.toString().substring(0, 8)}</p>
                <p>Status: <span className={`px-2 py-1 rounded text-xs ${getStatusColor(selectedOrder.status)}`}>{selectedOrder.status}</span></p>
                <p>Date: {selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleDateString() : '-'}</p>
                {selectedOrder.discountCode && (
                  <div className="mt-2 p-2 bg-gray-50 rounded">
                    <p className="font-medium">Discount Code Applied:</p>
                    <p>Code: <strong>{selectedOrder.discountCode.code}</strong></p>
                    <p>Type: {selectedOrder.discountCode.type === 'percentage' ? 'Percentage' : 'Fixed Amount'}</p>
                    <p>Value: {selectedOrder.discountCode.type === 'percentage' 
                      ? `${selectedOrder.discountCode.value}%` 
                      : `Rs ${selectedOrder.discountCode.value}`}</p>
                    {selectedOrder.discountAmount && selectedOrder.discountAmount > 0 && (
                      <p className="text-green-600 font-medium">
                        Discount Applied: -{formatCurrency(selectedOrder.discountAmount)}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div>
                <h3 className="font-semibold mb-2">Billing Address</h3>
                {(() => {
                  // Use billingAddress if available and has address fields, otherwise fall back to user address
                  const billingAddr = selectedOrder.billingAddress;
                  const user = selectedOrder.user;
                  const userAddress = user?.address;
                  
                  // Check if billingAddress has address fields, if not use user address
                  const hasBillingAddress = billingAddr && (billingAddr.street || billingAddr.city);
                  const displayAddress = hasBillingAddress ? billingAddr : (userAddress ? {
                    firstName: user?.name?.split(' ')[0] || '',
                    lastName: user?.name?.split(' ').slice(1).join(' ') || '',
                    street: userAddress.street || '',
                    city: userAddress.city || '',
                    state: userAddress.state || '',
                    zipCode: userAddress.zipCode || '',
                    country: userAddress.country || '',
                    phone: user?.phone || '',
                    email: user?.email || '',
                  } : null);
                  
                  if (displayAddress) {
                    return (
                      <>
                        {(displayAddress.firstName || displayAddress.lastName) ? (
                          <p className="font-medium">
                            {displayAddress.firstName} {displayAddress.lastName}
                          </p>
                        ) : (
                          <p className="font-medium">{selectedOrder.customerName || user?.name}</p>
                        )}
                        {displayAddress.street && (
                          <p>
                            {displayAddress.street}
                            {displayAddress.city && `, ${displayAddress.city}`}
                          </p>
                        )}
                        {(displayAddress.state || displayAddress.zipCode) && (
                          <p>
                            {displayAddress.state} {displayAddress.zipCode}
                          </p>
                        )}
                        {displayAddress.country && (
                          <p>{displayAddress.country}</p>
                        )}
                        {displayAddress.phone && (
                          <p className="mt-1">
                            <strong>Phone:</strong> {displayAddress.phone}
                          </p>
                        )}
                        {displayAddress.email && (
                          <p>
                            <strong>Email:</strong> {displayAddress.email}
                          </p>
                        )}
                      </>
                    );
                  } else {
                    // Fallback to customer info if no address available
                    return (
                      <>
                        <p>Name: {selectedOrder.customerName}</p>
                        <p>Email: {selectedOrder.customerEmail}</p>
                        {selectedOrder.customerPhone && (
                          <p>Phone: {selectedOrder.customerPhone}</p>
                        )}
                      </>
                    );
                  }
                })()}
              </div>

              <div>
                <h3 className="font-semibold mb-2">Items</h3>
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Product</th>
                      <th className="text-right py-2">Quantity</th>
                      <th className="text-right py-2">Price</th>
                      <th className="text-right py-2">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.items.map((item, idx) => (
                      <tr key={idx} className="border-b">
                        <td className="py-2">{item.productName}</td>
                        <td className="text-right py-2">{item.quantity}</td>
                        <td className="text-right py-2">
                          {formatCurrency(item.price)}
                        </td>
                        <td className="text-right py-2">
                          {formatCurrency(item.price * item.quantity)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    {selectedOrder.subtotal && selectedOrder.subtotal !== selectedOrder.total && (
                      <tr>
                        <td colSpan={3} className="text-right py-2">
                          Subtotal:
                        </td>
                        <td className="text-right py-2">
                          {formatCurrency(selectedOrder.subtotal)}
                        </td>
                      </tr>
                    )}
                    {selectedOrder.discountCode && selectedOrder.discountAmount && selectedOrder.discountAmount > 0 && (
                      <>
                        <tr>
                          <td colSpan={3} className="text-right py-2">
                            Discount Code:
                          </td>
                          <td className="text-right py-2">
                            <span className="font-medium">{selectedOrder.discountCode.code}</span>
                            {selectedOrder.discountCode.type && (
                              <span className="text-sm text-gray-500 ml-2">
                                ({selectedOrder.discountCode.type === 'percentage' 
                                  ? `${selectedOrder.discountCode.value}%` 
                                  : `Rs ${selectedOrder.discountCode.value}`})
                              </span>
                            )}
                          </td>
                        </tr>
                        <tr>
                          <td colSpan={3} className="text-right py-2">
                            Discount Amount:
                          </td>
                          <td className="text-right py-2 text-green-600">
                            -{formatCurrency(selectedOrder.discountAmount)}
                          </td>
                        </tr>
                      </>
                    )}
                    {selectedOrder.deliveryCharges !== undefined && selectedOrder.deliveryCharges > 0 && (
                      <tr>
                        <td colSpan={3} className="text-right py-2">
                          Delivery Charges:
                        </td>
                        <td className="text-right py-2">
                          {formatCurrency(selectedOrder.deliveryCharges)}
                        </td>
                      </tr>
                    )}
                    <tr>
                      <td colSpan={3} className="text-right font-semibold py-2">
                        Total:
                      </td>
                      <td className="text-right font-semibold py-2">
                        {formatCurrency(selectedOrder.total || selectedOrder.totalAmount)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Shipping Address</h3>
                {(selectedOrder.shippingAddress.firstName || selectedOrder.shippingAddress.lastName) && (
                  <p className="font-medium">
                    {selectedOrder.shippingAddress.firstName} {selectedOrder.shippingAddress.lastName}
                  </p>
                )}
                <p>
                  {selectedOrder.shippingAddress.street},{" "}
                  {selectedOrder.shippingAddress.city}
                </p>
                <p>
                  {selectedOrder.shippingAddress.state}{" "}
                  {selectedOrder.shippingAddress.zipCode}
                </p>
                <p>{selectedOrder.shippingAddress.country}</p>
                {selectedOrder.shippingAddress.phone && (
                  <p className="mt-1">
                    <strong>Phone:</strong> {selectedOrder.shippingAddress.phone}
                  </p>
                )}
                {selectedOrder.shippingAddress.email && (
                  <p>
                    <strong>Email:</strong> {selectedOrder.shippingAddress.email}
                  </p>
                )}
              </div>

              <div>
                <h3 className="font-semibold mb-2">Update Status</h3>
                <select
                  value={selectedOrder.status}
                  onChange={(e) =>
                    handleStatusUpdate(
                      selectedOrder._id || selectedOrder.id || "",
                      e.target.value as Order["status"],
                    )
                  }
                  className="px-4 py-2 border rounded"
                >
                  <option value={selectedOrder.status} disabled>
                    Current: {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                  </option>
                  {getValidNextStatuses(selectedOrder.status).map((status) => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                  {getValidNextStatuses(selectedOrder.status).length === 0 && (
                    <option disabled>No status changes allowed</option>
                  )}
                </select>
                {getValidNextStatuses(selectedOrder.status).length === 0 && (
                  <p className="text-sm text-gray-500 mt-1">
                    This order cannot be updated further.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
