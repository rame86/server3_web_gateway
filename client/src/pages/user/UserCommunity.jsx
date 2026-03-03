/*
 * Lumina - User Community Page
 * 사이드바 고정(공지/인기글) 및 팬레터 버튼 보라색 포인트 수정본
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import Layout from '@/components/Layout';
import { BookOpen, Heart, MessageCircle, Eye, PenLine, Search, TrendingUp, Bell, Lock } from 'lucide-react';
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
  const [liked, setLiked] = useState(false);
  const config = typeConfig[post.category] || typeConfig['자유게시판'];
  const postId = post.boardId || post.id;

  return (
    <div
      className="glass-card rounded-2xl p-4 soft-shadow hover:bg-rose-50/30 transition-colors cursor-pointer border border-rose-50/50 mb-3"
      onClick={() => window.location.href = `/community/${postId}`}
    >
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ring-2 ring-white shadow-sm text-[9px] font-black ${post.category === '아티스트 레터' ? 'bg-gradient-to-tr from-purple-600 to-indigo-400 text-white' : 'bg-rose-100 text-rose-400'}`}>
          {post.category === '아티스트 레터' ? 'ARTIST' : 'USER'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${config.badgeClass}`}>{config.label}</span>
          </div>
          <h3 className="font-semibold text-sm text-foreground mb-1 line-clamp-1">{post.title}</h3>
          <p className="text-xs text-muted-foreground line-clamp-2 mb-2 leading-relaxed">{post.content}</p>
          <div className="flex items-center gap-3 text-[11px]">
            <span className="font-bold text-rose-400">{post.authorName || '익명'}</span>
            <span className="text-gray-400">{post.createdAt ? new Date(post.createdAt).toLocaleDateString() : '-'}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-rose-100">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Heart size={13} className={liked ? 'text-rose-500' : ''} fill={liked ? '#f43f5e' : 'none'} /> {post.likeCount || 0}
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground"><MessageCircle size={13} /> {post.commentCount || 0}</div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground"><Eye size={13} /> {(post.viewCount || 0).toLocaleString()}</div>
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

  // 사이드바 전용 데이터 로드 (모든 탭에서 유지됨)
  const fetchSidebarData = useCallback(async () => {
    try {
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      const response = await fetch(`${API_BASE_URL}/list`, { headers });
      const data = await response.json();
      const rawData = Array.isArray(data) ? data : (data.content || []);
      
      setSidebarData({
        notices: rawData.filter(p => p.category === '공지사항').slice(0, 5),
        hotPosts: [...rawData].sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0)).slice(0, 5)
      });
    } catch (err) {
      console.error("Sidebar Load Error:", err);
    }
  }, [token]);

  // 메인 리스트 패칭
  const fetchPosts = useCallback(async (category) => {
    try {
      setLoading(true);
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      const categoryParam = category === 'all' ? '' : `category=${encodeURIComponent(category)}`;
      const url = `${API_BASE_URL}/list${categoryParam ? `?${categoryParam}` : ''}`;
      
      const response = await fetch(url, { headers });
      const data = await response.json();
      const rawData = Array.isArray(data) ? data : (data.content || []);
      
      setPosts(!isLoggedIn ? rawData.filter(p => p.category === '자유게시판' || p.category === '공지사항') : rawData);
    } catch (err) {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [token, isLoggedIn]);

  useEffect(() => {
    fetchSidebarData();
    fetchPosts('all');
  }, [fetchSidebarData, fetchPosts]);

  const displayPosts = useMemo(() => {
    return posts.filter(p => 
      p.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.content?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [posts, searchQuery]);

  return (
    <Layout role="user">
      <div className="p-4 lg:p-6 space-y-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>종합 커뮤니티</h1>
            <p className="text-sm text-muted-foreground">팬과 아티스트가 함께 나누는 따뜻한 이야기</p>
          </div>
          <button
            onClick={() => isLoggedIn ? (window.location.href = '/community/write') : toast.error("로그인이 필요합니다.")}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white rounded-xl bg-rose-500 shadow-md active:scale-95 transition-all"
          >
            <PenLine size={16} /> 글쓰기
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-rose-300" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="검색어를 입력하세요..."
            className="w-full pl-11 pr-4 py-3 bg-white border border-rose-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-200"
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {boardTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                if (tab.private && !isLoggedIn) return toast.error("로그인이 필요합니다.");
                setActiveBoard(tab.key);
                fetchPosts(tab.key);
              }}
              className={`flex-shrink-0 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                activeBoard === tab.key ? 'bg-rose-500 text-white shadow-md' : 'bg-white border border-rose-50 text-gray-400 hover:bg-rose-50'
              }`}
            >
              {tab.label} {tab.private && !isLoggedIn && <Lock size={12} className="inline ml-1" />}
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main List */}
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center gap-2 mb-2 font-bold text-sm text-gray-700">
              <TrendingUp size={16} className="text-rose-500" /> {activeBoard === 'all' ? '전체 게시글' : `${activeBoard} 목록`}
            </div>
            {loading ? (
              <div className="py-20 text-center animate-pulse text-rose-300">데이터를 불러오는 중...</div>
            ) : displayPosts.length > 0 ? (
              displayPosts.map((post, idx) => <PostCard key={post.id || idx} post={post} />)
            ) : (
              <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-rose-100 text-gray-400 text-sm">게시글이 없습니다.</div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* 공지사항 */}
            <div className="glass-card rounded-2xl p-5 border border-rose-50 bg-white shadow-sm">
              <div className="flex items-center gap-2 mb-4 font-bold text-sm"><Bell size={18} className="text-amber-500" /> 공지사항</div>
              <div className="space-y-3">
                {sidebarData.notices.map((n, i) => (
                  <div key={i} onClick={() => window.location.href = `/community/${n.id}`} className="flex items-start gap-2 cursor-pointer group hover:text-rose-500">
                    <div className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-1.5 flex-shrink-0" />
                    <p className="text-xs line-clamp-1">{n.title}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 실시간 인기 (모든 탭 유지) */}
            <div className="glass-card rounded-2xl p-5 border border-rose-50 bg-white shadow-sm">
              <div className="flex items-center gap-2 mb-4 font-bold text-sm"><TrendingUp size={18} className="text-rose-500" /> 실시간 인기</div>
              <div className="space-y-3">
                {sidebarData.hotPosts.map((p, i) => (
                  <div key={i} onClick={() => window.location.href = `/community/${p.id}`} className="flex items-start gap-3 cursor-pointer group hover:text-rose-500">
                    <span className={`text-xs font-black w-4 flex-shrink-0 ${i < 3 ? 'text-rose-500' : 'text-gray-300'}`}>{i + 1}</span>
                    <p className="text-xs line-clamp-1">{p.title}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 팬레터 배너 (기존 CSS + 보라색 버튼 포인트) */}
            <div 
              className="rounded-2xl p-5 cursor-pointer hover:shadow-lg transition-all border border-rose-100"
              style={{ background: 'linear-gradient(135deg, oklch(0.92 0.06 10), oklch(0.92 0.06 290))' }}
              onClick={() => isLoggedIn ? (window.location.href = '/community/write?type=fanletter') : toast.error("로그인 필요")}
            >
              <div className="flex items-center gap-2 mb-2">
                <Heart size={18} className="text-rose-500" fill="#f43f5e" />
                <h3 className="font-bold text-sm text-gray-800">팬레터 쓰기</h3>
              </div>
              <p className="text-xs text-muted-foreground mb-4">아티스트에게 따뜻한 마음을 전해보세요</p>
              
              {/* 버튼만 보라색 포인트 적용 */}
              <button className="w-full py-2.5 text-xs font-bold text-white rounded-xl bg-gradient-to-r from-purple-600 to-indigo-500 shadow-md active:scale-95 transition-all">
                팬레터 작성하기
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}