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
        eventStartDate: item.eventStartDate || item.eventDate
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
      const payload = {
        // 🌟 자바 DTO의 @JsonProperty("eventId")에 맞춰서 전달
        eventId: event.approvalId, 
        status: isApproved ? 'CONFIRMED' : 'FAILED',
        rejectionReason: isApproved ? "" : "관리자 거절 사유 입력",
        // 필요하다면 DTO의 다른 필드들도 채워줄 수 있음
        eventTitle: event.eventTitle,
        price: event.price || 0
      };

      console.log("📤 백엔드로 보내는 데이터:", payload);
      await adminApi.post('/admin/event/confirm', payload);
      
      toast.success(isApproved ? "승인 완료" : "거절 완료");
      fetchData(); // 🌟 처리 후 목록 새로고침
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
                              {formatPrice(event.price || 0)}
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
    </Layout>
  );
}