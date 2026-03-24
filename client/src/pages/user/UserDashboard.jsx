/*
 * Lumina - User Dashboard
 * 원본 레이아웃 복원: 찜한 아티스트, 예매 내역, 결제/포인트 내역, 빠른 메뉴
 */

import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import {
  Heart, ShoppingBag, Calendar, MessageCircle, Sparkles, ArrowRight, Bell,
  Loader2, Star, Music, User
} from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { coreApi, payApi } from '@/lib/api';

export default function UserDashboard() {
  const [paymentData, setPaymentData] = useState(null);
  const [followedArtists, setFollowedArtists] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [artistsLoading, setArtistsLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [memberId, setMemberId] = useState(null);
  const [, navigate] = useLocation();

  useEffect(() => {
    const storedName = localStorage.getItem('userName') || '사용자';
    const storedId = localStorage.getItem('memberId');
    setUserName(storedName);
    setMemberId(storedId);

    // 1. 결제/포인트 내역
    const fetchPayment = async () => {
      if (!storedId) { setIsLoading(false); return; }
      try {
        const res = await payApi.get(`/payment/admin/user-detail/${storedId}`);
        setPaymentData(res.data);
      } catch (e) {
        console.error('[Dashboard] 결제 내역 오류:', e);
      } finally {
        setIsLoading(false);
      }
    };

    // 2. 찜한 아티스트(팔로우) 목록
    const fetchFollowed = async () => {
      try {
        const res = await coreApi.get('/artist/my-follows');
        setFollowedArtists(res.data || []);
      } catch (e) {
        console.error('[Dashboard] 아티스트 팔로우 목록 오류:', e);
      } finally {
        setArtistsLoading(false);
      }
    };

    fetchPayment();
    fetchFollowed();
  }, []);

  const fmtPt = (n) => n != null ? `${Number(n).toLocaleString()}P` : '-';
  const fmtN  = (n) => n != null ? `${Number(n)}건` : '-';

  const stats = [
    {
      label: '즐겨찾기',
      value: artistsLoading ? '...' : `${followedArtists.length}명`,
      icon: <Heart size={18} />, bg: 'bg-rose-50', text: 'text-rose-500'
    },
    {
      label: '예매 내역',
      value: '-',
      icon: <Calendar size={18} />, bg: 'bg-violet-50', text: 'text-violet-500'
    },
    {
      label: '포인트',
      value: isLoading ? '...' : fmtPt(paymentData?.pointBalance),
      icon: <Sparkles size={18} />, bg: 'bg-amber-50', text: 'text-amber-500'
    },
    {
      label: '구매 건',
      value: isLoading ? '...' : fmtN(paymentData?.totalPurchases),
      icon: <ShoppingBag size={18} />, bg: 'bg-teal-50', text: 'text-teal-500'
    },
  ];

  return (
    <Layout role="user">
      <div className="p-4 lg:p-6 space-y-6">

        {/* 웰컴 배너 */}
        <div
          className="relative overflow-hidden rounded-3xl p-6 lg:p-8 text-white"
          style={{ background: 'linear-gradient(135deg, oklch(0.58 0.16 10), oklch(0.52 0.20 290))' }}>
          <div className="relative z-10">
            <p className="text-white/70 text-xs font-semibold tracking-widest uppercase mb-1">LUMINA DASHBOARD</p>
            <h1 className="text-2xl lg:text-3xl font-bold mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
              {userName} 님
            </h1>
            <p className="text-white/80 text-sm">
              {isLoading ? '데이터 불러오는 중...' : '오늘도 좋아하는 아티스트와 함께하세요 ✨'}
            </p>
          </div>
          <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-20">
            <Heart size={100} fill="white" className="text-white" />
          </div>
        </div>

        {/* 요약 통계 카드 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {stats.map((s, i) => (
            <div key={i} className="glass-card rounded-2xl p-4 soft-shadow bg-white">
              <div className={`inline-flex items-center justify-center w-9 h-9 rounded-xl ${s.bg} ${s.text} mb-3`}>
                {s.icon}
              </div>
              <p className="text-xl font-black text-foreground font-dm-sans">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* 내 아티스트 */}
        <div className="glass-card rounded-2xl p-5 soft-shadow bg-white">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
              내 아티스트
            </h2>
            <Link href="/artists">
              <button className="flex items-center gap-1 text-xs text-rose-500 font-semibold hover:text-rose-600">
                전체보기 <ArrowRight size={12} />
              </button>
            </Link>
          </div>

          {artistsLoading ? (
            <div className="flex items-center justify-center py-6 text-muted-foreground">
              <Loader2 size={18} className="animate-spin mr-2" /> 불러오는 중...
            </div>
          ) : followedArtists.length === 0 ? (
            <div className="text-center py-6">
              <Music size={32} className="mx-auto text-muted-foreground/40 mb-2" />
              <p className="text-sm text-muted-foreground">팔로우한 아티스트가 없습니다.</p>
              <Link href="/user/artists">
                <button className="mt-3 text-xs text-rose-500 font-semibold hover:underline">아티스트 찾기 →</button>
              </Link>
            </div>
          ) : (
            <div className="flex gap-4 flex-wrap">
              {followedArtists.map((artist) => (
                <button
                  key={artist.memberId}
                  onClick={() => navigate(`/artists/${artist.memberId}`)}
                  className="flex flex-col items-center gap-2 group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-100 to-pink-200 flex items-center justify-center overflow-hidden border-2 border-white shadow-md group-hover:border-rose-300 transition-all">
                    {artist.profileImageUrl ? (
                      <img src={artist.profileImageUrl} alt={artist.stageName} className="w-full h-full object-cover" />
                    ) : (
                      <User size={24} className="text-rose-400" />
                    )}
                  </div>
                  <span className="text-xs font-bold text-foreground text-center max-w-[64px] truncate">
                    {artist.stageName}
                  </span>
                  <span className="text-[10px] text-rose-500 font-semibold bg-rose-50 px-2 py-0.5 rounded-full">
                    팔로잉
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 구매 / 포인트 내역 */}
        <div className="grid lg:grid-cols-2 gap-4">
          {/* 구매 내역 */}
          <div className="glass-card rounded-2xl p-5 soft-shadow bg-white">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
                구매 내역
              </h2>
              <Link href="/user/wallet">
                <button className="flex items-center gap-1 text-xs text-rose-500 font-semibold hover:text-rose-600">
                  전체보기 <ArrowRight size={12} />
                </button>
              </Link>
            </div>
            {isLoading ? (
              <div className="flex items-center justify-center py-6 text-muted-foreground">
                <Loader2 size={18} className="animate-spin mr-2" /> 불러오는 중...
              </div>
            ) : paymentData?.purchaseHistory?.length > 0 ? (
              <div className="space-y-2">
                {paymentData.purchaseHistory.slice(0, 5).map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-foreground leading-tight">{item.itemName || '항목'}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.purchasedAt ? new Date(item.purchasedAt).toLocaleDateString('ko-KR') : ''}
                      </p>
                    </div>
                    <span className="text-sm font-bold text-rose-600">
                      {Math.abs(Number(item.amount)).toLocaleString()}P
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-6">구매 내역이 없습니다.</p>
            )}
          </div>

          {/* 포인트 내역 */}
          <div className="glass-card rounded-2xl p-5 soft-shadow bg-white">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
                포인트 내역
              </h2>
              <Link href="/user/wallet">
                <button className="flex items-center gap-1 text-xs text-rose-500 font-semibold hover:text-rose-600">
                  전체보기 <ArrowRight size={12} />
                </button>
              </Link>
            </div>
            {isLoading ? (
              <div className="flex items-center justify-center py-6 text-muted-foreground">
                <Loader2 size={18} className="animate-spin mr-2" /> 불러오는 중...
              </div>
            ) : paymentData?.pointHistory?.length > 0 ? (
              <div className="space-y-2">
                {paymentData.pointHistory.slice(0, 5).map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-foreground leading-tight">{item.description || item.type}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.processedAt ? new Date(item.processedAt).toLocaleDateString('ko-KR') : ''}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`text-sm font-bold ${item.type === 'CHARGE' ? 'text-teal-600' : 'text-rose-600'}`}>
                        {item.type === 'CHARGE' ? '+' : '-'}{Math.abs(Number(item.amount)).toLocaleString()}P
                      </span>
                      <p className="text-xs text-muted-foreground">
                        {Math.abs(Number(item.balanceAfter)).toLocaleString()}P
                      </p>
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
          <h2 className="text-base font-bold text-foreground mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
            빠른 메뉴
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: '굿즈', icon: <ShoppingBag size={20} />, href: '/user/store', color: 'bg-amber-50 text-amber-600' },
              { label: '팬레터 작성', icon: <Heart size={20} />, href: '/user/community', color: 'bg-rose-50 text-rose-600' },
              { label: '포인트 충전', icon: <Sparkles size={20} />, href: '/user/wallet', color: 'bg-teal-50 text-teal-600' },
              { label: '커뮤니티', icon: <MessageCircle size={20} />, href: '/user/community', color: 'bg-violet-50 text-violet-600' },
            ].map((action) => (
              <Link key={action.label} href={action.href}>
                <div className={`flex flex-col items-center gap-2 p-4 rounded-2xl ${action.color} hover:opacity-80 transition-opacity cursor-pointer`}>
                  {action.icon}
                  <span className="text-xs font-bold">{action.label}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </Layout>
  );
}