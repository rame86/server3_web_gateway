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

    /* -----------------------------------------------------------
     * [STATE] 상태 관리 영역
     * ----------------------------------------------------------- */
    const [event, setEvent] = useState(null);               // 공연 정보
    const [loading, setLoading] = useState(true);           // 로딩 상태
    const [step, setStep] = useState(1);                    // 예매 단계
    const [ticketCount, setTicketCount] = useState(1);      // 일반 티켓 수량
    const [selectedSeats, setSelectedSeats] = useState([]); // 선택된 좌석 번호
    const [reservationResult, setReservationResult] = useState(null); // 예약 결과
    const [isMapOpen, setIsMapOpen] = useState(false);      // 지도 모달 여부
    const [userPoints, setUserPoints] = useState(0);        // 보유 포인트

    /* -----------------------------------------------------------
     * [CONFIG] 특정 공연장 좌석 설정
     * ----------------------------------------------------------- */
    const venueSeatMaps = {
        '잠실구장': { rows: 5, cols: 10, total: 50 },
        '상암월드컵': { rows: 10, cols: 10, total: 100 },
        '고덕구장': { rows: 10, cols: 20, total: 200 }
    };

    /* -----------------------------------------------------------
     * [DATA FETCHING] 데이터 로드
     * ----------------------------------------------------------- */
    const fetchUserPoints = async () => {
        try {
            const { data } = await payApi.get('/payment/');
            setUserPoints(data.currentBalance || 0);
        } catch (error) {
            console.error('포인트 조회 실패:', error);
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
                    venue: e.venue || e.location_name || '미지정 공연장',
                    date: e.event_date ? new Date(e.event_date).toLocaleDateString() : 'TBD',
                    time: e.open_time ? new Date(e.open_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'TBD'
                });
            } catch (error) {
                toast.error('공연 정보를 가져오는데 실패했어.');
            } finally {
                setLoading(false);
            }
        };

        if (eventId) {
            fetchEventDetail();
            fetchUserPoints();
        }
    }, [eventId]);

    /* -----------------------------------------------------------
     * [HELPER] 로직 관련 헬퍼 함수
     * ----------------------------------------------------------- */
    const currentVenueConfig = event ? venueSeatMaps[event.venue] : null;
    const isSeatSelectionMode = !!currentVenueConfig;

    const handleSeatClick = (seatId) => {
        if (selectedSeats.includes(seatId)) {
            setSelectedSeats(selectedSeats.filter(id => id !== seatId));
        } else {
            if (selectedSeats.length >= 4) {
                toast.error("최대 4매까지만 고를 수 있어.");
                return;
            }
            setSelectedSeats([...selectedSeats, seatId]);
        }
    };

    const finalTicketCount = isSeatSelectionMode ? selectedSeats.length : ticketCount;
    const totalPrice = (event?.price || 0) * finalTicketCount;
    const grandTotal = totalPrice + (finalTicketCount * 1000); 
    const isEnoughPoints = userPoints >= grandTotal;

    const handleNext = () => {
        if (step === 1) {
            if (isSeatSelectionMode && selectedSeats.length === 0) {
                toast.error("좌석을 먼저 선택해줘!");
                return;
            }
            setStep(2);
        } else if (step === 2 && isEnoughPoints) {
            setStep(3);
        }
    };

    /* -----------------------------------------------------------
     * [MAP LOGIC] 지도 위치 핸들러 (기본값: 서강대학교)
     * ----------------------------------------------------------- */
    const handleMapReady = async (map) => {
        try {
            const { data } = await resApi.get(`/events/${eventId}/location`);
            // 데이터가 없으면 서강대 좌표(37.5509, 126.9410) 사용
            const location = { 
                lat: parseFloat(data?.lat || 37.5509), 
                lng: parseFloat(data?.lng || 126.9410) 
            };
            map.setCenter(location);
            map.addMarker(location, event?.venue || "서강대학교");
        } catch (error) {
            console.error("공연장 위치 조회 실패. 기본 위치를 표시해:", error);
            const defaultLoc = { lat: 37.5509, lng: 126.9410 };
            map.setCenter(defaultLoc);
            map.addMarker(defaultLoc, "서강대학교");
        }
    };

    if (loading) return <Layout role="user"><div className="p-6 text-center">정보 로딩 중...</div></Layout>;
    if (!event) return <Layout role="user"><div className="p-6 text-center">정보 없음</div></Layout>;

    return (
        <Layout role="user">
            <div className="p-4 lg:p-6 pb-24 max-w-2xl mx-auto space-y-6">
                
                {/* 상단 헤더 */}
                <div className="flex items-center gap-3 border-b border-rose-100 pb-4">
                    <button onClick={() => step > 1 ? setStep(step - 1) : setLocation(`/user/events/${event.id}`)} className="p-2 -ml-2 text-muted-foreground hover:bg-rose-50 rounded-full transition-colors">
                        <ChevronLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold">예약 진행</h1>
                        <p className="text-sm text-muted-foreground line-clamp-1">{event.title}</p>
                    </div>
                </div>

                {/* STEP 1: 좌석/수량 선택 */}
                {step === 1 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="glass-card p-6 rounded-3xl soft-shadow space-y-4">
                            <h2 className="font-bold text-lg mb-2">
                                {isSeatSelectionMode ? `${event.venue} 좌석 선택` : '예매 수량 선택'}
                            </h2>

                            {isSeatSelectionMode ? (
                                <div className="seat-selection-wrapper py-4">
                                    <div className="stage mb-8">STAGE</div>
                                    <div className="seat-grid flex flex-col gap-2 items-center overflow-x-auto pb-4">
                                        {Array.from({ length: currentVenueConfig.rows }).map((_, rIdx) => (
                                            <div key={rIdx} className="flex gap-2 items-center">
                                                <span className="text-[10px] text-gray-400 w-4 text-center">{String.fromCharCode(65 + rIdx)}</span>
                                                {Array.from({ length: currentVenueConfig.cols }).map((_, sIdx) => {
                                                    const seatId = `${String.fromCharCode(65 + rIdx)}${sIdx + 1}`;
                                                    const isSelected = selectedSeats.includes(seatId);
                                                    return (
                                                        <div 
                                                            key={sIdx} 
                                                            className={`seat ${isSelected ? 'selected' : ''}`} 
                                                            onClick={() => handleSeatClick(seatId)}
                                                        >
                                                            {sIdx + 1}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ))}
                                    </div>
                                    <div className="text-sm text-center text-muted-foreground mt-4">
                                        선택 좌석: <span className="text-rose-600 font-bold">{selectedSeats.length > 0 ? selectedSeats.join(', ') : '없음'}</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center justify-between p-4 bg-white border border-rose-100 rounded-2xl">
                                    <div>
                                        <p className="font-semibold">{formatPrice(event.price)}</p>
                                        <p className="text-sm text-rose-500 font-medium">잔여석 {event.remaining}석</p>
                                    </div>
                                    <div className="flex items-center gap-4 bg-rose-50 rounded-xl p-1">
                                        <button onClick={() => setTicketCount(Math.max(1, ticketCount - 1))} className="w-8 h-8 flex items-center justify-center bg-white rounded-lg text-rose-600">-</button>
                                        <span className="font-bold w-4 text-center">{ticketCount}</span>
                                        <button onClick={() => setTicketCount(Math.min(4, Math.min(event.remaining, ticketCount + 1)))} className="w-8 h-8 flex items-center justify-center bg-white rounded-lg text-rose-600">+</button>
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-between items-center p-4 bg-rose-50 rounded-2xl">
                                <span className="font-medium text-muted-foreground">총 결제 금액</span>
                                <span className="text-xl font-bold text-rose-600">{formatPrice(totalPrice)}</span>
                            </div>
                        </div>

                        <button onClick={handleNext} className="w-full py-3.5 btn-primary-gradient text-white rounded-2xl font-bold">
                            다음 단계로
                        </button>
                    </div>
                )}

                {/* STEP 2: 포인트 결제 */}
                {step === 2 && (
                    <div className="space-y-6">
                         {/* 결제 수단 카드 */}
                         <div className="glass-card p-6 rounded-3xl soft-shadow space-y-4">
                            <h2 className="font-bold text-lg mb-2 flex items-center gap-2">
                                <CreditCard size={20} className="text-rose-500" />
                                포인트 결제
                            </h2>
                            <div className="bg-rose-50 rounded-2xl p-5 border border-rose-100 flex justify-between items-center">
                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">보유 포인트</p>
                                    <p className="text-2xl font-bold text-foreground">{formatPrice(userPoints).replace('원', 'P')}</p>
                                </div>
                                <button onClick={() => setLocation('/user/wallet')} className="px-4 py-2 bg-white text-rose-600 font-semibold rounded-xl text-sm border border-rose-100 shadow-sm hover:bg-rose-50 transition-colors">충전하기</button>
                            </div>
                            {!isEnoughPoints && (
                                <div className="flex items-start gap-2 p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 text-sm">
                                    <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
                                    <p>포인트가 부족해. 충전 후 다시 시도해줘!</p>
                                </div>
                            )}
                        </div>

                        {/* 결제 요약 상세 */}
                        <div className="glass-card p-6 rounded-3xl soft-shadow space-y-3">
                            <h3 className="font-semibold text-sm text-muted-foreground mb-4">결제 요약</h3>
                            <div className="flex justify-between text-sm"><span>티켓 상품 금액</span> <span>{formatPrice(totalPrice)}</span></div>
                            <div className="flex justify-between text-sm"><span>예매 수수료</span> <span>{formatPrice(finalTicketCount * 1000)}</span></div>
                            <div className="flex justify-between text-lg font-bold pt-3 border-t border-rose-100 mt-2 text-rose-600">
                                <span>총 차감 포인트</span>
                                <span>{formatPrice(grandTotal).replace('원', 'P')}</span>
                            </div>
                        </div>

                         <button
                            onClick={async () => {
                                toast.loading('결제 중...');
                                const memberId = localStorage.getItem('memberId') || '1';
                                try {
                                    const { data } = await resApi.post('/reserve', { 
                                        event_id: event.id, 
                                        ticket_count: finalTicketCount,
                                        member_id: memberId,
                                        selected_seats: isSeatSelectionMode ? selectedSeats : null
                                    });
                                    toast.dismiss();
                                    setReservationResult({ ticket_code: data.ticket_id || data.ticketCode });
                                    handleNext();
                                } catch (error) {
                                    toast.dismiss();
                                    toast.error('결제에 실패했어.');
                                }
                            }}
                            disabled={!isEnoughPoints}
                            className="w-full py-4 btn-primary-gradient text-white rounded-2xl font-bold"
                        >
                            {formatPrice(grandTotal).replace('원', 'P')} 결제하기
                        </button>
                    </div>
                )}

                {/* STEP 3: 완료 */}
                {step === 3 && (
                    <div className="space-y-6 text-center">
                        <CheckCircle2 size={40} className="mx-auto text-green-500 mb-4" />
                        <h2 className="text-2xl font-bold">예약 완료!</h2>
                        <div className="glass-card p-4 rounded-2xl text-left inline-block w-full max-w-sm bg-white">
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between"><span>공연명</span><span className="font-semibold">{event.title}</span></div>
                                <div className="flex justify-between">
                                    <span>장소</span>
                                    <div className="text-right">
                                        <span className="font-semibold block">{event.venue}</span>
                                        <button onClick={() => setIsMapOpen(true)} className="text-xs text-rose-500 font-medium hover:underline">장소 보기</button>
                                    </div>
                                </div>
                            </div>
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