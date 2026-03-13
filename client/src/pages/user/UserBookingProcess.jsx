import { useState, useEffect } from 'react';
import { useLocation, useParams } from 'wouter';
import Layout from '@/components/Layout';
import { formatPrice } from '@/lib/data';
import { toast } from 'sonner';
import { resApi, payApi } from '@/lib/api';
import { ChevronLeft, CheckCircle2, CreditCard, AlertCircle, Ticket, MapPin } from 'lucide-react';
import { MapView } from '@/components/Map';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

export default function UserBookingProcess() {
    const [, setLocation] = useLocation();
    const params = useParams();
    const eventId = params.id;
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);

    const [step, setStep] = useState(1);
    const [ticketCount, setTicketCount] = useState(1);
    const [reservationResult, setReservationResult] = useState(null);
    const [isMapOpen, setIsMapOpen] = useState(false);
    const [userPoints, setUserPoints] = useState(0);

    const fetchUserPoints = async () => {
        try {
            const { data } = await payApi.get('/payment/');
            setUserPoints(data.currentBalance || 0);
        } catch (error) {
            console.error('Failed to fetch wallet info:', error);
        }
    };

    useEffect(() => {
        const fetchEventDetail = async () => {
            try {
                setLoading(true);
                const { data } = await resApi.get(`/events/${eventId}`);
                const e = data.event || data;
                
                setEvent({
                    id: e.event_id,
                    title: e.title,
                    price: e.price || 0,
                    remaining: e.available_seats || 0,
                    venue: e.venue || e.location_name || 'KSPO DOME',
                    date: e.event_date ? new Date(e.event_date).toLocaleDateString() : 'TBD',
                    time: e.open_time ? new Date(e.open_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'TBD'
                });
            } catch (error) {
                toast.error('이벤트 상세 정보를 가져오는데 실패했습니다.');
                console.error('Fetch event detail error:', error);
            } finally {
                setLoading(false);
            }
        };

        if (eventId) {
            fetchEventDetail();
            fetchUserPoints();
        }
    }, [eventId]);

    const handleMapReady = async (map) => {
        try {
            if (event?.venue) {
                map.addMarker({ lat: 37.5203, lng: 127.1155 }, event.venue);
            }

            const { data } = await resApi.get(`/events/${eventId}/location`);
            
            if (data) {
                const location = { 
                    lat: parseFloat(data.lat || 37.5203), 
                    lng: parseFloat(data.lng || 127.1155) 
                };
                map.setCenter(location);
                map.addMarker(location, data.venue || data.location_name || event?.venue);
            }
        } catch (error) {
            console.error("Failed to fetch event location:", error);
        }
    };

    if (loading) {
        return (
            <Layout role="user">
                <div className="p-4 lg:p-6 flex justify-center items-center h-64">
                    <p className="text-muted-foreground">결제 정보를 준비하는 중...</p>
                </div>
            </Layout>
        );
    }

    if (!event) {
        return (
            <Layout role="user">
                <div className="p-4 lg:p-6 flex flex-col justify-center items-center h-64">
                    <p className="text-muted-foreground mb-4">결제할 이벤트를 찾을 수 없습니다.</p>
                    <button onClick={() => setLocation('/user/events')} className="text-rose-600 hover:underline">
                        목록으로 돌아가기
                    </button>
                </div>
            </Layout>
        );
    }

    const totalPrice = event.price * ticketCount;
    const grandTotal = totalPrice + (ticketCount * 1000);
    const isEnoughPoints = userPoints >= grandTotal;

    const handleNext = () => {
        if (step === 1 && ticketCount > 0) setStep(2);
        else if (step === 2 && isEnoughPoints) setStep(3);
    };

    return (
        <Layout role="user">
            <div className="p-4 lg:p-6 pb-24 max-w-2xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex items-center gap-3 border-b border-rose-100 pb-4">
                    <button
                        onClick={() => step > 1 ? setStep(step - 1) : setLocation(`/user/events/${event.id}`)}
                        className="p-2 -ml-2 text-muted-foreground hover:bg-rose-50 rounded-full transition-colors"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>예약 진행</h1>
                        <p className="text-sm text-muted-foreground line-clamp-1">{event.title}</p>
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
                                {s === 1 ? '티켓 선택' : s === 2 ? '결제 수단' : '예약 완료'}
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

                {/* Step 1: Ticket Selection */}
                {step === 1 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="glass-card p-6 rounded-3xl soft-shadow space-y-4">
                            <h2 className="font-bold text-lg mb-2">수량 선택</h2>

                            <div className="flex items-center justify-between p-4 bg-white border border-rose-100 rounded-2xl">
                                <div>
                                    <p className="font-semibold">{formatPrice(event.price)} <span className="text-xs text-muted-foreground font-normal">/ 1매</span></p>
                                    <p className="text-sm text-rose-500 font-medium">잔여석 {event.remaining}석</p>
                                </div>

                                <div className="flex items-center gap-4 bg-rose-50 rounded-xl p-1 shadow-inner">
                                    <button
                                        onClick={() => setTicketCount(Math.max(1, ticketCount - 1))}
                                        className="w-8 h-8 flex items-center justify-center bg-white rounded-lg text-rose-600 hover:bg-rose-100 shadow-sm"
                                    >
                                        -
                                    </button>
                                    <span className="font-bold w-4 text-center">{ticketCount}</span>
                                    <button
                                        onClick={() => setTicketCount(Math.min(4, Math.min(event.remaining, ticketCount + 1)))}
                                        className="w-8 h-8 flex items-center justify-center bg-white rounded-lg text-rose-600 hover:bg-rose-100 shadow-sm"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground px-2 pb-2">1인당 최대 4매까지 예매 가능합니다.</p>

                            <div className="flex justify-between items-center p-4 bg-rose-50 rounded-2xl">
                                <span className="font-medium text-muted-foreground">총 결제 금액</span>
                                <span className="text-xl font-bold text-rose-600">{formatPrice(totalPrice)}</span>
                            </div>
                        </div>

                        <button
                            onClick={handleNext}
                            className="w-full py-3.5 btn-primary-gradient text-white rounded-2xl font-bold shadow-md"
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
                            <div className="flex justify-between text-sm"><span>티켓 상품 금액</span> <span>{formatPrice(totalPrice)}</span></div>
                            <div className="flex justify-between text-sm"><span>예매 수수료</span> <span>{formatPrice(ticketCount * 1000)}</span></div>
                            <div className="flex justify-between text-lg font-bold pt-3 border-t border-rose-100 mt-2 text-rose-600">
                                <span>총 차감 포인트</span>
                                <span>{formatPrice(grandTotal).replace('원', 'P')}</span>
                            </div>
                        </div>

                        <button
                            onClick={async () => {
                                toast.loading('포인트 결제가 진행 중입니다...');
                                const memberId = localStorage.getItem('memberId') || '1';
                                try {
                                    // Backend resController expects: { event_id, ticket_count, member_id }
                                    const { data } = await resApi.post('/reserve', { 
                                        event_id: event.id, 
                                        ticket_count: ticketCount,
                                        member_id: memberId
                                    });
                                    toast.dismiss();
                                    
                                    // Save reservation response to show on completion screen
                                    setReservationResult({
                                        ticket_code: data.ticket_id || data.ticketCode
                                    });
                                    handleNext();
                                } catch (error) {
                                    toast.dismiss();
                                    toast.error(error.response?.data?.message || error.response?.data?.error || '예약 결제에 실패했습니다.');
                                }
                            }}
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

                        <h2 className="text-2xl font-bold mb-2">예약이 완료되었습니다!</h2>
                        <p className="text-muted-foreground text-sm max-w-[250px] mx-auto mb-8">
                            입장 바코드 및 자세한 예매 정보는 '내 예매 내역'에서 확인할 수 있습니다.
                        </p>

                        <div className="glass-card p-4 rounded-2xl text-left bg-white inline-block w-full max-w-sm">
                            <div className="flex items-center justify-center border-b border-dashed border-rose-200 pb-4 mb-4">
                                <Ticket className="text-rose-400 mr-2" />
                                <span className="font-bold text-rose-500 tracking-widest font-mono">
                                    TICKET ID: {reservationResult?.ticket_code || Math.floor(Math.random() * 10000) + 80000}
                                </span>
                            </div>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between"><span className="text-muted-foreground">공연명</span> <span className="font-semibold line-clamp-1 flex-1 text-right ml-4">{event.title}</span></div>
                                <div className="flex justify-between"><span className="text-muted-foreground">관람일</span> <span className="font-semibold">{event.date} {event.time}</span></div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">장소</span> 
                                    <div className="text-right">
                                        <span className="font-semibold block">{event.venue}</span>
                                        <button 
                                            onClick={() => setIsMapOpen(true)}
                                            className="text-xs text-rose-500 font-medium hover:underline mt-1"
                                        >
                                            장소 보기 안내
                                        </button>
                                    </div>
                                </div>
                                <div className="flex justify-between"><span className="text-muted-foreground">매수</span> <span className="font-semibold">{ticketCount}매</span></div>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-6">
                            <button
                                onClick={() => setLocation('/user/events')}
                                className="flex-1 py-3.5 bg-gray-100 font-semibold rounded-2xl text-muted-foreground hover:bg-gray-200 transition-colors"
                            >
                                목록으로
                            </button>
                            <button
                                onClick={() => {
                                    toast.info("예매 내역 탭으로 이동합니다.");
                                    setLocation('/user/events');
                                }}
                                className="flex-1 py-3.5 btn-primary-gradient text-white font-semibold rounded-2xl shadow-sm hover:shadow-md transition-shadow"
                            >
                                예매 내역 확인
                            </button>
                        </div>
                    </div>
                )}

                {/* Map Modal */}
                <Dialog open={isMapOpen} onOpenChange={setIsMapOpen}>
                    <DialogContent className="sm:max-w-2xl p-0 overflow-hidden bg-white rounded-3xl border-none">
                        <DialogHeader className="p-6 pb-2">
                            <DialogTitle className="text-xl font-bold flex items-center gap-2">
                                <MapPin className="text-rose-500" size={20} />
                                공연장 위치 안내
                            </DialogTitle>
                        </DialogHeader>
                        <div className="p-6 pt-0 space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-bold text-foreground">{event.venue}</p>
                                    <p className="text-xs text-muted-foreground">정확한 위치는 지도를 참조해주세요.</p>
                                </div>
                            </div>
                            <div className="rounded-2xl overflow-hidden border border-rose-100 h-[400px]">
                                <MapView 
                                    className="h-full w-full"
                                    onMapReady={handleMapReady}
                                />
                            </div>
                            <div className="flex justify-end pt-2">
                                <button 
                                    onClick={() => setIsMapOpen(false)}
                                    className="px-6 py-2 bg-rose-50 text-rose-600 font-bold rounded-xl text-sm hover:bg-rose-100 transition-colors"
                                >
                                    닫기
                                </button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </Layout>
    );
}
