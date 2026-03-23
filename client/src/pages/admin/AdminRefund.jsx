import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, Search, Filter } from 'lucide-react';
import Layout from '@/components/Layout';
import axios from 'axios';
import { toast } from 'sonner';

// 🌟 핵심: 컴포넌트 외부 최상단에 선언하여 스코프(유효 범위) 에러 원천 차단 및 하드코딩 방지
const API_URL = import.meta.env.VITE_API_GATEWAY_URL;

const AdminRefund = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. 화면 켜질 때 환불 대기 목록 가져오기
  useEffect(() => {
    fetchRefunds();
  }, []);

  const fetchRefunds = async () => {
    try {
      setLoading(true);
      
      // 🌟 [핵심 수정] 컨트롤러가 @RequestMapping("/admin") 이니까 
      // 주소도 /msa/admin/refund 로 쏴야 서버가 찾아낼 수 있어!
      const response = await axios.get(`${API_URL}/msa/admin/refund`);

      if (Array.isArray(response.data)) {
        setRequests(response.data);
      } else {
        setRequests([]);
      }
    } catch (error) {
      console.error('환불 목록 조회 실패:', error);
      toast.error('목록을 불러오지 못했습니다.');
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  // 2. 승인/거절 버튼 클릭 시 실행할 함수
  const handleProcessRefund = async (targetId, action) => {
    const actionText = action === 'APPROVED' ? '승인' : '거절';
    
    // 🌟 [핵심 수정] 하드코딩된 '1' 대신 로컬 스토리지에서 실제 관리자 ID를 가져옴
    const adminId = localStorage.getItem('memberId') || localStorage.getItem('userId');

    if (!adminId) {
      toast.error("관리자 정보를 확인할 수 없습니다. 다시 로그인해 주세요.");
      return;
    }

    if (!window.confirm(`해당 요청을 ${actionText} 처리하시겠습니까?`)) return;

    try {
      // 🌟 서버로 실제 관리자 ID를 함께 보냄
      await axios.post(`${API_URL}/msa/admin/refund`, {
        targetId: targetId,
        status: action,
        adminId: Number(adminId) // 숫자로 형변환해서 전송
      });

      toast.success(`환불 요청이 ${actionText}되었습니다.`);
      fetchRefunds(); // 목록 새로고침
    } catch (error) {
      console.error(`처리 실패:`, error);
      toast.error(`처리 중 오류가 발생했습니다.`);
    }
  };

  return (
    <Layout role="admin">
      <div className="p-6 lg:p-10 space-y-8 fade-in-up">
        {/* --- 상단 타이틀 --- */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
                관리자 환불 관리
            </h2>
            <p className="text-sm text-muted-foreground">플랫폼 예매 환불 요청 내역 및 처리 현황</p>
          </div>
          <div className="relative group">
            <input 
              type="text" 
              placeholder="주문번호 검색..." 
              className="pl-10 pr-4 py-2 bg-white border border-rose-100 rounded-xl focus:ring-2 focus:ring-amber-400 outline-none transition-all w-full md:w-64"
            />
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-amber-500" />
          </div>
        </header>

        {/* --- 대시보드 요약 카드 --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card soft-shadow p-6 rounded-2xl border-l-4 border-amber-400">
            <div className="flex items-center gap-4 text-amber-600 mb-2">
              <Clock size={20} />
              <span className="text-sm font-semibold uppercase tracking-wider">대기 중</span>
            </div>
            <p className="text-3xl font-bold">{requests.length} <span className="text-lg font-normal text-muted-foreground">건</span></p>
          </div>
          <div className="glass-card soft-shadow p-6 rounded-2xl border-l-4 border-emerald-400">
            <div className="flex items-center gap-4 text-emerald-600 mb-2">
              <CheckCircle size={20} />
              <span className="text-sm font-semibold uppercase tracking-wider">오늘 처리</span>
            </div>
            <p className="text-3xl font-bold">- <span className="text-lg font-normal text-muted-foreground">건</span></p>
          </div>
          <div className="glass-card soft-shadow p-6 rounded-2xl border-l-4 border-rose-400">
            <div className="flex items-center gap-4 text-rose-600 mb-2">
              <Filter size={20} />
              <span className="text-sm font-semibold uppercase tracking-wider">오늘 총 환불액</span>
            </div>
            <p className="text-3xl font-bold text-rose-500">-</p>
          </div>
        </div>

        {/* --- 테이블 영역 --- */}
        <div className="glass-card soft-shadow rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-amber-50/50 border-b border-amber-100">
                <tr>
                  <th className="p-4 text-xs font-bold text-amber-700 uppercase">타겟 정보</th>
                  <th className="p-4 text-xs font-bold text-amber-700 uppercase">회원 번호</th>
                  <th className="p-4 text-xs font-bold text-amber-700 uppercase">환불 금액</th>
                  <th className="p-4 text-xs font-bold text-amber-700 uppercase">제목/사유</th>
                  <th className="p-4 text-xs font-bold text-amber-700 uppercase">상태</th>
                  <th className="p-4 text-xs font-bold text-amber-700 uppercase text-center">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rose-50/50">
                {loading ? (
                  <tr><td colSpan="6" className="p-6 text-center text-sm text-muted-foreground">데이터를 불러오는 중입니다...</td></tr>
                ) : requests.length === 0 ? (
                  <tr><td colSpan="6" className="p-6 text-center text-sm text-muted-foreground">대기 중인 환불 요청이 없습니다.</td></tr>
                ) : (
                  requests?.map((item) => (
                    <tr key={item.targetId || item.id} className="hover:bg-amber-50/20 transition-colors group">
                      <td className="p-4">
                        <div className="font-semibold text-sm">{item.targetId}</div>
                        {item.createdAt && <div className="text-[11px] text-muted-foreground">{new Date(item.createdAt).toLocaleDateString()}</div>}
                      </td>
                      <td className="p-4 text-sm font-medium">{item.memberId}</td>
                      <td className="p-4 font-bold text-sm">₩{item.totalPrice?.toLocaleString()}</td>
                      <td className="p-4">
                        <div className="text-sm font-medium line-clamp-1">{item.title}</div>
                      </td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-[11px] font-bold ${
                          item.status === 'PENDING' ? 'badge-rose' : 'badge-mint'
                        }`}>
                          {item.status === 'PENDING' ? '승인 대기' : item.status}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {/* 🌟 승인 액션 */}
                          <button 
                            onClick={() => handleProcessRefund(item.targetId, 'APPROVED')}
                            className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-amber-50 text-amber-600 hover:bg-amber-500 hover:text-white transition-all text-[11px] font-medium border border-amber-200/50 leading-tight"
                          >
                            <CheckCircle size={12} />
                            <span>승인</span>
                          </button>

                          {/* 🌟 거절 액션 */}
                          <button 
                            onClick={() => handleProcessRefund(item.targetId, 'REJECTED')}
                            className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-rose-50 text-rose-400 hover:bg-rose-500 hover:text-white transition-all text-[11px] font-medium border border-rose-100 leading-tight"
                          >
                            <XCircle size={12} />
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
      </div>
    </Layout>
  );
};

export default AdminRefund;