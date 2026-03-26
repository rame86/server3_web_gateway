/*
 * Lumina - Artist Booking & Event Management
 * Soft Bloom Design: Event management and proposal flow for artists
 */

import { useState, useEffect } from 'react'; // 🌟 useEffect 추가
import Layout from '@/components/Layout';
import { cn } from "@/lib/utils";
import { Calendar, Plus, Search, MapPin, Users, Ticket, Clock, Check, X, MoreVertical, Image as ImageIcon, Sparkles, Map, MessageSquareX } from 'lucide-react';
import { events, formatPrice, eventTypeLabel, eventTypeBadgeClass } from '@/lib/data';
import { toast } from 'sonner';
import { resApi, adminApi } from '@/lib/api'; // 🌟 백엔드 통신을 위한 API 추가
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import SeatSelection from '../user/UserBookingSeatSelection';

// 🌟 추가: DB의 영문 상태값을 예쁜 한글과 색상으로 바꿔주는 매핑 객체
const statusMap = {
  PENDING: { label: '승인 대기 중', style: 'bg-amber-500 text-white' },
  CONFIRMED: { label: '승인 완료', style: 'bg-teal-500 text-white' },
  FAILED: { label: '반려됨', style: 'bg-rose-500 text-white' },
  CANCELED: { label: '취소됨', style: 'bg-gray-500 text-white' },
  CANCELLED: { label: '취소됨', style: 'bg-gray-500 text-white' }
};

const getSeatLayoutConfig = (capacity, venueName = "") => {
    if (venueName.includes('루미나50') || capacity === 50) return { rows: 5, cols: 10 };
    if (venueName.includes('루미나100') || capacity === 100) return { rows: 10, cols: 10 };
    if (venueName.includes('루미나200') || capacity === 200) return { rows: 10, cols: 20 };
    const safeCapacity = capacity || 100;
    const defaultRows = 10;
    return { rows: defaultRows, cols: Math.ceil(safeCapacity / defaultRows) };
};

