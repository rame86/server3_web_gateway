/*
 * Lumina - Admin Community Management
 * Soft Bloom Design: Post management, reports
 */

import { useState } from 'react';
import Layout from '@/components/Layout';
import { AlertCircle, Eye, Trash2, Search, Flag, CheckCircle } from 'lucide-react';
import { posts } from '@/lib/data';
import { toast } from 'sonner';

const reports = [
{ id: 1, postTitle: '불쾌한 내용 게시글', reportedBy: '달빛소녀', reason: '욕설/비방', date: '2026-02-18', status: 'pending' },
{ id: 2, postTitle: '스팸 광고 게시글', reportedBy: '별빛팬', reason: '스팸/광고', date: '2026-02-17', status: 'resolved' }];


export default function AdminCommunity() {
  const [activeTab, setActiveTab] = useState('posts');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = posts.filter((p) =>
  p.title.includes(searchQuery) || p.author.includes(searchQuery)
  );

  return (
    <Layout role="admin">
      <div className="p-4 lg:p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
            게시판 관리
          </h1>
          <p className="text-sm text-muted-foreground">커뮤니티 게시글 관리 및 신고 처리</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 bg-amber-50 p-1 rounded-2xl">
          {[
          { key: 'posts', label: '게시글 관리' },
          { key: 'reports', label: `신고 처리 (${reports.filter((r) => r.status === 'pending').length})` }].
          map((tab) =>
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            activeTab === tab.key ?
            'bg-white text-amber-600 shadow-sm' :
            'text-muted-foreground hover:text-foreground'}`
            }>
            
              {tab.label}
            </button>
          )}
        </div>

        {activeTab === 'posts' &&
        <>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
              type="text"
              placeholder="게시글 또는 작성자 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-amber-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-300" />
            
            </div>

            <div className="glass-card rounded-2xl overflow-hidden soft-shadow">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-amber-100">
                      <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">게시글</th>
                      <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden md:table-cell">작성자</th>
                      <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden lg:table-cell">날짜</th>
                      <th className="text-right p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">관리</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((post) =>
                  <tr key={post.id} className="border-b border-amber-50 last:border-0 hover:bg-amber-50/30 transition-colors">
                        <td className="p-4">
                          <div>
                            <p className="font-semibold text-sm text-foreground line-clamp-1">{post.title}</p>
                            <p className="text-xs text-muted-foreground line-clamp-1">{post.content}</p>
                          </div>
                        </td>
                        <td className="p-4 hidden md:table-cell">
                          <div className="flex items-center gap-2">
                            <img src={post.authorImage} alt="" className="w-6 h-6 rounded-full object-cover" />
                            <span className="text-sm text-muted-foreground">{post.author}</span>
                          </div>
                        </td>
                        <td className="p-4 hidden lg:table-cell">
                          <span className="text-xs text-muted-foreground">{post.createdAt}</span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-end gap-1">
                            <button
                          onClick={() => toast.info('게시글 상세보기 기능 준비 중입니다')}
                          className="p-1.5 rounded-lg hover:bg-amber-50 transition-colors">
                          
                              <Eye size={14} className="text-muted-foreground" />
                            </button>
                            <button
                          onClick={() => toast.warning('게시글을 삭제했습니다')}
                          className="p-1.5 rounded-lg hover:bg-red-50 transition-colors">
                          
                              <Trash2 size={14} className="text-muted-foreground hover:text-red-500" />
                            </button>
                          </div>
                        </td>
                      </tr>
                  )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        }

        {activeTab === 'reports' &&
        <div className="space-y-4">
            {reports.map((report) =>
          <div key={report.id} className="glass-card rounded-2xl p-4 soft-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                report.status === 'pending' ? 'bg-red-50 text-red-500' : 'bg-teal-50 text-teal-500'}`
                }>
                      {report.status === 'pending' ? <Flag size={16} /> : <CheckCircle size={16} />}
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-foreground">{report.postTitle}</p>
                      <p className="text-xs text-muted-foreground">신고자: {report.reportedBy} · {report.date}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
              report.status === 'pending' ? 'bg-red-100 text-red-700' : 'bg-teal-100 text-teal-700'}`
              }>
                    {report.status === 'pending' ? '처리 대기' : '처리 완료'}
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <AlertCircle size={12} className="text-amber-500" />
                  <span className="text-xs text-amber-700 font-medium">신고 사유: {report.reason}</span>
                </div>
                {report.status === 'pending' &&
            <div className="flex gap-2">
                    <button
                onClick={() => toast.success('게시글을 삭제하고 신고를 처리했습니다')}
                className="flex-1 py-2 text-xs font-semibold text-white rounded-xl bg-red-500 hover:bg-red-600 transition-colors">
                
                      게시글 삭제
                    </button>
                    <button
                onClick={() => toast.info('신고를 무시하고 처리했습니다')}
                className="flex-1 py-2 text-xs font-semibold text-muted-foreground rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                
                      무시
                    </button>
                  </div>
            }
              </div>
          )}
          </div>
        }
      </div>
    </Layout>);

}