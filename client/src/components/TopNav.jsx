/*
 * Lumina - 상단 네비게이션 컴포넌트
 * 역할: 사용자 역할(User/Artist/Admin)에 따른 맞춤형 메뉴 및 반응형 네비게이션 제공
 * 디자인: Soft Bloom (글래스모피즘 기반의 반투명 상단 바)
 */

import { useLocation, Link } from 'wouter';
import { Search, Bell, CheckSquare } from 'lucide-react'; // 루시드 아이콘: 검색, 알림, 체크박스
import { useState } from 'react';

// --- 역할별 카테고리 메뉴 정의 ---

// 일반 팬(User)용 카테고리
const userCategories = [
  { label: '홈', href: '/user' },
  { label: '아티스트', href: '/user/artists' },
  { label: '굿즈샵', href: '/user/store' },
  { label: '이벤트', href: '/user/booking' },
  { label: '채팅', href: '/user/chat' },
  { label: '커뮤니티', href: '/user/community' },
  { label: '포인트', href: '/user/wallet' }
];

// 아티스트용 카테고리
const artistCategories = [
  { label: '대시보드', href: '/artist' },
  { label: '팬덤', href: '/artist/fandom' },
  { label: '굿즈', href: '/artist/store' },
  { label: '채팅', href: '/artist/chat' },
  { label: '이벤트', href: '/artist/events' },
  { label: '커뮤니티', href: '/artist/community' },
  { label: '정산', href: '/artist/settlement' }
];

// 관리자용 카테고리
const adminCategories = [
  { label: '대시보드', href: '/admin' },
  { label: '사용자', href: '/admin/users' },
  { label: '아티스트', href: '/admin/artists' },
  { label: '굿즈', href: '/admin/store' },
  { label: '예매', href: '/admin/booking' },
  { label: '게시판', href: '/admin/community' },
  { label: '정산', href: '/admin/settlement' },
  { label: '환불 관리', icon: <CheckSquare size={18} />, href: '/admin/refunds', badge: 12 }
];

// --- 역할별 테마 및 스타일 설정 ---
const roleConfig = {
  user: {
    categories: userCategories,
    color: 'from-rose-400 to-pink-500',
    accent: 'text-rose-500',
    activeClass: 'text-rose-600 border-b-2 border-rose-500', // 활성화 시 스타일
    hoverClass: 'hover:text-rose-600 hover:bg-rose-50/50'     // 호버 시 스타일
  },
  artist: {
    categories: artistCategories,
    color: 'from-violet-400 to-purple-500',
    accent: 'text-violet-500',
    activeClass: 'text-violet-600 border-b-2 border-violet-500',
    hoverClass: 'hover:text-violet-600 hover:bg-violet-50/50'
  },
  admin: {
    categories: adminCategories,
    color: 'from-amber-400 to-orange-400',
    accent: 'text-amber-600',
    activeClass: 'text-amber-600 border-b-2 border-amber-500',
    hoverClass: 'hover:text-amber-600 hover:bg-amber-50/50'
  }
};

export default function TopNav({ role }) {
  const [location] = useLocation(); // 현재 경로 추적
  const [searchOpen, setSearchOpen] = useState(false); // 모바일 검색바 확장 상태

  // 🌟 [수정 포인트] 대문자로 들어와도 소문자로 변환하고, 없으면 'user'를 기본값으로!
  const currentRole = (role || 'user').toLowerCase();
  
  // 🌟 [수정 포인트] 혹시 모를 에러 방지를 위해 config가 없을 때 'user' 설정을 쓰도록 방어
  const config = roleConfig[currentRole] || roleConfig['user'];
  //const config = roleConfig[role]; // 현재 역할에 맞는 설정값

  // 현재 경로와 메뉴 링크가 일치하는지 확인 (서브 경로 포함)
  const isActive = (href) => {
    return location === href || location.startsWith(href + '/');
  };

  return (
    <div
      className="sticky top-0 z-40 border-b border-rose-100"
      style={{
        background: 'rgba(255,255,255,0.92)', // 반투명 배경
        backdropFilter: 'blur(12px)',         // 글래스모피즘 블러 효과
        WebkitBackdropFilter: 'blur(12px)'
      }}>

      <div className="container mx-auto px-4 lg:px-6">
        {/* --- [1] 데스크톱 메뉴 (lg 이상에서 노출) --- */}
        <div className="hidden lg:flex items-center justify-between h-14">
          {/* 서비스 로고 */}
          <Link href={role === 'user' ? '/user' : role === 'artist' ? '/artist' : '/admin'}>
            <div className="flex items-center gap-2 cursor-pointer flex-shrink-0">
              <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${config.color} flex items-center justify-center shadow-sm`}>
                <span className="text-white font-bold text-xs" style={{ fontFamily: "'Playfair Display', serif" }}>F</span>
              </div>
              <span className="font-bold text-sm text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
                Lumina
              </span>
            </div>
          </Link>

          {/* 중앙 가로 네비게이션 카테고리 */}
          <nav className="flex items-center gap-1 flex-1 ml-8">
            {config.categories.map((category) => (
              <Link key={category.href} href={category.href}>
                <div
                  className={`px-4 py-3.5 text-sm font-medium transition-all cursor-pointer border-b-2 border-transparent ${isActive(category.href) ?
                      config.activeClass :
                      `text-muted-foreground ${config.hoverClass}`
                    }`}>
                  {category.label}
                </div>
              </Link>
            ))}
          </nav>

          {/* 우측 액션: 검색창 및 알림 */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="relative hidden sm:block">
              <input
                type="text"
                placeholder="검색..."
                className="w-32 px-3 py-1.5 text-xs bg-rose-50 border border-rose-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300 transition-all" />
              <Search size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            </div>
            <button className="relative p-2 rounded-lg hover:bg-rose-50 transition-colors">
              <Bell size={16} className="text-muted-foreground" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full" />
            </button>
          </div>
        </div>

        {/* --- [2] 모바일 메뉴 헤더 (lg 미만에서 노출) --- */}
        <div className="lg:hidden flex items-center justify-between h-12">
          {/* 로고 (모바일용 작은 사이즈) */}
          <Link href={role === 'user' ? '/user' : role === 'artist' ? '/artist' : '/admin'}>
            <div className="flex items-center gap-1.5 cursor-pointer">
              <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${config.color} flex items-center justify-center shadow-sm`}>
                <span className="text-white font-bold text-xs" style={{ fontFamily: "'Playfair Display', serif" }}>F</span>
              </div>
              <span className="font-bold text-xs text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
                Lumina
              </span>
            </div>
          </Link>

          {/* 모바일 우측 버튼: 검색 토글 및 알림 */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-1.5 rounded-lg hover:bg-rose-50 transition-colors">
              <Search size={14} className="text-muted-foreground" />
            </button>
            <button className="relative p-1.5 rounded-lg hover:bg-rose-50 transition-colors">
              <Bell size={14} className="text-muted-foreground" />
              <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-rose-500 rounded-full" />
            </button>
          </div>
        </div>

        {/* --- [3] 모바일 하단 가로 스크롤 카테고리 --- */}
        <div className="lg:hidden overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
          <div className="flex gap-2 min-w-min">
            {config.categories.map((category) => (
              <Link key={category.href} href={category.href}>
                <div
                  className={`px-3 py-1.5 text-xs font-medium whitespace-nowrap rounded-full transition-all cursor-pointer ${isActive(category.href) ?
                      `bg-gradient-to-r ${config.color} text-white shadow-sm` :
                      'bg-rose-50 text-muted-foreground'
                    }`}>
                  {category.label}
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* 모바일 전용 검색바 확장 영역 */}
        {searchOpen && (
          <div className="lg:hidden pb-2">
            <input
              type="text"
              placeholder="검색..."
              autoFocus
              className="w-full px-3 py-2 text-xs bg-rose-50 border border-rose-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300" />
          </div>
        )}
      </div>
    </div>
  );
}