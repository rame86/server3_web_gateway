import { useState, useEffect } from 'react';
import { useLocation, useParams } from 'wouter';
import Layout from '@/components/Layout';
import { ChevronLeft, CheckCircle2, CreditCard, AlertCircle, Package, Loader2 } from 'lucide-react';
import { formatPrice } from '@/lib/data';
import { toast } from 'sonner';
import { shopApi, payApi } from '@/lib/api';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";

export default function UserPurchaseProcess() {
    const [, setLocation] = useLocation();
    const params = useParams();
    const productId = params.id;
    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [step, setStep] = useState(1);
    
    // Extract quantity from URL query params
    const queryParams = new URLSearchParams(window.location.search);
    const initialQty = parseInt(queryParams.get('qty') || '1', 10);
    const [quantity, setQuantity] = useState(initialQty);
    
    const [userPoints, setUserPoints] = useState(0);
    const [isPayConfirmOpen, setIsPayConfirmOpen] = useState(false);
    const deliveryFee = 3000;

    const fetchUserPoints = async () => {
        try {
            const { data } = await payApi.get('/payment/');
            setUserPoints(data.currentBalance || 0);
        } catch (error) {
            console.error('Failed to fetch wallet info:', error);
        }
    };

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                const response = await shopApi.get(`shop/detail/${productId}`);
                let data = response.data;
                if (data && data.data) data = data.data; // Handle potential API wrappers
                
                const mappedItem = {
                    id: data.productId || data.id,
                    name: data.title || data.name || '알 수 없는 상품',
                    artistId: data.sellerId,
                    artistName: data.sellerType === 'ARTIST' ? '아티스트' : (data.artistName || '유저'),
                    price: data.basePrice || data.price || 0,
                    image: data.imageUrl || '',
                    stock: 100, // Placeholder
                };
                setItem(mappedItem);
            } catch (error) {
                console.error('Failed to fetch product:', error);
                toast.error('상품 정보를 가져오는 데 실패했습니다.');
            } finally {
                setLoading(false);
            }
        };

        if (productId) {
            fetchProduct();
            fetchUserPoints();
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

    const totalPrice = item.price * quantity;
    const grandTotal = totalPrice + (totalPrice >= 50000 || totalPrice === 0 ? 0 : deliveryFee);
    const isEnoughPoints = userPoints >= grandTotal;

    const handleNext = () => {
        if (step === 1 && quantity > 0) setStep(2);
        else if (step === 2 && isEnoughPoints) setStep(3);
    };

    const handlePayment = async () => {
        setIsPayConfirmOpen(false);
        toast.loading('포인트 결제가 진행 중입니다...');
        try {
            await shopApi.post('/shop/checkout', { productId: item.id, quantity, usePoint: grandTotal });
            toast.dismiss();
            handleNext();
        } catch (error) {
            toast.dismiss();
            toast.error('결제에 실패했습니다.');
        }
    };

    return (
        <Layout role="user">
            <div className="p-4 lg:p-6 pb-24 max-w-2xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex items-center gap-3 border-b border-rose-100 pb-4">
                    <button
                        onClick={() => step > 1 ? setStep(step - 1) : setLocation(`/user/store/${item.id}`)}
                        className="p-2 -ml-2 text-muted-foreground hover:bg-rose-50 rounded-full transition-colors"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>주문 진행</h1>
                        <p className="text-sm text-muted-foreground line-clamp-1">{item.name}</p>
                    </div>
                </div>

                {/* Progress */}
                <div className="flex items-center justify-between mb-8 px-4 relative">
                    {[1, 2, 3].map((s) => (
                        <div key={s} className="flex flex-col items-center gap-2 z-10">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all
                ${step === s ? 'btn-primary-gradient text-white shadow-md' :
                                    step > s ? 'bg-rose-100 text-rose-500' : 'bg-gray-100 text-gray-400'}`}
                            >
                                {step > s ? <CheckCircle2 size={16} /> : s}
                            </div>
                            <span className={`text-xs font-semibold ${step >= s ? 'text-rose-600' : 'text-muted-foreground'}`}>
                                {s === 1 ? '주문 정보' : s === 2 ? '결제 수단' : '주문 완료'}
                            </span>
                        </div>
                    ))}
                    {/* Progress Lines */}
                    <div className="absolute left-8 right-8 top-4 h-[2px] bg-gray-100 -z-0">
                        <div
                            className="h-full bg-rose-300 transition-all duration-300"
                            style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }}
                        />
                    </div>
                </div>

                {/* Step 1: Order details info */}
                {step === 1 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="glass-card p-6 rounded-3xl soft-shadow space-y-4">
                            <h2 className="font-bold text-lg mb-4">주문 상품 정보</h2>

                            <div className="flex gap-4 bg-white p-4 rounded-2xl border border-rose-50">
                                <img src={item.image} alt={item.name} className="w-20 h-20 rounded-xl object-cover" />
                                <div className="flex-1">
                                    <p className="text-xs text-rose-500 font-bold mb-1">{item.artistName}</p>
                                    <p className="font-semibold text-sm line-clamp-2">{item.name}</p>
                                    <p className="font-bold mt-2">{formatPrice(item.price)}</p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                <span className="font-medium text-muted-foreground">수량</span>
                                <div className="flex items-center gap-4 bg-white rounded-xl p-1 shadow-sm border border-gray-200">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="w-8 h-8 flex items-center justify-center bg-white rounded-lg hover:bg-gray-100 text-gray-600"
                                    >
                                        -
                                    </button>
                                    <span className="font-bold w-6 text-center">{quantity}</span>
                                    <button
                                        onClick={() => setQuantity(Math.min(10, Math.min(item.stock || 100, quantity + 1)))}
                                        className="w-8 h-8 flex items-center justify-center bg-white rounded-lg hover:bg-gray-100 text-gray-600"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
                            
                            <div className="flex justify-between items-center p-4 bg-rose-50 rounded-2xl">
                                <span className="font-medium text-muted-foreground">총 주문 금액 (배송비 제외)</span>
                                <span className="text-xl font-bold text-rose-600">{formatPrice(totalPrice)}</span>
                            </div>
                        </div>

                        <button
                            onClick={handleNext}
                            className="w-full py-4 btn-primary-gradient text-white rounded-2xl font-bold shadow-md hover:scale-[1.02] transition-all"
                        >
                            다음 단계로
                        </button>
                    </div>
                )}

                {/* Step 2: Payment */}
                {step === 2 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="glass-card p-6 rounded-3xl soft-shadow space-y-4">
                            <h2 className="font-bold text-lg mb-2 flex items-center gap-2">
                                <CreditCard size={20} className="text-rose-500" />
                                포인트 결제
                            </h2>
                            <p className="text-sm text-muted-foreground mb-4">Lumina 내 모든 스토어 및 예매 결제는 포인트로 진행됩니다.</p>

                            <div className="bg-rose-50 rounded-2xl p-5 border border-rose-100 flex justify-between items-center">
                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">보유 포인트</p>
                                    <p className="text-2xl font-bold text-foreground">
                                        {formatPrice(userPoints).replace('원', 'P')}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setLocation('/user/wallet')}
                                    className="px-4 py-2 bg-white text-rose-600 font-semibold rounded-xl text-sm shadow-sm hover:bg-rose-50 border border-rose-100 transition-colors"
                                >
                                    충전하기
                                </button>
                            </div>

                            {!isEnoughPoints && (
                                <div className="flex items-start gap-2 p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 text-sm">
                                    <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
                                    <p>포인트가 부족합니다. 안전한 결제를 위해 포인트 지갑에서 먼저 충전을 완료해주세요.</p>
                                </div>
                            )}
                        </div>

                        <div className="glass-card p-6 rounded-3xl soft-shadow space-y-3">
                            <h3 className="font-semibold text-sm text-muted-foreground mb-4">결제 요약</h3>
                            <div className="flex justify-between text-sm"><span>상품 금액</span> <span>{formatPrice(totalPrice)}</span></div>
                            <div className="flex justify-between text-sm">
                                <span>배송비</span>
                                <span>{totalPrice >= 50000 ? '무료' : formatPrice(deliveryFee)}</span>
                            </div>
                            <div className="flex justify-between text-lg font-bold pt-3 border-t border-rose-100 mt-2 text-rose-600">
                                <span>총 차감 포인트</span>
                                <span>{formatPrice(grandTotal).replace('원', 'P')}</span>
                            </div>
                        </div>

                        <button
                            onClick={() => setIsPayConfirmOpen(true)}
                            disabled={!isEnoughPoints}
                            className="w-full py-4 btn-primary-gradient text-white rounded-2xl font-bold shadow-lg disabled:opacity-50 disabled:grayscale transition-all hover:scale-[1.02]"
                        >
                            {formatPrice(grandTotal).replace('원', 'P')} 결제하기
                        </button>
                    </div>
                )}

                {/* Step 3: Complete */}
                {step === 3 && (
                    <div className="space-y-6 pt-10 text-center animate-in zoom-in-95 fade-in duration-500">
                        <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                            <CheckCircle2 size={40} />
                        </div>

                        <h2 className="text-2xl font-bold mb-2">구매가 완료되었습니다!</h2>
                        <p className="text-muted-foreground text-sm max-w-[250px] mx-auto mb-8">
                            상품 준비가 완료되는 대로 빠르게 배송해 드릴게요. 배송 현황은 알림을 통해 안내됩니다.
                        </p>

                        <div className="glass-card p-4 rounded-2xl text-left bg-white inline-block w-full max-w-sm">
                            <div className="flex items-center justify-center border-b border-dashed border-rose-200 pb-4 mb-4">
                                <Package className="text-rose-400 mr-2" />
                                <span className="font-bold text-rose-500 tracking-widest font-mono">ORDER ID: {Math.floor(Math.random() * 10000) + 90000}</span>
                            </div>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between"><span className="text-muted-foreground">상품명</span> <span className="font-semibold line-clamp-1 flex-1 text-right ml-4">{item.name}</span></div>
                                <div className="flex justify-between"><span className="text-muted-foreground">구입수량</span> <span className="font-semibold">{quantity}개</span></div>
                                <div className="flex justify-between"><span className="text-muted-foreground">사용 포인트</span> <span className="font-semibold text-rose-500">{formatPrice(grandTotal).replace('원', 'P')}</span></div>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-6">
                            <button
                                onClick={() => setLocation('/user/store')}
                                className="flex-1 py-3.5 bg-gray-100 font-semibold rounded-2xl text-muted-foreground hover:bg-gray-200 transition-colors"
                            >
                                스토어 메인
                            </button>
                            <button
                                onClick={() => {
                                    setLocation('/user/store/orders');
                                }}
                                className="flex-1 py-3.5 btn-primary-gradient text-white font-semibold rounded-2xl shadow-sm hover:shadow-md transition-shadow"
                            >
                                주문 내역 확인
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* 결제 확인 모달 */}
            <Dialog open={isPayConfirmOpen} onOpenChange={setIsPayConfirmOpen}>
                <DialogContent className="sm:max-w-sm p-0 overflow-hidden bg-white rounded-3xl border-none">
                    <DialogHeader className="hidden">
                        <DialogTitle>결제 확인</DialogTitle>
                        <DialogDescription>결제를 진행하기 전 확인하세요.</DialogDescription>
                    </DialogHeader>
                    <div className="p-8 space-y-6 text-center">
                        <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto">
                            <CreditCard size={32} className="text-rose-500" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-foreground">결제를 진행할까요?</h3>
                            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                                {item?.name}<br />
                                <span className="text-rose-500 font-bold text-lg">
                                    {formatPrice(grandTotal).replace('원', 'P')}
                                </span>
                                이 차감됩니다.
                            </p>
                        </div>
                        <div className="px-4 py-3 bg-rose-50 rounded-2xl text-sm text-rose-600 font-medium">
                            수량: <span className="font-bold">{quantity}개</span>
                            {totalPrice >= 50000 ? ' · 배송비 무료' : ` · 배송비 ${formatPrice(deliveryFee)}`}
                        </div>
                        <div className="flex gap-3 pt-2">
                            <button
                                onClick={() => setIsPayConfirmOpen(false)}
                                className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-all"
                            >
                                취소
                            </button>
                            <button
                                onClick={handlePayment}
                                className="flex-[1.5] py-3 btn-primary-gradient text-white font-bold rounded-2xl shadow-lg active:scale-95 transition-all"
                            >
                                결제하기
                            </button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </Layout>
    );
}
