/*
 * Lumina - Admin Settlement
 * Soft Bloom Design: Platform settlement overview
 */

import Layout from '@/components/Layout';
import { BarChart3, TrendingUp, Wallet, Download, CheckCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const monthlyData = [
{ month: '9월', total: 180000000, fee: 18000000 },
{ month: '10월', total: 195000000, fee: 19500000 },
{ month: '11월', total: 210000000, fee: 21000000 },
{ month: '12월', total: 248000000, fee: 24800000 },
{ month: '1월', total: 231000000, fee: 23100000 },
{ month: '2월', total: 240000000, fee: 24000000 }];


const settlements = [
{ id: 1, artist: 'NOVA', amount: 12400000, fee: 1240000, net: 11160000, status: 'completed', date: '2026-02-10' },
{ id: 2, artist: '이하은', amount: 10100000, fee: 1010000, net: 9090000, status: 'pending', date: '2026-03-10' },
{ id: 3, artist: 'BLOSSOM', amount: 8700000, fee: 870000, net: 7830000, status: 'completed', date: '2026-02-10' },
{ id: 4, artist: '김지수', amount: 6200000, fee: 620000, net: 5580000, status: 'completed', date: '2026-02-10' },
{ id: 5, artist: 'PRISM', amount: 4800000, fee: 480000, net: 4320000, status: 'pending', date: '2026-03-10' }];


export default function AdminSettlement() {
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

        {/* Summary */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
          { label: '이번 달 총 거래액', value: '₩2.4억', change: '+3.9%', color: 'text-rose-600 bg-rose-50' },
          { label: '플랫폼 수수료 (10%)', value: '₩2,400만', change: '+3.9%', color: 'text-amber-600 bg-amber-50' },
          { label: '아티스트 정산 예정', value: '₩2.16억', change: '3월 10일', color: 'text-violet-600 bg-violet-50' },
          { label: '정산 완료', value: '₩1.97억', change: '3건', color: 'text-teal-600 bg-teal-50' }].
          map((card, i) =>
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
              <BarChart data={monthlyData}>
                <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip
                  contentStyle={{ background: 'white', border: '1px solid #fef3c7', borderRadius: '12px', fontSize: '12px' }}
                  formatter={(value) => [`₩${(value / 100000000).toFixed(1)}억`, '']} />
                
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
              <LineChart data={monthlyData}>
                <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip
                  contentStyle={{ background: 'white', border: '1px solid #fce7f3', borderRadius: '12px', fontSize: '12px' }}
                  formatter={(value) => [`₩${(value / 10000).toFixed(0)}만`, '수수료']} />
                
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
                {settlements.map((s) =>
                <tr key={s.id} className="border-b border-amber-50 last:border-0 hover:bg-amber-50/30 transition-colors">
                    <td className="p-4">
                      <span className="font-semibold text-sm text-foreground">{s.artist}</span>
                    </td>
                    <td className="p-4 text-right">
                      <span className="text-sm text-foreground">₩{s.amount.toLocaleString()}</span>
                    </td>
                    <td className="p-4 text-right hidden md:table-cell">
                      <span className="text-sm text-amber-600">-₩{s.fee.toLocaleString()}</span>
                    </td>
                    <td className="p-4 text-right">
                      <span className="text-sm font-bold text-foreground">₩{s.net.toLocaleString()}</span>
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
    </Layout>);

}