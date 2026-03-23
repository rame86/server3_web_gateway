/*
 * Lumina - User Cart Page
 * 장바구니 목록 조회, 항목 삭제, 결제 이동
 */

import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import Layout from '@/components/Layout';
import { ShoppingCart, Trash2, Loader2, ShoppingBag, ArrowRight } from 'lucide-react';
import { formatPrice } from '@/lib/data';
import { toast } from 'sonner';
import { shopApi } from '@/lib/api';

export default function UserCart() {
  const [, setLocation] = useLocation();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const res = await shopApi.get('/shop/cart');
      setCart(res.data);
    } catch (err) {
      console.error(err);
      toast.error('장바구니를 불러오는 데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const handleRemove = async (cartItemId) => {
    try {
      const res = await shopApi.delete(`/shop/cart/${cartItemId}`);
      setCart(res.data);
      toast.success('장바구니에서 제거했습니다.');
    } catch {
      toast.error('제거에 실패했습니다.');
    }
  };

  if (loading) {
    return (
      <Layout role="user">
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <Loader2 size={40} className="text-rose-500 animate-spin" />
          <p className="text-muted-foreground font-medium">장바구니를 불러오는 중입니다...</p>
        </div>
      </Layout>
    );
  }

  // CartResponseDTO: { cartId, memberId, items: [{ cartItemId, productId, title, imageUrl, unitPrice, quantity, subtotal }], totalPrice }
  const items = cart?.items || [];
  const totalPrice = cart?.totalPrice ?? 0;
  const deliveryFee = items.length > 0 && totalPrice < 50000 ? 3000 : 0;
  const grandTotal = Number(totalPrice) + deliveryFee;

  return (
    <Layout role="user">
      <div className="p-4 lg:p-6 space-y-6 max-w-2xl mx-auto pb-28">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart size={22} className="text-rose-500" />
            <h1 className="text-xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
              장바구니
            </h1>
          </div>
          <span className="text-sm text-muted-foreground">{items.length}개 상품</span>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingBag size={48} className="text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground font-medium">장바구니가 비어 있습니다.</p>
            <button
              onClick={() => setLocation('/user/store')}
              className="mt-4 px-6 py-2.5 btn-primary-gradient text-white rounded-xl font-semibold shadow-sm text-sm"
            >
              쇼핑하러 가기
            </button>
          </div>
        ) : (
          <>
            {/* Cart Items */}
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.cartItemId}
                  className="glass-card rounded-2xl p-4 flex gap-4 items-center soft-shadow">

                  {/* Image */}
                  <div
                    onClick={() => setLocation(`/user/store/${item.productId}`)}
                    className="cursor-pointer flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden bg-rose-50 border border-rose-100"
                  >
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingBag size={24} className="text-rose-300" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div
                    className="flex-1 cursor-pointer"
                    onClick={() => setLocation(`/user/store/${item.productId}`)}
                  >
                    <p className="font-semibold text-sm text-foreground line-clamp-2">{item.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">수량: {item.quantity}개</p>
                    <p className="text-rose-600 font-bold mt-1">{formatPrice(item.subtotal)}</p>
                  </div>

                  {/* Remove */}
                  <button
                    onClick={() => handleRemove(item.cartItemId)}
                    className="w-9 h-9 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center hover:bg-red-50 hover:border-red-200 transition-colors flex-shrink-0"
                    title="삭제"
                  >
                    <Trash2 size={16} className="text-gray-400" />
                  </button>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="glass-card rounded-2xl p-5 space-y-3 soft-shadow">
              <h3 className="font-semibold text-sm text-muted-foreground mb-2">결제 요약</h3>
              <div className="flex justify-between text-sm">
                <span>상품 금액</span><span>{formatPrice(totalPrice)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>배송비</span>
                <span className={deliveryFee === 0 ? 'text-green-500 font-semibold' : ''}>
                  {deliveryFee === 0 ? '무료' : formatPrice(deliveryFee)}
                </span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-3 border-t border-rose-100 text-rose-600">
                <span>총 결제 예정 금액</span>
                <span>{formatPrice(grandTotal).replace('원', 'P')}</span>
              </div>
            </div>

            {/* Checkout */}
            <button
              onClick={() => {
                if (items.length === 1) {
                  setLocation(`/user/store/purchase/${items[0].productId}?qty=${items[0].quantity}`);
                } else {
                  toast.info('현재 다중 상품 결제는 개별 상품 페이지에서 바로 구매로 진행해 주세요.');
                }
              }}
              className="w-full py-4 btn-primary-gradient text-white rounded-2xl font-bold shadow-md hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
            >
              결제하기
              <ArrowRight size={18} />
            </button>
          </>
        )}
      </div>
    </Layout>
  );
}
