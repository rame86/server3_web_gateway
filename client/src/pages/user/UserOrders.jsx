/*
 * Lumina - User Orders Page
 * 주문 내역 목록 조회
 */

import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import Layout from '@/components/Layout';
import { Package, Loader2, ChevronRight, CheckCircle2, ShoppingBag, Trash2, Star, X } from 'lucide-react';
import { formatPrice } from '@/lib/data';
import { toast } from 'sonner';
import { shopApi } from '@/lib/api';

export default function UserOrders() {
  const [, setLocation] = useLocation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // 리뷰 관련 상태
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewImage, setReviewImage] = useState(null);
  const [reviewImagePreview, setReviewImagePreview] = useState(null);
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
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

  const handleDeleteOrder = async (orderId) => {
    if (!confirm('정말로 이 주문 내역을 삭제하시겠습니까?')) return;
    try {
      await shopApi.delete(`/shop/order/${orderId}`);
      toast.success('주문 내역이 삭제되었습니다.');
      setOrders(prev => prev.filter(o => o.orderId !== orderId));
    } catch (err) {
      console.error(err);
      toast.error('주문 내역 삭제에 실패했습니다.');
    }
  };

  const openReviewModal = (product) => {
    setSelectedProduct(product);
    setReviewRating(5);
    setReviewComment('');
    setReviewImage(null);
    setReviewImagePreview(null);
    setIsReviewModalOpen(true);
  };

  const handleReviewSubmit = async () => {
    if (!reviewComment.trim()) {
      toast.error('리뷰 내용을 입력해주세요.');
      return;
    }
    try {
      setSubmittingReview(true);
      
      const formData = new FormData();
      formData.append('productId', selectedProduct.productId);
      formData.append('rating', reviewRating);
      formData.append('comment', reviewComment);
      if (reviewImage) {
        formData.append('image', reviewImage);
      }

      await shopApi.post('/shop/review', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.success('리뷰가 등록되었습니다!');
      setIsReviewModalOpen(false);
    } catch (err) {
      console.error(err);
      toast.error('리뷰 등록에 실패했습니다.');
    } finally {
      setSubmittingReview(false);
    }
  };

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
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold shadow-sm ${statusInfo.color}`}>
                        {statusInfo.text}
                      </span>
                      <button 
                        onClick={() => handleDeleteOrder(order.orderId)}
                        className="p-1.5 text-gray-400 hover:text-rose-500 transition-colors"
                        title="주문 내역 삭제"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="p-4 space-y-4">
                    {order.orderItems && order.orderItems.map((item) => (
                      <div key={item.orderItemId} className="flex gap-4 items-start">
                        {/* Image */}
                        <div
                          onClick={() => setLocation(`/user/store/${item.productId || ''}`)}
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
                          <div className="flex justify-between items-start gap-2">
                            <p
                              className="font-semibold text-sm text-foreground line-clamp-2 cursor-pointer hover:text-rose-600 transition-colors"
                              onClick={() => setLocation(`/user/store/${item.productId || ''}`)}
                            >
                              {item.title}
                            </p>
                            {/* 리뷰 버튼 - 결제 완료 이후에만 표시 */}
                            {(order.status === 'PAID' || order.status === 'SHIPPED' || order.status === 'DELIVERED') && (
                              <button
                                onClick={() => openReviewModal(item)}
                                className="flex-shrink-0 px-2 py-1 text-[10px] font-bold text-rose-500 border border-rose-200 rounded-md hover:bg-rose-50 transition-colors"
                              >
                                리뷰 작성
                              </button>
                            )}
                          </div>
                          {(item.color || item.size) && (
                            <p className="text-xs text-muted-foreground mt-1 gap-2 flex">
                              {item.color && <span>옵션: {item.color}</span>}
                              {item.size && <span>사이즈: {item.size}</span>}
                            </p>
                          )}
                          {/* 원가 × 수량 = 소계 */}
                          <div className="mt-2 space-y-0.5">
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span>단가</span>
                              <span>{formatPrice(item.unitPrice)}</span>
                            </div>
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span>수량</span>
                              <span>{item.quantity}개</span>
                            </div>
                            <div className="flex items-center justify-between text-sm font-bold text-rose-600 border-t border-rose-50 pt-1">
                              <span>소계</span>
                              <span>{formatPrice(item.subtotal ?? (item.unitPrice * item.quantity))}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Footer - 배송비 + 총결제금액 */}
                  <div className="px-4 pb-4 bg-gray-50 border-t border-gray-100 space-y-1.5 pt-3 rounded-b-3xl">
                    {(() => {
                      const itemsTotal = order.orderItems
                        ? order.orderItems.reduce((sum, it) => sum + (it.subtotal ?? (it.unitPrice * it.quantity)), 0)
                        : 0;
                      const shipping = order.shippingFee ?? 0;
                      const grand = order.totalAmount ?? (itemsTotal + shipping);
                      return (
                        <>
                          <div className="flex justify-between text-sm text-muted-foreground">
                            <span>상품 합계</span>
                            <span>{formatPrice(itemsTotal)}</span>
                          </div>
                          <div className="flex justify-between text-sm text-muted-foreground">
                            <span>배송비</span>
                            <span>{Number(shipping) === 0 ? '무료' : formatPrice(shipping)}</span>
                          </div>
                          <div className="flex justify-between text-base font-bold text-rose-600 border-t border-rose-100 pt-2 mt-1">
                            <span>총 결제금액</span>
                            <span>{String(formatPrice(grand)).replace('원', 'P')}</span>
                          </div>
                        </>
                      );
                    })()}
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Review Modal */}
      {isReviewModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b flex items-center justify-between bg-rose-50/30">
              <h2 className="text-lg font-bold text-rose-600">상품 리뷰 작성</h2>
              <button onClick={() => setIsReviewModalOpen(false)} className="p-1 hover:bg-white rounded-full transition-colors">
                <X size={20} className="text-gray-400" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="flex gap-4 items-center p-3 bg-gray-50 rounded-2xl">
                <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border bg-white">
                  <img src={selectedProduct.imageUrl} alt={selectedProduct.title} className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="font-bold text-sm line-clamp-1">{selectedProduct.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">이 상품은 어떠셨나요?</p>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-bold text-center">별점을 선택해주세요</p>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setReviewRating(star)}
                      className="transition-transform active:scale-90"
                    >
                      <Star
                        size={32}
                        className={star <= reviewRating ? "fill-amber-400 text-amber-400" : "text-gray-200"}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-bold">상세한 후기를 남겨주세요</p>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="착용감, 색상, 디자인 등 만족스러웠던 점을 공유해주세요!"
                  className="w-full h-32 p-4 rounded-2xl border bg-gray-50 focus:bg-white focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all outline-none resize-none text-sm"
                />
              </div>

              <div className="space-y-2">
                <p className="text-sm font-bold">사진 첨부 (선택)</p>
                <div className="flex gap-4 items-center">
                  <label className="flex-shrink-0 w-20 h-20 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 hover:border-rose-200 transition-all">
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          setReviewImage(file);
                          setReviewImagePreview(URL.createObjectURL(file));
                        }
                      }}
                    />
                    <Package size={20} className="text-gray-400 mb-1" />
                    <span className="text-[10px] text-gray-500">사진 추가</span>
                  </label>
                  {reviewImagePreview && (
                    <div className="relative w-20 h-20 rounded-2xl overflow-hidden border">
                      <img src={reviewImagePreview} alt="Preview" className="w-full h-full object-cover" />
                      <button 
                        onClick={() => {
                          setReviewImage(null);
                          setReviewImagePreview(null);
                        }}
                        className="absolute top-1 right-1 p-1 bg-black/50 rounded-full text-white hover:bg-black transition-colors"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={handleReviewSubmit}
                disabled={submittingReview}
                className="w-full py-4 btn-primary-gradient text-white rounded-2xl font-bold shadow-lg shadow-rose-200 disabled:opacity-50 transition-all active:scale-[0.98]"
              >
                {submittingReview ? <Loader2 size={24} className="animate-spin mx-auto" /> : '리뷰 등록하기'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
