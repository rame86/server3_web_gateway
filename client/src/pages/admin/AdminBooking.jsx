import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Calendar, Check, X, Eye, Clock, MapPin, Users, Ticket, MessageSquareX } from 'lucide-react';
import { formatPrice } from '@/lib/data';
import { toast } from 'sonner';
import { adminApi } from '@/lib/api';

// 🌟 네가 만든 좌석표 컴포넌트 불러오기 (경로는 네 폴더 구조에 맞게 수정해!)
import SeatSelection from '../user/UserBookingSeatSelection'; 

//눈 모양 눌렀을 때 시간 포맷 변환
const toLocalDatetime = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';
  const pad = (n) => n.toString().padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

export default function AdminBooking() {
  const [activeTab, setActiveTab] = useState('pending');
  const [pendingList, setPendingList] = useState([]);
  const [allEvents, setAllEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [bookingStart, setBookingStart] = useState('');
  const [bookingEnd, setBookingEnd] = useState('');

  const [rejectingEvent, setRejectingEvent] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // 🌟 [추가] 게이트웨이 주소 설정 (포트 강제 주입 로직)
  const rawUrl = import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost';
  const gatewayUrl = (rawUrl === 'http://localhost') 
      ? 'http://localhost:8082' 
      : rawUrl.replace(/\/$/, '');

  // 🌟 [추가] 이미지 URL 조립 함수
  const getImageUrl = (url) => {
    if (!url) return 'https://placehold.co/400x200?text=Lumina+Pulse';
    if (url.startsWith('http')) return url;
    const imagePath = url.startsWith('/') ? url : `/images/res/${url}`;
    return `${gatewayUrl}${imagePath}`;
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data } = await adminApi.get('/admin/event/list');
      
      const formattedData = data.map(item => ({
        ...item,
        eventTitle: item.eventTitle || item.title, 
        location: item.location || item.venue,
        eventStartDate: item.eventDate,       // 실제 공연일
        bookingStartDate: item.eventStartDate, // 예매 시작일 (DB 컬럼이 event_start_date이므로)
        bookingEndDate: item.eventEndDate,     // 예매 종료일
        totalCapacity: item.totalCapacity || item.total_capacity || 0
      }));
      
      const eventOnlyData = formattedData.filter(item => item.category === 'EVENT');
      setAllEvents(eventOnlyData);
      
      const pendingOnly = eventOnlyData.filter(e => e.status === 'PENDING');
      setPendingList(pendingOnly);
    } catch (error) {
      console.error("데이터 로드 실패:", error);
      toast.error("데이터를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ── 승인 (날짜 없이 바로) ──────────────────
  const handleApprove = async (event) => {
    try {
      await adminApi.post('/admin/event/confirm', {
        eventId: event.approvalId || event.eventId,
        status: 'CONFIRMED',
        rejectionReason: '',
        eventTitle: event.eventTitle,
        price: event.price || 0,
        bookingStartDate: null,
        bookingEndDate: null,
      });
      toast.success('승인 처리되었습니다.');
      fetchData();
    } catch (error) {
      toast.error('승인 처리 실패');
    }
  };

  // ── 반려 ──────────────────────────────────
  const handleReject = async () => {
    if (!rejectionReason.trim()) return toast.error('거절 사유를 입력해주세요.');
    try {
      await adminApi.post('/admin/event/confirm', {
        eventId: rejectingEvent.approvalId || rejectingEvent.eventId,
        status: 'FAILED',
        rejectionReason,
        eventTitle: rejectingEvent.eventTitle,
        price: rejectingEvent.price || 0,
      });
      toast.success('반려 처리되었습니다.');
      setRejectingEvent(null); // 반려 입력창 닫기
      setSelectedEvent(null); // 상세 보기 모달도 함께 닫기
      setRejectionReason('');
      fetchData();
    } catch (error) {
      toast.error('반려 처리 실패');
    }
  };

  // ── 예매 날짜 설정 후 큐 발송 ──────────────
  const handlePublishBooking = async () => {
    if (!bookingStart || !bookingEnd) return toast.error('예매 시작/종료 시간을 설정해주세요.');
    try {
      await adminApi.post('/admin/event/confirm', {  // ← 큐 발송 API (백엔드 확인 필요)
        eventId: selectedEvent.approvalId || selectedEvent.eventId,
        status: 'CONFIRMED',
        eventStartDate: bookingStart,
        eventEndDate: bookingEnd,
      });
      toast.success('예매 일정이 발송되었습니다.');
      setSelectedEvent(null);
      setBookingStart('');
      setBookingEnd('');
      fetchData();
    } catch (error) {
      toast.error('예매 일정 발송 실패');
    }
  };

  // 🌟 선택된 공연장 크기에 따라 좌석 줄(rows)/칸(cols) 자동 계산
  const getSeatLayoutConfig = (capacity, venueName = "") => {
    if (venueName.includes('루미나50') || capacity === 50) return { rows: 5, cols: 10 };
    if (venueName.includes('루미나100') || capacity === 100) return { rows: 10, cols: 10 };
    if (venueName.includes('루미나200') || capacity === 200) return { rows: 10, cols: 20 };
    
    // 외부 공연장 등 기타 규모일 경우 (대략 10줄 기준으로 칸 수 계산)
    const safeCapacity = capacity || 100;
    const defaultRows = 10;
    return { rows: defaultRows, cols: Math.ceil(safeCapacity / defaultRows) };
  };

  return (
    <Layout role="admin">
      <div className="p-4 lg:p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
            예매 승인 관리
          </h1>
          <p className="text-sm text-muted-foreground">이벤트 등록 요청을 검토하고 승인합니다 (Live Data)</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="glass-card rounded-2xl p-4 text-center soft-shadow bg-white border">
            <p className="text-xl font-bold text-amber-600">{pendingList.length}</p>
            <p className="text-xs text-muted-foreground">승인 대기</p>
          </div>
          <div className="glass-card rounded-2xl p-4 text-center soft-shadow bg-white border">
            <p className="text-xl font-bold text-teal-600">
              {allEvents.filter(e => e.status === 'CONFIRMED').length}
            </p>
            <p className="text-xs text-muted-foreground">승인 완료</p>
          </div>
          <div className="glass-card rounded-2xl p-4 text-center soft-shadow bg-white border">
            <p className="text-xl font-bold text-foreground">{allEvents.length}</p>
            <p className="text-xs text-muted-foreground">전체 이벤트</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 bg-amber-50 p-1 rounded-2xl">
          {[
            { key: 'pending', label: `대기 중 (${pendingList.length})` },
            { key: 'all', label: '전체 이벤트' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === tab.key ? 'bg-white text-amber-600 shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-16 text-muted-foreground">데이터 로딩 중...</div>
        ) : (
          <>
            {/* 1. 대기 중인 목록 탭 */}
            {activeTab === 'pending' && (
              <div className="space-y-4">
                {pendingList.length === 0 ? (
                  <div className="text-center py-16">
                    <Calendar size={48} className="text-muted-foreground/30 mx-auto mb-4" />
                    <p className="text-muted-foreground">처리할 이벤트가 없습니다</p>
                  </div>
                ) : (
                  pendingList.map((event) => (
                    <div key={event.approvalId || event.eventId} className="glass-card rounded-2xl overflow-hidden soft-shadow bg-white border">
                      <div className="flex flex-col sm:flex-row">
                        <div className="relative sm:w-48 h-36 sm:h-auto flex-shrink-0 bg-gray-100">
                          <img 
                            src={getImageUrl(event.imageUrl)} 
                            alt={event.eventTitle} 
                            className="w-full h-full object-cover" 
                          />
                        </div>
                        
                        <div className="p-4 flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-bold text-lg text-foreground">{event.eventTitle || event.title || "제목 없음"}</h3>
                              <p className="text-sm text-rose-500 font-medium">{event.artistName || '신청 아티스트'}</p>
                            </div>
                            
                            <div className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                              <Clock size={11} />
                              {event.createdAt ? new Date(event.createdAt).toLocaleDateString() : 'N/A'}
                            </div>
                            <button 
                              onClick={() => {                               
                                setBookingStart(''); 
                                setBookingEnd('');
                                setSelectedEvent(event);
                              }}
                              className="p-2 bg-slate-100 hover:bg-amber-100 text-amber-600 rounded-xl transition-all shadow-sm"
                              title="상세보기 및 시간 설정"
                            >
                              <Eye size={18} />
                            </button>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2 mb-4">
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Calendar size={12} className="text-rose-400" />
                              공연일: {event.eventStartDate ? new Date(event.eventStartDate).toLocaleDateString() : '일정 미정'}
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <MapPin size={12} className="text-rose-400" />
                              {event.location || '장소 미정'}
                            </div>
                            {/* 🌟 추가: 예매 시작/종료일 (대기 목록) */}
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground col-span-2">
                              <Clock size={12} className="text-rose-400" />
                              예매 오픈: {event.bookingStartDate ? new Date(event.bookingStartDate).toLocaleString() : '미정'}
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground col-span-2">
                              <Clock size={12} className="text-rose-400" />
                              예매 종료: {event.bookingEndDate ? new Date(event.bookingEndDate).toLocaleString() : '미정'}
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                              <Users size={12} className="text-rose-400" />
                              <span className="font-medium text-foreground">{event.stock || 0}석 남음</span>
                              <span className="text-[10px] text-gray-400">/ {(event.totalCapacity || 0).toLocaleString()}석</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 mt-1">
                              <Ticket size={12} />
                              {formatPrice(event.price || 0)}
                            </div>
                          </div>

                          <div className="flex gap-2">
                            {/* 대기 목록 카드의 버튼 */}
                            <button
                              onClick={() => handleApprove(event)}  // ✅ 바로 승인
                              className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-white rounded-xl bg-teal-500 hover:bg-teal-600 transition-colors shadow-sm"
                            >
                              <Check size={16} /> 승인
                            </button>
                            <button
                              onClick={() => setRejectingEvent(event)}
                              className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-red-600 rounded-xl bg-red-50 hover:bg-red-100 transition-colors border border-red-100"
                            >
                              <X size={16} /> 반려
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* 2. 전체 이벤트 탭 */}
            {activeTab === 'all' && (
              <div className="space-y-3">
                {allEvents.map((event) => (
                  <div key={event.approvalId || event.eventId} className="glass-card rounded-2xl p-4 soft-shadow flex items-center gap-4 bg-white border">
                    <img 
                      src={getImageUrl(event.imageUrl || event.imageURL || event.image)} 
                      alt={event.eventTitle} 
                      className="w-16 h-16 rounded-xl object-cover" 
                    />
                    
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-foreground line-clamp-1">
                        {event.eventTitle || event.title || "제목 없음"}
                      </p>
                      
                      <p className="text-xs text-muted-foreground mt-0.5">
                        공연일: {event.eventStartDate ? new Date(event.eventStartDate).toLocaleDateString() : '일정 미정'} · {event.location || '장소 미정'}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-rose-600 font-semibold">{formatPrice(event.price || 0)}</span>
                        <span className="text-xs text-muted-foreground">잔여 {event.stock || 0}석</span>
                      </div>
                    </div>

                    {/* 🌟 눈 모양 아이콘: 상태 뱃지 바로 앞으로 이동! */}
                    <button 
                      onClick={() => {                               
                        // 💡 주의: 파일 윗부분에 toLocalDatetime 함수가 꼭 있어야 해!
                        setBookingStart(toLocalDatetime(event.bookingStartDate)); 
                        setBookingEnd(toLocalDatetime(event.bookingEndDate));
                        setSelectedEvent(event);
                      }}
                      className="p-2 bg-slate-50 hover:bg-amber-100 text-amber-600 rounded-xl transition-all flex-shrink-0 shadow-sm"
                      title="상세보기"
                    >
                      <Eye size={16} />
                    </button>

                    {/* 상태 뱃지 */}
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${
                      event.status === 'CONFIRMED' ? 'bg-teal-100 text-teal-700' : 
                      event.status === 'PENDING' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {
                        event.status === 'CONFIRMED' ? '승인됨' : 
                        event.status === 'PENDING' ? '대기중' : '거절됨'
                      }
                    </span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* --- 🌟 [상세 정보 모달] 예매 시간 설정 및 실제 좌석표 렌더링 --- */}
      {selectedEvent && !rejectingEvent && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 font-noto">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in duration-200">
            <div className="p-6 border-b bg-amber-50 flex justify-between items-center">
              <h2 className="text-xl font-bold flex items-center gap-2 text-amber-900">
                <Ticket size={22} className="text-amber-600"/> 이벤트 최종 승인 검토
              </h2>
              <button onClick={() => setSelectedEvent(null)} className="p-2 hover:bg-black/5 rounded-full transition-colors"><X /></button>
            </div>

            <div className="p-8 overflow-y-auto space-y-8 custom-scrollbar">
              <div className="flex gap-5 p-6 bg-slate-50 rounded-[2.5rem] border border-slate-100">
                <img 
                  src={getImageUrl(selectedEvent.imageUrl)} 
                  className="w-28 h-28 rounded-2xl object-cover shadow-md" 
                />
                <div className="flex-1">
                  <h3 className="font-bold text-xl text-slate-800">{selectedEvent.eventTitle || selectedEvent.title}</h3>
                  <p className="text-sm text-rose-500 font-bold mb-2">{selectedEvent.artistName}</p>
                  <div className="space-y-1.5 text-xs text-muted-foreground font-medium">
                    <p className="flex items-center gap-1.5"><MapPin size={14} className="text-slate-400"/> {selectedEvent.location}</p>
                    <p className="flex items-center gap-1.5"><Calendar size={14} className="text-slate-400"/> 공연일: {selectedEvent.eventStartDate ? new Date(selectedEvent.eventStartDate).toLocaleString() : '미정'}</p>
                    <p className="flex items-center gap-1.5"><Clock size={14} className="text-slate-400"/> 예매 오픈: {selectedEvent.bookingStartDate ? new Date(selectedEvent.bookingStartDate).toLocaleString() : '미정'}</p>
                    <p className="flex items-center gap-1.5"><Clock size={14} className="text-slate-400"/> 예매 종료: {selectedEvent.bookingEndDate ? new Date(selectedEvent.bookingEndDate).toLocaleString() : '미정'}</p>
                  </div>
                </div>
              </div>

              <div className="p-8 bg-amber-50/50 rounded-[2.5rem] border border-amber-100 space-y-5">
                <h4 className="text-sm font-bold text-amber-900 flex items-center gap-2">
                  <Clock size={18} className="text-amber-600"/> 예매 오픈/종료 일정 설정
                </h4>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-amber-700/60 uppercase ml-1 tracking-widest">Open Time</label>
                    <input 
                      type="datetime-local" 
                      value={bookingStart}
                      onChange={(e) => setBookingStart(e.target.value)}
                      className="w-full p-4 rounded-2xl border border-amber-200 focus:ring-4 focus:ring-amber-500/10 outline-none text-sm font-bold transition-all shadow-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-amber-700/60 uppercase ml-1 tracking-widest">Close Time</label>
                    <input 
                      type="datetime-local" 
                      value={bookingEnd}
                      onChange={(e) => setBookingEnd(e.target.value)}
                      className="w-full p-4 rounded-2xl border border-amber-200 focus:ring-4 focus:ring-amber-500/10 outline-none text-sm font-bold transition-all shadow-sm"
                    />
                  </div>
                </div>
              </div>

              {/* 🌟 좌석표 실제 렌더링 섹션 */}
              <div className="space-y-4">
                <h4 className="text-xs font-black text-primary uppercase tracking-[0.2em] ml-1">Seat Layout Plan</h4>
                <div className="p-6 border-2 border-dashed border-slate-200 rounded-[2.5rem] bg-slate-50/30">
                  
                  {/* 🌟 '루미나'가 포함된 공연장일 때만 좌석표 노출 */}
                  {selectedEvent.location?.includes('루미나') ? (
                    <>
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-sm font-bold text-slate-600">공연장: {selectedEvent.location}</span>
                        <span className="text-xs font-black px-3 py-1 bg-white border border-slate-200 rounded-full shadow-sm">
                          Total {selectedEvent.totalCapacity} Seats
                        </span>
                      </div>
                      
                      {/* 조회 전용 (클릭 방지) */}
                      <div className="bg-white rounded-3xl border border-slate-100 shadow-inner overflow-auto p-4 flex justify-center items-center pointer-events-none select-none">
                        <SeatSelection 
                          {...getSeatLayoutConfig(selectedEvent.totalCapacity, selectedEvent.location)} 
                          ticketCount={0} 
                          reservedSeats={[]} 
                          onSeatSelect={() => {}} 
                        />
                      </div>
                    </>
                  ) : (
                    /* 🌟 외부 공연장일 때 보여줄 대체 UI */
                    <div className="py-12 text-center">
                      <MapPin size={40} className="mx-auto text-slate-300 mb-3" />
                      <p className="text-sm font-bold text-slate-400">외부 공연장은 좌석표 조회가 지원되지 않습니다.</p>
                      <p className="text-xs text-slate-300 mt-1">현장 배정 또는 외부 예매 시스템을 확인해야 합니다.</p>
                    </div>
                  )}

                </div>
              </div>
            </div>

            {/* --- 하단 버튼 영역: PENDING 상태일 때만 노출 --- */}
            <div className="p-8 border-t bg-white font-noto">
              {selectedEvent.status === 'PENDING' ? (
                <div className="flex gap-4 items-center">
                  <button 
                    onClick={() => setRejectingEvent(selectedEvent)}
                    className="flex-1 py-4 bg-red-50 text-red-500 font-bold rounded-full border border-red-100 hover:bg-red-100 transition-all text-sm shadow-sm"
                  >
                    승인 반려
                  </button>
                  <button 
                    onClick={handlePublishBooking} 
                    className="flex-[2.5] py-4 bg-teal-500 text-white font-bold rounded-full shadow-xl shadow-teal-100 hover:bg-teal-600 active:scale-95 transition-all flex items-center justify-center gap-2 text-sm"
                  >
                    <Check size={18}/> 예매 일정 등록 및 발송
                  </button>
                </div>
              ) : (
                /* 🌟 이미 승인/반려된 경우 보여줄 UI */
                <div className="w-full py-4 bg-slate-50 rounded-full text-center border border-slate-100">
                  <p className="text-sm font-bold text-slate-400 flex items-center justify-center gap-2">
                    <Check size={16} className={selectedEvent.status === 'CONFIRMED' ? "text-teal-500" : "text-red-400"} />
                    이 이벤트는 이미 **{selectedEvent.status === 'CONFIRMED' ? '승인' : '반려'}** 처리가 완료되었습니다.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- 🌟 [반려 사유 입력 모달] --- */}
      {rejectingEvent && (
        <div className="fixed inset-0 z-[11000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 font-noto">
          <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in duration-200">
            <div className="p-6 border-b flex justify-between items-center bg-red-50">
              <h2 className="text-lg font-bold flex items-center gap-2 text-red-600">
                <MessageSquareX size={20} /> 이벤트 반려 처리
              </h2>
              <button 
                onClick={() => {
                  setRejectingEvent(null);
                  setRejectionReason('');
                }} 
                className="p-1 hover:bg-red-100 rounded-full transition-colors text-red-400"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm font-semibold text-slate-800 mb-1">
                  [{rejectingEvent.eventTitle || rejectingEvent.title}]
                </p>
                <p className="text-xs text-muted-foreground">이 이벤트를 반려하시겠습니까? 아티스트에게 전달될 사유를 입력해주세요.</p>
              </div>
              
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="예: 포스터 화질이 너무 낮습니다. / 대관 일정이 겹칩니다."
                className="w-full h-32 p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-red-500/20 outline-none text-sm resize-none"
              />
            </div>
            
            <div className="p-4 bg-slate-50 border-t flex gap-2">
              <button 
                onClick={() => {
                  setRejectingEvent(null);
                  setRejectionReason('');
                }}
                className="flex-1 py-3 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-100 transition-all text-sm"
              >
                취소
              </button>
              <button 
                onClick={handleReject}  // ✅
                className="flex-1 py-3 bg-red-500 text-white font-bold rounded-xl shadow-lg shadow-red-500/20 hover:bg-red-600 transition-all text-sm"
              >
                반려 확정
              </button>
            </div>
          </div>
        </div>
      )}

    </Layout>
  );
}