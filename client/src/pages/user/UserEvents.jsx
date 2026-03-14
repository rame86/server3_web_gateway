/*
 * Lumina - User Events & Booking Page
 * Soft Bloom Design: Event cards with booking flow
 */

import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import Layout from '@/components/Layout';
import { Calendar, MapPin, Users, Ticket, Search, Filter } from 'lucide-react';
import { formatPrice, eventTypeLabel, eventTypeBadgeClass } from '@/lib/data';
import { toast } from 'sonner';
import { resApi } from '@/lib/api';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const EVENT_BANNER = 'https://private-us-east-1.manuscdn.com/sessionFile/umqDS2iCyxhwdKkQqabwQ5/sandbox/5OYI281mcXf2naQYMxZ8bN-img-4_1771469993000_na1fn_ZXZlbnQtYmFubmVy.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvdW1xRFMyaUN5eGh3ZEtrUXFhYndRNS9zYW5kYm94LzVPWUkyODFtY1hmMm5hUVlNeFo4Yk4taW1nLTRfMTc3MTQ2OTk5MzAwMF9uYTFmbl9aWFpsYm5RdFltRnVibVZ5LnBuZz94LW9zcy1wcm9jZXNzPWltYWdlL3Jlc2l6ZSx3XzE5MjAsaF8xOTIwL2Zvcm1hdCx3ZWJwL3F1YWxpdHkscV84MCIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTc5ODc2MTYwMH19fV19&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=SpS9~fyVvbYsm2qctqJZV9eUrlIfhyCabWJgO-3X5SXV2pHfoLaIwtRR7ue8UIvhE3Yng8ezsBmKmhnHeDqN0FT-1aftlegleiZ6X8~5TtlKRrpO5wjQmWXVdO--NP31HCS0i55-KKwDDcNu~XzhMXd1lgbpZ9CRTP5eHveHhlJlsdAVoePEwGYZDhXZoSAe7TF1VEVQ16GXCSk1k63Poa0dON-KDYYNzP1NTW7kXD-aHpMalMS7WTrQbeqDv3lr3Dynh~jEekjHzTnuRpERwFfcMZEaBQ213--VePnE6oNHUb~pnkMQdc7myD2YF~EA~OkcBxEoLNJXBN~HtICNzw__';

const tabs = [
  { key: 'events', label: '이벤트 목록' },
  { key: 'my-bookings', label: '내 예매 내역' }];

const statusConfig = {
  confirmed: { label: '예매 확정', class: 'bg-teal-100 text-teal-700' },
  refund_pending: { label: '환불 진행 중', class: 'bg-indigo-100 text-indigo-700' }, // 🌟 추가
  refund_success: { label: '환불 완료', class: 'bg-gray-100 text-gray-500' },
  cancelled: { label: '취소됨', class: 'bg-gray-200 text-gray-600' },
  pending: { label: '대기 중', class: 'bg-amber-100 text-amber-700' }
};

