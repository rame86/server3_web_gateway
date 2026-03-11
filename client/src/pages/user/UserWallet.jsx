/*
 * Lumina - User Wallet Page
 * Soft Bloom Design: Point wallet, charge, history
 */

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Wallet, Plus, ArrowUpRight, ArrowDownLeft, CreditCard, Sparkles, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { payApi } from '@/lib/api';
import dayjs from 'dayjs';

const chargeOptions = [10000, 30000, 50000, 100000, 200000, 500000];

export default function UserWallet() {
  const [selectedCharge, setSelectedCharge] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchWalletData = async () => {
    try {
      setIsLoading(true);
      const res = await payApi.get('/payment/');
      if (res.data) {
        setBalance(res.data.currentBalance || 0);

        // Map backend DTO to frontend transaction format
        const mappedTxs = (res.data.transactions || []).map((tx, index) => ({
          id: index,
          type: tx.transactionType === 'CHARGE' ? 'charge' : tx.transactionType === 'SPEND' ? 'spend' : 'donate',
          desc: tx.description || (tx.transactionType === 'CHARGE' ? '포인트 충전' : '포인트 사용'),
          amount: tx.amount,
          date: dayjs(tx.createdAt).format('YYYY-MM-DD HH:mm'),
          balance: tx.balanceAfter
        }));
        setTransactions(mappedTxs);
      }
    } catch (error) {
      toast.error('지갑 정보를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWalletData();

    const handleMessage = (event) => {
      if (event.data === 'PAYMENT_SUCCESS') {
        toast.success('결제가 성공적으로 완료되었습니다.');
        fetchWalletData();
        setSelectedCharge(null);
      } else if (event.data === 'PAYMENT_FAILED') {
        toast.error('결제가 취소되었거나 실패했습니다.');
        setSelectedCharge(null);
      }
    };

    const handleStorage = (event) => {
      if (event.key === 'PAYMENT_STATUS_MSG' && event.newValue) {
        if (event.newValue.startsWith('PAYMENT_SUCCESS')) {
          toast.success('결제가 성공적으로 완료되었습니다.');
          fetchWalletData();
          setSelectedCharge(null);
        } else if (event.newValue.startsWith('PAYMENT_FAILED')) {
          toast.error('결제가 취소되었거나 실패했습니다.');
          setSelectedCharge(null);
        }
        // 사용한 메시지는 삭제
        localStorage.removeItem('PAYMENT_STATUS_MSG');
      }
    };

    window.addEventListener('message', handleMessage);
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('message', handleMessage);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);


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
            {isLoading ? (
              <div className="animate-pulse h-10 w-32 bg-white/20 rounded mb-1" />
            ) : (
              <p className="text-4xl font-bold mb-1" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                {balance.toLocaleString()}
                <span className="text-2xl ml-1">P</span>
              </p>
            )}
            <p className="text-white/70 text-sm">≈ {balance.toLocaleString()}원 상당</p>
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
                  className={`py-2.5 rounded-xl text-sm font-semibold transition-all ${selectedCharge === amount ?
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
              {[
                { label: '신용/체크카드', value: 'card' },
                { label: '계좌이체', value: 'transfer' },
                { label: '카카오페이', value: 'kakao_pay' },
                { label: '토스페이', value: 'tos_pay' }
              ].map((method) =>
                <button
                  key={method.value}
                  onClick={() => {
                    if (method.value === 'kakao_pay') {
                      setSelectedPaymentMethod(method.value);
                    } else {
                      toast.info(`${method.label} 결제 기능 준비 중입니다`);
                    }
                  }}
                  className={`w-full flex items-center gap-2 p-3 rounded-xl transition-colors text-sm font-medium text-foreground ${selectedPaymentMethod === method.value
                    ? 'border-2 border-rose-500 bg-rose-50'
                    : 'bg-white border border-rose-100 hover:bg-rose-50'
                    }`}>

                  <CreditCard size={14} className="text-rose-400" />
                  {method.label}
                </button>
              )}
            </div>

            <button
              onClick={async () => {
                if (!selectedCharge) { toast.warning('충전 금액을 선택해주세요'); return; }
                if (!selectedPaymentMethod) { toast.warning('결제 수단을 선택해주세요'); return; }
                try {
                  // 카카오페이 결제창(팝업) 콜백 시 NGINX Gateway가 인증을 통과시킬 수 있도록
                  // accessToken을 쿠키에 임시 저장 (Kakao 콜백 URL에 토큰을 포함시키면 255자 제한 초과로 400 에러 발생)
                  const token = localStorage.getItem('accessToken');
                  if (token) {
                    document.cookie = `accessToken=${token}; path=/; max-age=3600`;
                  }

                  const res = await payApi.post('/payment/charge', {
                    payType: selectedPaymentMethod,
                    amount: selectedCharge
                  });

                  if (res.data && res.data.nextRedirectUrl) {
                    toast.info('카카오페이 결제창을 엽니다.');
                    const popup = window.open(res.data.nextRedirectUrl, 'kakaopay', 'width=500,height=600');

                    if (!popup) {
                      // 팝업이 차단된 경우 현재 창에서 강제 이동
                      toast.warning('팝업이 차단되었습니다. 결제 페이지로 이동합니다.');
                      window.location.href = res.data.nextRedirectUrl;
                    }
                  } else {
                    toast.success('충전 요청이 완료되었습니다.');
                    fetchWalletData();
                    setSelectedCharge(null);
                  }
                } catch (error) {
                  toast.error('충전 처리에 실패했습니다.');
                }
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
              {isLoading ? (
                <div className="py-4 text-center text-sm text-muted-foreground">내역을 불러오는 중...</div>
              ) : transactions.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground bg-rose-50/50 rounded-xl">거래 내역이 없습니다</div>
              ) : (
                transactions.map((tx) =>
                  <div key={tx.id} className="flex items-center gap-3 py-2 border-b border-rose-50 last:border-0">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${tx.type === 'charge' ? 'bg-teal-50 text-teal-600' :
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
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>);

}