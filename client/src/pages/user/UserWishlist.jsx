/*
 * Lumina - User Wishlist Page
 * 찜한 상품 목록 조회, 장바구니/구매 이동
 */

import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import Layout from '@/components/Layout';
import { Heart, ShoppingCart, Trash2, Loader2, ShoppingBag } from 'lucide-react';
import { formatPrice } from '@/lib/data';
import { toast } from 'sonner';
import { shopApi } from '@/lib/api';

export default function UserWishlist() {
  const [, setLocation] = useLocation();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const res = await shopApi.get('/shop/wishlist');
      setWishlist(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error('위시리스트를 불러오는 데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleRemove = async (productId) => {
    try {
      await shopApi.delete(`/shop/wishlist/${productId}`);
      setWishlist((prev) => prev.filter((w) => w.productId !== productId));
      toast.success('위시리스트에서 제거했습니다.');
    } catch {
      toast.error('제거에 실패했습니다.');
    }
  };

  const handleAddToCart = async (productId, name) => {
    try {
      await shopApi.post('/shop/cart', { productId, quantity: 1 });
      toast.success(`${name}을(를) 장바구니에 담았습니다.`);
    } catch {
      toast.error('장바구니 담기에 실패했습니다.');
    }
  };

  if (loading) {
    return (
      <Layout role="user">
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <Loader2 size={40} className="text-rose-500 animate-spin" />
          <p className="text-muted-foreground font-medium">위시리스트를 불러오는 중입니다...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout role="user">
      <div className="p-4 lg:p-6 space-y-6 max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart size={22} className="text-rose-500" fill="currentColor" />
            <h1 className="text-xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
              위시리스트
            </h1>
          </div>
          <span className="text-sm text-muted-foreground">{wishlist.length}개 상품</span>
        </div>

        {wishlist.length === 0 ? (
          <div className="text-center py-20">
            <Heart size={48} className="text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground font-medium">찜한 상품이 없습니다.</p>
            <button
              onClick={() => setLocation('/user/store')}
              className="mt-4 px-6 py-2.5 btn-primary-gradient text-white rounded-xl font-semibold shadow-sm text-sm"
            >
              쇼핑하러 가기
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {wishlist.map((item) => (
              <div key={item.wishlistId}
                className="glass-card rounded-2xl p-4 flex gap-4 items-center soft-shadow">

                {/* Product Image */}
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
                  <p className="text-rose-600 font-bold mt-1">{formatPrice(item.basePrice)}</p>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => handleAddToCart(item.productId, item.title)}
                    className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center hover:bg-rose-100 transition-colors"
                    title="장바구니 담기"
                  >
                    <ShoppingCart size={16} className="text-rose-500" />
                  </button>
                  <button
                    onClick={() => handleRemove(item.productId)}
                    className="w-9 h-9 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center hover:bg-red-50 hover:border-red-200 transition-colors"
                    title="위시리스트 제거"
                  >
                    <Trash2 size={16} className="text-gray-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {wishlist.length > 0 && (
          <button
            onClick={() => setLocation('/user/store/cart')}
            className="w-full py-3.5 btn-primary-gradient text-white rounded-2xl font-bold shadow-md hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
          >
            <ShoppingCart size={18} />
            장바구니로 이동
          </button>
        )}
      </div>
    </Layout>
  );
}
