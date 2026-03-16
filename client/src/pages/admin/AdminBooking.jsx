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
      
      setAllEvents(data || []);
      // 상태가 PENDING인 것만 대기 목록으로 필터링
      setPendingList(data.filter(e => e.approvalStatus === 'PENDING') || []);
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
        eventId: event.eventId, // DTO 필드명 확인 (eventId)
        status: isApproved ? 'CONFIRMED' : 'FAILED',
        rejectionReason: isApproved ? "" : "관리자 거절" 
      };

      await adminApi.post('/admin/event/confirm', payload);
      
      toast.success(isApproved ? `"${event.title}" 승인 완료` : `"${event.title}" 거절 완료`);
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

        {/* Stats - 실시간 데이터 연동 */}
        <div className="grid grid-cols-3 gap-3">
          <div className="glass-card rounded-2xl p-4 text-center soft-shadow">
            <p className="text-xl font-bold text-amber-600">{pendingList.length}</p>
            <p className="text-xs text-muted-foreground">승인 대기</p>
          </div>
          <div className="glass-card rounded-2xl p-4 text-center soft-shadow">
            <p className="text-xl font-bold text-teal-600">
              {allEvents.filter(e => e.approvalStatus === 'CONFIRMED').length}
            </p>
            <p className="text-xs text-muted-foreground">승인 완료</p>
          </div>
          <div className="glass-card rounded-2xl p-4 text-center soft-shadow">
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
            {activeTab === 'pending' && (
              <div className="space-y-4">
                {pendingList.length === 0 ? (
                  <div className="text-center py-16">
                    <Calendar size={48} className="text-muted-foreground/30 mx-auto mb-4" />
                    <p className="text-muted-foreground">처리할 이벤트가 없습니다</p>
                  </div>
                ) : (
                  pendingList.map((event) => (
                    <div key={event.eventId} className="glass-card rounded-2xl overflow-hidden soft-shadow">
                      <div className="flex flex-col sm:flex-row">
                        <div className="relative sm:w-48 h-36 sm:h-auto flex-shrink-0 bg-gray-100">
                          {/* 🌟 이미지 URL 대응 (eventSnapshot 등에서 확인) */}
                          <img 
                             src={event.image || 'https://placehold.co/400x200?text=No+Image'} 
                             alt={event.title} 
                             className="w-full h-full object-cover" 
                          />
                        </div>
                        <div className="p-4 flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-bold text-foreground">{event.title}</h3>
                              <p className="text-sm text-rose-500 font-medium">{event.artistName}</p>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                              <Clock size={11} />
                              {event.created_at ? new Date(event.created_at).toLocaleDateString() : 'N/A'}
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2 mb-3">
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Calendar size={12} className="text-rose-400" />
                              {new Date(event.eventDate).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <MapPin size={12} className="text-rose-400" />
                              {event.venue}
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Users size={12} className="text-rose-400" />
                              {event.totalCapacity?.toLocaleString()}석
                            </div>
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-600">
                              <Ticket size={12} />
                              {formatPrice(event.price)}
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => handleProcessApproval(event, true)} // 🌟 승인 API 호출
                              className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-white rounded-xl bg-teal-500 hover:bg-teal-600 transition-colors"
                            >
                              <Check size={16} /> 승인
                            </button>
                            <button
                              onClick={() => handleProcessApproval(event, false)} // 🌟 거절 API 호출
                              className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-red-600 rounded-xl bg-red-50 hover:bg-red-100 transition-colors"
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

            {activeTab === 'all' && (
              <div className="space-y-3">
                {allEvents.map((event) => (
                  <div key={event.eventId} className="glass-card rounded-2xl p-4 soft-shadow flex items-center gap-4">
                    <img src={event.image || 'https://placehold.co/100x100'} className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-foreground line-clamp-1">{event.title}</p>
                      <p className="text-xs text-muted-foreground">{new Date(event.eventDate).toLocaleDateString()} · {event.venue}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      event.approvalStatus === 'CONFIRMED' ? 'bg-teal-100 text-teal-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {event.approvalStatus === 'CONFIRMED' ? '승인됨' : event.approvalStatus}
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