/*
 * Lumina - User Dashboard
 * Soft Bloom Design: Activity summary, artist cards, recent posts
 */

import Layout from '@/components/Layout';
import { Heart, ShoppingBag, Calendar, MessageCircle, Sparkles, ArrowRight, Bell } from 'lucide-react';
import { Link } from 'wouter';
import { artists, events, posts, formatNumber, formatPrice } from '@/lib/data';
import { toast } from 'sonner';

const ARTIST_CARD_BG = 'https://private-us-east-1.manuscdn.com/sessionFile/umqDS2iCyxhwdKkQqabwQ5/sandbox/5OYI281mcXf2naQYMxZ8bN-img-2_1771469987000_na1fn_YXJ0aXN0LWNhcmQtYmc.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvdW1xRFMyaUN5eGh3ZEtrUXFhYndRNS9zYW5kYm94LzVPWUkyODFtY1hmMm5hUVlNeFo4Yk4taW1nLTJfMTc3MTQ2OTk4NzAwMF9uYTFmbl9ZWEowYVhOMExXTmhjbVF0WW1jLnBuZz94LW9zcy1wcm9jZXNzPWltYWdlL3Jlc2l6ZSx3XzE5MjAsaF8xOTIwL2Zvcm1hdCx3ZWJwL3F1YWxpdHkscV84MCIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTc5ODc2MTYwMH19fV19&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=EZUCeRLXqnbrrXipC0EdvFhjoKZaHMjtR~l98uBy1-cG52gwzifiBzW9luu1A89wZMZpOHeiaQt7UsclcyxzrREt2CM5xof-s502I9D9lCkHxRtqrQOiTBGX8YQ4~76XZ7W3qSX-gmM0yHOe8rqoo~MleI3qPlnAzGT1mV7bPe4q24w8VVxlF0ydk65tGW8T-dWTTRUkZ7r63pJ0NOY4~tj5OZ6v6hVwAgBDOfrbEPkr62Ys~7jkv0aMtGm~wr-IRr--meGxsIAnBCDPOYiqlJ9HFXdZ9Ehr-qSi2g86H~ZEWprC07ZFlTibznNqI7~Fr4UjpqyAIpj8N-qXe7p2jg__';

const quickStats = [
{ label: '팔로우 아티스트', value: '3', icon: <Heart size={18} />, color: 'from-rose-400 to-pink-500', bg: 'bg-rose-50', text: 'text-rose-600' },
{ label: '예매 내역', value: '2', icon: <Calendar size={18} />, color: 'from-violet-400 to-purple-500', bg: 'bg-violet-50', text: 'text-violet-600' },
{ label: '포인트', value: '45,200P', icon: <Sparkles size={18} />, color: 'from-amber-400 to-orange-400', bg: 'bg-amber-50', text: 'text-amber-600' },
{ label: '구매 내역', value: '8건', icon: <ShoppingBag size={18} />, color: 'from-teal-400 to-cyan-500', bg: 'bg-teal-50', text: 'text-teal-600' }];


