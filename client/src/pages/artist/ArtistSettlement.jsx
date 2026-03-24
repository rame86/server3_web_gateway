/*
 * Lumina - Artist Settlement Page
 * Soft Bloom Design: Revenue breakdown, settlement history
 * API 연동 완료
 */

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { BarChart3, TrendingUp, Wallet, Download, Calendar, ArrowUpRight } from 'lucide-react';
import { toast } from 'sonner';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { payApi } from '@/lib/api';

const statusConfig = {
  PENDING: { label: '정산 예정', class: 'bg-amber-100 text-amber-700' },
  COMPLETED: { label: '정산 완료', class: 'bg-teal-100 text-teal-700' },
  pending: { label: '정산 예정', class: 'bg-amber-100 text-amber-700' },
  completed: { label: '정산 완료', class: 'bg-teal-100 text-teal-700' }
};

const defaultColors = [
  'oklch(0.70 0.18 10)',   // 이벤트 
  'oklch(0.65 0.18 290)',  // 굿즈
  'oklch(0.72 0.15 200)'   // 후원
];

export default function ArtistSettlement() {
  const [data, setData] = useState({
    thisMonthRevenue: 0,
    totalAccumulatedRevenue: 0,
    pendingSettlement: 0,
    completedSettlement: 0,
    monthlyTrend: [],
    revenueComposition: [],
    settlements: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSettlementData = async () => {
      try {
        setIsLoading(true);
        const response = await payApi.get('/artist/settlement');
        setData(response.data);
      } catch (error) {
        toast.error('정산 데이터를 불러오는데 실패했습니다.');
        console.error('Artist settlement fetch error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettlementData();
  }, []);

  // 수익 구성 데이터에 컬러 추가
  const revenueBreakdown = data.revenueComposition?.map((item, index) => ({
    ...item,
    color: item.color || defaultColors[index % defaultColors.length]
  })) || [];

  return (
    <Layout role="artist">
      <div className="p-4 lg:p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
              정산 내역
            </h1>
            <p className="text-sm text-muted-foreground">굿즈, 이벤트, 후원 수익 정산 현황</p>
          </div>
          <button
            onClick={() => toast.info('정산 내역 다운로드 기능 준비 중입니다')}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-rose-600 bg-rose-50 rounded-xl hover:bg-rose-100 transition-colors"
          >
            <Download size={14} />
            내역 다운로드
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: '이번 달 수익', value: `₩${Math.floor(data.thisMonthRevenue || 0).toLocaleString()}`, change: '최근 계산됨', icon: <TrendingUp size={16} />, color: 'text-rose-600 bg-rose-50' },
            { label: '누적 수익', value: `₩${Math.floor(data.totalAccumulatedRevenue || 0).toLocaleString()}`, change: '전체', icon: <BarChart3 size={16} />, color: 'text-violet-600 bg-violet-50' },
            { label: '정산 예정', value: `₩${Math.floor(data.pendingSettlement || 0).toLocaleString()}`, change: '예정됨', icon: <Calendar size={16} />, color: 'text-amber-600 bg-amber-50' },
            { label: '정산 완료', value: `₩${Math.floor(data.completedSettlement || 0).toLocaleString()}`, change: '완료됨', icon: <Wallet size={16} />, color: 'text-teal-600 bg-teal-50' }
          ].map((card, i) => (
            <div key={i} className="glass-card rounded-2xl p-4 soft-shadow">
              <div className={`inline-flex items-center justify-center w-8 h-8 rounded-xl ${card.color} mb-3`}>
                {card.icon}
              </div>
              <p className="text-lg font-bold text-foreground" style={{ fontFamily: "'DM Sans', sans-serif" }}>{card.value}</p>
              <p className="text-xs text-muted-foreground">{card.label}</p>
              <p className="text-xs text-teal-600 font-semibold mt-0.5">{card.change}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Revenue Chart */}
          <div className="lg:col-span-2 glass-card rounded-2xl p-5 soft-shadow">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={18} className="text-rose-500" />
              <h2 className="font-bold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
                월별 수익 현황
              </h2>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={data.monthlyTrend || []}>
                <defs>
                  <linearGradient id="goodsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="oklch(0.70 0.18 10)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="oklch(0.70 0.18 10)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="eventsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="oklch(0.65 0.18 290)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="oklch(0.65 0.18 290)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip
                  contentStyle={{ background: 'white', border: '1px solid #fce7f3', borderRadius: '12px', fontSize: '12px' }}
                  formatter={(value) => [`₩${(value / 10000).toFixed(0)}만`, '']}
                />
                <Area type="monotone" dataKey="events" stroke="oklch(0.65 0.18 290)" fill="url(#eventsGrad)" strokeWidth={2} name="이벤트" />
                <Area type="monotone" dataKey="goods" stroke="oklch(0.70 0.18 10)" fill="url(#goodsGrad)" strokeWidth={2} name="굿즈" />
              </AreaChart>
            </ResponsiveContainer>
            <div className="flex items-center gap-4 mt-2 justify-center">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full" style={{ background: 'oklch(0.65 0.18 290)' }} />
                <span className="text-xs text-muted-foreground">이벤트</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full" style={{ background: 'oklch(0.70 0.18 10)' }} />
                <span className="text-xs text-muted-foreground">굿즈</span>
              </div>
            </div>
          </div>

          {/* Breakdown Pie */}
          <div className="glass-card rounded-2xl p-5 soft-shadow">
            <h2 className="font-bold text-foreground mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              수익 구성
            </h2>
            <div className="flex justify-center mb-4">
              <PieChart width={160} height={160}>
                <Pie data={revenueBreakdown} cx={80} cy={80} innerRadius={50} outerRadius={75} dataKey="value" paddingAngle={3}>
                  {revenueBreakdown.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </div>
            <div className="space-y-2">
              {revenueBreakdown.map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ background: item.color }} />
                    <span className="text-xs text-muted-foreground">{item.name}</span>
                  </div>
                  <span className="text-xs font-bold text-foreground">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Settlement History */}
        <div className="glass-card rounded-2xl p-5 soft-shadow">
          <h2 className="font-bold text-foreground mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
            정산 내역
          </h2>
          <div className="space-y-3">
            {!isLoading && data.settlements?.length === 0 ? (
               <p className="text-sm text-muted-foreground text-center py-4">정산 내역이 없습니다.</p>
            ) : (
              data.settlements?.map((s, idx) => (
                <div key={s.id || idx} className="flex items-center gap-4 p-3 rounded-xl hover:bg-rose-50/50 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center flex-shrink-0">
                    <Wallet size={18} className="text-rose-500" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm text-foreground">{s.period} 정산</p>
                    <p className="text-xs text-muted-foreground">정산일: {s.date || '미정'}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-foreground">₩{Math.floor(s.amount || 0).toLocaleString()}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${statusConfig[s.status]?.class || statusConfig.PENDING.class}`}>
                      {statusConfig[s.status]?.label || s.status}
                    </span>
                  </div>
                  <button
                    onClick={() => toast.info('정산 상세보기 기능 준비 중입니다')}
                    className="p-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                  >
                    <ArrowUpRight size={14} className="text-muted-foreground" />
                  </button>
                </div>
              ))
            )}
            {isLoading && (
              <p className="text-sm text-muted-foreground text-center py-4">정산 내역을 불러오는 중입니다...</p>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}