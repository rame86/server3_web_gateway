/*
 * Lumina - User Dashboard
 * 실시간 대시보드: WebSocket(STOMP) + MQ를 통해 Pay 서비스에서 실시간 데이터 수신
 */

import { useEffect, useState } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import Layout from '@/components/Layout';
import { Heart, ShoppingBag, Calendar, MessageCircle, Sparkles, ArrowRight, Bell, Loader2 } from 'lucide-react';
import { Link } from 'wouter';
import { coreApi, getGatewayUrl } from '@/lib/api';
import { toast } from 'sonner';

export default function UserDashboard() {
  const [paymentData, setPaymentData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const gatewayUrl = getGatewayUrl();
    const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
    const memberId = localStorage.getItem('memberId');
    const storedName = localStorage.getItem('userName') || '사용자';
    setUserName(storedName);

    if (!memberId) {
      setIsLoading(false);
      return;
    }

    // 1. WebSocket(STOMP) 클라이언트 설정
    //    AdminUsers.jsx의 user-stats 구독 패턴과 동일하게, 유저 전용 채널 구독
    const client = new Client({
      webSocketFactory: () => new SockJS(`${gatewayUrl}/msa/core/ws-admin`),
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      reconnectDelay: 5000,
    });

    client.onConnect = () => {
      console.log('[UserDashboard] WebSocket 연결 완료');

      // 2. 유저 전용 STOMP 토픽 구독
      //    UserDashboardPayListener가 이 채널로 Pay 서비스 응답을 relay함
      client.subscribe(`/topic/user-dashboard/${memberId}`, (msg) => {
        try {
          const data = JSON.parse(msg.body);
          console.log('[UserDashboard] 결제 데이터 수신:', data);
          setPaymentData(data);
          setIsLoading(false);
          toast.success('대시보드 데이터를 불러왔습니다!');
        } catch (e) {
          console.error('[UserDashboard] 데이터 파싱 오류:', e);
          setIsLoading(false);
        }
      });

      // 3. 구독 완료 후 Core에 MQ 트리거 요청
      //    Core → Pay (pay.request 큐, type=ADMIN, orderId=USER_DETAIL)
      //    Pay → Core (user.dashboard.pay.res 큐) → STOMP /topic/user-dashboard/{memberId}
      coreApi.post('/dashboard/dashboard-queue', { memberId: Number(memberId) })
        .then(() => console.log('[UserDashboard] MQ 트리거 요청 완료'))
        .catch(err => {
          console.error('[UserDashboard] MQ 트리거 실패:', err);
          setIsLoading(false);
        });
    };

    client.onStompError = (frame) => {
      console.error('[UserDashboard] STOMP 에러:', frame.headers['message']);
      setIsLoading(false);
    };

    client.activate();

    // 5초 후에도 데이터 없으면 로딩 해제
    const timeout = setTimeout(() => setIsLoading(false), 5000);

    return () => {
      clearTimeout(timeout);
      client.deactivate();
    };
  }, []);

  // 포인트 잔액 포맷
  const formatBal = (n) => n != null ? `${Number(n).toLocaleString()}P` : '-';
  const formatNum = (n) => n != null ? `${Number(n)}건` : '-';

  const quickStats = [
    {
      label: '보유 포인트',
      value: paymentData ? formatBal(paymentData.pointBalance) : (isLoading ? '...' : '-'),
      icon: <Sparkles size={18} />,
      bg: 'bg-amber-50',
      text: 'text-amber-600'
    },
    {
      label: '구매 내역',
      value: paymentData ? formatNum(paymentData.totalPurchases) : (isLoading ? '...' : '-'),
      icon: <ShoppingBag size={18} />,
      bg: 'bg-teal-50',
      text: 'text-teal-600'
    },
    {
      label: '예매 내역',
      value: '-',
      icon: <Calendar size={18} />,
      bg: 'bg-violet-50',
      text: 'text-violet-600'
    },
    {
      label: '팬레터',
      value: '-',
      icon: <Heart size={18} />,
      bg: 'bg-rose-50',
      text: 'text-rose-600'
    },
  ];

  return (
    <Layout role="user">
      <div className="p-4 lg:p-6 space-y-6">
        {/* Welcome */}
        <div
          className="relative overflow-hidden rounded-3xl p-6 text-white"
          style={{ background: 'linear-gradient(135deg, oklch(0.60 0.20 10), oklch(0.55 0.18 290))' }}>
          <div className="relative">
            <p className="text-white/70 text-sm mb-1">안녕하세요 👋</p>
            <h1 className="text-2xl font-bold mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
              {userName} 님
            </h1>
            <p className="text-white/80 text-sm">
              {isLoading ? '대시보드 데이터 불러오는 중...' : '오늘도 좋아하는 아티스트와 함께하세요!'}
            </p>
          </div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-30">
            {isLoading ? <Loader2 size={80} className="text-white animate-spin" /> : <Heart size={80} fill="white" className="text-white" />}
          </div>
        </div>

        {/* Quick Stats - 실시간 데이터 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {quickStats.map((stat, i) =>
            <div key={i} className="glass-card rounded-2xl p-4 soft-shadow">
              <div className={`inline-flex items-center justify-center w-9 h-9 rounded-xl ${stat.bg} ${stat.text} mb-3`}>
                {stat.icon}
              </div>
              <p className="text-xl font-bold text-foreground" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                {stat.value}
              </p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          )}
        </div>

        {/* 결제/포인트 상세 내역 - 실시간 수신 데이터 */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* 구매 내역 */}
          <div className="glass-card rounded-2xl p-5 soft-shadow">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
                구매 내역
              </h2>
              <Link href="/user/wallet">
                <button className="flex items-center gap-1 text-sm text-rose-500 font-semibold hover:text-rose-600">
                  전체보기 <ArrowRight size={14} />
                </button>
              </Link>
            </div>
            {isLoading ? (
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                <Loader2 size={20} className="animate-spin mr-2" /> 불러오는 중...
              </div>
            ) : paymentData?.purchaseHistory?.length > 0 ? (
              <div className="space-y-2">
                {paymentData.purchaseHistory.slice(0, 5).map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-foreground">{item.itemName || '항목'}</p>
                      <p className="text-xs text-muted-foreground">{item.purchasedAt ? new Date(item.purchasedAt).toLocaleDateString('ko-KR') : ''}</p>
                    </div>
                    <span className="text-sm font-bold text-rose-600">
                      {Number(item.amount).toLocaleString()}P
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-6">구매 내역이 없습니다.</p>
            )}
          </div>

          {/* 포인트 내역 */}
          <div className="glass-card rounded-2xl p-5 soft-shadow">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
                포인트 내역
              </h2>
              <Link href="/user/wallet">
                <button className="flex items-center gap-1 text-sm text-rose-500 font-semibold hover:text-rose-600">
                  전체보기 <ArrowRight size={14} />
                </button>
              </Link>
            </div>
            {isLoading ? (
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                <Loader2 size={20} className="animate-spin mr-2" /> 불러오는 중...
              </div>
            ) : paymentData?.pointHistory?.length > 0 ? (
              <div className="space-y-2">
                {paymentData.pointHistory.slice(0, 5).map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-foreground">{item.description || item.type}</p>
                      <p className="text-xs text-muted-foreground">{item.processedAt ? new Date(item.processedAt).toLocaleDateString('ko-KR') : ''}</p>
                    </div>
                    <div className="text-right">
                      <span className={`text-sm font-bold ${item.type === 'CHARGE' ? 'text-teal-600' : 'text-rose-600'}`}>
                        {item.type === 'CHARGE' ? '+' : '-'}{Number(item.amount).toLocaleString()}P
                      </span>
                      <p className="text-xs text-muted-foreground">{Number(item.balanceAfter).toLocaleString()}P</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-6">포인트 내역이 없습니다.</p>
            )}
          </div>
        </div>

        {/* 빠른 메뉴 */}
        <div>
          <h2 className="text-lg font-bold text-foreground mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
            빠른 메뉴
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { label: 'AI 챗봇', icon: <MessageCircle size={18} />, href: '/user/chat', color: 'bg-violet-50 text-violet-600' },
              { label: '팬레터 쓰기', icon: <Heart size={18} />, href: '/user/community', color: 'bg-rose-50 text-rose-600' },
              { label: '굿즈 구매', icon: <ShoppingBag size={18} />, href: '/user/store', color: 'bg-amber-50 text-amber-600' },
              { label: '포인트 충전', icon: <Sparkles size={18} />, href: '/user/wallet', color: 'bg-teal-50 text-teal-600' },
            ].map((action) =>
              <Link key={action.label} href={action.href}>
                <div className={`flex flex-col items-center gap-2 p-3 rounded-xl ${action.color} hover-lift cursor-pointer`}>
                  {action.icon}
                  <span className="text-xs font-semibold">{action.label}</span>
                </div>
              </Link>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}