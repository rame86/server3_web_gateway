import { useState, useEffect, useCallback, useMemo } from 'react';
import Layout from '@/components/Layout';
import { BookOpen, Heart, MessageCircle, Eye, PenLine, Search, TrendingUp, Bell, X } from 'lucide-react';
import { toast } from 'sonner';

// [DB 설정] 백엔드 카테고리와 매칭
const boardTabs = [
  { key: 'all', label: '전체' },
  { key: '팬레터', label: '팬레터' },
  { key: '아티스트 레터', label: '아티스트 레터' },
  { key: '공지사항', label: '공지사항' },
  { key: '팬덤게시판', label: '팬덤게시판' },
  { key: '자유게시판', label: '자유게시판' }
];

// [디자인 설정] 카테고리별 배지 색상
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
  
  // 아티스트 여부 및 이름 판단
  const isArtist = post.category === '아티스트 레터' || post.isArtistPost || post.is_artist_post;
  const authorDisplayName = post.authorName || post.artist_name || post.memberId || '익명';

  return (
    <div
      className="glass-card rounded-2xl p-4 soft-shadow hover:bg-rose-50/30 transition-all cursor-pointer group mb-3 border border-rose-50/50"
      onClick={() => toast.info('게시글 상세보기 기능 준비 중입니다')}>
      
      <div className="flex items-start gap-3">
        {/* [수정 포인트] 프로필 이미지 우선, 없으면 카테고리에 따른 텍스트 표시 */}
        {post.authorImage ? (
          <img src={post.authorImage} alt="author" className="w-10 h-10 rounded-full object-cover flex-shrink-0 ring-2 ring-white shadow-sm" />
        ) : (
          <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ring-2 ring-white shadow-sm text-[9px] font-black tracking-tighter ${
            isArtist 
              ? 'bg-gradient-to-tr from-purple-600 to-indigo-400 text-white' 
              : 'bg-rose-100 text-rose-400'
          }`}>
            {isArtist ? 'ARTIST' : 'USER'}
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${config.badgeClass}`}>
              {config.label}
            </span>
            {isArtist && (
              <span className="text-[10px] bg-purple-600 text-white px-2 py-0.5 rounded-full font-bold">Official ✨</span>
            )}
          </div>
          <h3 className="font-semibold text-sm text-foreground mb-1 line-clamp-1 group-hover:text-rose-600 transition-colors">
            {post.title}
          </h3>
          <p className="text-xs text-muted-foreground line-clamp-2 mb-2 leading-relaxed">{post.content}</p>
          <div className="flex items-center gap-3 text-[11px]">
            <span className={`font-bold ${isArtist ? 'text-purple-600' : 'text-rose-400'}`}>
              {isArtist && '⭐ '} {authorDisplayName}
            </span>
            <span className="text-gray-400">
              {post.createdAt || post.created_at ? new Date(post.createdAt || post.created_at).toLocaleDateString() : '-'}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-rose-100">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setLiked(!liked);
            toast.success(liked ? '좋아요를 취소했습니다' : '좋아요!');
          }}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-rose-500 transition-colors">
          <Heart size={13} className={liked ? 'text-rose-500' : ''} fill={liked ? 'currentColor' : 'none'} />
          {(post.likeCount || post.like_count || 0) + (liked ? 1 : 0)}
        </button>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <MessageCircle size={13} />
          {post.commentCount || post.comment_count || 0}
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Eye size={13} />
          {(post.viewCount || post.view_count || 0).toLocaleString()}
        </div>
      </div>
    </div>
  );
}