export default function UserEvents() {
  const [activeTab, setActiveTab] = useState('events');
  const [, setLocation] = useLocation();
  const [events, setEvents] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('전체');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const handleViewDetail = (booking) => {
    setSelectedBooking(booking);
    setIsDetailOpen(true);
  };

  // 2. 환불 요청하기
  const handleRefundRequest = async (booking) => {
    const memberId = localStorage.getItem('memberId'); // 🌟 여기도 하드코딩 제거
    
    if (!memberId) {
      toast.error("로그인이 필요한 서비스입니다.");
      return;
    }

    if (!window.confirm(`'${booking.eventTitle}' 예매를 취소하시겠습니까?`)) return;

    try {
      // 🌟 백엔드 컨트롤러 구조 { ticket_code, member_id, refund_reason } 에 맞춤
      const response = await resApi.post('/refund', {
            ticket_code: booking.ticketCode, // 👈 booking.ticketCode 값을 ticket_code 키로 보냄
            member_id: memberId,            // 👈 member_id 로 보냄
            refund_reason: "사용자 직접 취소"  // 👈 refund_reason 으로 보냄
        });

      if (response.status === 202 || response.status === 200) {
            toast.success('환불 요청이 관리자에게 전달되었습니다.');
            
            // 목록 새로고침 로직
            const current = activeTab;
            setActiveTab('events'); 
            setTimeout(() => setActiveTab(current), 10);
        }
    } catch (error) {
        console.error("Refund error:", error);
        // 백엔드에서 보낸 "환불에 필요한 티켓 코드가 없습니다." 메시지가 여기 뜰 거야
        const serverMsg = error.response?.data?.message || '취소 요청 중 오류가 발생했습니다.';
        toast.error(serverMsg);
    }
};

  useEffect(() => {
    const mapBackendEvent = (e) => ({
      id: e.event_id,
      title: e.title,
      artistId: e.artist_id ? Number(e.artist_id) : null,
      artistName: e.artist_name || 'Artist',
      type: (e.event_type || 'fanmeeting').toLowerCase(),
      date: e.event_date ? new Date(e.event_date).toLocaleDateString() : 'TBD',
      time: e.open_time ? new Date(e.open_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'TBD',
      venue: e.event_locations?.venue || (Array.isArray(e.event_locations) ? e.event_locations[0]?.venue : null) || e.venue || '장소 미정',
      capacity: e.total_capacity || 0,
      remaining: e.available_seats || 0,
      price: e.price || 0,
      image: (e.images && e.images.length > 0) ? e.images[0] : 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&h=300&fit=crop'
    });

    const fetchEvents = async () => {
      try {
        setLoading(true);
        const { data } = await resApi.get('/events');
        const rawEvents = data.events || data;
        const eventsArray = Array.isArray(rawEvents) ? rawEvents : [];
        setEvents(eventsArray.map(mapBackendEvent));
      } catch (error) {
        toast.error('이벤트 목록을 가져오는데 실패했습니다.');
        setEvents([]);
        console.error('Fetch events error:', error);
      } finally {
        setLoading(false);
      }
    };

 // UserEvents.jsx 내부의 fetchBookings 함수만 이 내용으로 교체!
    const fetchBookings = async () => {
      // 1. 현재 테스트 중인 16번 유저 ID를 우선적으로 가져오도록 설정
      const memberId = localStorage.getItem('memberId');
      
      console.log("🛠️ fetchBookings 실행됨! 조회 ID:", memberId);
      
      try {
        setLoading(true);
        // 2. 백엔드 라우트 /member/:memberId 호출 (이미 구현된 백엔드 경로)
        const { data } = await resApi.get(`/member/${memberId}`);
        
        console.log("📡 서버에서 온 데이터:", data);
        
        // 3. Prisma 응답은 배열이므로 바로 rawBookings에 할당
        const rawBookings = Array.isArray(data.data) ? data.data : [];
        
        // 4. 데이터 매핑 (include된 events 객체 참조)
        const mappedBookings = rawBookings.map(b => ({
            id: b.reservation_id,
            // 백엔드 include: { events: true } 결과에 맞춰서 참조
            eventTitle: b.events?.title || '공연명 없음',
            artistName: b.events?.artist_name || '아티스트',
            date: b.events?.event_date ? new Date(b.events.event_date).toLocaleDateString() : 'TBD',
            
            // 장소 정보 (events 테이블에 바로 venue가 있다면)
            venue: b.events?.event_locations?.venue || b.events?.venue || '장소 미정',
            
            seats: b.ticket_count || 0,
            totalPrice: b.pure_price || 0,
            status: (b.status || 'confirmed').toLowerCase(),
            ticketCode: b.ticket_code
        }));

        setBookings(mappedBookings);
        console.log("✅ 매핑된 예매 내역:", mappedBookings);
      } catch (error) {
        console.error('Fetch bookings error:', error);
        toast.error('내 예매 내역을 가져오는데 실패했습니다.');
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };

    if (activeTab === 'events') {
        fetchEvents();
    } else if (activeTab === 'my-bookings') {
        fetchBookings();
    }
  }, [activeTab]);

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         event.artistName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === '전체' || eventTypeLabel[event.type] === filterType;
    return matchesSearch && matchesFilter;
  });

  return (
    <Layout role="user">
      <div className="p-4 lg:p-6 space-y-6">
        {/* Banner */}
        <div className="relative overflow-hidden rounded-3xl h-36">
          <img src={EVENT_BANNER} alt="이벤트" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
          <div className="absolute inset-0 flex items-center px-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Calendar size={18} className="text-white" />
                <span className="text-white/80 text-sm font-medium">Events</span>
              </div>
              <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
                이벤트 & 예매
              </h1>
              <p className="text-white/70 text-sm">팬미팅, 팬사인회, 팬파티 예매</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 bg-rose-50 p-1 rounded-2xl">
          {tabs.map((tab) =>
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === tab.key ?
                  'bg-white text-rose-600 shadow-sm' :
                  'text-muted-foreground hover:text-foreground'}`
              }>

              {tab.label}
            </button>
          )}
        </div>

        {activeTab === 'events' &&
          <>
            {/* Search */}
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="이벤트 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-white border border-rose-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" />

              </div>
              <button
                onClick={() => toast.info('고급 필터 기능 준비 중입니다')}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-rose-100 rounded-xl text-sm font-medium text-muted-foreground hover:bg-rose-50 transition-colors">

                <Filter size={16} />
                필터
              </button>
            </div>

            {/* Event type filter */}
            <div className="flex gap-2 overflow-x-auto pb-1">
              {['전체', '팬미팅', '팬사인회', '팬파티', '콘서트'].map((type) =>
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${filterType === type ?
                      'bg-rose-500 text-white' :
                      'bg-white border border-rose-100 text-muted-foreground hover:bg-rose-50'}`
                  }>

                  {type}
                </button>
              )}
            </div>

            {/* Events List */}
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-10 text-muted-foreground">로딩 중...</div>
              ) : filteredEvents.length > 0 ? (
                filteredEvents.map((event) =>
                  <div key={event.id} className="glass-card rounded-2xl overflow-hidden soft-shadow hover-lift">
                    <div className="flex flex-col sm:flex-row">
                      <div className="relative sm:w-48 h-36 sm:h-auto flex-shrink-0">
                        <img
                          src={event.image}
                          alt={event.title}
                          className="w-full h-full object-cover" />

                        <div className="absolute top-2 left-2">
                          <span className={`px-2 py-1 rounded-lg text-xs font-bold ${eventTypeBadgeClass[event.type]}`}>
                            {eventTypeLabel[event.type]}
                          </span>
                        </div>
                      </div>
                      <div className="p-4 flex-1">
                        <h3 className="font-bold text-foreground mb-2">{event.title}</h3>
                        <div className="space-y-1.5 mb-3">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar size={14} className="text-rose-400" />
                            {event.date} {event.time}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin size={14} className="text-rose-400" />
                            {event.venue}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Users size={14} className="text-rose-400" />
                            잔여석 {event.remaining}석 / {event.capacity}석
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-xl font-bold text-rose-600">{formatPrice(event.price)}</span>
                            <span className="text-xs text-muted-foreground ml-1">/ 1인</span>
                          </div>
                          <button
                            onClick={() => setLocation(`/user/events/${event.id}`)}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-xl btn-primary-gradient shadow-sm">

                            <Ticket size={14} />
                            예매하기
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              ) : (
                <div className="text-center py-10 text-muted-foreground">검색 결과가 없습니다.</div>
              )}
            </div>
          </>
        }

        {/* 내 예매 내역 리스트 출력 부분 */}
       {activeTab === 'my-bookings' &&
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
              내 예매 내역
            </h2>
            {bookings.length > 0 ? (
              bookings.map((booking) =>
                <div key={booking.id} className="glass-card rounded-2xl p-4 soft-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      {/* 🌟 수정: mappedBookings에서 매핑한 필드명으로 출력 */}
                      <h3 className="font-bold text-foreground text-sm">{booking.eventTitle}</h3>
                      <p className="text-xs text-muted-foreground">{booking.artistName}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${statusConfig[booking.status]?.class || 'bg-gray-100'}`}>
                      {statusConfig[booking.status]?.label || '확인 중'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Calendar size={12} className="text-rose-400" />
                      {booking.date}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <MapPin size={12} className="text-rose-400" />
                      {booking.venue}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Ticket size={12} className="text-rose-400" />
                      {booking.seats}매
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-600">
                      {formatPrice(booking.totalPrice)}
                    </div>
                  </div>
                  {booking.ticketCode && (
                    <div className="mb-3 p-2 bg-rose-50 rounded-lg border border-rose-100">
                        <p className="text-[10px] text-rose-400 font-semibold uppercase tracking-wider mb-0.5">Ticket Code</p>
                        <p className="text-sm font-mono font-bold text-rose-700">{booking.ticketCode}</p>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <button
                        onClick={() => handleViewDetail(booking)} // 🌟 상세보기 연결
                        className="flex-1 py-2 text-xs font-semibold text-rose-600 bg-rose-50 rounded-xl hover:bg-rose-100 transition-colors"
                    >
                        상세보기
                    </button>
                    {booking.status !== 'cancelled' && booking.status !== 'refunded' && (
                        <button
                            onClick={() => handleRefundRequest(booking)} // 🌟 취소/환불 연결
                            className="flex-1 py-2 text-xs font-semibold text-muted-foreground bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                        >
                            취소/환불
                        </button>
                    )}
                </div>
                </div>
              )
            ) : (
              <div className="text-center py-10 text-muted-foreground">예매 내역이 없습니다.</div>
            )}
          </div>
        }
      </div>

      {/* 예매 상세 정보 모달 */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        {/* 🌟 중요: p-0 border-none으로 기본 스타일 다 날리고 max-w-md로 고정해 */}
        <DialogContent className="max-w-[95vw] sm:max-w-[420px] bg-white rounded-[32px] p-0 border-none overflow-hidden shadow-2xl outline-none">
          
          <div className="p-8 space-y-6">
            {/* Header 영역 */}
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <DialogTitle className="text-2xl font-bold text-[#1A1A1A]">예매 상세 정보</DialogTitle>
                <p className="text-[11px] text-[#999] font-bold uppercase tracking-[0.2em]">Ticket Details</p>
              </div>
            </div>

            {selectedBooking && (
              <div className="space-y-6">
                {/* 🌟 핑크 카드 섹션 */}
                <div className="bg-[#FFF5F6] rounded-[24px] p-6 border border-[#FFE4E8]">
                  <h4 className="text-[#FF4D6D] font-bold text-xl mb-1 leading-snug">
                    {selectedBooking.eventTitle}
                  </h4>
                  <p className="text-[#555] font-semibold text-sm mb-4">{selectedBooking.artistName}</p>
                  
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2.5 text-xs text-[#777]">
                      <Calendar size={14} className="text-[#FF8095]" />
                      <span className="font-medium">{selectedBooking.date}</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs text-[#777]">
                      <MapPin size={14} className="text-[#FF8095]" />
                      <span className="font-medium">{selectedBooking.venue}</span>
                    </div>
                  </div>
                </div>

                {/* 결제 정보 내역 */}
                <div className="px-1 space-y-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-[#888] font-medium">티켓 수량</span>
                    <span className="text-[#1A1A1A] font-bold">{selectedBooking.seats}매</span>
                  </div>
                  {/* 🌟 여기에 좌석 정보 추가! (좌석 데이터가 있을 때만 렌더링) */}
                  {selectedBooking.selected_seats && selectedBooking.selected_seats.length > 0 && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-[#888] font-medium">선택 좌석</span>
                      <span className="text-[#1A1A1A] font-bold">
                        {selectedBooking.selected_seats.join(', ')}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-[#888] font-medium">티켓 가격(순수)</span>
                    <span className="text-[#FF4D6D] font-bold text-base">
                      {formatPrice(selectedBooking.totalPrice)}
                    </span>
                  </div>
                  <div className="pt-4 border-t border-dashed border-[#EEE] flex justify-between items-center">
                    <span className="text-sm font-bold text-[#1A1A1A]">예매 상태</span>
                    <span className={`text-[11px] font-bold px-3 py-1.5 rounded-full ${statusConfig[selectedBooking.status]?.class}`}>
                      {statusConfig[selectedBooking.status]?.label}
                    </span>
                  </div>
                </div>

                {/* 🌟 티켓 코드 섹션 (회색 박스) */}
                <div className="bg-[#F8F9FA] rounded-[20px] p-5 flex flex-col items-center justify-center border border-[#F0F0F0]">
                  <p className="text-[10px] text-[#AAA] font-bold uppercase mb-2 tracking-widest">Electronic Ticket Code</p>
                  <p className="text-lg font-mono font-black text-[#1A1A1A] tracking-[0.15em]">
                    {selectedBooking.ticketCode}
                  </p>
                </div>

                {/* 하단 버튼: 꽉 차게 설정 */}
                <button
                  onClick={() => setIsDetailOpen(false)}
                  className="w-full py-4 bg-[#1A1A1A] text-white rounded-[18px] font-bold text-sm hover:bg-black transition-all active:scale-[0.98] shadow-lg mt-2"
                >
                  확인 및 닫기
                </button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Layout>);
}