/*
 * Lumina - User Orders Page
 * 주문 내역 목록 조회
 */

import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import Layout from '@/components/Layout';
import { Package, Loader2, ChevronRight, CheckCircle2, ShoppingBag } from 'lucide-react';
import { formatPrice } from '@/lib/data';
import { toast } from 'sonner';
import { shopApi } from '@/lib/api';

export default function UserOrders() {
  const [, setLocation] = useLocation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      // Backend expects pagination but has defaults (page=0, size=10)
      const res = await shopApi.get('/shop/order');
      setOrders(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error('주문 내역을 불러오는 데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const getStatusLabel = (status) => {
    switch(status) {
      case 'PENDING': return { text: '결제 대기', color: 'text-amber-500 bg-amber-50' };
      case 'PAID': return { text: '결제 완료', color: 'text-teal-600 bg-teal-50' };
      case 'SHIPPED': return { text: '배송 중', color: 'text-blue-500 bg-blue-50' };
      case 'DELIVERED': return { text: '배송 완료', color: 'text-gray-600 bg-gray-100' };
      case 'CANCELLED': return { text: '주문 취소', color: 'text-red-500 bg-red-50' };
      default: return { text: status, color: 'text-gray-500 bg-gray-50' };
    }
  };

  if (loading) {
    return (
      <Layout role="user">
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <Loader2 size={40} className="text-rose-500 animate-spin" />
          <p className="text-muted-foreground font-medium">주문 내역을 불러오는 중입니다...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout role="user">
      <div className="p-4 lg:p-6 space-y-6 max-w-3xl mx-auto pb-28">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package size={22} className="text-rose-500" />
            <h1 className="text-xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
              주문/배송 내역
            </h1>
          </div>
          <span className="text-sm text-muted-foreground">총 {orders.length}건</span>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-20 glass-card rounded-3xl">
            <Package size={48} className="text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground font-medium mb-4">주문 내역이 없습니다.</p>
            <button
              onClick={() => setLocation('/user/store')}
              className="px-6 py-2.5 btn-primary-gradient text-white rounded-xl font-semibold shadow-sm text-sm"
            >
              쇼핑하러 가기
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const orderDate = order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '날짜 미상';
              const statusInfo = getStatusLabel(order.status);
              
              return (
                <div key={order.orderId} className="glass-card rounded-3xl overflow-hidden soft-shadow border border-rose-50/50">
                  {/* Order Header */}
                  <div className="bg-rose-50/50 p-4 border-b border-rose-100/50 flex flex-wrap gap-3 items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-rose-500 mb-0.5 block">{orderDate}</span>
                      <span className="text-sm font-semibold text-foreground">주문번호 {order.orderId.substring(0, 8).toUpperCase()}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold shadow-sm ${statusInfo.color}`}>
                        {statusInfo.text}
                      </span>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="p-4 space-y-4">
                    {order.orderItems && order.orderItems.map((item) => (
                      <div key={item.orderItemId} className="flex gap-4 items-start">
                        {/* Image */}
                        <div
                          onClick={() => setLocation(`/user/store/${item.variantId || ''}`)}
                          className="cursor-pointer flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden bg-gray-50 border border-gray-100"
                        >
                          {item.imageUrl ? (
                            <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ShoppingBag size={24} className="text-gray-300" />
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1">
                          <p 
                            className="font-semibold text-sm text-foreground line-clamp-2 cursor-pointer hover:text-rose-600 transition-colors"
                            onClick={() => setLocation(`/user/store/${item.variantId || ''}`)}
                          >
                            {item.title}
                          </p>
                          {(item.color || item.size) && (
                            <p className="text-xs text-muted-foreground mt-1 gap-2 flex">
                              {item.color && <span>옵션: {item.color}</span>}
                              {item.size && <span>사이즈: {item.size}</span>}
                            </p>
                          )}
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-rose-600 font-bold">{formatPrice(item.unitPrice)}</span>
                            <span className="text-sm text-muted-foreground font-medium">{item.quantity}개</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Footer */}
                  <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-sm font-semibold text-muted-foreground">총 결제 금액</span>
                    <span className="text-lg font-bold text-rose-600">{formatPrice(order.totalAmount).replace('원', 'P')}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
