/*
 * Lumina - Top Navigation Component
 * Soft Bloom Design: Horizontal menu bar with role-based categories
 */

import { useLocation, Link } from 'wouter';
import { Search, Bell } from 'lucide-react';
import { useState } from 'react';








const userCategories = [
{ label: '홈', href: '/user' },
{ label: '아티스트', href: '/user/artists' },
{ label: '굿즈샵', href: '/user/store' },
{ label: '이벤트', href: '/user/booking' },
{ label: '채팅', href: '/user/chat' },
{ label: '커뮤니티', href: '/user/community' },
{ label: '포인트', href: '/user/wallet' }];


const artistCategories = [
{ label: '대시보드', href: '/artist' },
{ label: '팬덤', href: '/artist/fandom' },
{ label: '굿즈', href: '/artist/store' },
{ label: '채팅', href: '/artist/chat' },
{ label: '이벤트', href: '/artist/events' },
{ label: '커뮤니티', href: '/artist/community' },
{ label: '정산', href: '/artist/settlement' }];


const adminCategories = [
{ label: '대시보드', href: '/admin' },
{ label: '사용자', href: '/admin/users' },
{ label: '아티스트', href: '/admin/artists' },
{ label: '굿즈', href: '/admin/store' },
{ label: '예매', href: '/admin/booking' },
{ label: '게시판', href: '/admin/community' },
{ label: '정산', href: '/admin/settlement' }];






const roleConfig = {
  user: {
    categories: userCategories,
    color: 'from-rose-400 to-pink-500',
    accent: 'text-rose-500',
    activeClass: 'text-rose-600 border-b-2 border-rose-500',
    hoverClass: 'hover:text-rose-600 hover:bg-rose-50/50'
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
  const [location] = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);
  const config = roleConfig[role];

  const isActive = (href) => {
    return location === href || location.startsWith(href + '/');
  };

  return (
    <div
      className="sticky top-0 z-40 border-b border-rose-100"
      style={{
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)'
      }}>
      
      <div className="container mx-auto px-4 lg:px-6">
        {/* Desktop Menu */}
        <div className="hidden lg:flex items-center justify-between h-14">
          {/* Logo */}
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

          {/* Menu Categories */}
          <nav className="flex items-center gap-1 flex-1 ml-8">
            {config.categories.map((category) =>
            <Link key={category.href} href={category.href}>
                <div
                className={`px-4 py-3.5 text-sm font-medium transition-all cursor-pointer border-b-2 border-transparent ${
                isActive(category.href) ?
                config.activeClass :
                `text-muted-foreground ${config.hoverClass}`}`
                }>
                
                  {category.label}
                </div>
              </Link>
            )}
          </nav>

          {/* Right Actions */}
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

        {/* Mobile Menu */}
        <div className="lg:hidden flex items-center justify-between h-12">
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

        {/* Mobile Categories Scroll */}
        <div className="lg:hidden overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
          <div className="flex gap-2 min-w-min">
            {config.categories.map((category) =>
            <Link key={category.href} href={category.href}>
                <div
                className={`px-3 py-1.5 text-xs font-medium whitespace-nowrap rounded-full transition-all cursor-pointer ${
                isActive(category.href) ?
                `bg-gradient-to-r ${config.color} text-white shadow-sm` :
                'bg-rose-50 text-muted-foreground'}`
                }>
                
                  {category.label}
                </div>
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Search Bar */}
        {searchOpen &&
        <div className="lg:hidden pb-2">
            <input
            type="text"
            placeholder="검색..."
            autoFocus
            className="w-full px-3 py-2 text-xs bg-rose-50 border border-rose-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300" />
          
          </div>
        }
      </div>
    </div>);

}