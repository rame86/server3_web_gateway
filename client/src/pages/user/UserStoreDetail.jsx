import { useState } from 'react';
import { useLocation, useParams } from 'wouter';
import Layout from '@/components/Layout';
import { ChevronLeft, ShoppingCart, Heart, Share2, Star, Truck, Info, ShieldCheck } from 'lucide-react';
import { goodsItems, formatPrice } from '@/lib/data';
import { toast } from 'sonner';

export default function UserStoreDetail() {
    const [, setLocation] = useLocation();
    const params = useParams();
    const itemId = parseInt(params.id || '1', 10);
    const item = goodsItems.find(i => i.id === itemId) || goodsItems[0];
    const [wishlisted, setWishlisted] = useState(false);

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
                                    <span className="font-bold">{item.rating}</span>
                                    <span className="text-muted-foreground">({item.reviews}개 리뷰)</span>
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
                                onClick={() => {
                                    setWishlisted(!wishlisted);
                                    toast.success(wishlisted ? '위시리스트에서 제거했습니다' : '위시리스트에 담았습니다');
                                }}
                                className="w-14 h-14 rounded-2xl border-2 border-gray-200 flex items-center justify-center hover:bg-gray-50 hover:border-rose-200 transition-colors"
                            >
                                <Heart size={24} className={wishlisted ? "text-rose-500" : "text-gray-400"} fill={wishlisted ? "currentColor" : "none"} />
                            </button>

                            <button
                                onClick={() => toast.success('장바구니에 담았습니다')}
                                className="w-14 h-14 rounded-2xl border-2 border-rose-200 bg-rose-50 flex items-center justify-center hover:border-rose-400 transition-colors"
                            >
                                <ShoppingCart size={24} className="text-rose-500" />
                            </button>

                            <button
                                onClick={() => setLocation(`/user/store/purchase/${item.id}`)}
                                className="flex-1 rounded-2xl btn-primary-gradient text-white font-bold text-lg shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
                            >
                                바로 구매하기
                            </button>
                        </div>

                        <p className="text-center text-xs text-muted-foreground flex items-center justify-center gap-1.5">
                            <Info size={14} /> 이 상품은 Fanverse 포인트 서비스로만 결제 가능합니다.
                        </p>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
