/*
 * Lumina - User Events & Booking Page
 * Soft Bloom Design: Event cards with booking flow
 */

import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import Layout from '@/components/Layout';
import { Calendar, MapPin, Users, Ticket, Search, Filter, Heart, Sparkles } from 'lucide-react';
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
  pending:         { label: '확인 중',   class: 'bg-yellow-100 text-yellow-600' },
  confirmed:       { label: '예매 완료', class: 'bg-green-100 text-green-600' },
  failed:          { label: '결제 실패', class: 'bg-red-100 text-red-500' },
  refund_pending:  { label: '환불 대기', class: 'bg-blue-100 text-blue-500' },
  refund_rejected: { label: '환불 거절', class: 'bg-red-100 text-red-500' },
  refunded:        { label: '환불 완료', class: 'bg-gray-100 text-gray-500' },
  cancelled:       { label: '취소됨',   class: 'bg-gray-100 text-gray-400' },
};

export default function UserEvents() {
  // 🌟 [추가] URL 파라미터(?tab=...)를 읽어오는 헬퍼 함수
  const getTabFromUrl = () => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    return tabs.some(t => t.key === tab) ? tab : 'events';
  };
  const [activeTab, setActiveTab] = useState('events');
  const [, setLocation] = useLocation();
  const [events, setEvents] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('전체');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [refundTarget, setRefundTarget] = useState(null);
  const handleViewDetail = (booking) => {
    setSelectedBooking(booking);
    setIsDetailOpen(true);
  };
  const [wishlists, setWishlists] = useState(new Set());

  // 🌟 [추가] 로컬 환경 대응용 게이트웨이 주소 설정
  const rawUrl = import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost';
  const gatewayUrl = (rawUrl === 'http://localhost') 
      ? 'http://localhost:8082' 
      : rawUrl.replace(/\/$/, '');

  // 🌟 [추가] 이미지 URL 완성 함수
  const getImageUrl = (url) => {
      if (!url || url.includes('placehold.co')) return 'https://placehold.co/600x400?text=No+Image';
      if (url.startsWith('http')) return url;
      const imagePath = url.startsWith('/') ? url : `/images/res/${url}`;
      return `${gatewayUrl}${imagePath}`;
  };

  const handleRefundRequest = (booking) => {
    const memberId = localStorage.getItem('memberId');
    if (!memberId) {
        toast.error("로그인이 필요한 서비스입니다.");
        return;
    }
    setRefundTarget(booking); // 모달 열기
  };

  const submitRefund = async () => {
    const booking = refundTarget;
    setRefundTarget(null);
    try {
        const memberId = localStorage.getItem('memberId');
        const response = await resApi.post('/refund', {
            ticket_code: booking.ticketCode,
            member_id: memberId,
            refund_reason: "사용자 직접 취소"
        });
        if (response.status === 202 || response.status === 200) {
            toast.success('환불 요청이 관리자에게 전달되었습니다.');
            const current = activeTab;
            setActiveTab('events');
            setTimeout(() => setActiveTab(current), 10);
        }
    } catch (error) {
        const serverMsg = error.response?.data?.message || '취소 요청 중 오류가 발생했습니다.';
        toast.error(serverMsg);
    }
};

  useEffect(() => {
    // 1. 매핑 함수 정의
    const mapBackendEvent = (e) => ({
      id: e.event_id,
      title: e.title,
      artistName: e.artist_name || 'Artist',
      type: (e.event_type || 'fanmeeting').toLowerCase(),
      date: e.event_date ? new Date(e.event_date).toLocaleDateString() : 'TBD',
      venue: e.event_locations?.venue || e.venue || '장소 미정',
      remaining: e.available_seats || 0,
      capacity: e.total_capacity || 0,
      price: e.price || 0,
      image: getImageUrl(e.event_images?.[0]?.image_url || e.image)
    });

    // 2. 이벤트 목록 가져오기
    const fetchEvents = async () => {
      try {
        setLoading(true);
        // 🌟 이미 resApi에 인터셉터가 있다면 headers 설정은 지워도 돼!
        const { data } = await resApi.get('/events');
        const rawEvents = data.events || data;
        setEvents(Array.isArray(rawEvents) ? rawEvents.map(mapBackendEvent) : []);
      } catch (error) {
        console.error('Fetch events error:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchWishlists = async () => {
      const memberId = localStorage.getItem('memberId');
      if (!memberId) return;
      try {
        const { data } = await resApi.get(`/wishlist?memberId=${memberId}`);
        // ✅ event_id를 Number로 강제 변환해서 저장해봐 (백엔드 타입과 일치시키기)
        const ids = new Set((data || []).map(w => Number(w.event_id || w.events?.event_id)));
        setWishlists(ids);
      } catch (e) {
        console.error("위시리스트 로드 실패", e);
      }
    };

    // 3. 예매 내역 가져오기
    const fetchBookings = async () => {
      const memberId = localStorage.getItem('memberId');
      if (!memberId) return;
      try {
        setLoading(true);
        const { data } = await resApi.get(`/member/${memberId}`);
        const rawBookings = Array.isArray(data.data) ? data.data : [];
        const mappedBookings = rawBookings.map(b => ({
            id: b.reservation_id,
            eventTitle: b.events?.title || '공연명 없음',
            artistName: b.events?.artist_name || '아티스트',
            date: b.events?.event_date ? new Date(b.events.event_date).toLocaleDateString() : 'TBD',
            venue: b.events?.venue || '장소 미정',
            seats: b.ticket_count || 0,
            totalPrice: b.pure_price || 0,
            status: (b.status || 'confirmed').toLowerCase(),
            ticketCode: b.ticket_code,
            selected_seats: Array.isArray(b.selected_seats) ? b.selected_seats : [],
        }));
        setBookings(mappedBookings);
      } catch (error) {
        toast.error('내 예매 내역 로드 실패');
      } finally {
        setLoading(false);
      }
    };

    // 실행 분기
    if (activeTab === 'events') {
      fetchEvents(); 
      fetchWishlists();
    } else if (activeTab === 'my-bookings') fetchBookings();

  }, [activeTab]); // 🌟 window.location.search 대신 activeTab만 감시해도 충분해!

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         event.artistName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === '전체' || eventTypeLabel[event.type] === filterType;
    return matchesSearch && matchesFilter;
  });

  // 기존 filteredEvents 아래에 추가
  const sortedEvents = [
      ...filteredEvents.filter(e => wishlists.has(e.id)),
      ...filteredEvents.filter(e => !wishlists.has(e.id)),
  ];

  // [수정] 함수에서 어떤 공연인지 eventId를 인자로 받아야 함
  const toggleWishlist = async (e, eventId) => {
    e.preventDefault();
    e.stopPropagation();
    const memberId = localStorage.getItem('memberId');
    if (!memberId) return toast.error('로그인이 필요합니다.');

    const isWished = wishlists.has(eventId);

    try {
      if (isWished) {
        // 찜 해제
        await resApi.delete(`/events/${eventId}/wishlist`, { data: { memberId } });
        setWishlists(prev => {
          const next = new Set(prev);
          next.delete(eventId);
          return next;
        });
        toast.success('찜 해제');
      } else {
        // 찜 등록
        await resApi.post(`/events/${eventId}/wishlist`, { memberId });
        setWishlists(prev => {
          const next = new Set(prev);
          next.add(eventId);
          return next;
        });
        toast.success('찜 완료!');
      }
    } catch (error) {
      toast.error('처리 중 오류 발생');
    }
  };

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
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                // 🌟 핵심: 탭을 클릭할 때 URL 파라미터도 해당 탭에 맞게 변경해줌
                setLocation(`/user/events?tab=${tab.key}`);
                setActiveTab(tab.key);
              }}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === tab.key
                  ? 'bg-white text-rose-600 shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
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
                sortedEvents.map((event) =>
                  <div key={event.id} className="glass-card rounded-2xl overflow-hidden soft-shadow hover-lift">
                    <div className="flex flex-col sm:flex-row">
                      <div className="relative sm:w-48 h-36 sm:h-auto flex-shrink-0">
                        <img
                          src={event.image}
                          alt={event.title}
                          className="w-full h-full object-cover" 
                          onError={(e) => { e.target.src = 'https://placehold.co/400x200?text=No+Image'; }}
                          />
                        <div className="absolute top-2 left-2">
                          <span className={`px-2 py-1 rounded-lg text-xs font-bold ${eventTypeBadgeClass[event.type]}`}>
                            {eventTypeLabel[event.type]}
                          </span>
                        </div>
                       <button
                            onClick={(e) => toggleWishlist(e, event.id)}
                            className="absolute top-2 right-2 w-10 h-10 flex items-center justify-center bg-white/20 backdrop-blur-md rounded-full shadow-md transition-all hover:bg-white/40 hover:scale-110 active:scale-95"
                        >
                            <Heart 
                                size={20} 
                                className={wishlists.has(Number(event.id)) ? "text-rose-400" : "text-white"} 
                                fill={wishlists.has(Number(event.id)) ? "currentColor" : "none"} 
                            />  
                        </button>
                      </div>
                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                          {/* 🌟 1. 깔끔하고 힙한 가로 배치 (아티스트는 예쁜 태그로, 제목은 굵고 선명하게) */}
                          <div className="flex items-center gap-2.5 mb-4">
                            {/* 🌟 아티스트: 반짝이 아이콘 + 그라데이션 텍스트 */}
                            <div className="flex items-center gap-1.5 shrink-0">
                              <Sparkles size={16} className="text-violet-500" />
                              <span className="text-[17px] font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-rose-500 tracking-wide">
                                {event.artistName}
                              </span>
                            </div>
                            
                            <span className="text-gray-200">|</span>
                            
                            {/* 공연 제목 */}
                            <h3 className="text-[15px] font-bold text-foreground truncate">
                              {event.title}
                            </h3>
                          </div>
                          
                          {/* 🌟 2. 상세 정보 (아이콘과 텍스트 정렬) */}
                          <div className="space-y-1.5 mb-4">
                            <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
                              <Calendar size={14} className="text-rose-400" />
                              <span className="font-medium">{event.date} {event.time}</span>
                            </div>
                            <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
                              <MapPin size={14} className="text-rose-400" />
                              <span className="font-medium truncate">{event.venue}</span>
                            </div>
                            <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
                              <Users size={14} className="text-rose-400" />
                              <span className="font-medium">잔여석 {event.remaining}석 / {event.capacity}석</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* 🌟 3. 하단 영역 (선을 하나 그어서 위아래 정보를 깔끔하게 분리) */}
                        <div className="flex items-end justify-between mt-2 pt-4 border-t border-gray-100">
                          <div>
                            <span className="text-[18px] font-black text-rose-600">{formatPrice(event.price)}</span>
                            <span className="text-[11px] text-muted-foreground ml-1 font-medium">/ 1인</span>
                          </div>
                          <button
                            onClick={() => setLocation(`/user/events/${event.id}`)}
                            className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-white rounded-xl bg-rose-500 hover:bg-rose-600 shadow-sm transition-colors">
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
                  {/* 🌟 변경된 좌석 정보 출력 로직: 루미나 공연장 체크 */}
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-[#888] font-medium">선택 좌석</span>
                    <span className="text-[#1A1A1A] font-bold">
                      {['루미나50', '루미나100', '루미나200'].includes(selectedBooking.venue) 
                        ? (selectedBooking.selected_seats && selectedBooking.selected_seats.length > 0 
                            ? selectedBooking.selected_seats.join(', ') 
                            : '좌석 선택 안 됨')
                        : '좌석정보 미제공'}
                    </span>
                  </div>
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
      {refundTarget && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-sm rounded-[2rem] p-8 space-y-5 shadow-2xl">
                <div className="text-center">
                    <div className="w-16 h-16 bg-rose-50 text-rose-400 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-rose-100">
                        <Ticket size={28} />
                    </div>
                    <h3 className="text-lg font-bold">예매 취소/환불</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                        <span className="font-bold text-rose-500">'{refundTarget.eventTitle}'</span><br/>
                        예매를 취소하시겠습니까?
                    </p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setRefundTarget(null)}
                        className="flex-1 py-3 rounded-xl font-bold text-muted-foreground hover:bg-secondary transition-all text-sm"
                    >
                        돌아가기
                    </button>
                    <button
                        onClick={submitRefund}
                        className="flex-[1.5] py-3 rounded-xl bg-rose-500 text-white font-bold hover:bg-rose-600 active:scale-95 transition-all text-sm shadow-lg"
                    >
                        취소 확정
                    </button>
                </div>
            </div>
        </div>
    )}
    </Layout>);
}