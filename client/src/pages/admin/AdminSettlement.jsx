import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { useWebSocket } from '@/contexts/WebSocketContext';
import { BarChart3, TrendingUp, Wallet, Download, CheckCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { coreApi } from '@/lib/api';

export default function AdminSettlement() {
  const stompClient = useWebSocket();
  const [settlements, setSettlements] = useState([]);
  const [summary, setSummary] = useState({
    thisMonthTotal: 0,
    feeTotal: 0,
    artistSettlementTotal: 0,
    completedSettlementCount: 0
  });
  const [monthlyTrend, setMonthlyTrend] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 초기 데이터 요청 (MQ 트리거)
  const fetchInitialData = async () => {
    try {
      setIsLoading(true);
      await coreApi.get('/admin/settlement');
      console.log('=====> [Settlement] 초기 데이터 요청 완료');
    } catch (error) {
      console.error('Failed to trigger settlement data:', error);
      toast.error('정산 데이터를 요청하지 못했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  // 웹소켓 구독
  useEffect(() => {
    if (!stompClient) return;

    const subscription = stompClient.subscribe('/topic/admin/settlement', (frame) => {
      try {
        const response = JSON.parse(frame.body);
        console.log('📢 [WebSocket] 수신된 원본 데이터:', response);
        
        // 데이터가 response.payload 안에 들어있을 수도 있고, 
        // 이미지처럼 response 자체가 객체일 수도 있으니 둘 다 대응합니다.
        const data = response.payload || response; 

        // 1. 요약 데이터 매핑
        if (data.summary) {
          setSummary({
            thisMonthTotal: data.summary.totalGrossAmount || 0,
            feeTotal: data.summary.totalPlatformFee || 0,
            artistSettlementTotal: data.summary.totalSettledAmount || 0,
            completedSettlementCount: data.artistSettlements?.length || 0
          });
        }

        // 2. 아티스트별 리스트 매핑
        if (data.artistSettlements) {
          const mappedSettlements = data.artistSettlements.map((s, index) => ({
            id: s.artistId || index,
            artist: s.artistName,
            amount: s.grossAmount,
            fee: s.feeAmount,
            net: s.netAmount,
            status: s.status === 'COMPLETED' ? 'completed' : 'pending',
            date: '실시간' // 혹은 s.lastTransactionDate 변환
          }));
          setSettlements(mappedSettlements);
        }

        // ⭐ 3. 월별 트렌드 데이터 매핑 (여기 추가/수정!)
        if (data.monthlyTrend) {
          const mappedTrend = data.monthlyTrend.map(t => ({
            month: t.month,        // "2026-03"
            total: t.totalGross,   // 👈 서버의 totalGross를 차트의 total로 매핑
            fee: t.totalFee        // 👈 서버의 totalFee를 차트의 fee로 매핑
          }));
          setMonthlyTrend(mappedTrend);
        }
      } catch (err) {
        console.error('WebSocket data parsing error:', err);
      }
    });

    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, [stompClient]);

  // 임시 데이터 (백엔드 연동 전까지 빈 상태 방지용 데모 데이터)
  // 실제 데이터 수신 시 위 state들이 업데이트되어 이 화면을 덮어씌웁니다.
  const displaySettlements = settlements.length > 0 ? settlements : [
    { id: 1, artist: 'NOVA', amount: 12400000, fee: 1240000, net: 11160000, status: 'completed', date: '2026-02-10' },
    { id: 2, artist: '이하은', amount: 10100000, fee: 1010000, net: 9090000, status: 'pending', date: '2026-03-10' }
  ];

  return (
    <Layout role="admin">
      <div className="p-4 lg:p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
              결제 정산 관리
            </h1>
            <p className="text-sm text-muted-foreground">플랫폼 전체 결제 및 아티스트 정산 현황</p>
          </div>
          <button
            onClick={() => toast.info('정산 내역 내보내기 기능 준비 중입니다')}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-amber-600 bg-amber-50 rounded-xl hover:bg-amber-100 transition-colors">
            <Download size={14} />
            내보내기
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: '이번 달 총 거래액', value: `₩${(summary.thisMonthTotal || 0).toLocaleString()}`, change: '+3.9%', color: 'text-rose-600 bg-rose-50' },
            { label: '플랫폼 수수료 (10%)', value: `₩${(summary.feeTotal || 0).toLocaleString()}`, change: '+3.9%', color: 'text-amber-600 bg-amber-50' },
            { label: '아티스트 정산 예정', value: `₩${(summary.artistSettlementTotal || 0).toLocaleString()}`, change: '3월 10일', color: 'text-violet-600 bg-violet-50' },
            { label: '정산 완료', value: `${summary.completedSettlementCount || 0}건`, change: '상세보기', color: 'text-teal-600 bg-teal-50' }
          ].map((card, i) =>
            <div key={i} className="glass-card rounded-2xl p-4 soft-shadow">
              <div className={`inline-flex items-center justify-center w-8 h-8 rounded-xl ${card.color} mb-3`}>
                <Wallet size={16} />
              </div>
              <p className="text-lg font-bold text-foreground" style={{ fontFamily: "'DM Sans', sans-serif" }}>{card.value}</p>
              <p className="text-xs text-muted-foreground">{card.label}</p>
              <p className="text-xs text-teal-600 font-semibold mt-0.5">{card.change}</p>
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Revenue Chart */}
          <div className="glass-card rounded-2xl p-5 soft-shadow">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 size={18} className="text-amber-500" />
              <h2 className="font-bold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
                월별 거래액
              </h2>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={monthlyTrend.length > 0 ? monthlyTrend : []}>
                <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip
                  contentStyle={{ background: 'white', border: '1px solid #fef3c7', borderRadius: '12px', fontSize: '12px' }}
                  formatter={(value) => [`₩${value.toLocaleString()}`, '']} />
                <Bar dataKey="total" fill="oklch(0.72 0.15 60)" radius={[6, 6, 0, 0]} name="총 거래액" />
                <Bar dataKey="fee" fill="oklch(0.80 0.12 60)" radius={[6, 6, 0, 0]} name="수수료" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Fee Trend */}
          <div className="glass-card rounded-2xl p-5 soft-shadow">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={18} className="text-rose-500" />
              <h2 className="font-bold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
                수수료 추이
              </h2>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={monthlyTrend.length > 0 ? monthlyTrend : []}>
                <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip
                  contentStyle={{ background: 'white', border: '1px solid #fce7f3', borderRadius: '12px', fontSize: '12px' }}
                  formatter={(value) => [`₩${value.toLocaleString()}`, '수수료']} />
                <Line type="monotone" dataKey="fee" stroke="oklch(0.70 0.18 10)" strokeWidth={2.5} dot={{ fill: 'oklch(0.70 0.18 10)', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Settlement Table */}
        <div className="glass-card rounded-2xl overflow-hidden soft-shadow">
          <div className="p-4 border-b border-amber-100">
            <h2 className="font-bold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
              아티스트별 정산 내역
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-amber-50">
                  <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">아티스트</th>
                  <th className="text-right p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">총 거래액</th>
                  <th className="text-right p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden md:table-cell">수수료 (10%)</th>
                  <th className="text-right p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">정산액</th>
                  <th className="text-center p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">상태</th>
                  <th className="text-right p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">정산일</th>
                </tr>
              </thead>
              <tbody>
                {displaySettlements.map((s) =>
                  <tr key={s.id} className="border-b border-amber-50 last:border-0 hover:bg-amber-50/30 transition-colors">
                    <td className="p-4">
                      <span className="font-semibold text-sm text-foreground">{s.artist}</span>
                    </td>
                    <td className="p-4 text-right">
                      <span className="text-sm text-foreground">₩{(s.amount || 0).toLocaleString()}</span>
                    </td>
                    <td className="p-4 text-right hidden md:table-cell">
                      <span className="text-sm text-amber-600">-₩{(s.fee || 0).toLocaleString()}</span>
                    </td>
                    <td className="p-4 text-right">
                      <span className="text-sm font-bold text-foreground">₩{(s.net || 0).toLocaleString()}</span>
                    </td>
                    <td className="p-4 text-center">
                      {s.status === 'completed' ?
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-teal-100 text-teal-700">
                          <CheckCircle size={11} />
                          완료
                        </span> :
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
                          <Clock size={11} />
                          예정
                        </span>
                      }
                    </td>
                    <td className="p-4 text-right">
                      <span className="text-xs text-muted-foreground">{s.date}</span>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}