export default function UserDashboard() {
  return (
    <Layout role="user">
      <div className="p-4 lg:p-6 space-y-6">
        {/* Welcome */}
        <div
          className="relative overflow-hidden rounded-3xl p-6 text-white"
          style={{ background: 'linear-gradient(135deg, oklch(0.60 0.20 10), oklch(0.55 0.18 290))' }}>
          
          <div className="absolute inset-0 opacity-20">
            <img src={ARTIST_CARD_BG} alt="" className="w-full h-full object-cover" />
          </div>
          <div className="relative">
            <p className="text-white/70 text-sm mb-1">안녕하세요 👋</p>
            <h1 className="text-2xl font-bold mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
              별빛팬 님
            </h1>
            <p className="text-white/80 text-sm">오늘도 좋아하는 아티스트와 함께하세요!</p>
          </div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-30">
            <Heart size={80} fill="white" className="text-white" />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {quickStats.map((stat, i) =>
          <div key={i} className="glass-card rounded-2xl p-4 soft-shadow">
              <div className={`inline-flex items-center justify-center w-9 h-9 rounded-xl ${stat.bg} ${stat.text} mb-3`}>
                {stat.icon}
              </div>
              <p className="text-xl font-bold text-foreground" style={{ fontFamily: "'DM Sans', sans-serif" }}>{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* My Artists */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
                내 아티스트
              </h2>
              <Link href="/user/artists">
                <button className="flex items-center gap-1 text-sm text-rose-500 font-semibold hover:text-rose-600">
                  전체보기 <ArrowRight size={14} />
                </button>
              </Link>
            </div>

            <div className="space-y-3">
              {artists.slice(0, 3).map((artist) =>
              <div key={artist.id} className="glass-card rounded-2xl p-4 flex items-center gap-4 hover-lift soft-shadow">
                  <img
                  src={artist.image}
                  alt={artist.name}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-white shadow-sm flex-shrink-0" />
                
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm text-foreground">{artist.name}</p>
                      <span className="text-xs badge-rose px-1.5 py-0.5 rounded-full">{artist.group}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{artist.fandom} · {formatNumber(artist.followers)} 팬</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {artist.upcomingEvents > 0 &&
                  <span className="text-xs bg-rose-500 text-white px-2 py-0.5 rounded-full font-semibold">
                        행사 {artist.upcomingEvents}
                      </span>
                  }
                    <button
                    onClick={() => toast.success(`${artist.name} 아티스트 페이지로 이동합니다`)}
                    className="p-1.5 rounded-lg hover:bg-rose-50 transition-colors">
                    
                      <ArrowRight size={14} className="text-muted-foreground" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Upcoming Events */}
            <div className="flex items-center justify-between mt-6">
              <h2 className="text-lg font-bold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
                다가오는 이벤트
              </h2>
              <Link href="/user/events">
                <button className="flex items-center gap-1 text-sm text-rose-500 font-semibold hover:text-rose-600">
                  전체보기 <ArrowRight size={14} />
                </button>
              </Link>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              {events.slice(0, 2).map((event) =>
              <Link key={event.id} href="/user/booking">
                  <div className="glass-card rounded-2xl overflow-hidden hover-lift soft-shadow cursor-pointer">
                    <img src={event.image} alt={event.title} className="w-full h-28 object-cover" />
                    <div className="p-3">
                      <p className="font-semibold text-sm text-foreground line-clamp-1">{event.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{event.date}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm font-bold text-rose-600">{formatPrice(event.price)}</span>
                        <span className="text-xs text-muted-foreground">{event.remaining}석 남음</span>
                      </div>
                    </div>
                  </div>
                </Link>
              )}
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-4">
            {/* Recent Posts */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-bold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
                  최근 소식
                </h2>
                <Link href="/user/community">
                  <button className="flex items-center gap-1 text-sm text-rose-500 font-semibold hover:text-rose-600">
                    전체보기 <ArrowRight size={14} />
                  </button>
                </Link>
              </div>
              <div className="space-y-2">
                {posts.map((post) =>
                <div
                  key={post.id}
                  onClick={() => toast.info('커뮤니티 기능 준비 중입니다')}
                  className="glass-card rounded-xl p-3 cursor-pointer hover:bg-rose-50/50 transition-colors">
                  
                    <div className="flex items-start gap-2">
                      <img
                      src={post.authorImage}
                      alt={post.author}
                      className="w-7 h-7 rounded-full object-cover flex-shrink-0" />
                    
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-foreground line-clamp-1">{post.title}</p>
                        <p className="text-xs text-muted-foreground">{post.author} · {post.createdAt}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div>
              <h2 className="text-lg font-bold text-foreground mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
                빠른 메뉴
              </h2>
              <div className="grid grid-cols-2 gap-2">
                {[
                { label: 'AI 챗봇', icon: <MessageCircle size={18} />, href: '/user/chat', color: 'bg-violet-50 text-violet-600' },
                { label: '팬레터 쓰기', icon: <Heart size={18} />, href: '/user/community', color: 'bg-rose-50 text-rose-600' },
                { label: '굿즈 구매', icon: <ShoppingBag size={18} />, href: '/user/store', color: 'bg-amber-50 text-amber-600' },
                { label: '포인트 충전', icon: <Sparkles size={18} />, href: '/user/wallet', color: 'bg-teal-50 text-teal-600' }].
                map((action) =>
                <Link key={action.label} href={action.href}>
                    <div className={`flex flex-col items-center gap-2 p-3 rounded-xl ${action.color} hover-lift cursor-pointer`}>
                      {action.icon}
                      <span className="text-xs font-semibold">{action.label}</span>
                    </div>
                  </Link>
                )}
              </div>
            </div>

            {/* Notifications */}
            <div className="glass-card rounded-2xl p-4 soft-shadow">
              <div className="flex items-center gap-2 mb-3">
                <Bell size={16} className="text-rose-500" />
                <h3 className="font-semibold text-sm text-foreground">알림</h3>
                <span className="ml-auto text-xs bg-rose-500 text-white px-1.5 py-0.5 rounded-full">3</span>
              </div>
              <div className="space-y-2">
                {[
                { text: 'NOVA 팬미팅 예매 확정!', time: '방금 전', dot: 'bg-rose-500' },
                { text: '이하은이 새 레터를 작성했어요', time: '1시간 전', dot: 'bg-violet-500' },
                { text: '팬사인회 잔여석 알림', time: '3시간 전', dot: 'bg-amber-500' }].
                map((notif, i) =>
                <div key={i} className="flex items-start gap-2">
                    <div className={`w-2 h-2 rounded-full ${notif.dot} mt-1.5 flex-shrink-0`} />
                    <div>
                      <p className="text-xs text-foreground">{notif.text}</p>
                      <p className="text-xs text-muted-foreground">{notif.time}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>);

}