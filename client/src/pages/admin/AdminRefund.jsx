import React, { useState } from 'react';
import { CheckCircle, XCircle, Clock, Search, Filter } from 'lucide-react';
import Layout from '@/components/Layout'; // Layout 경로 확인해서 가져오기!

const AdminRefund = () => {
  const [requests, setRequests] = useState([
    { id: 1, orderId: 'ORD-2026-0501', user: '수민', amount: 35000, reason: '단순 변심', date: '2026-03-15', status: 'pending' },
    { id: 2, orderId: 'ORD-2026-0488', user: '이하은', amount: 128000, reason: '상품 파손', date: '2026-03-14', status: 'pending' },
    { id: 3, orderId: 'ORD-2026-0450', user: '박지성', amount: 22000, reason: '배송 지연', date: '2026-03-12', status: 'approved' },
  ]);

  return (
    <Layout role="admin">
      <div className="p-6 lg:p-10 space-y-8 fade-in-up">
        {/* --- 상단 타이틀 --- */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            {/* 제목 크기를 2xl로 줄이고 하단 여백 살짝 추가 */}
            <h2 className="text-2xl font-bold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
                관리자 환불 관리
            </h2>
            {/* 기존 정산 관리 화면과 동일한 스타일의 설명 문구 */}
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
            <p className="text-3xl font-bold">12 <span className="text-lg font-normal text-muted-foreground">건</span></p>
          </div>
          <div className="glass-card soft-shadow p-6 rounded-2xl border-l-4 border-emerald-400">
            <div className="flex items-center gap-4 text-emerald-600 mb-2">
              <CheckCircle size={20} />
              <span className="text-sm font-semibold uppercase tracking-wider">처리 완료</span>
            </div>
            <p className="text-3xl font-bold">45 <span className="text-lg font-normal text-muted-foreground">건</span></p>
          </div>
          <div className="glass-card soft-shadow p-6 rounded-2xl border-l-4 border-rose-400">
            <div className="flex items-center gap-4 text-rose-600 mb-2">
              <Filter size={20} />
              <span className="text-sm font-semibold uppercase tracking-wider">오늘 총 환불액</span>
            </div>
            <p className="text-3xl font-bold text-rose-500">₩1,240,000</p>
          </div>
        </div>

        {/* --- 테이블 영역 --- */}
        <div className="glass-card soft-shadow rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-amber-50/50 border-b border-amber-100">
                <tr>
                  <th className="p-4 text-xs font-bold text-amber-700 uppercase">주문정보</th>
                  <th className="p-4 text-xs font-bold text-amber-700 uppercase">요청자</th>
                  <th className="p-4 text-xs font-bold text-amber-700 uppercase">환불금액</th>
                  <th className="p-4 text-xs font-bold text-amber-700 uppercase">사유</th>
                  <th className="p-4 text-xs font-bold text-amber-700 uppercase">상태</th>
                  <th className="p-4 text-xs font-bold text-amber-700 uppercase text-center">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rose-50/50">
                {requests.map((item) => (
                  <tr key={item.id} className="hover:bg-amber-50/20 transition-colors group">
                    <td className="p-4">
                      <div className="font-semibold text-sm">{item.orderId}</div>
                      <div className="text-[11px] text-muted-foreground">{item.date}</div>
                    </td>
                    <td className="p-4 text-sm font-medium">{item.user}</td>
                    <td className="p-4 font-bold text-sm">₩{item.amount.toLocaleString()}</td>
                    <td className="p-4 text-sm text-muted-foreground">{item.reason}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-[11px] font-bold ${
                        item.status === 'pending' ? 'badge-rose' : 'badge-mint'
                      }`}>
                        {item.status === 'pending' ? '승인 대기' : '처리 완료'}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {/* 승인: 아주 작게(text-[9px]), 패딩 최소화 */}
                        <button className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-amber-50 text-amber-600 hover:bg-amber-500 hover:text-white transition-all text-[11px] font-medium border border-amber-200/50 leading-tight">
                            <CheckCircle size={12} />
                            <span>승인</span>
                        </button>

                        {/* 거절: 아주 작게(text-[9px]), 패딩 최소화 */}
                        <button className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-rose-50 text-rose-400 hover:bg-rose-500 hover:text-white transition-all text-[11px] font-medium border border-rose-100 leading-tight">
                            <XCircle size={12} />
                            <span>거절</span>
                        </button>
                        </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminRefund;