/*
 * Lumina - 레이아웃 컴포넌트
 * 디자인: Soft Bloom (글래스모피즘 효과 적용된 사이드바)
 * 역할: 권한(User, Artist, Admin)에 따른 차등 UI 및 네비게이션 제공
 */
import React, { useEffect, useState } from 'react';

import { Link, useLocation } from 'wouter';
import {
  Home, ShoppingBag, MessageCircle, Calendar, BookOpen, Music,
  Heart, Wallet, Map, Bell, Settings, LogOut, Menu,
  LayoutDashboard, Users, Package, CheckSquare, FileText,
  BarChart3, Star, Mic2, ChevronRight, Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import TopNav from './TopNav';
import { coreApi } from '@/lib/api';

// --- 네비게이션 항목 정의 (역할별) ---

// 일반 사용자용 메뉴
const userNavItems = [
  { label: '대시보드', icon: <Home size={18} />, href: '/user' },
  { label: '굿즈 샵', icon: <ShoppingBag size={18} />, href: '/user/store', badge: 'NEW' },
  { label: '채팅', icon: <MessageCircle size={18} />, href: '/user/chat', badge: 3 },
  { label: '예매', icon: <Calendar size={18} />, href: '/user/booking' },
  { label: '커뮤니티', icon: <BookOpen size={18} />, href: '/user/community' },
  { label: '아티스트', icon: <Star size={18} />, href: '/user/artists' },
  { label: '포인트 월렛', icon: <Wallet size={18} />, href: '/user/wallet' }
];

// 아티스트용 메뉴
const artistNavItems = [
  { label: '대시보드', icon: <LayoutDashboard size={18} />, href: '/artist' },
  { label: '팬덤 페이지', icon: <Heart size={18} />, href: '/artist/fandom' },
  { label: '굿즈 관리', icon: <Package size={18} />, href: '/artist/store' },
  { label: '팬 채팅', icon: <MessageCircle size={18} />, href: '/artist/chat', badge: 12 },
  { label: '예매 관리', icon: <Calendar size={18} />, href: '/artist/booking' },
  { label: '커뮤니티', icon: <BookOpen size={18} />, href: '/artist/community' },
  { label: '후원 내역', icon: <Sparkles size={18} />, href: '/artist/donations' },
  { label: '정산 내역', icon: <BarChart3 size={18} />, href: '/artist/settlement' }
];

// 관리자용 메뉴
const adminNavItems = [
  { label: '대시보드', icon: <LayoutDashboard size={18} />, href: '/admin' },
  { label: '사용자 관리', icon: <Users size={18} />, href: '/admin/users' },
  { label: '아티스트 관리', icon: <Mic2 size={18} />, href: '/admin/artists' },
  { label: '굿즈 승인', icon: <Package size={18} />, href: '/admin/store', badge: 5 },
  { label: '예매 승인', icon: <CheckSquare size={18} />, href: '/admin/booking', badge: 3 },
  { label: '게시판 관리', icon: <FileText size={18} />, href: '/admin/community' },
  { label: '결제 정산', icon: <BarChart3 size={18} />, href: '/admin/settlement' },
  { label: '환불 관리', icon: <CheckSquare size={18} />, href: '/admin/refunds', badge: 12 }
];

// --- 역할별 테마 및 기본 정보 설정 ---
const roleConfig = {
  user: {
    label: '팬 계정',
    color: 'from-rose-400 to-pink-500',
    bgColor: 'bg-rose-50',
    textColor: 'text-rose-600',
    navItems: userNavItems,
    userName: '임시데이터',
    userImage: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop'
  },
  artist: {
    label: '아티스트 계정',
    color: 'from-violet-400 to-purple-500',
    bgColor: 'bg-violet-50',
    textColor: 'text-violet-600',
    navItems: artistNavItems,
    userName: '임시데이터',
    userImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop'
  },
  admin: {
    label: '관리자',
    color: 'from-amber-400 to-orange-500',
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-600',
    navItems: adminNavItems,
    userName: '관리자',
    userImage: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop'
  }
};

export default function Layout({ children, role }) {
  const [location, setLocation] = useLocation(); // 현재 경로 추적 및 이동
  const [sidebarOpen, setSidebarOpen] = useState(false); // 모바일 사이드바 개폐 상태
  const currentRole = (role || 'user').toLowerCase();

  // 해결 포인트 2: 만약 잘못된 role이 들어와도 터지지 않게 'user' 정보를 기본으로 가져옴
  const config = roleConfig[currentRole] || roleConfig['user'];

  // 사용자 이름 및 이미지 상태 관리 (로컬스토리지 우선)\
  // 1. 상태 정의: 로컬스토리지에 값이 있으면 먼저 사용
  const userName = localStorage.getItem('userName') || config?.userName || '사용자';
  const [userImage, setUserImage] = useState(localStorage.getItem('userImage') || null);

  // 2. API 호출: 컴포넌트 로드 시 서버에서 최신 이미지 가져오기
  useEffect(() => {
    const fetchMyImage = async () => {
      try {
        const res = await coreApi.get('/member/my-info'); // 내 정보 조회 API
        if (res.data && res.data.profileImageUrl) {
          setUserImage(res.data.profileImageUrl); // 상태 업데이트
          localStorage.setItem('userImage', res.data.profileImageUrl); // 로컬스토리지 갱신
        }
      } catch (e) {
        console.error('Failed to fetch user info for layout image', e);
      }
    };
    fetchMyImage();
  }, []);

  // 로그아웃 처리 (서버 세션 파기 및 클라이언트 데이터 초기화)
  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await coreApi.post('/member/logout');
        console.log("백엔드 Redis 세션 삭제 성공");
      }
    } catch (error) {
      console.error("백엔드 로그아웃 통신 실패:", error);
    }

    localStorage.clear(); // 로컬 스토리지 전체 삭제
    toast.success('로그아웃 되었습니다.');
    window.location.replace('/'); // 메인으로 강제 이동 및 새로고침
  };

  return (
    <>
      <div className="min-h-screen bg-background flex">
        {/* 모바일 사이드바 배경 (오버레이) */}
        {sidebarOpen &&
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)} />
        }

        {/* 사이드바 메인 영역 */}
        <aside
          className={cn(
            'fixed top-0 left-0 h-full w-64 z-50 transition-transform duration-300 ease-out',
            'lg:translate-x-0 lg:static lg:z-auto', // 데스크톱 고정, 모바일 슬라이드
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          )}
          style={{
            background: 'rgba(255,255,255,0.92)', // 글래스모피즘 반투명
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderRight: '1px solid rgba(255,200,210,0.3)',
            boxShadow: '4px 0 24px rgba(180,100,120,0.08)'
          }}>

          {/* 로고 영역 */}
          <div className="p-5 border-b border-rose-100">
            <Link href={role === 'user' ? '/user' : role === 'artist' ? '/artist' : '/admin'} className="flex items-center gap-2.5">
              <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${config.color} flex items-center justify-center shadow-sm`}>
                <Heart size={16} className="text-white" fill="white" />
              </div>
              <div>
                <span className="font-bold text-lg text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Lumina
                </span>
                <div className={`text-xs ${config.textColor} font-medium`}>{config.label}</div>
              </div>
            </Link>
          </div>

          {/* 사용자 프로필 영역 (알림 버튼 포함) */}
          <div className="p-4 border-b border-rose-100">
            <div className={`flex items-center gap-3 p-3 rounded-xl ${config.bgColor}`}>
              <img
                src={userImage || config.userImage}
                alt={userName}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-sm" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-foreground truncate">{userName}</p>
              </div>
              <button
                onClick={() => toast.info('알림 기능 준비 중입니다')}
                className="p-1.5 rounded-lg hover:bg-white/60 transition-colors relative">
                <Bell size={15} className="text-muted-foreground" />
                <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-rose-500 rounded-full"></span>
              </button>
            </div>
          </div>

          {/* 메인 네비게이션 메뉴 리스트 */}
          <nav className="p-3 flex-1 overflow-y-auto">
            <div className="space-y-0.5">
              {config.navItems.map((item) => {
                // 현재 경로와 메뉴 링크 일치 여부 확인 (활성화 표시용)
                const isActive = location === item.href || (item.href !== '/' && location.startsWith(item.href));
                return (
                  <Link key={item.href} href={item.href}>
                    <div
                      className={cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group',
                        isActive ?
                          'sidebar-item-active' : // 활성화 스타일
                          'text-muted-foreground hover:bg-rose-50/80 hover:text-foreground'
                      )}
                      onClick={() => setSidebarOpen(false)}>
                      <span className={cn('flex-shrink-0', isActive ? 'text-rose-500' : 'group-hover:text-rose-400')}>
                        {item.icon}
                      </span>
                      <span className="text-sm font-medium flex-1">{item.label}</span>
                      {/* 뱃지(알림 숫자 등) 노출 로직 */}
                      {item.badge !== undefined &&
                        <span className={cn(
                          'text-xs px-1.5 py-0.5 rounded-full font-semibold',
                          typeof item.badge === 'number' ?
                            'bg-rose-500 text-white min-w-[20px] text-center' :
                            'badge-rose'
                        )}>
                          {item.badge}
                        </span>
                      }
                      {isActive && <ChevronRight size={14} className="text-rose-400" />}
                    </div>
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* 사이드바 하단 (설정/로그아웃) */}
          <div className="p-3 border-t border-rose-100">
            {/* 🌟 핵심 수정: role이 admin이 아닐 때만 설정 버튼을 렌더링 */}
            {currentRole !== 'admin' && (
              <button
                onClick={() => setLocation(`/${role}/profile`)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl w-full text-muted-foreground hover:bg-rose-50/80 hover:text-foreground transition-all">
                <Settings size={18} />
                <span className="text-sm font-medium">설정</span>
              </button>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl w-full text-muted-foreground hover:bg-rose-50/80 hover:text-foreground transition-all">
              <LogOut size={18} />
              <span className="text-sm font-medium">로그아웃</span>
            </button>
          </div>
        </aside>

        {/* 메인 콘텐츠 영역 */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* 상단 공통 네비바 */}
          <TopNav role={role} />

          {/* 모바일 전용 상단 헤더 및 메뉴 버튼 */}
          <div className="lg:hidden sticky top-14 z-30 flex items-center justify-between px-4 py-2 bg-white/80 backdrop-blur-sm border-b border-rose-100">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-xl hover:bg-rose-50 transition-colors">
              <Menu size={20} className="text-foreground" />
            </button>
            <span className="text-xs text-muted-foreground font-medium">{config.label} 포털</span>
            <div className="w-8" />
          </div>

          {/* 실제 페이지 내용이 렌더링되는 곳 */}
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </>
  );
}