/*
 * FanVerse - Landing Page
 * Soft Bloom Design: Hero with generated image, floating blobs, glass cards
 * Light background, dark plum text, rose/lavender accents
 */

import { Link } from 'wouter';
import { Heart, Star, ShoppingBag, Calendar, MessageCircle, ArrowRight, Sparkles, Users } from 'lucide-react';
import { artists, events, formatNumber, eventTypeLabel } from '@/lib/data';

const HERO_IMAGE = 'https://private-us-east-1.manuscdn.com/sessionFile/umqDS2iCyxhwdKkQqabwQ5/sandbox/5OYI281mcXf2naQYMxZ8bN-img-1_1771469990000_na1fn_aGVyby1iYW5uZXI.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvdW1xRFMyaUN5eGh3ZEtrUXFhYndRNS9zYW5kYm94LzVPWUkyODFtY1hmMm5hUVlNeFo4Yk4taW1nLTFfMTc3MTQ2OTk5MDAwMF9uYTFmbl9hR1Z5YnkxaVlXNXVaWEkucG5nP3gtb3NzLXByb2Nlc3M9aW1hZ2UvcmVzaXplLHdfMTkyMCxoXzE5MjAvZm9ybWF0LHdlYnAvcXVhbGl0eSxxXzgwIiwiQ29uZGl0aW9uIjp7IkRhdGVMZXNzVGhhbiI6eyJBV1M6RXBvY2hUaW1lIjoxNzk4NzYxNjAwfX19XX0_&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=Gk6-RcKA810q1mJj28u~YoJ5-RP4U1Lec3zElayno~iytpDKUX5LnCM~JW7yMDqF10WqXKJgZ39O8CPphID5LS3h42fyLEin20mcZvyuVqn-UnPHVSe5uKXGQcOf2a~bTVgZG5w3yfv34aJedVt5PGGEP7H~JwuW4752amkXtCgszaHsnDNMnWY9xzFU7N3qkY0LISQbeGCB~rmqaHiBz~0tV5NCbZfkYmEO61qJPHbMJtklgVyti~cKHIE6NZm-0YeUOsDnH~KKRxWw8-aDtQJP51leg8hOTk-pxUqbL8aWLnpHDEwJpLPlzJiIebRMLtkzo8jcKkng93aIOsIB1Q__';

const STORE_IMAGE = 'https://private-us-east-1.manuscdn.com/sessionFile/umqDS2iCyxhwdKkQqabwQ5/sandbox/5OYI281mcXf2naQYMxZ8bN-img-3_1771469995000_na1fn_c3RvcmUtYmFubmVy.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvdW1xRFMyaUN5eGh3ZEtrUXFhYndRNS9zYW5kYm94LzVPWUkyODFtY1hmMm5hUVlNeFo4Yk4taW1nLTNfMTc3MTQ2OTk5NTAwMF9uYTFmbl9jM1J2Y21VdFltRnVibVZ5LnBuZz94LW9zcy1wcm9jZXNzPWltYWdlL3Jlc2l6ZSx3XzE5MjAsaF8xOTIwL2Zvcm1hdCx3ZWJwL3F1YWxpdHkscV84MCIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTc5ODc2MTYwMH19fV19&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=S6eW5vgVm6XszGBI~5NJLohyz1gX2utvIhf5xyaFfjZvUuZExvd8CLx0tJVpjHLF7Q1tJp0wjt~GQ49qIXhAgcEXp3LZtjSUkgdkfR0qoCnjkuhTT-mmw8pHSJm-ySJMVjSfZmWoazcNSMA3K~Ewpsb1Fvi~gBT~isRfg2fkElPpBALw1UmvyX4o-vfbw18vlBp-TRVokhS10GUSy-NL6I6Au0MQcnHCwRNa5hUpEeDN9aOlbPfIbh6LpN8f~OKUAMjE6aAJepBfbK8LoNCctsecUKk4aHsooodJ6nU5oudE8Z0PPw~TlPpnXBnkBwPYEjfZX2dRsaXlDetbd2bpFQ__';

