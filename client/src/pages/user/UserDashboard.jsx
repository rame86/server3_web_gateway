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
  //**결제 및 포인트 내역 전체 데이터를 통째로 저장하는 상태 변수**/
  const [paymentData, setPaymentData] = useState(null);

  //**사용자가 찜(팔로우)한 아티스트 객체 목록 배열을 저장하는 상태 변수**/
  const [followedArtists, setFollowedArtists] = useState([]);

  //**결제/포인트 API 데이터 로딩 상태 변수 (true: 통신 중, false: 통신 완료)**/
  const [isLoading, setIsLoading] = useState(true);

  //**아티스트 API 데이터 로딩 상태 변수 (true: 통신 중, false: 통신 완료)**/
  const [artistsLoading, setArtistsLoading] = useState(true);

  //**현재 접속한 사용자의 이름 문자열을 저장하는 변수 (화면 상단 환영 문구용)**/
  const [userName, setUserName] = useState('');

  //**현재 접속한 사용자의 DB 고유 식별자(PK)를 저장하는 변수**/
  const [memberId, setMemberId] = useState(null);

  //**다른 페이지로 강제 이동시킬 때 사용하는 라우터 함수 (ex: navigate('/path'))**/
  const [, navigate] = useLocation();

  //**컴포넌트가 화면에 처음 뜰 때(Mount) 단 한 번만 실행되는 초기화 로직**/
  useEffect(() => {
    // 1. 로컬스토리지에서 유저 정보 꺼내서 상태 변수에 저장
    const storedName = localStorage.getItem('userName') || '사용자';
    const storedId = localStorage.getItem('memberId');
    setUserName(storedName);
    setMemberId(storedId);

    //**결제 및 포인트 내역 API 호출 함수**/
    const fetchPayment = async () => {
      if (!storedId) { setIsLoading(false); return; } // ID가 없으면 로딩 끄고 바로 종료
      try {
        // MSA 결제 서버(payApi)로 유저 상세 내역 요청
        const res = await payApi.get(`/payment/user-detail/${storedId}`);
        setPaymentData(res.data); // 받아온 데이터를 paymentData 상태에 저장
      } catch (e) {
        console.error('[Dashboard] 결제 내역 오류:', e);
      } finally {
        setIsLoading(false); // 통신 성공/실패 무관하게 로딩 상태 해제
      }
    };

    //**팔로우한 아티스트 목록 조회 API 호출 함수**/
    const fetchFollowed = async () => {
      try {
        // MSA 코어 서버(coreApi)로 내 팔로우 리스트 요청
        const res = await coreApi.get('/artist/my-follows');
        setFollowedArtists(res.data || []); // 받아온 아티스트 배열을 followedArtists 상태에 저장
      } catch (e) {
        console.error('[Dashboard] 아티스트 팔로우 목록 오류:', e);
      } finally {
        setArtistsLoading(false); // 통신 성공/실패 무관하게 로딩 상태 해제
      }
    };

    // 정의한 두 API 함수를 실제로 실행
    fetchPayment();
    fetchFollowed();
  }, []);

  //**포인트 숫자를 '1,000P' 포맷의 문자열로 변환해주는 헬퍼 함수**/
  const fmtPt = (n) => n != null ? `${Number(n).toLocaleString()}P` : '-';

  //**건수를 '5건' 포맷의 문자열로 변환해주는 헬퍼 함수**/
  const fmtN = (n) => n != null ? `${Number(n)}건` : '-';

  //**화면 최상단 4개의 요약 통계 카드(즐겨찾기, 예매내역, 포인트, 구매건수) 데이터를 정의하는 배열**/
  const stats = [
    {
      label: '즐겨찾기',
      // followedArtists 배열의 길이를 사용해 찜한 명수 표시
      value: artistsLoading ? '...' : `${followedArtists.length}명`,
      icon: <Heart size={18} />, bg: 'bg-rose-50', text: 'text-rose-500'
    },
    {
      label: '예매 내역',
      value: '-', // 하드코딩된 임시 데이터 영역
      icon: <Calendar size={18} />, bg: 'bg-violet-50', text: 'text-violet-500'
    },
    {
      label: '포인트',
      // paymentData 객체 내부의 pointBalance 값 추출
      value: isLoading ? '...' : fmtPt(paymentData?.pointBalance),
      icon: <Sparkles size={18} />, bg: 'bg-amber-50', text: 'text-amber-500'
    },
    {
      label: '구매 건',
      // paymentData 객체 내부의 totalPurchases 값 추출
      value: isLoading ? '...' : fmtN(paymentData?.totalPurchases),
      icon: <ShoppingBag size={18} />, bg: 'bg-teal-50', text: 'text-teal-500'
    },
  ];

  return (
    <Layout role="user">
      <div className="p-4 lg:p-6 space-y-6">

        {/* 웰컴 배너 영역 */}
        <div
          className="relative overflow-hidden rounded-3xl p-6 lg:p-8 text-white"
          style={{ background: 'linear-gradient(135deg, oklch(0.58 0.16 10), oklch(0.52 0.20 290))' }}>
          <div className="relative z-10">
            <p className="text-white/70 text-xs font-semibold tracking-widest uppercase mb-1">LUMINA DASHBOARD</p>
            {/***사용자 이름 출력부***/}
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

        {/* 요약 통계 카드 렌더링 영역 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {/* stats 배열을 반복문(map)으로 돌려서 4개의 카드를 찍어냄 */}
          {stats.map((s, i) => (
            <div key={i} className="glass-card rounded-2xl p-4 soft-shadow bg-white">
              <div className={`inline-flex items-center justify-center w-9 h-9 rounded-xl ${s.bg} ${s.text} mb-3`}>
                {s.icon}
              </div>
              {/***통계 실제 수치(value) 출력부***/}
              <p className="text-xl font-black text-foreground font-dm-sans">{s.value}</p>
              {/***통계 라벨(label) 출력부***/}
              <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* 내 아티스트 (찜/팔로우 목록) 섹션 */}
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

          {/* 데이터 로딩 및 결과 여부에 따른 화면 분기 처리 */}
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
              {/***팔로우 배열(followedArtists)을 반복문으로 돌려 개별 아이콘 렌더링***/}
              {followedArtists.map((artist) => (
                <button
                  key={artist.memberId}
                  // 클릭 시 해당 아티스트의 고유 ID를 이용해 상세 페이지로 강제 이동
                  onClick={() => navigate(`/artists/${artist.memberId}`)}
                  className="flex flex-col items-center gap-2 group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-100 to-pink-200 flex items-center justify-center overflow-hidden border-2 border-white shadow-md group-hover:border-rose-300 transition-all">
                    {/***아티스트 프로필 이미지 데이터 (URL) 적용부***/}
                    {artist.profileImageUrl ? (
                      <img src={artist.profileImageUrl} alt={artist.stageName} className="w-full h-full object-cover" />
                    ) : (
                      // 이미지가 없을 때 보여주는 기본 아이콘
                      <User size={24} className="text-rose-400" />
                    )}
                  </div>
                  {/***아티스트 활동명 출력부***/}
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

        {/* 구매 내역 / 포인트 내역 병렬 배치 섹션 */}
        <div className="grid lg:grid-cols-2 gap-4">

          {/* [좌측] 구매 내역 블록 */}
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
                {/***통째로 받아온 paymentData 객체 안에서 구매기록 배열(purchaseHistory)만 뽑아 상위 5개(.slice(0,5)) 렌더링***/}
                {paymentData.purchaseHistory.slice(0, 5).map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <div>
                      {/***구매 항목 이름(상품명) 출력부***/}
                      <p className="text-sm font-medium text-foreground leading-tight">{item.itemName || '항목'}</p>
                      {/***구매 날짜를 연.월.일 포맷으로 변환하여 출력부***/}
                      <p className="text-xs text-muted-foreground">
                        {item.purchasedAt ? new Date(item.purchasedAt).toLocaleDateString('ko-KR') : ''}
                      </p>
                    </div>
                    {/***구매에 사용된 금액(P) 출력부***/}
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

          {/* [우측] 포인트 내역 블록 */}
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
                {/***통째로 받아온 paymentData 객체 안에서 포인트 변동내역 배열(pointHistory)만 뽑아 상위 5개(.slice(0,5)) 렌더링***/}
                {paymentData.pointHistory.slice(0, 5).map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <div>
                      {/***포인트 변동 사유(설명) 출력부***/}
                      <p className="text-sm font-medium text-foreground leading-tight">{item.description || item.type}</p>
                      {/***포인트 변동 처리일자 포맷 변환 출력부***/}
                      <p className="text-xs text-muted-foreground">
                        {item.processedAt ? new Date(item.processedAt).toLocaleDateString('ko-KR') : ''}
                      </p>
                    </div>
                    <div className="text-right">
                      {/***CHARGE(충전)일 경우 초록색과 '+' 부호, 그 외(사용)일 경우 빨간색과 '-' 부호 노출 분기 처리***/}
                      <span className={`text-sm font-bold ${item.type === 'CHARGE' ? 'text-teal-600' : 'text-rose-600'}`}>
                        {item.type === 'CHARGE' ? '+' : '-'}{Math.abs(Number(item.amount)).toLocaleString()}P
                      </span>
                      {/***변동 후 최종 잔액 출력부***/}
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

        {/* 하단 빠른 메뉴 섹션 */}
        <div>
          <h2 className="text-base font-bold text-foreground mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
            빠른 메뉴
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/***빠른 이동 버튼들을 정의한 정적 배열 데이터를 반복문으로 돌려 4개의 숏컷 버튼 생성***/}
            {[
              { label: '굿즈', icon: <ShoppingBag size={20} />, href: '/user/store', color: 'bg-amber-50 text-amber-600' },
              { label: '팬레터 작성', icon: <Heart size={20} />, href: '/user/community', color: 'bg-rose-50 text-rose-600' },
              { label: '포인트 충전', icon: <Sparkles size={20} />, href: '/user/wallet', color: 'bg-teal-50 text-teal-600' },
              { label: '커뮤니티', icon: <MessageCircle size={20} />, href: '/user/community', color: 'bg-violet-50 text-violet-600' },
            ].map((action) => (
              // Link 컴포넌트를 이용해 href 경로로 라우팅
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