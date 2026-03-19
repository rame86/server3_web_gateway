import { useState, useEffect } from 'react'; // 🌟 데이터 로드를 위해 useEffect 추가
import Layout from '@/components/Layout';
import { Calendar, Check, X, Eye, Clock, MapPin, Users, Ticket } from 'lucide-react';
import { formatPrice, eventTypeLabel } from '@/lib/data'; // events 더미는 제거
import { toast } from 'sonner';
import { adminApi } from '@/lib/api'; // 🌟 관리자 API (8080 포트 설정된 axios 인스턴스)

export default function AdminBooking() {
  const [activeTab, setActiveTab] = useState('pending');
  const [pendingList, setPendingList] = useState([]); // 🌟 대기 목록 상태 관리
  const [allEvents, setAllEvents] = useState([]);     // 🌟 전체 목록 상태 관리
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [bookingStart, setBookingStart] = useState('');
  const [bookingEnd, setBookingEnd] = useState('');

  // 1️⃣ [GET] 데이터 불러오기 함수
  const fetchData = async () => {
    try {
      setLoading(true);
      // 대기 중인 목록 (Spring: /admin/event/list 혹은 별도 대기 쿼리)
      // 만약 /admin/event/list가 전체라면 필터링해서 사용
      const { data } = await adminApi.get('/admin/event/list');
      // 🌟 이 로그를 추가하고 브라우저 콘솔(F12)을 봐봐!
      console.log("📡 백엔드 응답 데이터:", data);
      // 🌟 [중요] 백엔드에서 'title'로 오면 'eventTitle'로도 쓸 수 있게 복사해줌
      const formattedData = data.map(item => ({
        ...item,
        eventTitle: item.eventTitle || item.title, // 둘 중 있는 걸로 사용
        location: item.location || item.venue,
        eventStartDate: item.eventStartDate || item.eventDate,
        totalCapacity: item.totalCapacity || item.total_capacity || 0
      }));
      // 1. 전체 데이터 중 'EVENT' 카테고리만 먼저 걸러냄
      const eventOnlyData = data.filter(item => item.category === 'EVENT');
      // 2. 전체 이벤트 탭용 데이터 세팅
      setAllEvents(eventOnlyData);
      // 3. 승인 대기(PENDING) 탭용 데이터 세팅
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

  // 2️⃣ [POST] 승인/거절 처리 함수 (Spring: /admin/event/confirm 호출)
const handleProcessApproval = async (event, isApproved) => {
  try {
    // 승인일 때는 시간이 필수니까 체크!
    if (isApproved && (!bookingStart || !bookingEnd)) {
      return toast.error("예매 시작 및 종료 시간을 설정해주세요.");
    }

    const payload = {
      eventId: event.approvalId, 
      status: isApproved ? 'CONFIRMED' : 'FAILED',
      rejectionReason: isApproved ? "" : "관리자 거절 사유 입력",
      eventTitle: event.eventTitle,
      price: event.price || 0,
      // 🌟 여기에 관리자가 설정한 시간 추가해서 보냄
      bookingStartDate: bookingStart,
      bookingEndDate: bookingEnd
    };

    console.log("📤 백엔드로 보내는 데이터:", payload);
    await adminApi.post('/admin/event/confirm', payload);
    
    toast.success(isApproved ? "승인 완료" : "거절 완료");
    setSelectedEvent(null); // 모달 닫기
    fetchData(); 
  } catch (error) {
    console.error("처리 실패:", error);
    toast.error("처리 도중 오류가 발생했습니다.");
  }
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

        {/* Stats - 실시간 데이터 연동 (필드명 status로 통일) */}
        <div className="grid grid-cols-3 gap-3">
          <div className="glass-card rounded-2xl p-4 text-center soft-shadow bg-white border">
            <p className="text-xl font-bold text-amber-600">{pendingList.length}</p>
            <p className="text-xs text-muted-foreground">승인 대기</p>
          </div>
          <div className="glass-card rounded-2xl p-4 text-center soft-shadow bg-white border">
            <p className="text-xl font-bold text-teal-600">
              {/* 🌟 status 필드로 필터링 */}
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
                    <div key={event.approvalId} className="glass-card rounded-2xl overflow-hidden soft-shadow bg-white border">
                      <div className="flex flex-col sm:flex-row">
                        {/* 이미지: event.image 필드 사용 */}
                        <div className="relative sm:w-48 h-36 sm:h-auto flex-shrink-0 bg-gray-100">
                          <img 
                              src={event.imageUrl || 'https://placehold.co/400x200?text=Lumina+Pulse'} 
                              alt={event.eventTitle || event.title} 
                              className="w-full h-full object-cover" 
                          />
                        </div>
                        
                        <div className="p-4 flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              {/* 🌟 제목: eventTitle (또는 title) */}
                              <h3 className="font-bold text-lg text-foreground">{event.eventTitle || event.title || "제목 없음"}</h3>
                              {/* 🌟 아티스트: artistName */}
                              <p className="text-sm text-rose-500 font-medium">{event.artistName || '신청 아티스트'}</p>
                            </div>
                            
                            <div className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                              <Clock size={11} />
                              {/* 🌟 신청일: createdAt */}
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
                              {/* 🌟 공연일: eventStartDate */}
                              {event.eventStartDate ? new Date(event.eventStartDate).toLocaleDateString() : '일정 미정'}
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <MapPin size={12} className="text-rose-400" />
                              {/* 🌟 장소: location */}
                              {event.location || '장소 미정'}
                            </div>
                            {/* 🌟 실시간 잔여석 정보 추가 */}
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Users size={12} className="text-rose-400" />
                              <span className="font-medium text-foreground">
                                {/* 백엔드 DTO의 stock 필드 사용 */}
                                {event.stock || 0}석 남음 
                              </span>
                              <span className="text-[10px] text-gray-400">
                                / {(event.totalCapacity || 0).toLocaleString()}석
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-600">
                              <Ticket size={12} />
                              {/* 🌟 가격: price */}
                              {/* {formatPrice(event.price || 0)} */}
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => handleProcessApproval(event, true)}
                              className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-white rounded-xl bg-teal-500 hover:bg-teal-600 transition-colors shadow-sm"
                            >
                              <Check size={16} /> 승인
                            </button>
                            <button
                              onClick={() => handleProcessApproval(event, false)}
                              className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-red-600 rounded-xl bg-red-50 hover:bg-red-100 transition-colors border border-red-100"
                            >
                              <X size={16} /> 거절
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* 🌟 [탭2] 전체 이벤트: 기존 스타일 복구 (가격, 잔여석 포함) */}
            {activeTab === 'all' && (
              <div className="space-y-3">
                {allEvents.map((event) => (
                  <div key={event.approvalId || event.eventId} className="glass-card rounded-2xl p-4 soft-shadow flex items-center gap-4 bg-white border">
                    {/* 1. 이미지 */}
                    <img 
                      src={event.imageUrl || event.imageURL || event.image || 'https://placehold.co/100x100?text=No+Img'} 
                      alt={event.eventTitle || event.title} 
                      className="w-16 h-16 rounded-xl object-cover flex-shrink-0 bg-gray-50" 
                    />
                    
                    {/* 2. 정보 영역 */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-foreground line-clamp-1">
                        {event.eventTitle || event.title || "제목 없음"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {event.eventStartDate ? new Date(event.eventStartDate).toLocaleDateString() : '일정 미정'} · {event.location || '장소 미정'}
                      </p>
                      
                      {/* 🌟 가격 및 잔여석 표시 (기존 스타일) */}
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-rose-600 font-semibold">
                          {formatPrice(event.price || 0)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          잔여 {event.stock || 0}석
                        </span>
                      </div>
                    </div>

                    {/* 3. 상태 뱃지 (동적 색상 및 텍스트 매핑) */}
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${
                      event.status === 'CONFIRMED' ? 'bg-teal-100 text-teal-700' : 
                      event.status === 'PENDING' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {
                        event.status === 'CONFIRMED' ? '승인됨' : 
                        event.status === 'PENDING' ? '대기중' : 
                        event.status === 'FAILED' ? '거절됨' : 
                        event.status === 'REJECTED' ? '거절됨' : event.status
                      }
                    </span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
      {/* --- [상세 정보 모달] 예매 시간 설정 및 좌석 확인 --- */}
      {selectedEvent && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 font-noto">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in duration-200">
            {/* Header */}
            <div className="p-6 border-b bg-amber-50 flex justify-between items-center">
              <h2 className="text-xl font-bold flex items-center gap-2 text-amber-900">
                <Ticket size={22} className="text-amber-600"/> 이벤트 최종 승인 검토
              </h2>
              <button onClick={() => setSelectedEvent(null)} className="p-2 hover:bg-black/5 rounded-full transition-colors"><X /></button>
            </div>

            {/* Content */}
            <div className="p-8 overflow-y-auto space-y-8 custom-scrollbar">
              {/* 이벤트 요약 섹션 */}
              <div className="flex gap-5 p-6 bg-slate-50 rounded-[2.5rem] border border-slate-100">
                <img src={selectedEvent.imageUrl || 'https://placehold.co/200x200'} className="w-28 h-28 rounded-2xl object-cover shadow-md" />
                <div className="flex-1">
                  <h3 className="font-bold text-xl text-slate-800">{selectedEvent.eventTitle || selectedEvent.title}</h3>
                  <p className="text-sm text-rose-500 font-bold mb-2">{selectedEvent.artistName}</p>
                  <div className="space-y-1 text-xs text-muted-foreground font-medium">
                    <p className="flex items-center gap-1.5"><MapPin size={14} className="text-slate-400"/> {selectedEvent.location}</p>
                    <p className="flex items-center gap-1.5"><Calendar size={14} className="text-slate-400"/> 공연: {new Date(selectedEvent.eventStartDate).toLocaleString()}</p>
                  </div>
                </div>
              </div>
              {/* 🌟 관리자 설정: 예매 시간 설정 */}
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
                <p className="text-[10px] text-amber-600/70 font-medium ml-1">* 승인 즉시 설정된 시간에 맞춰 예매가 활성화됩니다.</p>
              </div>

              {/* 🌟 좌석표 확인 섹션 (루미나 50/100/200 전용) */}
              <div className="space-y-4">
                <h4 className="text-xs font-black text-primary uppercase tracking-[0.2em] ml-1">Seat Layout Plan</h4>
                <div className="p-6 border-2 border-dashed border-slate-200 rounded-[2.5rem] bg-slate-50/30">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm font-bold text-slate-600">공연장: {selectedEvent.location}</span>
                    <span className="text-xs font-black px-3 py-1 bg-white border border-slate-200 rounded-full shadow-sm">Total {selectedEvent.totalCapacity} Seats</span>
                  </div>
                  
                  {/* 좌석 배치도 컴포넌트 들어갈 자리 */}
                  <div className="aspect-[16/9] bg-white rounded-3xl border border-slate-100 shadow-inner flex items-center justify-center relative overflow-hidden">
                    {/* 💡 여기에 UserBookingSeatSelect.jsx를 ReadOnly로 임포트해서 넣으면 돼! */}
                    <div className="text-center space-y-2">
                      <Users size={32} className="mx-auto text-slate-200" />
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Venue Map Visualized</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Footer Actions */}
            <div className="p-8 border-t bg-white flex gap-4 items-center font-noto">
              <button 
                onClick={() => handleProcessApproval(selectedEvent, false)}
                className="flex-1 py-4 bg-red-50 text-red-500 font-bold rounded-full border border-red-100 hover:bg-red-100 transition-all text-sm shadow-sm"
              >
                승인 반려
              </button>
              <button 
                onClick={() => handleProcessApproval(selectedEvent, true)}
                className="flex-[2.5] py-4 bg-teal-500 text-white font-bold rounded-full shadow-xl shadow-teal-100 hover:bg-teal-600 active:scale-95 transition-all flex items-center justify-center gap-2 text-sm"
              >
                <Check size={18}/> 최종 승인 및 예매 오픈
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}