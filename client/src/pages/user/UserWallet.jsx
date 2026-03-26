/*
 * Lumina - User Wallet Page
 * Soft Bloom Design: Point wallet, charge, history
 */

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Wallet, Plus, ArrowUpRight, ArrowDownLeft, CreditCard, Sparkles, TrendingUp, Info, X } from 'lucide-react';
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
  const [isChargeModalOpen, setIsChargeModalOpen] = useState(false);

  const fetchWalletData = async () => {
    try {
      setIsLoading(true);
      const res = await payApi.get('/payment/');
      if (res.data) {
        setBalance(res.data.currentBalance || 0);

        // Map backend DTO to frontend transaction format
        const mappedTxs = (res.data.transactions || []).map((tx, index) => {
          const getType = (t) => {
            if (t === 'CHARGE') return 'charge';
            if (t === 'REFUND') return 'refund';
            if (t === 'DONATION') return 'donate';
            return 'spend'; // PAYMENT, SPEND 등
          };
          const getDesc = (t, description) => {
            if (description) return description;
            if (t === 'CHARGE') return '포인트 충전';
            if (t === 'REFUND') return '환불';
            if (t === 'DONATION') return '아티스트 후원';
            return '결제';
          };
          return {
            id: index,
            type: getType(tx.transactionType),
            desc: getDesc(tx.transactionType, tx.description),
            amount: tx.amount,
            date: dayjs(tx.createdAt).format('YYYY-MM-DD HH:mm'),
            balance: tx.balanceAfter
          };
        });
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
              onClick={() => setIsChargeModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl text-sm font-semibold text-white transition-colors">

              <Plus size={14} />
              충전하기
            </button>
            <button
              onClick={() => toast.info('출금 기능 준비 중입니다')}
              className="flex items-center gap-1.5 px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl text-sm font-semibold text-white transition-colors">

              <CreditCard size={14} />
              출금하기
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr_350px] gap-6">
          {/* Transaction History (Expanded) */}
          <div className="glass-card rounded-2xl p-5 soft-shadow h-[600px] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp size={18} className="text-rose-500" />
                <h2 className="font-bold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
                  거래 내역
                </h2>
              </div>
              <span className="text-xs font-medium text-muted-foreground px-2 py-1 bg-rose-50 rounded-lg">최근 30일</span>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
              {isLoading ? (
                <div className="py-8 text-center text-sm text-muted-foreground">내역을 불러오는 중...</div>
              ) : transactions.length === 0 ? (
                <div className="py-12 mt-4 text-center text-sm text-muted-foreground bg-rose-50/50 rounded-xl border border-rose-100/50 border-dashed">
                  <TrendingUp size={32} className="mx-auto text-rose-300 mb-3 opacity-50" />
                  거래 내역이 없습니다
                </div>
              ) : (
                transactions.map((tx) =>
                  <div key={tx.id} className="flex items-center gap-4 py-3 border-b border-rose-50 last:border-0 hover:bg-rose-50/30 transition-colors px-2 rounded-xl -mx-2">
                    <div className={`w-10 h-10 rounded-[14px] flex items-center justify-center flex-shrink-0 ${tx.type === 'charge' ? 'bg-teal-50 text-teal-600' :
                      tx.type === 'donate' ? 'bg-violet-50 text-violet-600' :
                      tx.type === 'refund' ? 'bg-amber-50 text-amber-600' :
                        'bg-rose-50 text-rose-600'}`
                    }>
                      {tx.type === 'charge' ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground mb-0.5">{tx.desc}</p>
                      <p className="text-[11px] text-muted-foreground font-medium">{tx.date}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-[15px] font-bold tracking-tight mb-0.5 ${tx.amount > 0 ? 'text-teal-600' : 'text-rose-600'}`}>
                        {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString()} P
                      </p>
                      <p className="text-[11px] text-muted-foreground font-medium">{tx.balance.toLocaleString()} P</p>
                    </div>
                  </div>
                )
              )}
            </div>
            
            {transactions.length > 5 && (
              <button className="w-full mt-4 py-2.5 text-sm font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors">
                더보기
              </button>
            )}
          </div>

          {/* Guide & Quick Links */}
          <div className="space-y-4">
            {/* Guide Card */}
            <div className="glass-card rounded-2xl p-5 soft-shadow border border-rose-100/50">
              <div className="flex items-center gap-2 mb-4">
                <Info size={18} className="text-rose-500" />
                <h2 className="font-bold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
                  포인트 이용 안내
                </h2>
              </div>
              
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex gap-2">
                  <span className="text-rose-400 mt-0.5">•</span>
                  <span className="leading-relaxed">충전된 포인트는 루미나 내 굿즈 구매, 이벤트 참여, 그리고 아티스트 후원 등 모든 서비스에서 현금처럼 사용 가능합니다.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-rose-400 mt-0.5">•</span>
                  <span className="leading-relaxed">포인트 충전 한도는 1회 최대 200만 P, 월 최대 500만 P까지 가능합니다.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-rose-400 mt-0.5">•</span>
                  <span className="leading-relaxed">사용하지 않은 충전 포인트는 7일 이내 수수료 없이 환불(출금) 가능하며, 이후 출금 시 소정의 수수료가 부과될 수 있습니다.</span>
                </li>
              </ul>
              
              <div className="mt-5 p-3 rounded-xl bg-violet-50/50 border border-violet-100 text-xs text-violet-700 font-medium leading-relaxed">
                💡 <strong>Tip!</strong> 매월 1일은 포인트 충전 데이! 카카오페이로 5만 원 이상 충전 시 5% 추가 적립 혜택을 드립니다.
              </div>
            </div>
            
            {/* Event Banner */}
            <div className="relative overflow-hidden rounded-2xl p-5 cursor-pointer hover-lift shadow-sm border border-rose-50" style={{ background: 'linear-gradient(135deg, oklch(0.97 0.02 30), oklch(0.97 0.02 290))' }}>
              <div className="absolute right-[-20px] bottom-[-20px] opacity-10 blur-sm pointer-events-none">
                <Sparkles size={100} />
              </div>
              <div className="relative z-10 flex flex-col justify-center min-h-[5rem]">
                <span className="inline-block px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-600 text-[10px] font-bold mb-2 w-max">EVENT</span>
                <h3 className="font-bold text-foreground text-sm mb-1">첫 충전 프로모션 🎁</h3>
                <p className="text-xs text-muted-foreground">첫 충전 시 1,000P 즉시 지급해드려요!</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charge Modal */}
        {isChargeModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setIsChargeModalOpen(false)}>
            <div className="bg-white rounded-[24px] w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between p-5 border-b border-rose-50 bg-rose-50/30">
                <div className="flex items-center gap-2">
                  <Sparkles size={18} className="text-rose-500" />
                  <h2 className="font-bold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
                    포인트 충전
                  </h2>
                </div>
                <button onClick={() => {
                  setIsChargeModalOpen(false);
                  setSelectedCharge(null);
                  setSelectedPaymentMethod(null);
                }} className="text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-full hover:bg-white bg-white/50">
                  <X size={18} />
                </button>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-3 gap-2.5 mb-5">
                  {chargeOptions.map((amount) =>
                    <button
                      key={amount}
                      onClick={() => setSelectedCharge(amount)}
                      className={`py-3 rounded-[14px] text-sm font-semibold transition-all shadow-sm border ${selectedCharge === amount ?
                        'border-rose-400 btn-primary-gradient text-white shadow-rose-200' :
                        'border-rose-100/50 bg-white text-rose-600 hover:bg-rose-50 hover:border-rose-200'}`
                      }>
                      {(amount / 10000).toFixed(0)}만P
                    </button>
                  )}
                </div>

                {selectedCharge ? (
                  <div className="bg-rose-50/70 border border-rose-100 rounded-2xl p-4 mb-5 shadow-inner">
                    <div className="flex justify-between text-sm mb-2 pb-2 border-b border-rose-100/50">
                      <span className="text-muted-foreground font-medium">충전 금액</span>
                      <span className="font-bold text-foreground">{selectedCharge.toLocaleString()}원</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground font-medium">충전될 포인트</span>
                      <span className="font-black text-rose-600 text-lg tracking-tight">+{selectedCharge.toLocaleString()}<span className="text-sm ml-0.5 font-bold">P</span></span>
                    </div>
                  </div>
                ) : (
                   <div className="mb-5 p-4 rounded-2xl bg-gray-50 border border-gray-100 text-center text-sm text-gray-400 font-medium">
                     충전할 금액을 먼저 선택해주세요.
                   </div>
                )}

                <div className="space-y-3 mb-6">
                  <p className="text-[13px] font-bold text-muted-foreground mb-1 ml-1">결제 수단</p>
                  <div className="grid grid-cols-2 gap-2.5">
                    {[
                      { label: '카카오페이', value: 'kakao_pay', color: 'bg-[#FFDE00] text-[#3C1E1E]', activeColor: 'ring-2 ring-offset-2 ring-[#FFDE00] border-transparent' },
                      { label: '토스페이', value: 'tos_pay', color: 'bg-[#0064FF] text-white', activeColor: 'ring-2 ring-offset-2 ring-[#0064FF] border-transparent' },
                      { label: '신용/체크카드', value: 'card', color: 'bg-white text-gray-700 border border-gray-200', activeColor: 'ring-2 ring-offset-2 ring-gray-900 border-gray-900' },
                      { label: '계좌이체', value: 'transfer', color: 'bg-white text-gray-700 border border-gray-200', activeColor: 'ring-2 ring-offset-2 ring-gray-900 border-gray-900' }
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
                        className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-[14px] transition-all text-[13px] font-bold shadow-sm border-transparent ${method.color} ${selectedPaymentMethod === method.value ? method.activeColor : 'hover:shadow-md hover:-translate-y-0.5'}`}>
                        {method.value !== 'kakao_pay' && method.value !== 'tos_pay' && <CreditCard size={14} className={method.value === 'card' || method.value === 'transfer' ? 'text-gray-400' : 'opacity-70'} />}
                        {method.label}
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setIsChargeModalOpen(false);
                      setSelectedCharge(null);
                      setSelectedPaymentMethod(null);
                    }}
                    className="flex-1 py-3.5 text-sm font-semibold text-gray-500 bg-gray-100 hover:bg-gray-200 hover:text-gray-700 rounded-xl transition-colors">
                    취소
                  </button>
                  <button
                    onClick={async () => {
                      if (!selectedCharge) { toast.warning('충전 금액을 선택해주세요'); return; }
                      if (!selectedPaymentMethod) { toast.warning('결제 수단을 선택해주세요'); return; }
                      try {
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
                            toast.warning('팝업이 차단되었습니다. 결제 페이지로 이동합니다.');
                            window.location.href = res.data.nextRedirectUrl;
                          } else {
                            setIsChargeModalOpen(false);
                            setSelectedCharge(null);
                            setSelectedPaymentMethod(null);
                          }
                        } else {
                          toast.success('충전 요청이 완료되었습니다.');
                          fetchWalletData();
                          setSelectedCharge(null);
                          setIsChargeModalOpen(false);
                        }
                      } catch (error) {
                        toast.error('충전 처리에 실패했습니다.');
                      }
                    }}
                    className={`flex-[2] py-3.5 text-sm font-bold text-white rounded-xl shadow-md transition-all ${!selectedCharge || !selectedPaymentMethod ? 'bg-gray-300 cursor-not-allowed shadow-none border-0' : 'btn-primary-gradient hover:shadow-lg hover:-translate-y-0.5'}`}>
                    {selectedCharge && selectedPaymentMethod ? `${selectedCharge.toLocaleString()}원 결제하기` : '금액과 수단을 선택해주세요'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>);

}