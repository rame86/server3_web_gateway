/**
 * Lumina - Admin Dashboard
 * Soft Bloom Design: Platform overview, key metrics, recent activities
 * Web-style design with enhanced visual hierarchy
 */

import Layout from '@/components/Layout';
import { Users, ShoppingBag, Calendar, TrendingUp, AlertCircle, Clock, BarChart3, ArrowUpRight, Activity, Zap } from 'lucide-react';
import { Link } from 'wouter';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const platformStats = [
{ label: '총 사용자', value: '584,291', change: '+12.3%', icon: <Users size={20} />, color: 'from-rose-400 to-pink-500', bg: 'bg-rose-50', text: 'text-rose-600' },
{ label: '등록 아티스트', value: '1,240', change: '+8.7%', icon: <MicIcon size={20} />, color: 'from-violet-400 to-purple-500', bg: 'bg-violet-50', text: 'text-violet-600' },
{ label: '이번 달 거래액', value: '₩2.4억', change: '+31.2%', icon: <ShoppingBag size={20} />, color: 'from-amber-400 to-orange-400', bg: 'bg-amber-50', text: 'text-amber-600' },
{ label: '이번 달 이벤트', value: '284', change: '+19.4%', icon: <Calendar size={20} />, color: 'from-teal-400 to-cyan-500', bg: 'bg-teal-50', text: 'text-teal-600' }];


const monthlyUsers = [
{ month: '9월', users: 420000, revenue: 180000000 },
{ month: '10월', users: 456000, revenue: 195000000 },
{ month: '11월', users: 489000, revenue: 210000000 },
{ month: '12월', users: 521000, revenue: 248000000 },
{ month: '1월', users: 548000, revenue: 231000000 },
{ month: '2월', users: 584000, revenue: 240000000 }];


const monthlyRevenue = [
{ month: '9월', value: 180 },
{ month: '10월', value: 195 },
{ month: '11월', value: 210 },
{ month: '12월', value: 248 },
{ month: '1월', value: 231 },
{ month: '2월', value: 240 }];


const pendingItems = [
{ type: 'goods', label: '굿즈 승인 대기', count: 5, href: '/admin/store', color: 'text-amber-600 bg-amber-50', urgency: 'high' },
{ type: 'booking', label: '예매 승인 대기', count: 3, href: '/admin/booking', color: 'text-violet-600 bg-violet-50', urgency: 'medium' },
{ type: 'artist', label: '아티스트 신청', count: 8, href: '/admin/artists', color: 'text-rose-600 bg-rose-50', urgency: 'low' },
{ type: 'report', label: '신고 접수', count: 2, href: '/admin/community', color: 'text-red-600 bg-red-50', urgency: 'high' }];


const recentActivities = [
{ id: 1, type: 'user', text: '신규 사용자 가입 (별빛팬)', time: '2분 전', icon: <Users size={16} />, color: 'bg-rose-50 text-rose-600' },
{ id: 2, type: 'goods', text: 'NOVA 공식 굿즈 승인 요청', time: '15분 전', icon: <ShoppingBag size={16} />, color: 'bg-amber-50 text-amber-600' },
{ id: 3, type: 'artist', text: '새 아티스트 등록 신청 (김민준)', time: '32분 전', icon: <MicIcon size={16} />, color: 'bg-violet-50 text-violet-600' },
{ id: 4, type: 'booking', text: '팬미팅 예매 승인 요청', time: '1시간 전', icon: <Calendar size={16} />, color: 'bg-teal-50 text-teal-600' },
{ id: 5, type: 'report', text: '게시글 신고 접수', time: '2시간 전', icon: <AlertCircle size={16} />, color: 'bg-red-50 text-red-600' }];


function MicIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 8-9.04 9.06a2.82 2.82 0 1 0 3.98 3.98L16 12" />
      <circle cx="17" cy="7" r="5" />
    </svg>);

}