const EVENT_IMAGE = 'https://private-us-east-1.manuscdn.com/sessionFile/umqDS2iCyxhwdKkQqabwQ5/sandbox/5OYI281mcXf2naQYMxZ8bN-img-4_1771469993000_na1fn_ZXZlbnQtYmFubmVy.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvdW1xRFMyaUN5eGh3ZEtrUXFhYndRNS9zYW5kYm94LzVPWUkyODFtY1hmMm5hUVlNeFo4Yk4taW1nLTRfMTc3MTQ2OTk5MzAwMF9uYTFmbl9aWFpsYm5RdFltRnVibVZ5LnBuZz94LW9zcy1wcm9jZXNzPWltYWdlL3Jlc2l6ZSx3XzE5MjAsaF8xOTIwL2Zvcm1hdCx3ZWJwL3F1YWxpdHkscV84MCIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTc5ODc2MTYwMH19fV19&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=SpS9~fyVvbYsm2qctqJZV9eUrlIfhyCabWJgO-3X5SXV2pHfoLaIwtRR7ue8UIvhE3Yng8ezsBmKmhnHeDqN0FT-1aftlegleiZ6X8~5TtlKRrpO5wjQmWXVdO--NP31HCS0i55-KKwDDcNu~XzhMXd1lgbpZ9CRTP5eHveHhlJlsdAVoePEwGYZDhXZoSAe7TF1VEVQ16GXCSk1k63Poa0dON-KDYYNzP1NTW7kXD-aHpMalMS7WTrQbeqDv3lr3Dynh~jEekjHzTnuRpERwFfcMZEaBQ213--VePnE6oNHUb~pnkMQdc7myD2YF~EA~OkcBxEoLNJXBN~HtICNzw__';

const stats = [
  { label: '등록 아티스트', value: '1,240+', icon: <Mic2 /> },
  { label: '활성 팬덤', value: '58만+', icon: <Users /> },
  { label: '굿즈 상품', value: '12,000+', icon: <ShoppingBag /> },
  { label: '이벤트', value: '3,400+', icon: <Calendar /> }];


function Mic2({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 8-9.04 9.06a2.82 2.82 0 1 0 3.98 3.98L16 12" />
      <circle cx="17" cy="7" r="5" />
    </svg>);

}

