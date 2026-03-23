import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, Search, Filter, AlertCircle, AlertTriangle, History } from 'lucide-react';
import Layout from '@/components/Layout';
import { toast } from 'sonner';
import { resApi, coreApi } from '@/lib/api';

const AdminRefund = () => {
  const [requests, setRequests] = useState([]);
  const [completed, setCompleted] = useState([]);   // 🌟 완료 내역
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('pending'); // 🌟 탭 상태

  // 모달 상태
  const [confirmTarget, setConfirmTarget] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    fetchAll();
  }, []);

  // 대기 + 완료 동시 로드
  const fetchAll = async () => {
    setLoading(true);
    await Promise.all([fetchRefunds(), fetchCompleted()]);
    setLoading(false);
  };

  const fetchRefunds = async () => {
    try {
      const response = await resApi.post('/refundList', { _t: Date.now() });
      const data = response.data.data || response.data;
      setRequests(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('대기 목록 조회 실패:', error.config?.url);
      setRequests([]);
    }
  };

  const fetchCompleted = async () => {
    try {
      const response = await resApi.post('/refundCompletedList', { _t: Date.now() });
      const data = response.data.data || response.data;
      setCompleted(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('완료 내역 조회 실패:', error.config?.url);
      setCompleted([]);
    }
  };

  const handleProcessRefund = (item, action) => {
    if (action === 'REJECTED') {
      setRejectReason('');
      setRejectTarget({ item });
    } else {
      setConfirmTarget({ item, action });
    }
  };

// 승인 확정
const handleApproveSubmit = async () => {
    const { item, action } = confirmTarget;
    setConfirmTarget(null);
    
    // ✅ 즉시 목록에서 제거 (낙관적 업데이트)
    setRequests(prev => prev.filter(r => r.refundId !== item.refundId));
    
    try {
      await coreApi.post('/admin/refund', {
        refundId: item.refundId,
        targetId: item.targetId,
        status: action,
        rejectionReason: ''
      });
      toast.success('승인 처리가 완료되었습니다..');
      setTimeout(() => fetchAll(), 3000); // 3초 후 백그라운드 새로고침
    } catch (error) {
      console.error('처리 실패:', error);
      toast.error('처리에 실패했습니다. 다시 시도해주세요.');
      fetchAll(); // 실패 시 원래 데이터로 복원
    }
};

// 거절 확정
const handleRejectSubmit = async () => {
    if (!rejectReason.trim()) return toast.error('거절 사유를 작성해주세요.');
    const { item } = rejectTarget;
    setRejectTarget(null);

    // ✅ 즉시 목록에서 제거 (낙관적 업데이트)
    setRequests(prev => prev.filter(r => r.refundId !== item.refundId));

    try {
      await coreApi.post('/admin/refund', {
        refundId: item.refundId,
        targetId: item.targetId,
        status: 'REJECTED',
        rejectionReason: rejectReason
      });
      toast.success('거절 처리가 완료되었습니다.');
      setTimeout(() => fetchAll(), 3000); // 3초 후 백그라운드 새로고침
    } catch (error) {
      console.error('처리 실패:', error);
      toast.error('처리에 실패했습니다. 다시 시도해주세요.');
      fetchAll(); // 실패 시 원래 데이터로 복원
    }
};

  const filteredRequests = requests.filter(req =>
    req.targetId?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredCompleted = completed.filter(req =>
    req.targetId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout role="admin">
      <div className="p-6 lg:p-10 space-y-8 fade-in-up">

        {/* --- 상단 헤더 --- */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
              관리자 환불 관리
            </h2>
            <p className="text-sm text-muted-foreground">예약 서비스(res)의 실시간 환불 요청 내역</p>
          </div>
          <div className="relative group">
            <input
              type="text"
              placeholder="티켓 코드 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white border border-rose-100 rounded-xl focus:ring-2 focus:ring-amber-400 outline-none transition-all w-full md:w-64"
            />
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-amber-500" />
          </div>
        </header>

        {/* --- 대시보드 요약 --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card soft-shadow p-6 rounded-2xl border-l-4 border-amber-400">
            <div className="flex items-center gap-4 text-amber-600 mb-2">
              <Clock size={20} />
              <span className="text-sm font-semibold uppercase tracking-wider">대기 중인 요청</span>
            </div>
            <p className="text-3xl font-bold">{requests.length} <span className="text-lg font-normal text-muted-foreground">건</span></p>
          </div>
          <div className="glass-card soft-shadow p-6 rounded-2xl border-l-4 border-emerald-400">
            <div className="flex items-center gap-4 text-emerald-600 mb-2">
              <CheckCircle size={20} />
              <span className="text-sm font-semibold uppercase tracking-wider">평균 환불 금액</span>
            </div>
            <p className="text-3xl font-bold">
              ₩{requests.length > 0
                ? Math.round(requests.reduce((acc, cur) => acc + (cur.totalPrice || 0), 0) / requests.length).toLocaleString()
                : 0}
              <span className="text-lg font-normal text-muted-foreground"> /건</span>
            </p>
          </div>
          <div className="glass-card soft-shadow p-6 rounded-2xl border-l-4 border-rose-400">
            <div className="flex items-center gap-4 text-rose-600 mb-2">
              <Filter size={20} />
              <span className="text-sm font-semibold uppercase tracking-wider">총 환불 대기 금액</span>
            </div>
            <p className="text-3xl font-bold text-rose-500">
              ₩{requests.reduce((acc, cur) => acc + (cur.totalPrice || 0), 0).toLocaleString()}
            </p>
          </div>
        </div>

        {/* --- 탭 네비게이션 --- */}
        <div className="flex gap-2 bg-secondary/50 p-1.5 rounded-2xl border border-border/50 w-fit">
          <button
            onClick={() => setActiveTab('pending')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'pending' ? 'bg-white text-amber-600 shadow-md' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Clock size={16} />
            승인 대기
            {requests.length > 0 && (
              <span className="ml-1 px-2 py-0.5 bg-amber-100 text-amber-600 rounded-full text-[11px] font-black">
                {requests.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'completed' ? 'bg-white text-emerald-600 shadow-md' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <History size={16} />
            환불 완료 내역
            {completed.length > 0 && (
              <span className="ml-1 px-2 py-0.5 bg-emerald-100 text-emerald-600 rounded-full text-[11px] font-black">
                {completed.length}
              </span>
            )}
          </button>
        </div>

        {/* --- 승인 대기 탭 --- */}
        {activeTab === 'pending' && (
          <div className="glass-card soft-shadow rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-amber-50/50 border-b border-amber-100">
                  <tr>
                    <th className="p-4 text-xs font-bold text-amber-700 uppercase">티켓 코드</th>
                    <th className="p-4 text-xs font-bold text-amber-700 uppercase">회원 번호</th>
                    <th className="p-4 text-xs font-bold text-amber-700 uppercase">환불 금액</th>
                    <th className="p-4 text-xs font-bold text-amber-700 uppercase">이벤트 / 사유</th>
                    <th className="p-4 text-xs font-bold text-amber-700 uppercase">상태</th>
                    <th className="p-4 text-xs font-bold text-amber-700 uppercase text-center">관리 액션</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-rose-50/50">
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="p-10 text-center">
                        <div className="flex justify-center items-center gap-2 text-muted-foreground">
                          <Clock className="animate-spin" size={20} />
                          <span>데이터를 불러오고 있어...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredRequests.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="p-10 text-center text-muted-foreground">
                        <div className="flex flex-col items-center gap-2">
                          <AlertCircle size={40} className="text-rose-200" />
                          <p>대기 중인 환불 요청이 하나도 없네!</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredRequests.map((item) => (
                      <tr key={item.refundId} className="hover:bg-amber-50/20 transition-colors group">
                        <td className="p-4">
                          <div className="font-semibold text-sm">{item.targetId}</div>
                          <div className="text-[11px] text-muted-foreground">
                            {item.createdAt ? new Date(item.createdAt).toLocaleString() : '-'}
                          </div>
                        </td>
                        <td className="p-4 text-sm font-medium text-slate-600">{item.memberId}</td>
                        <td className="p-4 font-bold text-sm text-rose-500">
                          ₩{item.totalPrice?.toLocaleString()}
                        </td>
                        <td className="p-4">
                          <div className="text-sm font-medium line-clamp-1">{item.title}</div>
                          <div className="text-[11px] text-muted-foreground italic">"{item.reason || '사유 없음'}"</div>
                        </td>
                        <td className="p-4">
                          <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-500 border border-rose-100">
                            승인 대기
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleProcessRefund(item, 'APPROVED')}
                              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-500 hover:text-white transition-all text-xs font-bold border border-amber-200"
                            >
                              <CheckCircle size={14} />
                              <span>승인</span>
                            </button>
                            <button
                              onClick={() => handleProcessRefund(item, 'REJECTED')}
                              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white transition-all text-xs font-bold border border-rose-100"
                            >
                              <XCircle size={14} />
                              <span>거절</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- 환불 완료 내역 탭 --- */}
        {activeTab === 'completed' && (
          <div className="glass-card soft-shadow rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-emerald-50/50 border-b border-emerald-100">
                  <tr>
                    <th className="p-4 text-xs font-bold text-emerald-700 uppercase">티켓 코드</th>
                    <th className="p-4 text-xs font-bold text-emerald-700 uppercase">회원 번호</th>
                    <th className="p-4 text-xs font-bold text-emerald-700 uppercase">환불 금액</th>
                    <th className="p-4 text-xs font-bold text-emerald-700 uppercase">이벤트 / 사유</th>
                    <th className="p-4 text-xs font-bold text-emerald-700 uppercase">요청일</th>
                    <th className="p-4 text-xs font-bold text-emerald-700 uppercase">처리 완료일</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-50/50">
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="p-10 text-center">
                        <div className="flex justify-center items-center gap-2 text-muted-foreground">
                          <Clock className="animate-spin" size={20} />
                          <span>데이터를 불러오고 있어...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredCompleted.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="p-10 text-center text-muted-foreground">
                        <div className="flex flex-col items-center gap-2">
                          <History size={40} className="text-emerald-200" />
                          <p>완료된 환불 내역이 없어!</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredCompleted.map((item) => (
                      <tr key={item.refundId} className="hover:bg-emerald-50/20 transition-colors">
                        <td className="p-4">
                          <div className="font-semibold text-sm">{item.targetId}</div>
                        </td>
                        <td className="p-4 text-sm font-medium text-slate-600">{item.memberId}</td>
                        <td className="p-4 font-bold text-sm text-emerald-600">
                          ₩{item.totalPrice?.toLocaleString()}
                        </td>
                        <td className="p-4">
                          <div className="text-sm font-medium line-clamp-1">{item.title}</div>
                          <div className="text-[11px] text-muted-foreground italic">"{item.reason || '사유 없음'}"</div>
                        </td>
                        <td className="p-4 text-[11px] text-muted-foreground">
                          {item.createdAt ? new Date(item.createdAt).toLocaleString() : '-'}
                        </td>
                        <td className="p-4">
                          <div className="text-[11px] text-emerald-600 font-bold">
                            {item.processedAt ? new Date(item.processedAt).toLocaleString() : '-'}
                          </div>
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
                            완료
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ── 승인 확인 모달 ── */}
      {confirmTarget && (
        <div className="fixed inset-0 w-full h-full z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="glass-card w-full max-w-md rounded-[2.5rem] p-10 space-y-6 bg-white shadow-2xl border border-amber-100 fade-in-up">
            <div className="text-center">
              <div className="w-20 h-20 bg-amber-50 text-amber-500 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-amber-100">
                <CheckCircle size={36} />
              </div>
              <h2 className="text-2xl font-bold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>환불 승인</h2>
              <p className="text-sm text-muted-foreground mt-2 font-medium">
                <span className="text-amber-600 font-bold">"{confirmTarget.item.targetId}"</span> 티켓의<br />
                환불 요청을 승인할까요?
              </p>
              <p className="text-lg font-bold text-rose-500 mt-3">
                ₩{confirmTarget.item.totalPrice?.toLocaleString()}
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setConfirmTarget(null)}
                className="flex-1 py-4 font-bold text-muted-foreground hover:bg-secondary transition-all rounded-2xl"
              >
                취소
              </button>
              <button
                onClick={handleApproveSubmit}
                className="flex-[1.5] py-4 rounded-2xl bg-amber-500 text-white font-bold shadow-xl hover:bg-amber-600 active:scale-95 transition-all"
              >
                승인 확정
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 거절 사유 모달 ── */}
      {rejectTarget && (
        <div className="fixed inset-0 w-full h-full z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="glass-card w-full max-w-md rounded-[2.5rem] p-10 space-y-6 bg-white shadow-2xl border border-rose-100 fade-in-up">
            <div className="text-center">
              <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-rose-100">
                <AlertTriangle size={36} />
              </div>
              <h2 className="text-2xl font-bold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>환불 거절 사유</h2>
              <p className="text-sm text-muted-foreground mt-2 font-medium">
                <span className="text-rose-500 font-bold">"{rejectTarget.item.targetId}"</span> 티켓의<br />
                환불 거절 사유를 입력해주세요.
              </p>
            </div>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="구체적인 거절 사유를 입력하세요..."
              className="w-full h-36 p-5 rounded-3xl bg-secondary/30 border-none focus:ring-4 focus:ring-rose-100 text-sm leading-relaxed outline-none resize-none"
            />
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => { setRejectTarget(null); setRejectReason(''); }}
                className="flex-1 py-4 font-bold text-muted-foreground hover:bg-secondary transition-all rounded-2xl"
              >
                취소
              </button>
              <button
                onClick={handleRejectSubmit}
                className="flex-[1.5] py-4 rounded-2xl bg-rose-500 text-white font-bold shadow-xl hover:bg-rose-600 active:scale-95 transition-all"
              >
                거절 확정
              </button>
            </div>
          </div>
        </div>
      )}

    </Layout>
  );
};

export default AdminRefund;
