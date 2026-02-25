/**
 * Lumina - Admin Users Management
 * Soft Bloom Design: User management with enhanced web-style UI
 */

import Layout from '@/components/Layout';
import { Users, Search, Download, Eye, Ban, MoreVertical, Filter, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

const mockUsers = [
{ id: 1, name: '별빛팬', email: 'starlight@example.com', joinDate: '2025-12-01', status: 'active', purchases: 8, points: 45200, avatar: '⭐' },
{ id: 2, name: '달빛소녀', email: 'moonlight@example.com', joinDate: '2025-11-15', status: 'active', purchases: 15, points: 120000, avatar: '🌙' },
{ id: 3, name: '하늘별', email: 'skystar@example.com', joinDate: '2026-01-10', status: 'suspended', purchases: 2, points: 5000, avatar: '☁️' },
{ id: 4, name: '노비팬클럽', email: 'nova@example.com', joinDate: '2025-10-20', status: 'active', purchases: 32, points: 280000, avatar: '💫' },
{ id: 5, name: '이하은팬', email: 'haen@example.com', joinDate: '2025-09-05', status: 'active', purchases: 2, points: 95000, avatar: '🌸' },
{ id: 6, name: '꽃잎팬', email: 'petal@example.com', joinDate: '2026-02-01', status: 'pending', purchases: 0, points: 1000, avatar: '🌺' }];


const statusColors = {
  active: { bg: 'bg-green-50', text: 'text-green-700', badge: 'bg-green-100 text-green-700' },
  suspended: { bg: 'bg-red-50', text: 'text-red-700', badge: 'bg-red-100 text-red-700' },
  pending: { bg: 'bg-yellow-50', text: 'text-yellow-700', badge: 'bg-yellow-100 text-yellow-700' }
};

const statusLabels = {
  active: '활성',
  suspended: '정지',
  pending: '대기'
};

export default function AdminUsers() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredUsers = mockUsers.filter((user) => {
    const matchesSearch = user.name.includes(searchTerm) || user.email.includes(searchTerm);
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleStatusToggle = (userId) => {
    toast.success('사용자 상태가 업데이트되었습니다.');
  };

  const handleExport = () => {
    toast.success('사용자 목록이 다운로드되었습니다.');
  };

  return (
    <Layout role="admin">
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-500 via-rose-400 to-pink-400 text-white py-12 px-6 rounded-b-3xl shadow-lg">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-3 mb-3">
              <Users size={28} />
              <span className="text-red-100 text-sm font-semibold">사용자 관리</span>
            </div>
            <h1 className="text-4xl font-bold mb-2">사용자 관리</h1>
            <p className="text-red-50 text-lg">전체 {mockUsers.length}명의 사용자를 관리하세요</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-12">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all">
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-600 text-sm font-medium">전체 사용자</span>
                <div className="bg-green-50 p-3 rounded-lg text-green-600">
                  <Users size={20} />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900">584,291</p>
              <p className="text-xs text-green-600 mt-2">↑ 12.3% 증가</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all">
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-600 text-sm font-medium">활성 사용자</span>
                <div className="bg-blue-50 p-3 rounded-lg text-blue-600">
                  <TrendingUp size={20} />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900">571,842</p>
              <p className="text-xs text-blue-600 mt-2">97.9% 활성율</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all">
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-600 text-sm font-medium">정지된 사용자</span>
                <div className="bg-red-50 p-3 rounded-lg text-red-600">
                  <Ban size={20} />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900">12,449</p>
              <p className="text-xs text-red-600 mt-2">2.1% 정지율</p>
            </div>
          </div>

          {/* Controls */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="md:col-span-2 relative">
                <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="이름 또는 이메일 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all" />
                
              </div>

              {/* Filter */}
              <div className="relative">
                <Filter className="absolute left-3 top-3 text-gray-400" size={18} />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all appearance-none bg-white">
                  
                  <option value="all">전체 상태</option>
                  <option value="active">활성</option>
                  <option value="suspended">정지</option>
                  <option value="pending">대기</option>
                </select>
              </div>

              {/* Export */}
              <button
                onClick={handleExport}
                className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white rounded-lg px-4 py-2 font-semibold flex items-center justify-center gap-2 transition-all duration-300 shadow-md hover:shadow-lg">
                
                <Download size={18} />
                내보내기
              </button>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-rose-50 to-pink-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">사용자</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">가입일</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">상태</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">구매</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">포인트</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">작업</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) =>
                  <tr key={user.id} className="border-b border-gray-100 hover:bg-rose-50/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-300 to-pink-300 flex items-center justify-center text-lg font-bold">
                            {user.avatar}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{user.name}</p>
                            <p className="text-xs text-gray-500">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{user.joinDate}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${statusColors[user.status].badge}`}>
                          {statusLabels[user.status]}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{user.purchases}건</td>
                      <td className="px-6 py-4 text-sm font-semibold text-rose-600">{user.points.toLocaleString()}P</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                          onClick={() => toast.info(`${user.name} 사용자 상세 정보`)}
                          className="p-2 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors"
                          title="상세보기">
                          
                            <Eye size={16} />
                          </button>
                          <button
                          onClick={() => handleStatusToggle(user.id)}
                          className={`p-2 rounded-lg transition-colors ${user.status === 'active' ? 'hover:bg-red-50 text-red-600' : 'hover:bg-green-50 text-green-600'}`}
                          title={user.status === 'active' ? '정지' : '해제'}>
                          
                            <Ban size={16} />
                          </button>
                          <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors">
                            <MoreVertical size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
              <p className="text-sm text-gray-600">총 {filteredUsers.length}명의 사용자</p>
              <div className="flex items-center gap-2">
                <button className="px-3 py-1 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">이전</button>
                <button className="px-3 py-1 bg-rose-500 text-white rounded-lg text-sm font-medium">1</button>
                <button className="px-3 py-1 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">2</button>
                <button className="px-3 py-1 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">다음</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>);

}