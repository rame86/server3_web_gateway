/*
 * FanVerse - Artist Settlement Page
 * Soft Bloom Design: Revenue breakdown, settlement history
 */

import Layout from '@/components/Layout';
import { BarChart3, TrendingUp, Wallet, Download, Calendar, ArrowUpRight } from 'lucide-react';
import { toast } from 'sonner';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const monthlyRevenue = [
{ month: '9월', goods: 1200000, events: 2400000, donations: 800000 },
{ month: '10월', goods: 1800000, events: 3200000, donations: 1100000 },
{ month: '11월', goods: 2100000, events: 2800000, donations: 950000 },
{ month: '12월', goods: 3400000, events: 4500000, donations: 1600000 },
{ month: '1월', goods: 2800000, events: 3800000, donations: 1300000 },
{ month: '2월', goods: 3100000, events: 5200000, donations: 1800000 }];


const revenueBreakdown = [
{ name: '이벤트 예매', value: 52, color: 'oklch(0.70 0.18 10)' },
{ name: '굿즈 판매', value: 31, color: 'oklch(0.65 0.18 290)' },
{ name: '팬 후원', value: 17, color: 'oklch(0.72 0.15 200)' }];


const settlements = [
{ id: 1, period: '2026년 2월', amount: 10100000, status: 'pending', date: '2026-03-10' },
{ id: 2, period: '2026년 1월', amount: 7900000, status: 'completed', date: '2026-02-10' },
{ id: 3, period: '2025년 12월', amount: 9500000, status: 'completed', date: '2026-01-10' },
{ id: 4, period: '2025년 11월', amount: 5850000, status: 'completed', date: '2025-12-10' }];


const statusConfig = {
  pending: { label: '정산 예정', class: 'bg-amber-100 text-amber-700' },
  completed: { label: '정산 완료', class: 'bg-teal-100 text-teal-700' }
};

export default function ArtistSettlement() {
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
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-rose-600 bg-rose-50 rounded-xl hover:bg-rose-100 transition-colors">
            
            <Download size={14} />
            내역 다운로드
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
          { label: '이번 달 수익', value: '₩10,100,000', change: '+27.8%', icon: <TrendingUp size={16} />, color: 'text-rose-600 bg-rose-50' },
          { label: '누적 수익', value: '₩43,350,000', change: '전체', icon: <BarChart3 size={16} />, color: 'text-violet-600 bg-violet-50' },
          { label: '정산 예정', value: '₩10,100,000', change: '3월 10일', icon: <Calendar size={16} />, color: 'text-amber-600 bg-amber-50' },
          { label: '정산 완료', value: '₩33,250,000', change: '3회', icon: <Wallet size={16} />, color: 'text-teal-600 bg-teal-50' }].
          map((card, i) =>
          <div key={i} className="glass-card rounded-2xl p-4 soft-shadow">
              <div className={`inline-flex items-center justify-center w-8 h-8 rounded-xl ${card.color} mb-3`}>
                {card.icon}
              </div>
              <p className="text-lg font-bold text-foreground" style={{ fontFamily: "'DM Sans', sans-serif" }}>{card.value}</p>
              <p className="text-xs text-muted-foreground">{card.label}</p>
              <p className="text-xs text-teal-600 font-semibold mt-0.5">{card.change}</p>
            </div>
          )}
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
              <AreaChart data={monthlyRevenue}>
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
                  formatter={(value) => [`₩${(value / 10000).toFixed(0)}만`, '']} />
                
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
                  {revenueBreakdown.map((entry, index) =>
                  <Cell key={index} fill={entry.color} />
                  )}
                </Pie>
              </PieChart>
            </div>
            <div className="space-y-2">
              {revenueBreakdown.map((item, i) =>
              <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ background: item.color }} />
                    <span className="text-xs text-muted-foreground">{item.name}</span>
                  </div>
                  <span className="text-xs font-bold text-foreground">{item.value}%</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Settlement History */}
        <div className="glass-card rounded-2xl p-5 soft-shadow">
          <h2 className="font-bold text-foreground mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
            정산 내역
          </h2>
          <div className="space-y-3">
            {settlements.map((s) =>
            <div key={s.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-rose-50/50 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center flex-shrink-0">
                  <Wallet size={18} className="text-rose-500" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm text-foreground">{s.period} 정산</p>
                  <p className="text-xs text-muted-foreground">정산일: {s.date}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-foreground">₩{s.amount.toLocaleString()}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${statusConfig[s.status].class}`}>
                    {statusConfig[s.status].label}
                  </span>
                </div>
                <button
                onClick={() => toast.info('정산 상세보기 기능 준비 중입니다')}
                className="p-1.5 rounded-lg hover:bg-rose-50 transition-colors">
                
                  <ArrowUpRight size={14} className="text-muted-foreground" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>);

}