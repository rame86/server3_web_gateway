/*
 * FanVerse - User Wallet Page
 * Soft Bloom Design: Point wallet, charge, history
 */

import { useState } from 'react';
import Layout from '@/components/Layout';
import { Wallet, Plus, ArrowUpRight, ArrowDownLeft, CreditCard, Sparkles, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

const transactions = [
{ id: 1, type: 'charge', desc: '포인트 충전', amount: 50000, date: '2026-02-18', balance: 95200 },
{ id: 2, type: 'spend', desc: 'NOVA 팬미팅 예매', amount: -88000, date: '2026-02-15', balance: 45200 },
{ id: 3, type: 'charge', desc: '포인트 충전', amount: 100000, date: '2026-02-10', balance: 133200 },
{ id: 4, type: 'spend', desc: 'BLOSSOM 포토카드 세트', amount: -28000, date: '2026-02-08', balance: 33200 },
{ id: 5, type: 'donate', desc: '이하은 후원', amount: -10000, date: '2026-02-05', balance: 61200 },
{ id: 6, type: 'charge', desc: '이벤트 보상 포인트', amount: 5000, date: '2026-02-01', balance: 71200 }];


const chargeOptions = [10000, 30000, 50000, 100000, 200000, 500000];

export default function UserWallet() {
  const [selectedCharge, setSelectedCharge] = useState(null);

  return (
    <Layout role="user">
      <div className="p-4 lg:p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
            포인트 월렛
          </h1>
          <p className="text-sm text-muted-foreground">포인트 충전, 결제, 거래 내역 관리</p>
        </div>

        {/* Balance Card */}
        <div
          className="relative overflow-hidden rounded-3xl p-6 text-white"
          style={{ background: 'linear-gradient(135deg, oklch(0.58 0.20 10), oklch(0.55 0.18 290))' }}>
          
          <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-10 translate-x-10 -translate-y-10"
          style={{ background: 'white' }} />
          <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full opacity-10 -translate-x-6 translate-y-6"
          style={{ background: 'white' }} />
          <div className="relative">
            <div className="flex items-center gap-2 mb-4">
              <Wallet size={20} className="text-white/80" />
              <span className="text-white/80 text-sm font-medium">내 포인트</span>
            </div>
            <p className="text-4xl font-bold mb-1" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              45,200
              <span className="text-2xl ml-1">P</span>
            </p>
            <p className="text-white/70 text-sm">≈ 45,200원 상당</p>
          </div>
          <div className="flex gap-3 mt-5">
            <button
              onClick={() => toast.info('충전 기능 준비 중입니다')}
              className="flex items-center gap-1.5 px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl text-sm font-semibold text-white transition-colors">
              
              <Plus size={14} />
              충전하기
            </button>
            <button
              onClick={() => toast.info('결제 기능 준비 중입니다')}
              className="flex items-center gap-1.5 px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl text-sm font-semibold text-white transition-colors">
              
              <CreditCard size={14} />
              결제하기
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Charge */}
          <div className="glass-card rounded-2xl p-5 soft-shadow">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles size={18} className="text-rose-500" />
              <h2 className="font-bold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
                포인트 충전
              </h2>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-4">
              {chargeOptions.map((amount) =>
              <button
                key={amount}
                onClick={() => setSelectedCharge(amount)}
                className={`py-2.5 rounded-xl text-sm font-semibold transition-all ${
                selectedCharge === amount ?
                'btn-primary-gradient text-white shadow-sm' :
                'bg-rose-50 text-rose-600 hover:bg-rose-100'}`
                }>
                
                  {(amount / 10000).toFixed(0)}만P
                </button>
              )}
            </div>

            {selectedCharge &&
            <div className="bg-rose-50 rounded-xl p-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">충전 금액</span>
                  <span className="font-semibold text-foreground">{selectedCharge.toLocaleString()}원</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-muted-foreground">충전 포인트</span>
                  <span className="font-bold text-rose-600">{selectedCharge.toLocaleString()}P</span>
                </div>
              </div>
            }

            <div className="space-y-2 mb-4">
              <p className="text-xs font-semibold text-muted-foreground mb-2">결제 수단</p>
              {['신용/체크카드', '계좌이체', '카카오페이', '네이버페이'].map((method) =>
              <button
                key={method}
                onClick={() => toast.info(`${method} 결제 기능 준비 중입니다`)}
                className="w-full flex items-center gap-2 p-3 rounded-xl bg-white border border-rose-100 hover:bg-rose-50 transition-colors text-sm font-medium text-foreground">
                
                  <CreditCard size={14} className="text-rose-400" />
                  {method}
                </button>
              )}
            </div>

            <button
              onClick={() => {
                if (!selectedCharge) {toast.warning('충전 금액을 선택해주세요');return;}
                toast.success(`${selectedCharge.toLocaleString()}P 충전이 완료되었습니다!`);
              }}
              className="w-full py-3 text-sm font-bold text-white rounded-xl btn-primary-gradient shadow-sm">
              
              충전하기
            </button>
          </div>

          {/* Transaction History */}
          <div className="glass-card rounded-2xl p-5 soft-shadow">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={18} className="text-rose-500" />
              <h2 className="font-bold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
                거래 내역
              </h2>
            </div>

            <div className="space-y-3">
              {transactions.map((tx) =>
              <div key={tx.id} className="flex items-center gap-3 py-2 border-b border-rose-50 last:border-0">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                tx.type === 'charge' ? 'bg-teal-50 text-teal-600' :
                tx.type === 'donate' ? 'bg-violet-50 text-violet-600' :
                'bg-rose-50 text-rose-600'}`
                }>
                    {tx.type === 'charge' ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{tx.desc}</p>
                    <p className="text-xs text-muted-foreground">{tx.date}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold ${tx.amount > 0 ? 'text-teal-600' : 'text-rose-600'}`}>
                      {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString()}P
                    </p>
                    <p className="text-xs text-muted-foreground">{tx.balance.toLocaleString()}P</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>);

}