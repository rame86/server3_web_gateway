/*
 * FanVerse - Artist Dashboard
 * Soft Bloom Design: Artist activity summary, fan stats, recent fan letters
 */

import Layout from '@/components/Layout';
import { Heart, Users, TrendingUp, Sparkles, MessageCircle, Calendar, Package, ArrowRight, Star, BarChart3 } from 'lucide-react';
import { Link } from 'wouter';
import { posts, events } from '@/lib/data';
import { toast } from 'sonner';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const ARTIST_COVER = 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200&h=400&fit=crop';

const weeklyData = [
{ day: '월', fans: 120, revenue: 450000 },
{ day: '화', fans: 180, revenue: 680000 },
{ day: '수', fans: 95, revenue: 320000 },
{ day: '목', fans: 240, revenue: 890000 },
{ day: '금', fans: 310, revenue: 1200000 },
{ day: '토', fans: 420, revenue: 1580000 },
{ day: '일', fans: 380, revenue: 1340000 }];


const artistStats = [
{ label: '총 팬 수', value: '421,000', icon: <Users size={18} />, color: 'from-rose-400 to-pink-500', bg: 'bg-rose-50', text: 'text-rose-600', change: '+2.3%' },
{ label: '이번 주 후원', value: '₩2,840,000', icon: <Sparkles size={18} />, color: 'from-violet-400 to-purple-500', bg: 'bg-violet-50', text: 'text-violet-600', change: '+15.2%' },
{ label: '팬레터', value: '1,284', icon: <Heart size={18} />, color: 'from-amber-400 to-orange-400', bg: 'bg-amber-50', text: 'text-amber-600', change: '+8.7%' },
{ label: '예매 현황', value: '87석', icon: <Calendar size={18} />, color: 'from-teal-400 to-cyan-500', bg: 'bg-teal-50', text: 'text-teal-600', change: '잔여석' }];


export default function ArtistDashboard() {
  return (
    <Layout role="artist">
      <div className="p-4 lg:p-6 space-y-6">
        {/* Profile Banner */}
        <div className="relative overflow-hidden rounded-3xl">
          <img src={ARTIST_COVER} alt="커버" className="w-full h-40 object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent" />
          <div className="absolute inset-0 flex items-end p-5">
            <div className="flex items-end gap-4">
              <img
                src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop"
                alt="이하은"
                className="w-16 h-16 rounded-2xl object-cover ring-3 ring-white shadow-lg" />
              
              <div className="pb-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
                    이하은
                  </h1>
                  <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-full">
                    <Star size={10} className="text-amber-300" fill="currentColor" />
                    <span className="text-white text-xs font-semibold">인증 아티스트</span>
                  </div>
                </div>
                <p className="text-white/80 text-sm">BLOSSOM · PETAL 팬덤</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {artistStats.map((stat, i) =>
          <div key={i} className="glass-card rounded-2xl p-4 soft-shadow">
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
            {/* Weekly Fan Growth */}
            <div className="glass-card rounded-2xl p-5 soft-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <TrendingUp size={18} className="text-rose-500" />
                  <h2 className="font-bold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
                    주간 팬 활동
                  </h2>
                </div>
                <span className="text-xs badge-rose px-2 py-1 rounded-full">이번 주</span>
              </div>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={weeklyData}>
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={{ background: 'white', border: '1px solid #fce7f3', borderRadius: '12px', fontSize: '12px' }}
                    formatter={(value) => [`${value}명`, '신규 팬']} />
                  
                  <Bar dataKey="fans" fill="oklch(0.75 0.15 10)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Revenue Chart */}
            <div className="glass-card rounded-2xl p-5 soft-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <BarChart3 size={18} className="text-violet-500" />
                  <h2 className="font-bold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
                    주간 수익
                  </h2>
                </div>
                <span className="text-xs badge-lavender px-2 py-1 rounded-full">이번 주</span>
              </div>
              <ResponsiveContainer width="100%" height={140}>
                <LineChart data={weeklyData}>
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={{ background: 'white', border: '1px solid #fce7f3', borderRadius: '12px', fontSize: '12px' }}
                    formatter={(value) => [`₩${value.toLocaleString()}`, '수익']} />
                  
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="oklch(0.65 0.18 290)"
                    strokeWidth={2.5}
                    dot={{ fill: 'oklch(0.65 0.18 290)', r: 4 }} />
                  
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Recent Fan Letters */}
            <div className="glass-card rounded-2xl p-5 soft-shadow">
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
                {posts.filter((p) => p.type === 'fanletter').slice(0, 3).map((post) =>
                <div
                  key={post.id}
                  onClick={() => toast.info('팬레터 상세보기 기능 준비 중입니다')}
                  className="flex items-start gap-3 p-3 rounded-xl hover:bg-rose-50/50 transition-colors cursor-pointer">
                  
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
                )}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            {/* Quick Actions */}
            <div className="glass-card rounded-2xl p-4 soft-shadow">
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
                    <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-rose-50/50 transition-colors cursor-pointer">
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
            <div className="glass-card rounded-2xl p-4 soft-shadow">
              <div className="flex items-center gap-2 mb-3">
                <Calendar size={16} className="text-rose-500" />
                <h3 className="font-bold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
                  내 이벤트
                </h3>
              </div>
              {events.filter((e) => e.artistId === 3).map((event) =>
              <div key={event.id} className="p-3 rounded-xl bg-rose-50 mb-2">
                  <p className="text-sm font-semibold text-foreground line-clamp-1">{event.title}</p>
                  <p className="text-xs text-muted-foreground">{event.date}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-rose-600 font-semibold">잔여 {event.remaining}석</span>
                    <span className="text-xs badge-rose px-1.5 py-0.5 rounded-full">예매 중</span>
                  </div>
                </div>
              )}
            </div>

            {/* Donation Summary */}
            <div
              className="rounded-2xl p-4 text-white"
              style={{ background: 'linear-gradient(135deg, oklch(0.60 0.18 290), oklch(0.55 0.20 310))' }}>
              
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={16} className="text-white" />
                <h3 className="font-bold text-white">이번 달 후원</h3>
              </div>
              <p className="text-3xl font-bold mb-1" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                ₩8,420,000
              </p>
              <p className="text-white/70 text-xs">전월 대비 +23.5% ↑</p>
              <Link href="/artist/donations">
                <button className="mt-3 w-full py-2 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-semibold text-white transition-colors">
                  후원 내역 보기
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>);

}