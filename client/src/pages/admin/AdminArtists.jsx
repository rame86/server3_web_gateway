/**
 * Lumina - Admin Artists Management
 * Soft Bloom Design: Artist approval, management with web-style UI
 */

import { useState } from 'react';
import Layout from '@/components/Layout';
import { Search, CheckCircle, Users, Eye, Check, X, Clock, Music } from 'lucide-react';
import { toast } from 'sonner';

const pendingArtists = [
{ id: 101, name: '김민준', group: 'ECHO', genre: '발라드', appliedDate: '2026-02-18', status: 'pending', followers: 0, avatar: '🎤' },
{ id: 102, name: '박서연', group: 'AURORA', genre: 'K-POP', appliedDate: '2026-02-17', status: 'pending', followers: 0, avatar: '🎵' },
{ id: 103, name: '최지훈', group: 'PRISM', genre: 'R&B', appliedDate: '2026-02-16', status: 'pending', followers: 0, avatar: '🎸' }];


const approvedArtists = [
{ id: 1, name: '김지수', group: 'NOVA', genre: 'K-POP', followers: 520000, status: 'active', avatar: '⭐' },
{ id: 2, name: '박준호', group: 'NOVA', genre: 'K-POP', followers: 390000, status: 'active', avatar: '✨' },
{ id: 3, name: '이하은', group: 'BLOSSOM', genre: 'K-POP', followers: 420000, status: 'active', avatar: '🌸' }];


const statusColors = {
  active: { bg: 'bg-green-50', text: 'text-green-700', badge: 'bg-green-100 text-green-700' },
  pending: { bg: 'bg-yellow-50', text: 'text-yellow-700', badge: 'bg-yellow-100 text-yellow-700' },
  suspended: { bg: 'bg-red-50', text: 'text-red-700', badge: 'bg-red-100 text-red-700' }
};

export default function AdminArtists() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('pending');

  const filteredPending = pendingArtists.filter((a) =>
  a.name.includes(searchQuery) || a.group.includes(searchQuery)
  );

  const filteredApproved = approvedArtists.filter((a) =>
  a.name.includes(searchQuery) || a.group.includes(searchQuery)
  );

  const handleApprove = (artistId) => {
    toast.success('아티스트가 승인되었습니다!');
  };

  const handleReject = (artistId) => {
    toast.error('아티스트 신청이 거절되었습니다.');
  };

  return (
    <Layout role="admin">
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-violet-500 via-purple-400 to-indigo-400 text-white py-12 px-6 rounded-b-3xl shadow-lg">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-3 mb-3">
              <Music size={28} />
              <span className="text-violet-100 text-sm font-semibold">아티스트 관리</span>
            </div>
            <h1 className="text-4xl font-bold mb-2">아티스트 관리</h1>
            <p className="text-violet-50 text-lg">아티스트 등록 승인 및 계정 관리</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-12">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all">
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-600 text-sm font-medium">전체 아티스트</span>
                <div className="bg-violet-50 p-3 rounded-lg text-violet-600">
                  <Music size={20} />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900">1,240</p>
              <p className="text-xs text-violet-600 mt-2">↑ 8.7% 증가</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all">
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-600 text-sm font-medium">승인 대기</span>
                <div className="bg-yellow-50 p-3 rounded-lg text-yellow-600">
                  <Clock size={20} />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900">{pendingArtists.length}</p>
              <p className="text-xs text-yellow-600 mt-2">즉시 처리 필요</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all">
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-600 text-sm font-medium">활성 아티스트</span>
                <div className="bg-green-50 p-3 rounded-lg text-green-600">
                  <CheckCircle size={20} />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900">{approvedArtists.length}</p>
              <p className="text-xs text-green-600 mt-2">정상 운영 중</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-8 bg-gray-100 p-1 rounded-xl inline-flex">
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-6 py-2 rounded-lg font-semibold transition-all ${
              activeTab === 'pending' ?
              'bg-white text-violet-600 shadow-md' :
              'text-gray-600 hover:text-gray-900'}`
              }>
              
              승인 대기 ({pendingArtists.length})
            </button>
            <button
              onClick={() => setActiveTab('approved')}
              className={`px-6 py-2 rounded-lg font-semibold transition-all ${
              activeTab === 'approved' ?
              'bg-white text-violet-600 shadow-md' :
              'text-gray-600 hover:text-gray-900'}`
              }>
              
              승인된 아티스트 ({approvedArtists.length})
            </button>
          </div>

          {/* Search */}
          <div className="mb-8 relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="아티스트명 또는 그룹명 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all" />
            
          </div>

          {/* Pending Artists */}
          {activeTab === 'pending' &&
          <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900 mb-4">승인 대기 중인 아티스트</h2>
              {filteredPending.length === 0 ?
            <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
                  <Music size={48} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500 text-lg">승인 대기 중인 아티스트가 없습니다.</p>
                </div> :

            filteredPending.map((artist) =>
            <div key={artist.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-300 to-purple-300 flex items-center justify-center text-2xl font-bold">
                          {artist.avatar}
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">{artist.name}</h3>
                          <p className="text-gray-600">{artist.group} · {artist.genre}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Clock size={14} className="text-yellow-600" />
                            <span className="text-xs text-gray-500">{artist.appliedDate} 신청</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                    onClick={() => handleApprove(artist.id)}
                    className="bg-green-500 hover:bg-green-600 text-white rounded-lg px-6 py-2 font-semibold flex items-center gap-2 transition-all duration-300 shadow-md hover:shadow-lg">
                    
                          <Check size={18} />
                          승인
                        </button>
                        <button
                    onClick={() => handleReject(artist.id)}
                    className="bg-red-500 hover:bg-red-600 text-white rounded-lg px-6 py-2 font-semibold flex items-center gap-2 transition-all duration-300 shadow-md hover:shadow-lg">
                    
                          <X size={18} />
                          거절
                        </button>
                      </div>
                    </div>
                  </div>
            )
            }
            </div>
          }

          {/* Approved Artists */}
          {activeTab === 'approved' &&
          <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">승인된 아티스트</h2>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-violet-50 to-purple-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">아티스트</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">그룹</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">장르</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">팔로워</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">상태</th>
                        <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">작업</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredApproved.map((artist) =>
                    <tr key={artist.id} className="border-b border-gray-100 hover:bg-violet-50/30 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-300 to-purple-300 flex items-center justify-center text-lg font-bold">
                                {artist.avatar}
                              </div>
                              <p className="font-semibold text-gray-900">{artist.name}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">{artist.group}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{artist.genre}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1 text-sm font-semibold text-violet-600">
                              <Users size={14} />
                              {(artist.followers / 1000).toFixed(0)}K
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${statusColors[artist.status].badge}`}>
                              활성
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center gap-2">
                              <button className="p-2 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors" title="상세보기">
                                <Eye size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                    )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          }
        </div>
      </div>
    </Layout>);

}