export default function UserCommunity() {
  const [activeBoard, setActiveBoard] = useState('all');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterKeyword, setFilterKeyword] = useState('');

  // [DB 연동 로직]
  const fetchPosts = useCallback(async (categoryKey = 'all') => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token'); 
      const categoryParam = categoryKey === 'all' ? '전체' : categoryKey;
      const API_URL = `http://localhost:8080/msa/core/api/board/posts?category=${encodeURIComponent(categoryParam)}`;

      const response = await fetch(API_URL, {
        method: 'GET',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '', 
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 401) {
        toast.error("로그인이 필요한 서비스입니다.");
        return;
      }
      if (!response.ok) throw new Error(`데이터 로드 실패: ${response.status}`);
      
      const data = await response.json();
      setPosts(Array.isArray(data) ? data : (data.content || []));
      
    } catch (error) {
      console.error("DB 연동 에러:", error);
      toast.error("게시글을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts(activeBoard);
  }, [activeBoard, fetchPosts]);

  // 프론트엔드 검색 필터링
  const filteredDisplayPosts = useMemo(() => {
    if (!filterKeyword.trim()) return posts;
    const low = filterKeyword.toLowerCase();
    return posts.filter(p => 
      p.title?.toLowerCase().includes(low) || 
      p.content?.toLowerCase().includes(low)
    );
  }, [posts, filterKeyword]);

  return (
    <Layout role="user">
      <div className="p-4 lg:p-6 space-y-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
              종합 커뮤니티
            </h1>
            <p className="text-sm text-muted-foreground">팬레터, 아티스트 레터, 공지사항, 게시판</p>
          </div>
          <button
            onClick={() => toast.info('글쓰기 기능 준비 중입니다')}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-xl bg-rose-500 shadow-md hover:bg-rose-600 transition-all">
            <PenLine size={14} />
            글쓰기
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="게시글 검색 후 Enter..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && setFilterKeyword(searchQuery)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-rose-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 shadow-sm" />
        </div>

        {/* Board Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {boardTabs.map((tab) =>
            <button
              key={tab.key}
              onClick={() => setActiveBoard(tab.key)}
              className={`flex-shrink-0 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                activeBoard === tab.key ?
                'bg-rose-500 text-white shadow-md' :
                'bg-white border border-rose-50 text-gray-400 hover:bg-rose-50'
              }`}>
              {tab.label}
            </button>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-1">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp size={16} className="text-rose-500" />
              <span className="text-sm font-bold">최신 게시글</span>
            </div>

            {loading ? (
              <div className="text-center py-20 animate-pulse text-rose-300 font-medium">소식을 가져오는 중입니다...</div>
            ) : filteredDisplayPosts.length > 0 ? (
              filteredDisplayPosts.map((post) => (
                <PostCard key={post.boardId || post.id || Math.random()} post={post} />
              ))
            ) : (
              <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-rose-200">
                <BookOpen size={40} className="text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">표시할 게시글이 없습니다.</p>
              </div>
            )}
          </div>

          {/* Sidebar (공지사항 & 인기글) */}
          <div className="space-y-4">
            <div className="glass-card rounded-2xl p-4 border border-rose-50 shadow-sm bg-white">
              <div className="flex items-center gap-2 mb-3">
                <Bell size={16} className="text-amber-500" />
                <h3 className="font-bold text-sm">공지사항</h3>
              </div>
              <div className="space-y-2">
                {posts.filter(p => p.category === '공지사항').slice(0, 3).map((notice, i) => (
                  <p key={i} className="text-xs text-gray-600 line-clamp-1 hover:text-rose-500 cursor-pointer">• {notice.title}</p>
                ))}
              </div>
            </div>

            <div className="glass-card rounded-2xl p-4 border border-rose-50 shadow-sm bg-white">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp size={16} className="text-rose-500" />
                <h3 className="font-bold text-sm text-foreground">실시간 인기</h3>
              </div>
              {[...posts].sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0)).slice(0, 5).map((post, i) => (
                <div key={i} className="flex gap-2 mb-2 cursor-pointer group">
                  <span className={`text-xs font-bold ${i < 3 ? 'text-rose-500' : 'text-gray-300'}`}>{i+1}</span>
                  <p className="text-xs text-gray-600 line-clamp-1 group-hover:text-rose-600">{post.title}</p>
                </div>
              ))}
            </div>

            <div className="rounded-2xl p-5 cursor-pointer border border-rose-100 bg-gradient-to-br from-rose-50 to-purple-50" onClick={() => toast.info('준비 중입니다')}>
              <div className="flex items-center gap-2 mb-2">
                <Heart size={16} className="text-rose-500" fill="currentColor" />
                <h3 className="font-bold text-sm">팬레터 쓰기</h3>
              </div>
              <p className="text-[11px] text-gray-500 mb-4 leading-relaxed">아티스트에게 진심을 전해보세요.</p>
              <button className="w-full py-2.5 text-xs font-bold text-white bg-rose-500 rounded-xl">작성하기</button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}