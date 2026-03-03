"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import OrdersClient from './OrdersClient';
import { ordersApi, Order } from '../../../lib/api/orders.api';

export default function OrdersPage() {
  const searchParams = useSearchParams();
  const [orders, setOrders] = useState<Order[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const page = parseInt(searchParams.get('page') || '1');
        const statusParam = searchParams.get('status') || '';
        setStatus(statusParam);
        
        const ordersData = await ordersApi.getAll({ page, limit: 20, status: statusParam });
        setOrders(ordersData.orders);
        setPagination(ordersData.pagination);
      } catch (error: any) {
        console.error('Error fetching orders:', error);
        setOrders([]);
        setPagination({ page: 1, limit: 20, total: 0, pages: 0 });
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading orders...</div>
      </div>
    );
  }

  return (
    <OrdersClient
      initialOrders={orders}
      initialPagination={pagination}
      initialStatus={status}
    />
  );
}
