/*
 * Lumina MSA 커뮤니티 - 사이드바 완전 복구 및 키값/이동 최적화 버전
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import Layout from '@/components/Layout';
import { Heart, MessageCircle, Eye, PenLine, Search, TrendingUp, Bell, Lock, BookOpen } from 'lucide-react';
import { toast } from 'sonner';

const API_BASE_URL = 'http://localhost/msa/core/board';
const TOKEN_KEY = 'TOKEN';

const boardTabs = [
  { key: 'all', label: '전체', private: false },
  { key: '팬레터', label: '팬레터', private: true },
  { key: '아티스트 레터', label: '아티스트 레터', private: true },
  { key: '공지사항', label: '공지사항', private: false },
  { key: '팬덤게시판', label: '팬덤', private: true },
  { key: '자유게시판', label: '자유게시판', private: false }
];

const typeConfig = {
  '팬레터': { label: '팬레터', badgeClass: 'bg-rose-100 text-rose-600' },
  '아티스트 레터': { label: '아티스트 레터', badgeClass: 'bg-purple-100 text-purple-600' },
  '공지사항': { label: '공지', badgeClass: 'bg-amber-100 text-amber-700' },
  '팬덤게시판': { label: '팬덤', badgeClass: 'bg-teal-100 text-teal-600' },
  '자유게시판': { label: '자유', badgeClass: 'bg-gray-100 text-gray-600' }
};

function PostCard({ post }) {
  const [liked] = useState(false);
  const config = typeConfig[post.category] || typeConfig['자유게시판'];
  const safePostId = post.board_id || post.id || post.boardId || post.no;
  const displayName = post.name || `회원(${post.member_id || '익명'})`;

  const handleMoveDetail = (e) => {
    if (e) e.stopPropagation(); 
    if (!safePostId) return toast.error("게시글 번호를 찾을 수 없습니다.");
    window.location.href = `/user/community/${safePostId}`;
  };

  return (
    <div
      className="glass-card rounded-2xl p-4 soft-shadow hover:bg-rose-50/30 transition-all cursor-pointer border border-rose-50/50 mb-3 group"
      onClick={handleMoveDetail}
    >
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ring-2 ring-white shadow-sm text-[9px] font-black ${post.is_artist_post ? 'bg-gradient-to-tr from-purple-600 to-indigo-400 text-white' : 'bg-rose-100 text-rose-400'}`}>
          {post.is_artist_post ? '아티스트' : '사용자'}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${config.badgeClass}`}>{config.label}</span>
          </div>
          
          <h3 className="font-semibold text-sm text-foreground mb-1 line-clamp-1 group-hover:text-rose-600 transition-colors">
            {post.title}
          </h3>
          
          <p className="text-xs text-muted-foreground line-clamp-2 mb-2 leading-relaxed">{post.content}</p>
          
          <div className="flex items-center gap-3 text-[11px]">
            <span className="font-bold text-rose-500">{displayName}</span>
            <span className="text-gray-400">
              {post.created_at ? new Date(post.created_at).toLocaleDateString() : '-'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function UserCommunity() {
  const [activeBoard, setActiveBoard] = useState('all');
  const [posts, setPosts] = useState([]);
  const [sidebarData, setSidebarData] = useState({ notices: [], hotPosts: [] });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const token = localStorage.getItem(TOKEN_KEY);
  const isLoggedIn = !!token;

  const getHeaders = useCallback(() => {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
  }, [token]);

  const fetchSidebarData = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/list`, { headers: getHeaders() });
      const data = await response.json();
      const rawData = Array.isArray(data) ? data : (data.content || []);
      
      setSidebarData({
        notices: rawData.filter(p => p.category === '공지사항').slice(0, 5),
        hotPosts: [...rawData].sort((a, b) => (b.view_count || 0) - (a.view_count || 0)).slice(0, 5)
      });
    } catch (err) { console.error("사이드바 데이터 오류", err); }
  }, [getHeaders]);

  const fetchPosts = useCallback(async (category) => {
    try {
      setLoading(true);
      const categoryParam = category === 'all' ? '' : `category=${encodeURIComponent(category)}`;
      const url = `${API_BASE_URL}/list${categoryParam ? `?${categoryParam}` : ''}`;
      
      const response = await fetch(url, { headers: getHeaders() });
      if (!response.ok) throw new Error("서버 인증 오류");
      
      const data = await response.json();
      const rawData = Array.isArray(data) ? data : (data.content || []);
      
      setPosts(!isLoggedIn 
        ? rawData.filter(p => p.category === '자유게시판' || p.category === '공지사항') 
        : rawData
      );
    } catch (err) {
      toast.error("목록을 불러오는 중 오류가 발생했습니다.");
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [getHeaders, isLoggedIn]);

  useEffect(() => {
    fetchSidebarData();
    fetchPosts('all');
  }, [fetchSidebarData, fetchPosts]);

  const displayPosts = useMemo(() => {
    if (!searchQuery.trim()) return posts;
    const low = searchQuery.toLowerCase();
    return posts.filter(p => 
      p.title?.toLowerCase().includes(low) || 
      p.content?.toLowerCase().includes(low)
    );
  }, [posts, searchQuery]);

  return (
    <Layout role="user">
      <div className="p-4 lg:p-6 space-y-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-foreground tracking-tight">종합 커뮤니티</h1>
          </div>
          <button
            onClick={() => isLoggedIn ? (window.location.href = '/user/community/write') : toast.error("로그인이 필요합니다.")}
            className="flex items-center gap-2 px-6 py-3 text-sm font-bold text-white rounded-2xl bg-rose-500 shadow-lg hover:bg-rose-600 transition-all"
          >
            <PenLine size={18} /> 글쓰기
          </button>
        </div>

        {/* 검색창 복구 */}
        <div className="relative group">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-rose-300" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="궁금한 내용을 검색해보세요"
            className="w-full pl-12 pr-4 py-4 bg-white border-2 border-rose-50 rounded-2xl text-sm focus:outline-none focus:border-rose-200 transition-all"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {boardTabs.map((tab) => (
            <button
              key={`tab-${tab.key}`}
              onClick={() => {
                if (tab.private && !isLoggedIn) return toast.error("로그인이 필요한 메뉴입니다.");
                setActiveBoard(tab.key);
                fetchPosts(tab.key);
              }}
              className={`flex-shrink-0 px-6 py-2.5 rounded-full text-sm font-bold border-2 transition-all ${
                activeBoard === tab.key ? 'bg-rose-500 text-white border-rose-500' : 'bg-white border-gray-50 text-gray-400'
              }`}
            >
              {tab.label} {tab.private && !isLoggedIn && <Lock size={12} className="inline ml-1" />}
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {loading ? (
              <div className="py-24 text-center font-bold">로딩 중...</div>
            ) : displayPosts.length > 0 ? (
              displayPosts.map((post, index) => (
                <PostCard key={`post-${post.board_id || post.id || index}`} post={post} />
              ))
            ) : (
              <div className="text-center py-24 font-medium bg-white rounded-3xl border-2 border-dashed border-rose-50">
                <BookOpen size={40} className="mx-auto text-rose-100 mb-4" />
                <p className="text-sm text-gray-400">게시글이 없습니다.</p>
              </div>
            )}
          </div>

          {/* 사이드바 전체 복구 섹션 */}
          <div className="space-y-6">
            {/* 1. 공지사항 */}
            <div className="glass-card rounded-3xl p-6 border border-rose-50 bg-white shadow-sm">
              <div className="flex items-center gap-2 mb-5 font-black text-sm text-gray-800">
                <Bell size={18} className="text-amber-500" /> 공지사항
              </div>
              <div className="space-y-4">
                {sidebarData.notices.map((n, i) => (
                  <div key={`side-notice-${n.board_id || i}`} onClick={() => window.location.href = `/user/community/${n.board_id || n.id}`} className="flex items-start gap-3 cursor-pointer group">
                    <div className="w-1.5 h-1.5 bg-rose-300 rounded-full mt-1.5 group-hover:bg-rose-500" />
                    <p className="text-xs text-gray-600 line-clamp-1 group-hover:text-rose-600 font-medium">{n.title}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. 실시간 인기글 */}
            <div className="glass-card rounded-3xl p-6 border border-rose-50 bg-white shadow-sm">
              <div className="flex items-center gap-2 mb-5 font-black text-sm text-gray-800">
                <TrendingUp size={18} className="text-rose-500" /> 실시간 인기
              </div>
              <div className="space-y-4">
                {sidebarData.hotPosts.map((p, i) => (
                  <div key={`side-hot-${p.board_id || i}`} onClick={() => window.location.href = `/user/community/${p.board_id || p.id}`} className="flex items-start gap-3 cursor-pointer group">
                    <span className={`text-xs font-black w-4 ${i < 3 ? 'text-rose-500' : 'text-gray-300'}`}>{i + 1}</span>
                    <p className="text-xs text-gray-600 line-clamp-1 group-hover:text-rose-600 font-medium">{p.title}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. 팬레터 배너 */}
            <div 
              className="group rounded-3xl p-6 cursor-pointer overflow-hidden relative border border-rose-100 shadow-md transition-all bg-white"
              style={{ background: 'linear-gradient(135deg, #fff 0%, #fff5f7 100%)' }}
              onClick={() => isLoggedIn ? (window.location.href = '/community/write?type=fanletter') : toast.error("로그인이 필요합니다.")}
            >
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <Heart size={20} className="text-rose-500" fill="#f43f5e" />
                  <h3 className="font-black text-sm text-gray-800">팬레터 쓰기</h3>
                </div>
                <p className="text-[11px] text-gray-500 mb-5 leading-relaxed font-bold">아티스트에게 따뜻한 마음을 전하세요.</p>
                <button className="w-full py-3 text-xs font-black text-white rounded-2xl bg-gradient-to-r from-purple-600 to-rose-400">
                  작성하기
                </button>
              </div>
            </div>
          </div>
          {/* 사이드바 복구 끝 */}
        </div>
      </div>
    </Layout>
  );
}