export default function AdminDashboard() {
  return (
    <Layout role="admin">
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-amber-500 via-orange-400 to-rose-400 text-white py-12 px-6 rounded-b-3xl shadow-lg">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-3 mb-3">
              <BarChart3 size={28} />
              <span className="text-amber-100 text-sm font-semibold">관리자 대시보드</span>
            </div>
            <h1 className="text-4xl font-bold mb-2">Lumina 대시보드</h1>
            <p className="text-amber-50 text-lg">플랫폼 전체 현황을 한눈에 확인하세요</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-12">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {platformStats.map((stat, idx) =>
            <div key={idx} className="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-gray-200">
                <div className="flex items-start justify-between mb-4">
                  <div className={`${stat.bg} p-3 rounded-xl group-hover:scale-110 transition-transform`}>
                    <div className={stat.text}>{stat.icon}</div>
                  </div>
                  <div className="flex items-center gap-1 text-green-600 text-sm font-semibold">
                    <ArrowUpRight size={14} />
                    {stat.change}
                  </div>
                </div>
                <p className="text-gray-600 text-sm font-medium mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
            )}
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
            {/* User Growth Chart */}
            <div className="lg:col-span-2 bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">월별 사용자 성장</h2>
                  <p className="text-gray-500 text-sm mt-1">최근 6개월 사용자 증가 추이</p>
                </div>
                <div className="bg-rose-50 p-3 rounded-xl text-rose-600">
                  <TrendingUp size={20} />
                </div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={monthlyUsers}>
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f472b6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f472b6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                    formatter={(value) => `${(value / 1000).toFixed(0)}K`} />
                  
                  <Area type="monotone" dataKey="users" stroke="#f472b6" fillOpacity={1} fill="url(#colorUsers)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Revenue Chart */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">월별 거래액</h2>
                  <p className="text-gray-500 text-sm mt-1">억 단위</p>
                </div>
                <div className="bg-amber-50 p-3 rounded-xl text-amber-600">
                  <ShoppingBag size={20} />
                </div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyRevenue}>
                  <XAxis dataKey="month" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                    formatter={(value) => `₩${value}억`} />
                  
                  <Bar dataKey="value" fill="#fb923c" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pending Items & Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Pending Items */}
            <div className="lg:col-span-2 bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">처리 대기 항목</h2>
                  <p className="text-gray-500 text-sm mt-1">즉시 처리가 필요한 항목들</p>
                </div>
                <div className="bg-red-50 p-3 rounded-xl text-red-600">
                  <AlertCircle size={20} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {pendingItems.map((item, idx) =>
                <Link key={idx} href={item.href}>
                    <a className={`${item.color} p-6 rounded-xl hover:shadow-md transition-all duration-300 cursor-pointer group`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold">{item.label}</span>
                        {item.urgency === 'high' && <Zap size={14} className="text-red-500" />}
                      </div>
                      <p className="text-3xl font-bold">{item.count}</p>
                      <p className="text-xs opacity-75 mt-2 group-hover:underline">상세보기 →</p>
                    </a>
                  </Link>
                )}
              </div>
            </div>

            {/* Recent Activities */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">최근 활동</h2>
                  <p className="text-gray-500 text-sm mt-1">실시간 플랫폼 활동</p>
                </div>
                <div className="bg-violet-50 p-3 rounded-xl text-violet-600">
                  <Activity size={20} />
                </div>
              </div>
              <div className="space-y-4">
                {recentActivities.map((activity, idx) =>
                <div key={idx} className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                    <div className={`${activity.color} p-2 rounded-lg flex-shrink-0`}>
                      {activity.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 line-clamp-2">{activity.text}</p>
                      <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                        <Clock size={12} />
                        {activity.time}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-12 bg-gradient-to-r from-violet-100 to-purple-100 rounded-2xl p-8 border border-violet-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">빠른 관리</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link href="/admin/users">
                <a className="bg-white hover:bg-violet-50 rounded-xl p-4 transition-colors duration-300 border border-violet-200 hover:border-violet-400 group">
                  <div className="flex items-center gap-3 mb-2">
                    <Users size={20} className="text-violet-600" />
                    <span className="font-semibold text-gray-900">사용자 관리</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">584,291명</p>
                  <p className="text-xs text-gray-500 mt-2 group-hover:text-violet-600">관리하기 →</p>
                </a>
              </Link>
              <Link href="/admin/artists">
                <a className="bg-white hover:bg-rose-50 rounded-xl p-4 transition-colors duration-300 border border-rose-200 hover:border-rose-400 group">
                  <div className="flex items-center gap-3 mb-2">
                    <MicIcon size={20} />
                    <span className="font-semibold text-gray-900 text-rose-600">아티스트 관리</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">1,240명</p>
                  <p className="text-xs text-gray-500 mt-2 group-hover:text-rose-600">관리하기 →</p>
                </a>
              </Link>
              <Link href="/admin/store">
                <a className="bg-white hover:bg-amber-50 rounded-xl p-4 transition-colors duration-300 border border-amber-200 hover:border-amber-400 group">
                  <div className="flex items-center gap-3 mb-2">
                    <ShoppingBag size={20} className="text-amber-600" />
                    <span className="font-semibold text-gray-900">굿즈 승인</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">5건 대기</p>
                  <p className="text-xs text-gray-500 mt-2 group-hover:text-amber-600">승인하기 →</p>
                </a>
              </Link>
              <Link href="/admin/settlement">
                <a className="bg-white hover:bg-teal-50 rounded-xl p-4 transition-colors duration-300 border border-teal-200 hover:border-teal-400 group">
                  <div className="flex items-center gap-3 mb-2">
                    <TrendingUp size={20} className="text-teal-600" />
                    <span className="font-semibold text-gray-900">결제 정산</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">이번 달</p>
                  <p className="text-xs text-gray-500 mt-2 group-hover:text-teal-600">정산하기 →</p>
                </a>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>);

}