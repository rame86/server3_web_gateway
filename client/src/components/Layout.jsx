/*
 * Lumina - Layout Component
 * Soft Bloom Design: Sidebar navigation with glass effect
 * Role-based: user / artist / admin
 */

import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import {
  Home, ShoppingBag, MessageCircle, Calendar, BookOpen, Music,
  Heart, Wallet, Map, Bell, Settings, LogOut, Menu,
  LayoutDashboard, Users, Package, CheckSquare, FileText,
  BarChart3, Star, Mic2, ChevronRight, Sparkles } from
'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import TopNav from './TopNav';











const userNavItems = [
{ label: '대시보드', icon: <Home size={18} />, href: '/user' },
{ label: '굿즈 샵', icon: <ShoppingBag size={18} />, href: '/user/store', badge: 'NEW' },
{ label: '채팅', icon: <MessageCircle size={18} />, href: '/user/chat', badge: 3 },
{ label: '예매', icon: <Calendar size={18} />, href: '/user/booking' },
{ label: '커뮤니티', icon: <BookOpen size={18} />, href: '/user/community' },
{ label: '이벤트', icon: <Music size={18} />, href: '/user/events' },
{ label: '아티스트', icon: <Star size={18} />, href: '/user/artists' },
{ label: '포인트 월렛', icon: <Wallet size={18} />, href: '/user/wallet' }];


const artistNavItems = [
{ label: '대시보드', icon: <LayoutDashboard size={18} />, href: '/artist' },
{ label: '팬덤 페이지', icon: <Heart size={18} />, href: '/artist/fandom' },
{ label: '굿즈 관리', icon: <Package size={18} />, href: '/artist/store' },
{ label: '팬 채팅', icon: <MessageCircle size={18} />, href: '/artist/chat', badge: 12 },
{ label: '예매 관리', icon: <Calendar size={18} />, href: '/artist/booking' },
{ label: '커뮤니티', icon: <BookOpen size={18} />, href: '/artist/community' },
{ label: '이벤트', icon: <Map size={18} />, href: '/artist/events' },
{ label: '후원 내역', icon: <Sparkles size={18} />, href: '/artist/donations' },
{ label: '정산 내역', icon: <BarChart3 size={18} />, href: '/artist/settlement' }];


const adminNavItems = [
{ label: '대시보드', icon: <LayoutDashboard size={18} />, href: '/admin' },
{ label: '사용자 관리', icon: <Users size={18} />, href: '/admin/users' },
{ label: '아티스트 관리', icon: <Mic2 size={18} />, href: '/admin/artists' },
{ label: '굿즈 승인', icon: <Package size={18} />, href: '/admin/store', badge: 5 },
{ label: '예매 승인', icon: <CheckSquare size={18} />, href: '/admin/booking', badge: 3 },
{ label: '게시판 관리', icon: <FileText size={18} />, href: '/admin/community' },
{ label: '결제 정산', icon: <BarChart3 size={18} />, href: '/admin/settlement' }];


const roleConfig = {
  user: {
    label: '팬 계정',
    color: 'from-rose-400 to-pink-500',
    bgColor: 'bg-rose-50',
    textColor: 'text-rose-600',
    navItems: userNavItems,
    userName: '별빛팬',
    userImage: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop'
  },
  artist: {
    label: '아티스트',
    color: 'from-violet-400 to-purple-500',
    bgColor: 'bg-violet-50',
    textColor: 'text-violet-600',
    navItems: artistNavItems,
    userName: '이하은',
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
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const config = roleConfig[role];

  // 로그아웃 로직 함수
  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('TOKEN'); // 저장된 토큰 꺼내기

      if (token) {
        await fetch('http://localhost/msa/core/member/logout', { // 백엔드 로그아웃 주소
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`, // 헤더에 토큰 담기 (중요!)
            'Content-Type': 'application/json'
          }
        });
        console.log("백엔드 Redis 세션 삭제 성공");
      }
    } catch (error) {
      console.error("백엔드 로그아웃 통신 실패:", error);
      // 서버가 죽었어도 일단 내 브라우저는 로그아웃시켜야 하니까 멈추지 않음
    }

    // 2. 브라우저(LocalStorage) 데이터 싹 지우기
    localStorage.clear(); 

    // 3. 알림 및 메인 이동
    toast.success('로그아웃 되었습니다.');
    window.location.replace('/')
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile overlay */}
      {sidebarOpen &&
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
        onClick={() => setSidebarOpen(false)} />

      }

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 h-full w-64 z-50 transition-transform duration-300 ease-out',
          'lg:translate-x-0 lg:static lg:z-auto',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        style={{
          background: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRight: '1px solid rgba(255,200,210,0.3)',
          boxShadow: '4px 0 24px rgba(180,100,120,0.08)'
        }}>
        
        {/* Logo */}
        <div className="p-5 border-b border-rose-100">
          <Link href="/" className="flex items-center gap-2.5">
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

        {/* User Profile */}
        <div className="p-4 border-b border-rose-100">
          <div className={`flex items-center gap-3 p-3 rounded-xl ${config.bgColor}`}>
            <img
              src={config.userImage}
              alt={config.userName}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-sm" />
            
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-foreground truncate">{config.userName}</p>
              <p className={`text-xs ${config.textColor} font-medium`}>{config.label}</p>
            </div>
            <button
              onClick={() => toast.info('알림 기능 준비 중입니다')}
              className="p-1.5 rounded-lg hover:bg-white/60 transition-colors relative">
              
              <Bell size={15} className="text-muted-foreground" />
              <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-rose-500 rounded-full"></span>
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-3 flex-1 overflow-y-auto">
          <div className="space-y-0.5">
            {config.navItems.map((item) => {
              const isActive = location === item.href || item.href !== '/' && location.startsWith(item.href);
              return (
                <Link key={item.href} href={item.href}>
                  <div
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group',
                      isActive ?
                      'sidebar-item-active' :
                      'text-muted-foreground hover:bg-rose-50/80 hover:text-foreground'
                    )}
                    onClick={() => setSidebarOpen(false)}>
                    
                    <span className={cn('flex-shrink-0', isActive ? 'text-rose-500' : 'group-hover:text-rose-400')}>
                      {item.icon}
                    </span>
                    <span className="text-sm font-medium flex-1">{item.label}</span>
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
                </Link>);

            })}
          </div>
        </nav>

        {/* Bottom actions */}
        <div className="p-3 border-t border-rose-100">
          <button
            onClick={() => toast.info('설정 기능 준비 중입니다')}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl w-full text-muted-foreground hover:bg-rose-50/80 hover:text-foreground transition-all">
            
            <Settings size={18} />
            <span className="text-sm font-medium">설정</span>
          </button>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl w-full text-muted-foreground hover:bg-rose-50/80 hover:text-foreground transition-all">
            <LogOut size={18} />
            <span className="text-sm font-medium">로그아웃</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navigation Bar */}
        <TopNav role={role} />

        {/* Mobile Menu Button */}
        <div className="lg:hidden sticky top-14 z-30 flex items-center justify-between px-4 py-2 bg-white/80 backdrop-blur-sm border-b border-rose-100">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-xl hover:bg-rose-50 transition-colors">
            
            <Menu size={20} className="text-foreground" />
          </button>
          <span className="text-xs text-muted-foreground font-medium">{config.label} 포털</span>
          <div className="w-8" />
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>);

}