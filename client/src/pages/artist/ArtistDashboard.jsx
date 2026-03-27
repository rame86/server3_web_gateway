/*
 * Lumina - Artist Dashboard
 * Soft Bloom Design: Artist activity summary, fan stats, recent fan letters
 */

import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { Heart, Users, TrendingUp, Sparkles, MessageCircle, Calendar, Package, ArrowRight, Star, BarChart3, Loader2 } from 'lucide-react';
import { Link } from 'wouter';
import { toast } from 'sonner';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { coreApi, payApi, resApi } from '@/lib/api';

const ARTIST_COVER = 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200&h=400&fit=crop';

export default function ArtistDashboard() {
  const [loading, setLoading] = useState(true);
  const [artistInfo, setArtistInfo] = useState({
    name: '아티스트',
    category: '',
    profileImageUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
    followerCount: 0,
    memberId: null
  });

  const [settlementData, setSettlementData] = useState({
    thisMonthRevenue: 0,
    monthlyTrend: [],
  });

  const [fanLetters, setFanLetters] = useState([]);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const myId = parseInt(localStorage.getItem('memberId'));
      if (!myId) {
        toast.error('로그인 정보가 없습니다.');
        setLoading(false);
        return;
      }

      try {
        // 1. 아티스트 정보
        let fetchedArtistName = '이름 없음';
        try {
          const artistRes = await coreApi.get('/artist/list');
          const me = artistRes.data.find(a => a.memberId === myId);
          
          if (me) {
            fetchedArtistName = me.stageName || me.artistName || '이름 없음';
            setArtistInfo({
              name: fetchedArtistName,
              category: me.category || '일반',
              profileImageUrl: me.profileImageUrl || 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
              followerCount: me.followerCount || 0,
              memberId: myId
            });
          }
        } catch (e) {
          console.error("아티스트 정보를 불러오는데 실패:", e);
        }

        // 2. 정산/수익 데이터
        try {
          const payRes = await payApi.get('/artist/settlement');
          setSettlementData({
            thisMonthRevenue: payRes.data.thisMonthRevenue || 0,
            monthlyTrend: (payRes.data.monthlyTrend || []).map(t => ({
              month: t.yearMonth.split('-')[1] + '월', // "2025-10" -> "10월"
              revenue: t.eventRevenue + t.goodsRevenue + t.donationRevenue,
              donation: t.donationRevenue
            }))
          });
        } catch (e) {
          console.error("정산 정보를 불러오는데 실패:", e);
        }

        // 3. 최근 팬레터
        try {
          // 게시판 카테고리 '팬레터' 조회
          const boardRes = await coreApi.get(`/artist/board/${myId}?category=팬레터`);
          const letters = Array.isArray(boardRes.data) ? boardRes.data : [];
          // 최신 3개만 유지
          setFanLetters(letters.slice(0, 3).map(b => ({
            id: b.boardId,
            title: b.title,
            content: b.content || '',
            author: b.writerNickname || b.writerName || '팬',
            authorImage: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=50&h=50&fit=crop",
            createdAt: b.createdAt ? `${b.createdAt[0]}.${String(b.createdAt[1]).padStart(2,'0')}.${String(b.createdAt[2]).padStart(2,'0')}` : '방금 전',
            likes: b.likes || 0
          })));
        } catch (e) {
          console.error("팬레터 정보를 불러오는데 실패:", e);
        }

        // 4. 내 이벤트
        try {
          const resEvents = await resApi.get(`/events/my?artistId=${myId}`);
          const allEvents = Array.isArray(resEvents.data?.events) ? resEvents.data.events : (Array.isArray(resEvents.data) ? resEvents.data : []);
          
          // 🌟 승인 완료(CONFIRMED) & 오늘 이후(미래) 일정만 필터링
          const upcomingEvents = allEvents.filter(e => {
            const isConfirmed = e.approval_status === 'CONFIRMED' || e.status === 'CONFIRMED';
            const eventDate = new Date(e.event_date || e.date);
            return isConfirmed && eventDate > new Date();
          });

          // 🌟 slice(0, 3)을 빼고 전체 예정 이벤트를 저장! (상단 통계용)
          setEvents(upcomingEvents.map(e => ({
            id: e.event_id || e.id,
            title: e.title || e.eventTitle,
            date: e.event_date ? new Date(e.event_date).toLocaleDateString().replace(/\.\s/g, '.').replace(/\.$/, '') : 'TBD',
            remaining: e.available_seats ?? e.availableSeats ?? e.total_capacity ?? 0
          })));
        } catch (e) {
          console.error("이벤트 정보를 불러오는데 실패:", e);
        }

      } catch (e) {
        console.error("아티스트 대시보드 API 복합 오류:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const artistStats = [
    { label: '총 팬 수', value: artistInfo.followerCount.toLocaleString(), icon: <Users size={18} />, color: 'from-rose-400 to-pink-500', bg: 'bg-rose-50', text: 'text-rose-600', change: '누적' },
    { label: '이번 달 후원', value: `₩${settlementData.thisMonthRevenue.toLocaleString()}`, icon: <Sparkles size={18} />, color: 'from-violet-400 to-purple-500', bg: 'bg-violet-50', text: 'text-violet-600', change: '이달 합계' },
    { label: '최근 팬레터', value: `${fanLetters.length}건`, icon: <Heart size={18} />, color: 'from-amber-400 to-orange-400', bg: 'bg-amber-50', text: 'text-amber-600', change: '조회 완료' },
    { label: '예정 이벤트', value: `${events.length}건`, icon: <Calendar size={18} />, color: 'from-teal-400 to-cyan-500', bg: 'bg-teal-50', text: 'text-teal-600', change: '일정 확인' }
  ];

  return (
    <Layout role="artist">
      <div className="p-4 lg:p-6 space-y-6 flex flex-col min-h-[80vh]">
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
            <Loader2 size={32} className="animate-spin mb-4 text-violet-500" />
            <p>아티스트 데이터를 불러오는 중입니다...</p>
          </div>
        ) : (
          <>
            {/* Profile Banner */}
            <div className="relative overflow-hidden rounded-3xl">
              <img src={artistInfo.profileImageUrl || ARTIST_COVER} alt="커버" className="w-full h-40 object-cover opacity-80" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
              <div className="absolute inset-0 flex items-end p-5">
                <div className="flex items-end gap-4">
                  <img
                    src={artistInfo.profileImageUrl}
                    alt={artistInfo.name}
                    className="w-16 h-16 rounded-2xl object-cover ring-3 ring-white shadow-lg bg-white" />
                  
                  <div className="pb-1">
                    <div className="flex items-center gap-2">
                      <h1 className="text-xl font-bold text-white drop-shadow-md" style={{ fontFamily: "'Playfair Display', serif" }}>
                        {artistInfo.name}
                      </h1>
                      <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-full shadow-sm">
                        <Star size={10} className="text-amber-300" fill="currentColor" />
                        <span className="text-white text-xs font-semibold">인증 아티스트</span>
                      </div>
                    </div>
                    <p className="text-white/90 text-sm drop-shadow-sm">{artistInfo.category} 아티스트</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {artistStats.map((stat, i) =>
                <div key={i} className="glass-card rounded-2xl p-4 soft-shadow bg-white">
                  <div className={`inline-flex items-center justify-center w-9 h-9 rounded-xl ${stat.bg} ${stat.text} mb-3`}>
                    {stat.icon}
                  </div>
                  <p className="text-lg font-bold text-foreground" style={{ fontFamily: "'DM Sans', sans-serif" }}>{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className="text-xs text-teal-600 font-semibold mt-1">{stat.change}</p>
                </div>
              )}
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Charts */}
              <div className="lg:col-span-2 space-y-4">
                {/* Monthly Fan Support Growth */}
                <div className="glass-card rounded-2xl p-5 soft-shadow bg-white">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <TrendingUp size={18} className="text-rose-500" />
                      <h2 className="font-bold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
                        월별 후원 수익 현황
                      </h2>
                    </div>
                    <span className="text-xs badge-rose px-2 py-1 rounded-full">최근 6개월</span>
                  </div>
                  <ResponsiveContainer width="100%" height={160}>
                    {settlementData.monthlyTrend.length > 0 ? (
                      <BarChart data={settlementData.monthlyTrend}>
                        <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis hide />
                        <Tooltip
                          contentStyle={{ background: 'white', border: '1px solid #fce7f3', borderRadius: '12px', fontSize: '12px' }}
                          formatter={(value) => [`₩${value.toLocaleString()}`, '후원 금액']} />
                        
                        <Bar dataKey="donation" fill="oklch(0.75 0.15 10)" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-sm text-gray-400">
                        표시할 데이터가 없습니다.
                      </div>
                    )}
                  </ResponsiveContainer>
                </div>

                {/* Revenue Chart */}
                <div className="glass-card rounded-2xl p-5 soft-shadow bg-white">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <BarChart3 size={18} className="text-violet-500" />
                      <h2 className="font-bold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
                        월별 총 수익 (굿즈/이벤트 포함)
                      </h2>
                    </div>
                    <span className="text-xs badge-lavender px-2 py-1 rounded-full">최근 6개월</span>
                  </div>
                  <ResponsiveContainer width="100%" height={140}>
                    {settlementData.monthlyTrend.length > 0 ? (
                      <LineChart data={settlementData.monthlyTrend}>
                        <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis hide />
                        <Tooltip
                          contentStyle={{ background: 'white', border: '1px solid #fce7f3', borderRadius: '12px', fontSize: '12px' }}
                          formatter={(value) => [`₩${value.toLocaleString()}`, '총 수익']} />
                        
                        <Line
                          type="monotone"
                          dataKey="revenue"
                          stroke="oklch(0.65 0.18 290)"
                          strokeWidth={2.5}
                          dot={{ fill: 'oklch(0.65 0.18 290)', r: 4 }} />
                        
                      </LineChart>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-sm text-gray-400">
                        표시할 통계가 없습니다.
                      </div>
                    )}
                  </ResponsiveContainer>
                </div>

                {/* Recent Fan Letters */}
                <div className="glass-card rounded-2xl p-5 soft-shadow bg-white">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Heart size={18} className="text-rose-500" />
                      <h2 className="font-bold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
                        최근 팬레터
                      </h2>
                    </div>
                    <Link href="/artist/community">
                      <button className="flex items-center gap-1 text-sm text-rose-500 font-semibold hover:text-rose-600">
                        전체보기 <ArrowRight size={14} />
                      </button>
                    </Link>
                  </div>
                  <div className="space-y-3">
                    {fanLetters.length > 0 ? fanLetters.map((post) =>
                    <div
                      key={post.id}
                      onClick={() => toast.info('팬레터 상세보기 기능 준비 중입니다')}
                      className="flex items-start gap-3 p-3 rounded-xl hover:bg-rose-50/50 transition-colors cursor-pointer border border-transparent hover:border-rose-100">
                      
                        <img src={post.authorImage} alt={post.author} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground line-clamp-1">{post.title}</p>
                          <p className="text-xs text-muted-foreground line-clamp-1">{post.content}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{post.author} · {post.createdAt}</p>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-rose-500">
                          <Heart size={11} fill="currentColor" />
                          {post.likes}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-6 text-sm text-gray-400">
                        최근 도착한 팬레터가 없습니다.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                {/* Quick Actions */}
                <div className="glass-card rounded-2xl p-4 soft-shadow bg-white">
                  <h3 className="font-bold text-foreground mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
                    빠른 메뉴
                  </h3>
                  <div className="space-y-2">
                    {[
                    { label: '아티스트 레터 작성', icon: <MessageCircle size={16} />, href: '/artist/community', color: 'text-violet-600 bg-violet-50' },
                    { label: '굿즈 등록', icon: <Package size={16} />, href: '/artist/store', color: 'text-amber-600 bg-amber-50' },
                    { label: '이벤트 등록', icon: <Calendar size={16} />, href: '/artist/booking', color: 'text-teal-600 bg-teal-50' },
                    { label: '팬 채팅', icon: <Heart size={16} />, href: '/artist/chat', color: 'text-rose-600 bg-rose-50' }].
                    map((action) =>
                    <Link key={action.label} href={action.href}>
                        <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-rose-50/50 transition-colors cursor-pointer border border-transparent hover:border-violet-100">
                          <div className={`w-8 h-8 rounded-lg ${action.color} flex items-center justify-center`}>
                            {action.icon}
                          </div>
                          <span className="text-sm font-medium text-foreground">{action.label}</span>
                          <ArrowRight size={14} className="ml-auto text-muted-foreground" />
                        </div>
                      </Link>
                    )}
                  </div>
                </div>

                {/* Upcoming Events */}
                <div className="glass-card rounded-2xl p-4 soft-shadow bg-white">
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar size={16} className="text-rose-500" />
                    <h3 className="font-bold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
                      내 이벤트
                    </h3>
                  </div>
                  {events.length > 0 ? events.slice(0, 3).map((event) =>
                  <div key={event.id} className="p-3 rounded-xl bg-violet-50 border border-violet-100 mb-2">
                      <p className="text-sm font-semibold text-foreground line-clamp-1">{event.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{event.date}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-rose-600 font-semibold">잔여 {event.remaining}석</span>
                        <span className="text-[10px] badge-rose px-1.5 py-0.5 rounded-full font-bold">진행 중</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6 text-sm text-gray-400">
                      등록된 예정 이벤트가 없습니다.
                    </div>
                  )}
                </div>


                
                {/* Donation Summary */}
                <div
                  className="rounded-2xl p-5 text-white shadow-lg"
                  style={{ background: 'linear-gradient(135deg, oklch(0.60 0.18 290), oklch(0.55 0.20 310))' }}>
                  
                  <div className="flex items-center gap-2 mb-3 opacity-90">
                    <Sparkles size={16} className="text-white" />
                    <h3 className="font-bold text-white">이번 달 후원 (정산 대기)</h3>
                  </div>
                  <p className="text-3xl font-bold mb-1" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                    ₩{settlementData.thisMonthRevenue.toLocaleString()}
                  </p>
                  <p className="text-white/80 text-xs"> 팬들의 따뜻한 마음이 도착했어요! 💌</p>
                  <Link href="/artist/settlement">
                    <button className="mt-4 w-full py-2.5 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-bold text-white transition-all shadow-sm">
                      정산 내역 확인하기
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}