export default function Home() {
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Navigation */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4"
        style={{
          background: 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(255,200,210,0.3)'
        }}>

        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center shadow-sm">
            <Heart size={16} className="text-white" fill="white" />
          </div>
          <span className="font-bold text-xl text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
            FanVerse
          </span>
        </div>

        <div className="hidden md:flex items-center gap-6">
          {['아티스트', '굿즈샵', '이벤트', '커뮤니티'].map((item) =>
            <a key={item} href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              {item}
            </a>
          )}
        </div>

        <div className="flex items-center gap-3">
          <Link href="/login">
            <button className="px-4 py-2 text-sm font-semibold text-rose-600 hover:text-rose-700 transition-colors">
              로그인
            </button>
          </Link>
          <Link href="/user">
            <button className="px-4 py-2 text-sm font-semibold text-white rounded-xl bg-gray-600 hover:bg-gray-700 transition-colors shadow-sm">
              게스트 둘러보기
            </button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-16">
        {/* Background image */}
        <div className="absolute inset-0 overflow-hidden">
          <img
            src={HERO_IMAGE}
            alt="FanVerse Hero"
            className="w-full h-full object-cover" />

          <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/60 to-white/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-transparent to-transparent" />
        </div>

        {/* Floating blobs */}
        <div
          className="absolute top-20 left-10 w-72 h-72 rounded-full blob-animate opacity-20 pointer-events-none"
          style={{ background: 'radial-gradient(circle, oklch(0.85 0.12 10), transparent)' }} />

        <div
          className="absolute bottom-20 right-20 w-96 h-96 rounded-full blob-animate-delay opacity-15 pointer-events-none"
          style={{ background: 'radial-gradient(circle, oklch(0.82 0.10 290), transparent)' }} />


        <div className="relative container mx-auto px-6 py-20">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-100 text-rose-600 text-sm font-semibold mb-6 fade-in-up">
              <Sparkles size={14} />
              K-POP 팬덤 플랫폼 #1
            </div>

            <h1
              className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6 fade-in-up"
              style={{ fontFamily: "'Playfair Display', serif", animationDelay: '0.1s' }}>

              <span className="text-foreground">아티스트와</span>
              <br />
              <span className="gradient-text">팬이 만나는</span>
              <br />
              <span className="text-foreground">특별한 공간</span>
            </h1>

            <p className="text-lg text-muted-foreground leading-relaxed mb-8 fade-in-up" style={{ animationDelay: '0.2s' }}>
              좋아하는 아티스트와 더 가까워지세요. 굿즈 구매부터 팬미팅 예매,
              AI 챗봇까지 — 팬덤 생활의 모든 것을 한 곳에서.
            </p>

            <div className="flex flex-wrap gap-3 fade-in-up" style={{ animationDelay: '0.3s' }}>
              <Link href="/login">
                <button className="flex items-center gap-2 px-6 py-3 text-base font-semibold text-white rounded-2xl btn-primary-gradient shadow-md">
                  팬으로 시작하기
                  <ArrowRight size={18} />
                </button>
              </Link>
              <Link href="/user">
                <button className="flex items-center gap-2 px-6 py-3 text-base font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-2xl transition-colors shadow-sm">
                  게스트로 둘러보기
                  <ArrowRight size={18} />
                </button>
              </Link>
              <Link href="/artist">
                <button className="flex items-center gap-2 px-6 py-3 text-base font-semibold text-violet-600 bg-violet-50 hover:bg-violet-100 rounded-2xl transition-colors">
                  아티스트 모드
                  <ArrowRight size={18} />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-white/80">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, i) =>
              <div key={i} className="text-center">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-rose-50 text-rose-500 mb-3">
                  {stat.icon}
                </div>
                <div className="text-2xl font-bold text-foreground" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Featured Artists */}
      <section className="py-16 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-30"
          style={{ background: 'linear-gradient(135deg, oklch(0.97 0.02 30), oklch(0.97 0.02 290))' }} />

        <div className="relative container mx-auto px-6">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-sm font-semibold text-rose-500 mb-1 uppercase tracking-wide">아티스트</p>
              <h2 className="text-3xl font-bold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
                인기 아티스트
              </h2>
            </div>
            <Link href="/user/artists">
              <button className="flex items-center gap-1 text-sm font-semibold text-rose-500 hover:text-rose-600 transition-colors">
                전체보기 <ArrowRight size={16} />
              </button>
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {artists.map((artist, i) =>
              <Link key={artist.id} href="/user/artists">
                <div
                  className="glass-card rounded-2xl p-4 text-center hover-lift cursor-pointer"
                  style={{ animationDelay: `${i * 0.05}s` }}>

                  <div className="relative mb-3">
                    <img
                      src={artist.image}
                      alt={artist.name}
                      className="w-16 h-16 rounded-full object-cover mx-auto ring-2 ring-white shadow-md" />

                    {artist.verified &&
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-rose-500 rounded-full flex items-center justify-center">
                        <Star size={10} className="text-white" fill="white" />
                      </div>
                    }
                  </div>
                  <p className="font-semibold text-sm text-foreground truncate">{artist.name}</p>
                  <p className="text-xs text-muted-foreground">{artist.group}</p>
                  <p className="text-xs text-rose-500 font-medium mt-1">{formatNumber(artist.followers)} 팬</p>
                </div>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-rose-500 mb-2 uppercase tracking-wide">서비스</p>
            <h2 className="text-3xl font-bold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
              FanVerse에서 할 수 있는 모든 것
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Store */}
            <Link href="/user/store">
              <div className="relative overflow-hidden rounded-3xl cursor-pointer group hover-lift soft-shadow">
                <img src={STORE_IMAGE} alt="굿즈샵" className="w-full h-48 object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <ShoppingBag size={16} className="text-white" />
                    </div>
                    <span className="text-white font-bold text-lg" style={{ fontFamily: "'Playfair Display', serif" }}>굿즈 샵</span>
                  </div>
                  <p className="text-white/80 text-sm">공식 굿즈부터 중고거래까지</p>
                </div>
              </div>
            </Link>

            {/* Events */}
            <Link href="/user/events">
              <div className="relative overflow-hidden rounded-3xl cursor-pointer group hover-lift soft-shadow">
                <img src={EVENT_IMAGE} alt="이벤트" className="w-full h-48 object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <Calendar size={16} className="text-white" />
                    </div>
                    <span className="text-white font-bold text-lg" style={{ fontFamily: "'Playfair Display', serif" }}>이벤트</span>
                  </div>
                  <p className="text-white/80 text-sm">팬미팅, 팬사인회, 팬파티</p>
                </div>
              </div>
            </Link>

            {/* Chat */}
            <Link href="/user/chat">
              <div
                className="relative overflow-hidden rounded-3xl cursor-pointer group hover-lift soft-shadow h-48 flex flex-col justify-end p-5"
                style={{ background: 'linear-gradient(135deg, oklch(0.75 0.15 290), oklch(0.65 0.20 10))' }}>

                <div
                  className="absolute top-4 right-4 w-16 h-16 rounded-full opacity-20"
                  style={{ background: 'white' }} />

                <div
                  className="absolute top-8 right-8 w-8 h-8 rounded-full opacity-30"
                  style={{ background: 'white' }} />

                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <MessageCircle size={16} className="text-white" />
                  </div>
                  <span className="text-white font-bold text-lg" style={{ fontFamily: "'Playfair Display', serif" }}>채팅</span>
                </div>
                <p className="text-white/80 text-sm">아티스트 AI 챗봇 & 팬 채팅</p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="py-16" style={{ background: 'linear-gradient(135deg, oklch(0.97 0.02 30), oklch(0.97 0.02 290))' }}>
        <div className="container mx-auto px-6">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-sm font-semibold text-rose-500 mb-1 uppercase tracking-wide">이벤트</p>
              <h2 className="text-3xl font-bold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
                다가오는 행사
              </h2>
            </div>
            <Link href="/user/events">
              <button className="flex items-center gap-1 text-sm font-semibold text-rose-500 hover:text-rose-600 transition-colors">
                전체보기 <ArrowRight size={16} />
              </button>
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {events.map((event) =>
              <Link key={event.id} href="/user/events">
                <div className="glass-card rounded-2xl overflow-hidden hover-lift cursor-pointer">
                  <div className="relative">
                    <img src={event.image} alt={event.title} className="w-full h-36 object-cover" />
                    <div className="absolute top-2 left-2">
                      <span className="px-2 py-1 rounded-lg text-xs font-semibold badge-rose">
                        {eventTypeLabel[event.type]}
                      </span>
                    </div>
                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1">
                      <span className="text-xs font-bold text-rose-600">{event.remaining}석 남음</span>
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="font-semibold text-sm text-foreground line-clamp-2 mb-1">{event.title}</p>
                    <p className="text-xs text-muted-foreground">{event.date} · {event.venue}</p>
                    <p className="text-sm font-bold text-rose-600 mt-2">{event.price.toLocaleString()}원</p>
                  </div>
                </div>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={HERO_IMAGE} alt="" className="w-full h-full object-cover opacity-30" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, oklch(0.60 0.20 10)/90%, oklch(0.55 0.18 290)/90%)' }} />
        </div>
        <div className="relative container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-white mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
            지금 바로 시작하세요
          </h2>
          <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
            좋아하는 아티스트의 팬덤에 가입하고 특별한 경험을 누려보세요
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/login">
              <button className="px-8 py-3.5 bg-white text-rose-600 font-bold rounded-2xl hover:bg-rose-50 transition-colors shadow-lg">
                팬으로 가입하기
              </button>
            </Link>
            <Link href="/user">
              <button className="px-8 py-3.5 bg-transparent border border-white text-white font-bold rounded-2xl hover:bg-white/10 transition-colors shadow-sm">
                게스트 모드로 진행
              </button>
            </Link>
            <Link href="/artist">
              <button className="px-8 py-3.5 bg-white/20 text-white font-bold rounded-2xl hover:bg-white/30 transition-colors border border-white/40">
                아티스트로 가입하기
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 bg-white border-t border-rose-100">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center">
                <Heart size={14} className="text-white" fill="white" />
              </div>
              <span className="font-bold text-lg" style={{ fontFamily: "'Playfair Display', serif" }}>FanVerse</span>
            </div>
            <div className="flex items-center gap-6">
              {['이용약관', '개인정보처리방침', '고객센터'].map((item) =>
                <a key={item} href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  {item}
                </a>
              )}
            </div>
            <p className="text-sm text-muted-foreground">© 2026 FanVerse. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>);

}