import { useState, useEffect, useCallback, useMemo } from 'react';
import Layout from '@/components/Layout';
import { BookOpen, Heart, MessageCircle, Eye, PenLine, Search, TrendingUp, Bell, Lock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

// [DB 설정] 하드코딩 지양 및 MSA 구조 참조
const TOKEN_KEY = 'TOKEN';
const API_BASE_URL = 'http://localhost/msa/core/board/list';

const boardTabs = [
  { key: 'all', label: '전체', private: true },
  { key: '팬레터', label: '팬레터', private: true },
  { key: '아티스트 레터', label: '아티스트 레터', private: true },
  { key: '공지사항', label: '공지사항', private: true },
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
  const config = typeConfig[post.category] || typeConfig['자유게시판'];
  const isArtist = post.category === '아티스트 레터' || post.isArtistPost || post.is_artist_post;
  const authorDisplayName = post.authorName || post.artist_name || post.memberId || '익명';

  return (
    <div className="glass-card rounded-2xl p-4 soft-shadow hover:bg-rose-50/30 transition-all cursor-pointer mb-3 border border-rose-50/50">
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ring-2 ring-white shadow-sm text-[9px] font-black ${isArtist ? 'bg-gradient-to-tr from-purple-600 to-indigo-400 text-white' : 'bg-rose-100 text-rose-400'}`}>
          {isArtist ? 'ARTIST' : 'USER'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${config.badgeClass}`}>{config.label}</span>
          </div>
          <h3 className="font-semibold text-sm mb-1 line-clamp-1">{post.title}</h3>
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{post.content}</p>
          <div className="flex items-center gap-3 mt-2 text-[11px]">
            <span className="font-bold text-rose-400">{authorDisplayName}</span>
            <span className="text-gray-400">{post.createdAt ? new Date(post.createdAt).toLocaleDateString() : '-'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function UserCommunity() {
  const [activeBoard, setActiveBoard] = useState('자유게시판'); // 기본값을 자유게시판으로 설정
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    setIsLoggedIn(!!token);
    // 토큰이 있으면 '전체', 없으면 '자유게시판'으로 시작
    setActiveBoard(token ? 'all' : '자유게시판');
  }, []);

  const fetchPosts = useCallback(async (boardKey) => {
    try {
      setLoading(true);
      const token = localStorage.getItem(TOKEN_KEY);
      
      // 요청 헤더 설정
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch(API_BASE_URL, {
        method: 'GET',
        headers: headers
      });

      // 401 에러 발생 시 처리
      if (response.status === 401) {
        if (token) {
          toast.error("세션이 만료되었습니다.");
          localStorage.removeItem(TOKEN_KEY);
          setIsLoggedIn(false);
        }
        // 토큰 없이 재시도하거나 자유게시판 데이터만 필터링하도록 유도
        // 여기서는 서버가 401을 주면 비회원 데이터도 못 가져오는 구조이므로 
        // 서버의 permitAll 설정이 필수적입니다.
        setPosts([]); 
        return;
      }

      if (!response.ok) throw new Error('네트워크 응답 없음');

      const data = await response.json();
      const rawPosts = Array.isArray(data) ? data : (data.content || []);
      
      // [로직] 비회원은 '자유게시판' 카테고리만 필터링해서 보여줌
      let filtered = rawPosts;
      if (!token) {
        filtered = rawPosts.filter(p => p.category === '자유게시판');
      } else if (boardKey !== 'all') {
        filtered = rawPosts.filter(p => p.category === boardKey);
      }
      
      setPosts(filtered);
    } catch (err) {
      console.error("Fetch Error:", err);
      // 에러가 나더라도 비회원에게 알림을 최소화하고 싶다면 무음 처리 가능
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts(activeBoard);
  }, [activeBoard, fetchPosts]);

  const handleTabClick = (tab) => {
    if (tab.private && !isLoggedIn) {
      toast.error("로그인한 회원만 이용할 수 있는 게시판입니다.");
      return;
    }
    setActiveBoard(tab.key);
  };

  return (
    <Layout role="user">
      <div className="p-4 lg:p-6 space-y-6 max-w-5xl mx-auto">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">종합 커뮤니티</h1>
            <p className="text-sm text-muted-foreground">
              {isLoggedIn ? '모든 소식을 확인하세요.' : '자유게시판을 둘러보세요. (로그인 시 전체 공개)'}
            </p>
          </div>
        </header>

        {/* Board Tabs */}
        <nav className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {boardTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleTabClick(tab)}
              className={`flex-shrink-0 px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${
                activeBoard === tab.key ? 'bg-rose-500 text-white shadow-md' : 'bg-white text-gray-400 border border-rose-50'
              }`}>
              {tab.label}
              {tab.private && !isLoggedIn && <Lock size={12} className="opacity-50" />}
            </button>
          ))}
        </nav>

        <div className="grid lg:grid-cols-3 gap-6">
          <main className="lg:col-span-2">
            {loading ? (
              <div className="py-20 text-center animate-pulse text-rose-300 font-medium">소식을 불러오는 중...</div>
            ) : posts.length > 0 ? (
              posts.map((post) => <PostCard key={post.id || Math.random()} post={post} />)
            ) : (
              <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-rose-200">
                <BookOpen size={40} className="text-muted-foreground/20 mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">표시할 게시글이 없습니다.</p>
              </div>
            )}
          </main>

          <aside className="space-y-4">
            {!isLoggedIn && (
              <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg">
                <h3 className="font-bold text-sm mb-1 text-white">더 많은 기능을 원하시나요?</h3>
                <p className="text-[11px] opacity-90 mb-4 text-white">로그인 시 아티스트 레터와 팬레터 작성이 가능합니다.</p>
                <button 
                  onClick={() => window.location.href = '/login'}
                  className="w-full py-2 bg-white text-indigo-600 rounded-lg text-xs font-bold hover:bg-opacity-90 transition-all">
                  1초만에 로그인하기
                </button>
              </div>
            )}
            
            <div className="glass-card rounded-2xl p-4 border border-rose-50 bg-white shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp size={16} className="text-rose-500" />
                <h3 className="font-bold text-sm">인기 급상승</h3>
              </div>
              <div className="space-y-2">
                {posts.slice(0, 3).map((p, i) => (
                  <p key={i} className="text-xs text-gray-500 line-clamp-1">• {p.title}</p>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </Layout>
  );
}