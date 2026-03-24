import { useState, useEffect } from 'react';
import { useLocation, useParams } from 'wouter';
import Layout from '@/components/Layout';
import { ChevronLeft, ShoppingCart, Heart, Share2, Star, Truck, Info, ShieldCheck, Loader2 } from 'lucide-react';
import { formatPrice } from '@/lib/data';
import { toast } from 'sonner';
import { shopApi } from '@/lib/api';

export default function UserStoreDetail() {
    const [, setLocation] = useLocation();
    const params = useParams();
    const productId = params.id;
    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [wishlisted, setWishlisted] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const [reviews, setReviews] = useState([]);
    const [reviewsLoading, setReviewsLoading] = useState(false);

    const fetchProduct = async () => {
        try {
            setLoading(true);
            const response = await shopApi.get(`shop/detail/${productId}`);
            let data = response.data;
            if (data && data.data) data = data.data; 
            
            const mappedItem = {
                id: data.productId || data.id,
                name: data.title || data.name || '알 수 없는 상품',
                artistId: data.sellerId,
                artistName: data.sellerType === 'ARTIST' ? '아티스트' : (data.artistName || '유저'),
                price: data.basePrice || data.price || 0,
                originalPrice: data.originalPrice, // If any
                description: data.description || '',
                image: data.imageUrl,
                category: data.category === 'OFFICIAL' ? 'official' :
                    data.category === 'UNOFFICIAL' ? 'unofficial' : 'used',
                stock: 100, // Placeholder
                rating: data.averageRating || 0.0,
                reviewCount: data.reviewCount || 0,
                badge: data.category === 'OFFICIAL' ? 'OFFICIAL' : null
            };
            setItem(mappedItem);
        } catch (error) {
            console.error('Failed to fetch product:', error);
            toast.error('상품 정보를 가져오는 데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const fetchReviews = async () => {
        try {
            setReviewsLoading(true);
            const res = await shopApi.get(`/shop/product/${productId}/reviews`);
            setReviews(res.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setReviewsLoading(false);
        }
    };

    useEffect(() => {
        if (productId) {
            fetchProduct();
            fetchReviews();
        }
    }, [productId]);

    if (loading) {
        return (
            <Layout role="user">
                <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                    <Loader2 size={40} className="text-rose-500 animate-spin" />
                    <p className="text-muted-foreground font-medium">상품 정보를 불러오는 중입니다...</p>
                </div>
            </Layout>
        );
    }

    if (!item) {
        return (
            <Layout role="user">
                <div className="text-center py-20">
                    <p className="text-muted-foreground">상품을 찾을 수 없습니다.</p>
                    <button onClick={() => setLocation('/user/store')} className="mt-4 text-rose-500 font-medium">스토어로 돌아가기</button>
                </div>
            </Layout>
        );
    }

    return (
        <Layout role="user">
            <div className="p-4 lg:p-6 space-y-6 pb-24 max-w-5xl mx-auto">
                <button
                    onClick={() => setLocation('/user/store')}
                    className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                    <ChevronLeft size={16} />
                    스토어로 돌아가기
                </button>

                <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
                    {/* Product Image Gallery */}
                    <div className="space-y-4">
                        <div className="relative aspect-square rounded-3xl overflow-hidden bg-gray-50 border border-gray-100 soft-shadow group">
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            {item.badge && (
                                <div className="absolute top-4 left-4">
                                    <span className={`px-3 py-1.5 rounded-xl text-sm font-bold shadow-sm ${item.badge === '중고' ? 'badge-lavender' : item.badge === '한정판' ? 'bg-amber-100 text-amber-700' : 'badge-rose'
                                        }`}>
                                        {item.badge}
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-4">
                            <div className="w-20 h-20 rounded-2xl overflow-hidden bg-rose-50 border-2 border-rose-400 cursor-pointer">
                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                            </div>
                        </div>
                    </div>

                    {/* Product Info */}
                    <div className="space-y-8">
                        <div>
                            <p className="text-rose-500 font-bold mb-2">{item.artistName}</p>
                            <h1 className="text-3xl font-bold text-foreground mb-4 leading-tight">{item.name}</h1>

                            <div className="flex items-center gap-4 text-sm mb-6">
                                <div className="flex items-center gap-1">
                                    <Star size={16} className="text-amber-400" fill="currentColor" />
                                    <span className="font-bold">{item.rating.toFixed(1)}</span>
                                    <span className="text-muted-foreground">({item.reviewCount}개 리뷰)</span>
                                </div>
                                <div className="w-1 h-1 rounded-full bg-gray-300" />
                                <span className="text-muted-foreground">남은 수량: {item.stock}개</span>
                            </div>

                            <div className="flex items-end gap-3 pb-6 border-b border-gray-100">
                                <span className="text-4xl font-bold text-rose-600">{formatPrice(item.price)}</span>
                                {item.originalPrice && (
                                    <span className="text-lg text-muted-foreground line-through pb-1">{formatPrice(item.originalPrice)}</span>
                                )}
                            </div>
                        </div>

                        <div className="space-y-4 text-sm border-b border-gray-100 pb-6">
                            <div className="flex items-center justify-between p-4 bg-rose-50 rounded-2xl border border-rose-100 shadow-inner">
                                <span className="font-semibold text-muted-foreground">수량 선택</span>
                                <div className="flex items-center gap-4 bg-white rounded-xl p-1 shadow-sm border border-rose-100">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="w-8 h-8 flex items-center justify-center bg-white rounded-lg text-rose-600 hover:bg-rose-50 shadow-sm border border-rose-50"
                                    >
                                        -
                                    </button>
                                    <span className="font-bold w-6 text-center">{quantity}</span>
                                    <button
                                        onClick={() => setQuantity(Math.min(10, Math.min(item.stock || 100, quantity + 1)))}
                                        className="w-8 h-8 flex items-center justify-center bg-white rounded-lg text-rose-600 hover:bg-rose-50 shadow-sm border border-rose-50"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
                                    <Truck size={18} />
                                </div>
                                <div>
                                    <p className="font-semibold text-foreground">일반 택배 배송</p>
                                    <p className="text-muted-foreground">3,000원 (50,000원 이상 무배)</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-500">
                                    <ShieldCheck size={18} />
                                </div>
                                <div>
                                    <p className="font-semibold text-foreground">100% 정품 보증</p>
                                    <p className="text-muted-foreground">가품일 경우 200% 보상</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={async () => {
                                    try {
                                        await shopApi.post('/shop/wishlist', { productId: item.id });
                                        setWishlisted(!wishlisted);
                                        toast.success(wishlisted ? '위시리스트에서 제거했습니다' : '위시리스트에 담았습니다');
                                    } catch (error) {
                                        toast.error('요청 처리에 실패했습니다.');
                                    }
                                }}
                                className="w-14 h-14 rounded-2xl border-2 border-gray-200 flex items-center justify-center hover:bg-gray-50 hover:border-rose-200 transition-colors"
                            >
                                <Heart size={24} className={wishlisted ? "text-rose-500" : "text-gray-400"} fill={wishlisted ? "currentColor" : "none"} />
                            </button>

                            <button
                                onClick={async () => {
                                    try {
                                        await shopApi.post('/shop/cart', { productId: item.id, quantity });
                                        toast.success(`${item.name} ${quantity}개를 장바구니에 담았습니다`);
                                    } catch (error) {
                                        toast.error('장바구니 담기에 실패했습니다.');
                                    }
                                }}
                                className="w-14 h-14 rounded-2xl border-2 border-rose-200 bg-rose-50 flex items-center justify-center hover:border-rose-400 transition-colors"
                            >
                                <ShoppingCart size={24} className="text-rose-500" />
                            </button>

                            <button
                                onClick={() => setLocation(`/user/store/purchase/${item.id}?qty=${quantity}`)}
                                className="flex-1 rounded-2xl btn-primary-gradient text-white font-bold text-lg shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
                            >
                                바로 구매하기
                            </button>
                        </div>

                        <p className="text-center text-xs text-muted-foreground flex items-center justify-center gap-1.5">
                            <Info size={14} /> 이 상품은 Lumina 포인트 서비스로만 결제 가능합니다.
                        </p>
                    </div>
                </div>

                {/* Reviews Section */}
                <div className="mt-16 space-y-8">
                    <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                        <h2 className="text-2xl font-bold">리뷰</h2>
                        <span className="text-rose-500 font-bold">{reviews.length}</span>
                    </div>

                    {reviewsLoading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="text-rose-500 animate-spin" />
                        </div>
                    ) : reviews.length === 0 ? (
                        <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed">
                            <Star size={40} className="mx-auto text-gray-200 mb-4" />
                            <p className="text-muted-foreground font-medium">아직 작성된 리뷰가 없습니다.</p>
                            <p className="text-sm text-muted-foreground mt-1">이 상품의 첫 번째 리뷰어가 되어보세요!</p>
                        </div>
                    ) : (
                        <div className="grid gap-6">
                            {reviews.map((review) => (
                                <div key={review.reviewId} className="p-6 bg-white rounded-3xl border border-gray-100 soft-shadow">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 font-bold text-sm">
                                                {review.memberId.toString().substring(0, 2)}
                                            </div>
                                            <div>
                                                <div className="flex gap-0.5 mb-1">
                                                    {[1, 2, 3, 4, 5].map((s) => (
                                                        <Star 
                                                            key={s} 
                                                            size={14} 
                                                            className={s <= review.rating ? "fill-amber-400 text-amber-400" : "text-gray-200"} 
                                                        />
                                                    ))}
                                                </div>
                                                <p className="text-xs text-muted-foreground">
                                                    {new Date(review.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-sm text-foreground leading-relaxed mb-4">
                                        {review.comment}
                                    </p>
                                    {review.imageUrl && (
                                        <div className="mt-4 rounded-2xl overflow-hidden border border-gray-100 max-w-sm bg-gray-50/50">
                                            <img
                                                src={review.imageUrl}
                                                alt="Review"
                                                className="w-full h-auto object-cover hover:scale-105 transition-transform duration-500 cursor-pointer"
                                                onClick={() => window.open(review.imageUrl, '_blank')}
                                            />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
}