export default function ArtistBooking() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  
  // 🌟 추가: 백엔드에서 가져온 실제 데이터를 담을 상태
  const [myEvents, setMyEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🌟 추가: 통계 데이터를 담을 상태 (기본값 0)
  const [stats, setStats] = useState({ totalReservations: 0 });

  // ArtistBooking.jsx 상단 state 선언부
  const [openManagerId, setOpenManagerId] = useState(null); // 기존에 있던 것
  const [selectedManageEvent, setSelectedManageEvent] = useState(null); 

  const [selectedFile, setSelectedFile] = useState(null); // 🌟 파일 상태 추가
  const [reservedSeats, setReservedSeats] = useState([]);

  // 🌟 백엔드 응답 객체 구조에 맞게 수정된 버전
  // ArtistBooking.jsx 내 fetchMyEvents 함수 수정
const fetchMyEvents = async () => {
    try {
        setLoading(true);
        const memberId = localStorage.getItem('memberId');
        
        if (!memberId) {
            toast.error("로그인이 필요합니다.");
            return;
        }

        // 🚨 호출 주소를 /events에서 /events/my로 변경합니다.
        const response = await resApi.get(`/events/my?artistId=${memberId}`);
        const data = response.data;

        let rawEvents = Array.isArray(data) ? data : (data.events || []);
        setMyEvents(rawEvents);

        const totalResCount = Array.isArray(data) 
          ? data.reduce((acc, curr) => acc + (curr.reservationsCount || curr._count?.reservations || 0), 0)
          : (data.totalReservations || 0);

        setStats({ totalReservations: totalResCount });
    } catch (error) {
        console.error("❌ 데이터 로드 실패:", error);
        toast.error("이벤트 목록을 불러오지 못했습니다.");
    } finally {
        setLoading(false);
    }
};

  // 🌟 추가: 컴포넌트 마운트 시 데이터 불러오기
  useEffect(() => {
    fetchMyEvents();
  }, []);

  // 🌟 수정: 기존 더미 데이터 대신 백엔드에서 가져온 myEvents 사용
  const filteredEvents = myEvents.filter(event => {
  //   event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //   (event.venue || event.event_locations?.venue || "").toLowerCase().includes(searchTerm.toLowerCase())
  // );
  // 콘솔 데이터 구조에 따라 eventTitle 또는 title 선택
  const title = event.eventTitle || event.title || "";
  const venue = event.venue || "";

  return title.toLowerCase().includes(searchTerm.toLowerCase()) ||
         venue.toLowerCase().includes(searchTerm.toLowerCase());
});

  // 🌟 수정: FormData를 추출해 백엔드로 전송하는 로직으로 변경
  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const memberId = localStorage.getItem('memberId');
    const storedName = localStorage.getItem('userName');

    // 1. 🌟 JSON 대신 FormData 객체 생성 (파일 전송을 위해 필수)
    const data = new FormData();

    // 2. 🌟 [핵심] 이미지 처리: 파일이 1순위, URL이 2순위
    if (selectedFile) {
      data.append('file', selectedFile); // 선택된 파일이 있으면 추가
    } else {
      data.append('image_url', form.image_url.value); // 파일 없으면 URL 추가
    }

    // 3. 🌟 나머지 필드들 담기 (기존 eventData에 있던 내용들)
    data.append('member_id', memberId);
    data.append('requester_id', memberId);
    data.append('artist_id', memberId);
    data.append('artist_name', storedName);
    data.append('title', form.title.value);
    data.append('event_type', form.type.value);
    data.append('event_date', form.event_date.value);
    data.append('open_time', form.open_time.value);
    data.append('close_time', form.close_time.value);
    data.append('venue', form.venue.value);
    data.append('address', form.address.value);
    data.append('total_capacity', form.total_capacity.value);
    data.append('price', form.price.value);
    data.append('description', form.description.value);
    data.append('age_limit', '0');
    data.append('running_time', '120');
    data.append('is_standing', 'false');

    try {
      toast.loading('등록 요청 중...');
      
      // 4. 🌟 중요: eventData 대신 data(FormData)를 보내고 헤더 설정
      await resApi.post('/events', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      }); 

      toast.dismiss();
      toast.success('이벤트 등록 요청이 완료되었습니다.');
      setIsAdding(false);
      fetchMyEvents(); 
    } catch (error) {
      toast.dismiss();
      toast.error('등록 요청 중 오류가 발생했습니다.');
      console.error(error);
    }
  };

  // 🌟 추가: 예매 명단 CSV(엑셀) 다운로드 함수
  const handleDownloadCSV = async (eventId, eventTitle) => {
    try {
      toast.loading('명단 추출 중...');

      // 🚨 임시 데이터 (나중에 백엔드 API /events/${eventId}/reservations 연동 시 수정!)
      const response = await resApi.get(`/events/${eventId}/reservations`);
      const attendees = response.data;
      
      // CSV 헤더 및 데이터 생성
      const header = "예매번호,예매자명,연락처,상태,예매일자\n";
      const rows = attendees.map(user => `${user.reserveId},${user.name},${user.phone},${user.status},${user.date}`).join('\n');
      
      // "\uFEFF" -> 한글 깨짐 방지용 BOM 추가
      const csvContent = "\uFEFF" + header + rows;

      // 파일 다운로드 트리거
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `[루미나]${eventTitle}_예매명단.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.dismiss();
      toast.success(`${eventTitle} 예매 명단 다운로드 완료!`);
    } catch (error) {
      toast.dismiss();
      console.error('다운로드 에러:', error);
      toast.error('명단 다운로드에 실패했습니다.');
    }
  };

  // 🌟 [수정] 상세 보기 클릭 시 처리 함수
  const handleOpenDetail = async (event) => {
    setSelectedEvent(event);
    setBookingStart(toLocalDatetime(event.bookingStartDate));
    setBookingEnd(toLocalDatetime(event.bookingEndDate));
    
    // 루미나 공연장일 때만 실시간 예매 좌석 가져오기
    if (event.location?.includes('루미나')) {
      try {
        const res = await resApi.get(`/events/${event.eventId || event.approvalId}`);
        setReservedSeats(res.data.reservedSeats || []);
      } catch (err) {
        console.error("좌석 정보 로드 실패:", err);
        setReservedSeats([]);
      }
    }
  };

  return (
    <Layout role="artist">
      <div className="p-4 lg:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
              예매 및 이벤트 관리
            </h1>
            <p className="text-sm text-muted-foreground">개최 중인 이벤트와 신규 등록 제안 내역을 관리합니다.</p>
          </div>
          
          <Dialog open={isAdding} onOpenChange={setIsAdding}>
            <DialogTrigger asChild>
              <button className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 text-white font-bold rounded-2xl shadow-lg hover:bg-teal-700 transition-all hover-lift">
                <Plus size={18} />
                새 이벤트 등록
              </button>

            </DialogTrigger>

            <DialogContent className="sm:max-w-[550px] rounded-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>새 이벤트(공연) 등록 요청 (Res Schema)</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 py-4">
                {/* 🌟 수정: 모든 Input/Select에 name 속성 추가 (FormData에서 값을 읽기 위해 필수) */}
                <div className="space-y-2">
                  <Label htmlFor="title">이벤트 제목 (Title)</Label>
                  <Input name="title" id="title" placeholder="공연 또는 이벤트 이름을 입력하세요" required className="rounded-xl border-teal-100 focus:ring-teal-300" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">이벤트 유형 (Event Type)</Label>
                    <select name="type" id="type" className="w-full h-10 px-3 bg-white border border-teal-100 rounded-xl text-sm focus:ring-2 focus:ring-teal-300 focus:outline-none">
                      <option value="CONCERT">콘서트 (CONCERT)</option>
                      <option value="FANMEETING">팬미팅 (FANMEETING)</option>
                      <option value="FANSIGN">팬사인회 (FANSIGN)</option>
                      <option value="FANPARTY">팬파티 (FANPARTY)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="event_date">진행 일시 (Event Date)</Label>
                    <Input name="event_date" id="event_date" type="datetime-local" required className="rounded-xl border-teal-100" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="venue">장소명 (Venue)</Label>
                    <Input name="venue" id="venue" placeholder="예: 루미나50, 루미나100, 루미나200" required className="rounded-xl border-teal-100" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">상세 주소 (Address)</Label>
                    <Input name="address" id="address" placeholder="서울특별시 마포구 백범로 23" required className="rounded-xl border-teal-100" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="total_capacity">총 정원 (Capacity)</Label>
                    <Input name="total_capacity" id="total_capacity" type="number" placeholder="5000" required className="rounded-xl border-teal-100" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">티켓 가격 (Price - Integer)</Label>
                    <Input name="price" id="price" type="number" placeholder="0" required className="rounded-xl border-teal-100" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="open_time">예매 시작 (Open Time)</Label>
                    <Input name="open_time" id="open_time" type="datetime-local" required className="rounded-xl border-teal-100" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="close_time">예매 종료 (Close Time)</Label>
                    <Input name="close_time" id="close_time" type="datetime-local" required className="rounded-xl border-teal-100" />
                  </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="description">이벤트 상세 설명 (Description)</Label>
                    <Textarea name="description" id="description" placeholder="이벤트에 대한 상세 설명을 입력하세요" className="rounded-xl border-teal-100 min-h-[100px]" />
                </div>

                <div className="space-y-4"> {/* 간격 조금 넓힘 */}
                {/* 1. 파일 업로드 부분 */}
                <div className="space-y-2">
                  <Label htmlFor="image_file">포스터 이미지 업로드 (파일)</Label>
                  <Input 
                    id="image_file" 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => setSelectedFile(e.target.files[0])} 
                    className="rounded-xl border-teal-100" 
                  />
                </div>
                {/* 2. URL 입력 부분 */}
                <div className="space-y-2">
                  <Label htmlFor="image_url">포스터 이미지 주소 (URL)</Label>
                  <div className="flex gap-2">
                    <Input 
                      name="image_url" 
                      id="image_url" 
                      placeholder="https://..." 
                      className="rounded-xl border-teal-100" 
                    />
                    <Button type="button" variant="outline" className="rounded-xl border-teal-200">
                      <ImageIcon size={18} />
                    </Button>
                  </div>
                </div>
              </div>
                              
                <DialogFooter className="pt-4">
                  <Button type="button" variant="ghost" onClick={() => setIsAdding(false)} className="rounded-xl">취소</Button>
                  <Button type="submit" className="bg-teal-600 hover:bg-teal-700 rounded-xl px-8 text-white">등록 제안하기</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <div className="flex gap-3 max-w-md">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="이벤트명 또는 장소 검색..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-11 bg-white border-teal-100 rounded-2xl focus:ring-teal-300 shadow-sm" 
            />
          </div>
        </div>
        {/* 🌟 오른쪽: 버튼 바로 아래에 위치할 안내 문구 */}
          <div className="text-right text-[11px] text-muted-foreground pr-2">
            <p className="leading-relaxed">
              <span className="font-bold text-teal-600">루미나50, 루미나100, 루미나200</span> 공연장을 이용할 아티스트는<br/>
              관리자에게 문의 바랍니다. (📞 <span className="font-bold">02-1000-1000</span>)
            </p>
          </div>

        {/* Analytics Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-2">
            <div className="glass-card rounded-3xl p-6 bg-gradient-to-br from-teal-500/10 to-transparent border-teal-100">
                <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="text-teal-500" size={20} />
                    <h2 className="font-bold text-lg" style={{ fontFamily: "'Playfair Display', serif" }}>실시간 예매 현황</h2>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-white/60 rounded-2xl border border-teal-50">
                        <p className="text-xs text-muted-foreground mb-1">총 예매 건수</p>
                        <p className="text-2xl font-bold text-teal-600">
                          {stats.totalReservations.toLocaleString()}건
                        </p>
                    </div>
                    <div className="p-4 bg-white/60 rounded-2xl border border-teal-50">
                        <p className="text-xs text-muted-foreground mb-1">예정된 오프라인 이벤트</p>
                        {/* 🌟 수정: 실시간 내 공연 갯수로 표시되게 연동 */}
                        <p className="text-2xl font-bold text-rose-500">{myEvents.length}건</p>
                    </div>
                </div>
            </div>
            
            <div className="glass-card rounded-3xl p-6 bg-gradient-to-br from-violet-500/10 to-transparent border-violet-100">
                <div className="flex items-center gap-2 mb-4">
                    <Map className="text-violet-500" size={20} />
                    <h2 className="font-bold text-lg" style={{ fontFamily: "'Playfair Display', serif" }}>주요 지역 팬 분포</h2>
                </div>
                <div className="flex items-end gap-2 h-16">
                    <div className="flex-1 bg-violet-200 rounded-t-lg h-[40%]"></div>
                    <div className="flex-1 bg-violet-400 rounded-t-lg h-[80%]"></div>
                    <div className="flex-1 bg-violet-600 rounded-t-lg h-[100%]"></div>
                    <div className="flex-1 bg-violet-400 rounded-t-lg h-[60%]"></div>
                    <div className="flex-1 bg-violet-200 rounded-t-lg h-[30%]"></div>
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground mt-2">
                    <span>경기</span><span>서울</span><span>부산</span><span>대구</span><span>강원</span>
                </div>
            </div>
        </div>

        {/* Events Feed */}
        <div className="space-y-4">
          {loading ? (
             <div className="py-20 text-center glass-card rounded-3xl text-muted-foreground">데이터를 불러오는 중입니다...</div>
          ) : filteredEvents.length > 0 ? (
            filteredEvents.map((event) => {
              // 1. 사용할 변수들을 상단에 안전하게 선언
              const capacity = event.total_capacity || event.totalCapacity || 0;
              const remaining = event.available_seats || event.availableSeats || 0;
             
              // 1. 일단 환경변수를 가져온다 (http://localhost 가 담기겠지?)
              const rawUrl = import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost';

              // 2. 만약 주소가 localhost인데 포트(:8082)가 없다면 강제로 붙여버림
              const gatewayUrl = (rawUrl === 'http://localhost') 
                  ? 'http://localhost:8082' 
                  : rawUrl.replace(/\/$/, '');

              // 3. 이미지 주소 조립 (나머지 로직은 그대로!)
              const rawImageUrl = event.event_images?.[0]?.image_url || event.imageUrl || event.image;
              let imageUrl = 'https://placehold.co/300x200?text=No+Image';

              if (rawImageUrl) {
                  if (rawImageUrl.startsWith('http')) {
                      imageUrl = rawImageUrl;
                  } else {
                      const imagePath = rawImageUrl.startsWith('/') ? rawImageUrl : `/images/res/${rawImageUrl}`;
                      imageUrl = `${gatewayUrl}${imagePath}`;
                  }
              }
             
              const eventTypeStr = event.event_type?.toLowerCase() || event.type?.toLowerCase() || 'concert';
              const venueName = event.venue || event.event_locations?.venue || '장소 미정';
              const eventDateStr = event.event_date || event.date ? new Date(event.event_date || event.date).toLocaleDateString() : 'TBD';
              
              // 🌟 이 변수가 실제 화면에 그려질 제목이야!
              const displayTitle = event.eventTitle || event.title || "제목 없음"; 
              const eventId = event.event_id || event.id;

              const currentStatus = event.approval_status?.toUpperCase() || event.status?.toUpperCase() || 'PENDING';
              const mappedStatus = statusMap[currentStatus] || statusMap.PENDING;

              return (
                <div key={eventId} className="glass-card rounded-3xl overflow-hidden soft-shadow hover-lift transition-all flex flex-col sm:flex-row">
                  <div className="sm:w-64 h-48 sm:h-auto relative bg-gray-100">
                      <img src={imageUrl} alt={displayTitle} className="w-full h-full object-cover" />
                      <div className="absolute top-3 left-3 flex gap-1">
                          <span className={cn("px-3 py-1 rounded-full text-xs font-bold shadow-md", eventTypeBadgeClass[eventTypeStr] || 'bg-gray-100 text-gray-800')}>
                              {eventTypeLabel[eventTypeStr] || event.event_type}
                          </span>
                          {/* 🌟 수정: DB 영문 상태를 한글+색상으로 예쁘게 렌더링 */}
                          <span className={cn("px-3 py-1 rounded-full text-[10px] font-bold shadow-md", mappedStatus.style)}>
                              {mappedStatus.label}
                          </span>
                      </div>
                  </div>
                  
                  <div className="p-6 flex-1 flex flex-col justify-between">
                      <div>
                          <div className="flex items-start justify-between mb-2">
                              <h3 className="text-xl font-bold text-foreground leading-tight">{displayTitle}</h3>
                              <button className="p-1.5 text-muted-foreground hover:bg-teal-50 rounded-lg transition-colors">
                                  <MoreVertical size={18} />
                              </button>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-y-3 gap-x-6 mt-4">
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Calendar size={16} className="text-teal-500" />
                                  {eventDateStr}
                              </div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <MapPin size={16} className="text-teal-500" />
                                  {venueName}
                              </div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Users size={16} className="text-teal-500" />
                                  정원 {capacity}명
                              </div>
                              <div className="flex items-center gap-2 text-sm font-bold text-teal-600">
                                  <Ticket size={16} />
                                  {formatPrice(event.price || 0)}
                              </div>
                          </div>
                      </div>
                      
                      <div className="mt-6 pt-4 border-t border-teal-50 flex items-center justify-between">
                          <div className="flex items-center gap-4">
                              <div className="text-xs">
                                  <span className="text-muted-foreground">판매 완료: </span>
                                  {/* 🌟 수정: 진짜 DB 잔여석 데이터로 연동 */}
                                  <span className="font-bold text-teal-600">{capacity - remaining} / {capacity}</span>
                              </div>
                              <div className="w-24 h-1.5 bg-teal-100 rounded-full overflow-hidden">
                                  <div 
                                      className="h-full bg-teal-500 transition-all duration-500" 
                                      style={{ width: `${capacity > 0 ? ((capacity - remaining) / capacity) * 100 : 0}%` }}
                                  ></div>
                              </div>
                          </div>
                          
                          <div className="flex gap-2">
                              {/* 🌟 수정: 내역 내려받기 버튼에 onClick 이벤트 추가 */}
                              <button 
                                onClick={() => handleDownloadCSV(event.event_id || event.id, event.title)}
                                className="px-4 py-2 text-xs font-bold text-muted-foreground border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                              >
                                  내역 내려받기
                              </button>

                              {/* 🌟 실시간 관리 버튼 (클릭 시 모달 오픈) */}
                              <button 
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  setSelectedManageEvent(event);
                                  
                                  // ✅ 상세 API 호출해서 reservedSeats 가져오기
                                  try {
                                    const res = await resApi.get(`/events/${event.event_id || event.id}`);
                                    setReservedSeats(res.data.reservedSeats || []);
                                  } catch (err) {
                                    console.error('좌석 조회 실패:', err);
                                    setReservedSeats([]);
                                  }
                                }}
                                className="px-4 py-2 text-xs font-bold text-white bg-teal-600 rounded-xl hover:bg-teal-700 shadow-sm transition-colors"
                              >
                                실시간 관리
                              </button>

                            </div>
                      </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-20 text-center glass-card rounded-3xl">
              <Calendar size={48} className="mx-auto text-teal-200 mb-4" />
              <p className="text-muted-foreground">검색된 이벤트가 없습니다.</p>
            </div>
          )}
        </div>
      </div>

      {/* 🌟 실시간 좌석 현황 모달 (Dialog) */}
      <Dialog open={!!selectedManageEvent} onOpenChange={() => {
        setSelectedManageEvent(null);
        setReservedSeats([]);
      }}>
        <DialogContent className="sm:max-w-[600px] rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
          {(() => {
            const rawStatus = (selectedManageEvent?.approval_status || selectedManageEvent?.status || 'PENDING').toString().trim().toUpperCase();
            const isConfirmed = rawStatus === 'CONFIRMED';
            const isFailed = rawStatus === 'FAILED' || rawStatus === 'REJECTED';
            
            const total = selectedManageEvent?.total_capacity || selectedManageEvent?.totalCapacity || 0;
            const available = selectedManageEvent?.available_seats || selectedManageEvent?.availableSeats || selectedManageEvent?.stock || 0;
            const reservedCount = total - available;

            // 🌟 여기서 변수를 정의해줘야 에러가 안 나!
            const venueName = selectedManageEvent?.venue || 
                      selectedManageEvent?.location || 
                      selectedManageEvent?.event_locations?.venue || 
                      "";
            return (
              <>
                <DialogHeader className={cn(
                  "p-6 text-white transition-colors duration-300",
                  isConfirmed ? "bg-teal-600" : "bg-rose-600"
                )}>
                  <DialogTitle className="flex items-center gap-2 text-xl font-bold">
                    {isConfirmed ? (
                      <><Sparkles size={20} className="text-rose-300 animate-pulse" /> 라이브 좌석 현황</>
                    ) : (
                      <><X size={20} /> {isFailed ? "이벤트 반려 사유" : "승인 대기 중"}</>
                    )}
                  </DialogTitle>
                  <p className="opacity-90 text-xs mt-1 font-medium">
                    {selectedManageEvent?.eventTitle || selectedManageEvent?.title}
                  </p>
                </DialogHeader>

                <div className="p-8 bg-white min-h-[300px] flex flex-col justify-center">
                  {isConfirmed ? (
                    /* ✅ [승인 완료] 상태 */
                    <div className="space-y-6 animate-in fade-in zoom-in duration-300">
                      <div className="flex justify-around items-center bg-slate-50 p-5 rounded-2xl border border-slate-100 shadow-inner">
                        <div className="text-center">
                          <p className="text-[10px] text-muted-foreground uppercase font-black mb-1">Total</p>
                          <p className="text-xl font-bold text-slate-700">{total}석</p>
                        </div>
                        <div className="w-px h-8 bg-slate-200" />
                        <div className="text-center">
                          <p className="text-[10px] text-rose-500 uppercase font-black mb-1">Reserved</p>
                          <p className="text-xl font-bold text-rose-600">{reservedCount}석</p>
                        </div>
                        <div className="w-px h-8 bg-slate-200" />
                        <div className="text-center">
                          <p className="text-[10px] text-teal-500 uppercase font-black mb-1">Remaining</p>
                          <p className="text-xl font-bold text-teal-600">{available}석</p>
                        </div>
                      </div>

                      {/* 🌟 핵심: 루미나 공연장 여부 체크 */}
                      {venueName.includes('루미나') ? (
                        <>
                          <div className="bg-slate-50 rounded-[2rem] border border-dashed border-slate-200 p-6 flex flex-col items-center overflow-auto max-h-[400px] custom-scrollbar">
                            <div className="mb-4 px-3 py-1 bg-white border border-teal-200 text-teal-600 text-[10px] font-bold rounded-full uppercase">STAGE</div>
                            {/* 🌟 pointer-events-none으로 클릭 방지, reservedSeats로 예매된 좌석 표시 */}
                            <div className="transform scale-90 origin-center pointer-events-none select-none">
                              <SeatSelection 
                                {...getSeatLayoutConfig(total, venueName)} 
                                ticketCount={0} 
                                reservedSeats={reservedSeats}
                                onSeatSelect={() => {}} 
                              />
                            </div>
                          </div>
                          <div className="flex gap-6 justify-center text-[11px] text-gray-400 font-bold">
                            <span className="flex items-center gap-1.5"><div className="w-3 h-3 bg-white border border-gray-300 rounded-sm"></div> 빈 좌석</span>
                            <span className="flex items-center gap-1.5"><div className="w-3 h-3 bg-gray-800 rounded-sm"></div> 예매 완료</span>
                          </div>
                        </>
                      ) : (
                        /* 🌟 외부 공연장 안내 UI */
                        <div className="bg-slate-50 rounded-[2rem] border border-slate-100 p-10 text-center space-y-4">
                          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-sm border border-slate-100">
                            <MapPin size={32} className="text-slate-300" />
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-700">외부 공연장 모니터링</h4>
                            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                              해당 공연장은 외부 시설로 실시간 좌석 배치도를 지원하지 않습니다.<br/>
                              정확한 현황은 예매 명단을 통해 확인해 주세요.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* ❌ [반려됨 또는 대기] 사유 안내 모드 */
                    <div className="space-y-4 py-6 text-center animate-in slide-in-from-bottom-4 duration-300">
                      <div className={cn(
                        "w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4",
                        isFailed ? "bg-rose-50 text-rose-500" : "bg-amber-50 text-amber-500"
                      )}>
                        {isFailed ? <MessageSquareX size={32} /> : <Clock size={32} className="animate-spin-slow" />}
                      </div>
                      <h4 className="text-lg font-bold text-slate-800">
                        {isFailed ? "관리자 검토 의견" : "관리자 승인을 기다리는 중입니다"}
                      </h4>
                      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-slate-600 text-sm leading-relaxed whitespace-pre-wrap font-medium">
                        {isFailed 
                          ? (selectedManageEvent?.event_approvals_events_approval_idToevent_approvals?.rejection_reason || "상세 반려 사유가 등록되지 않았습니다.")
                          : "승인이 완료되면 실시간 좌석 현황을 모니터링할 수 있습니다."
                        }
                      </div>
                    </div>
                  )}
                </div>
              </>
            );
          })()}

          <DialogFooter className="p-4 bg-slate-50 border-t">
            <Button 
              onClick={() => setSelectedManageEvent(null)}
              className="w-full bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-2xl font-bold h-12 shadow-sm"
            >
              모니터링 종료
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}