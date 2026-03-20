import { useState, useEffect } from 'react';
import { useLocation, useParams } from 'wouter';
import Layout from '@/components/Layout';
import { formatPrice } from '@/lib/data';
import { toast } from 'sonner';
import { resApi, payApi } from '@/lib/api';
import { ChevronLeft, CheckCircle2, CreditCard, AlertCircle, MapPin } from 'lucide-react';
import { MapView } from '@/components/Map';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";

// 🌟 좌석 컴포넌트 불러오기
import UserBookingSeatSelection from './UserBookingSeatSelection';

export default function UserBookingProcess() {
    const [, setLocation] = useLocation();
    const params = useParams();
    const eventId = params.id;

    /* -----------------------------------------------------------
     * [STATE] 상태 관리 영역
     * ----------------------------------------------------------- */
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [step, setStep] = useState(1);
    const [ticketCount, setTicketCount] = useState(1);
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [reservationResult, setReservationResult] = useState(null);
    const [isMapOpen, setIsMapOpen] = useState(false);
    const [userPoints, setUserPoints] = useState(0);

    const MAX_TICKETS = 2; // 1인당 최대 구매 제한 2매

   /* -----------------------------------------------------------
    * [CONFIG] 공연장별 좌석 규모 설정
    * ----------------------------------------------------------- */
    const venueSeatMaps = {
        '루미나50': { rows: 5, cols: 10, total: 50 },
        '루미나100': { rows: 10, cols: 10, total: 100 },
        '루미나200': { rows: 10, cols: 20, total: 200 }
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
                    venue: e.event_locations?.venue || e.venue || e.location_name || '미지정 공연장',
                    date: e.event_date ? new Date(e.event_date).toLocaleDateString() : 'TBD',
                    time: e.open_time ? new Date(e.open_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'TBD',
                    // 🌟 백엔드에서 주는 예약석 배열 (없으면 빈 배열 처리)
                    reserved_seats: data.reservedSeats || e.reservedSeats || [] 
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

    const finalTicketCount = ticketCount;
    const totalPrice = (event?.price || 0) * finalTicketCount;
    const grandTotal = totalPrice + (finalTicketCount * 1000); 
    const isEnoughPoints = userPoints >= grandTotal;

    const handleNext = () => {
        if (step === 1) {
            isSeatSelectionMode ? setStep(2) : setStep(3);
        } else if (step === 2) {
            if (selectedSeats.length !== ticketCount) {
                toast.error(`좌석을 ${ticketCount}개 선택해줘!`);
                return;
            }
            setStep(3);
        } else if (step === 3 && isEnoughPoints) {
            setStep(4);
        }
    };

    const handleBack = () => {
        if (step === 1) setLocation(`/user/events/${event.id}`);
        else if (step === 2) setStep(1);
        else if (step === 3) isSeatSelectionMode ? setStep(2) : setStep(1);
        else setStep(step - 1);
    };

    const handleMapReady = async (map) => {
        try {
            const { data } = await resApi.get(`/events/${eventId}/location`);
            const location = { lat: parseFloat(data?.lat || 37.5509), lng: parseFloat(data?.lng || 126.9410) };
            map.setCenter(location);
            map.addMarker(location, event?.venue || "서강대학교");
        } catch (error) {
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
                    <button onClick={handleBack} className="p-2 -ml-2 text-muted-foreground hover:bg-rose-50 rounded-full transition-colors">
                        <ChevronLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold">예약 진행</h1>
                        <p className="text-sm text-muted-foreground line-clamp-1">{event.title}</p>
                    </div>
                </div>

                {/* 🌟 STEP 1: 매수 선택 */}
                {step === 1 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="glass-card p-6 rounded-3xl soft-shadow space-y-4">
                            <h2 className="font-bold text-lg mb-2">예매 매수 선택</h2>
                            {/* 🌟 루미나 공연장일 때 (좌석 지정 가능) */}
                            {isSeatSelectionMode && (
                                <div className="p-3 bg-rose-50 text-rose-600 rounded-xl text-xs font-medium flex items-start gap-2 border border-rose-100">
                                    <CheckCircle2 size={14} className="mt-0.5" />
                                    <span>이 공연은 **좌석 지정이 가능한** 루미나 전용 공연장입니다! 다음 단계에서 원하는 자리를 선택해주세요.</span>
                                </div>
                            )}
                            {/* 🌟 외부 공연장일 때 (좌석 지정 불가) */}
                            {!isSeatSelectionMode && (
                                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl text-xs font-medium flex items-start gap-2 border border-blue-100">
                                    <AlertCircle size={14} className="mt-0.5" />
                                    <span>이 공연은 지정 좌석을 제공하지 않습니다. 결제 후 선착순 입장이 적용될 수 있으니 참고해주세요!</span>
                                </div>
                            )}
                            <p className="text-sm text-muted-foreground">인당 최대 {MAX_TICKETS}매까지 예매 가능합니다.</p>
                            
                            <div className="flex items-center justify-between p-4 bg-white border border-rose-100 rounded-2xl">
                                <div>
                                    <p className="font-semibold">{formatPrice(event.price)}</p>
                                    <p className="text-sm text-rose-500 font-medium">잔여석 {event.remaining}석</p>
                                </div>
                                <div className="flex items-center gap-4 bg-rose-50 rounded-xl p-1">
                                    <button 
                                        onClick={() => { setTicketCount(Math.max(1, ticketCount - 1)); setSelectedSeats([]); }} 
                                        className="w-8 h-8 flex items-center justify-center bg-white rounded-lg text-rose-600 shadow-sm"
                                    >-</button>
                                    <span className="font-bold w-4 text-center">{ticketCount}</span>
                                    <button 
                                        onClick={() => { setTicketCount(Math.min(MAX_TICKETS, Math.min(event.remaining, ticketCount + 1))); setSelectedSeats([]); }} 
                                        className="w-8 h-8 flex items-center justify-center bg-white rounded-lg text-rose-600 shadow-sm"
                                    >+</button>
                                </div>
                            </div>

                            <div className="flex justify-between items-center p-4 bg-rose-50 rounded-2xl">
                                <span className="font-medium text-muted-foreground">티켓 금액</span>
                                <span className="text-xl font-bold text-rose-600">{formatPrice(totalPrice)}</span>
                            </div>
                        </div>

                        <button onClick={handleNext} className="w-full py-3.5 btn-primary-gradient text-white rounded-2xl font-bold">
                            {isSeatSelectionMode ? '좌석 선택하기' : '결제 단계로'}
                        </button>
                    </div>
                )}

                {/* 🌟 STEP 2: 좌석 선택 */}
                {step === 2 && isSeatSelectionMode && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="glass-card p-6 rounded-3xl soft-shadow space-y-4">
                            <h2 className="font-bold text-lg mb-2">{event.venue} 좌석 선택</h2>
                            <p className="text-sm text-center text-muted-foreground mb-4">선택하신 매수(<span className="font-bold text-rose-500">{ticketCount}매</span>)만큼 좌석을 선택해주세요.</p>

                            {/* 🌟 여기서 컴포넌트를 사용! 복잡한 하드코딩 삭제 완료 */}
                            <UserBookingSeatSelection 
                                rows={currentVenueConfig.rows} 
                                cols={currentVenueConfig.cols} 
                                ticketCount={ticketCount} 
                                reservedSeats={event.reserved_seats} 
                                onSeatSelect={(seats) => setSelectedSeats(seats)} 
                            />
                            
                            <div className="text-sm text-center text-muted-foreground mt-4">
                                선택 좌석: <span className="text-rose-600 font-bold">{selectedSeats.length > 0 ? selectedSeats.join(', ') : '없음'}</span>
                                <span className="block text-xs mt-1">({selectedSeats.length} / {ticketCount} 선택됨)</span>
                            </div>
                        </div>

                        <button 
                            onClick={handleNext} 
                            className={`w-full py-3.5 rounded-2xl font-bold transition-all ${selectedSeats.length === ticketCount ? 'btn-primary-gradient text-white' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                            disabled={selectedSeats.length !== ticketCount}
                        >
                            결제 단계로
                        </button>
                    </div>
                )}

                {/* 🌟 STEP 3: 포인트 결제 */}
                {step === 3 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
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
                                const memberId = localStorage.getItem('memberId');
                                if (!memberId) {
                                    toast.error('로그인이 필요한 서비스야.');
                                    return;
                                }

                                toast.loading('예약 요청 중...', { id: 'pay-toast' });
                                
                                try {
                                    const { data } = await resApi.post('/reserve', { 
                                        event_id: event.id, 
                                        ticket_count: finalTicketCount,
                                        member_id: memberId,
                                        selected_seats: isSeatSelectionMode ? selectedSeats : null
                                    });
                                    
                                    const currentTicketCode = data.ticket_id || data.ticketCode;
                                    setReservationResult({ ticket_code: currentTicketCode });
                                    
                                    // [폴링 시작] 응답(202)을 받으면 바로 넘어가지 않고 2초 간격으로 상태를 찔러봄
                                    toast.loading('결제 확인 중... 잠시만 기다려줘.', { id: 'pay-toast' });
                                    
                                    let attempts = 0;
                                    const maxAttempts = 10; // 무한 루프 방지 (최대 20초 대기)
                                    
                                    const checkStatus = async () => {
                                        if (attempts >= maxAttempts) {
                                            toast.dismiss('pay-toast');
                                            toast.error('결제 확인이 지연되고 있어. 나중에 예매 내역을 확인해줘.');
                                            return;
                                        }
                                        attempts++;
                                        
                                        try {
                                            // 백엔드 상태 조회 API 호출 (URL은 백엔드 라우터 설정에 맞춰 수정 필요)
                                            const statusRes = await resApi.get(`/reservations/status/${currentTicketCode}`);
                                            const { status } = statusRes.data;
                                            
                                            if (status === 'CONFIRMED') {
                                                toast.success('결제 완료!', { id: 'pay-toast' });
                                                // 🌟 결제가 확정된 이 시점에만 Step 4로 넘김
                                                handleNext(); 
                                            } else if (status === 'FAILED') {
                                                toast.error('결제 실패. 포인트를 확인해줘.', { id: 'pay-toast' });
                                            } else {
                                                // PENDING 상태면 2초 뒤 재귀 호출로 다시 확인
                                                setTimeout(checkStatus, 2000); 
                                            }
                                        } catch (err) {
                                            // 상태 조회 실패 시에도 다음 턴에 다시 시도
                                            setTimeout(checkStatus, 2000);
                                        }
                                    };
                                    
                                    checkStatus(); // 폴링 최초 실행

                                } catch (error) {
                                    toast.dismiss('pay-toast');
                                    toast.error('결제 요청에 실패했어.');
                                }
                            }}
                            disabled={!isEnoughPoints}
                            className={`w-full py-4 rounded-2xl font-bold transition-all ${isEnoughPoints ? 'btn-primary-gradient text-white' : 'bg-gray-200 text-gray-400'}`}
                        >
                            {formatPrice(grandTotal).replace('원', 'P')} 결제하기
                        </button>
                    </div>
                )}

                {/* 🌟 STEP 4: 완료 */}
                {step === 4 && (
                    <div className="space-y-6 text-center animate-in zoom-in-95 duration-500">
                        <CheckCircle2 size={40} className="mx-auto text-green-500 mb-4" />
                        <h2 className="text-2xl font-bold">예약 완료!</h2>
                        
                        <div className="glass-card p-4 rounded-2xl text-left inline-block w-full max-w-sm bg-white">
                            <div className="space-y-3 text-sm">
                                {/* 🌟 추가된 티켓(예매) 번호 영역 */}
                                {reservationResult?.ticket_code && (
                                    <div className="flex justify-between pb-3 border-b border-rose-50">
                                        <span className="text-muted-foreground">예매 번호</span>
                                        <span className="font-bold tracking-wider text-rose-600">
                                            {reservationResult.ticket_code}
                                        </span>
                                    </div>
                                )}
                                
                                <div className="flex justify-between pt-1">
                                    <span className="text-muted-foreground">공연명</span>
                                    <span className="font-semibold">{event.title}</span>
                                </div>
                                
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">장소</span>
                                    <div className="text-right">
                                        <span className="font-semibold block">{event.venue}</span>
                                        <button onClick={() => setIsMapOpen(true)} className="text-xs text-rose-500 font-medium hover:underline">
                                            장소 보기
                                        </button>
                                    </div>
                                </div>
                                
                                {isSeatSelectionMode && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">좌석</span>
                                        <span className="font-semibold text-rose-600">{selectedSeats.join(', ')}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 🌟 추가: 예약 완료 후 다음 행동 유도 버튼 */}
                        <div className="pt-4">
                            <button 
                                onClick={() => setLocation('/user/events?tab=my-bookings')} 
                                className="px-6 py-3 bg-rose-50 text-rose-600 font-bold rounded-xl hover:bg-rose-100 transition-colors shadow-sm"
                            >
                                내 예매 내역 확인하기
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
                            <DialogDescription className="text-xs text-muted-foreground hidden">
                                선택하신 공연장의 상세 위치를 지도로 확인할 수 있습니다.
                            </DialogDescription>
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