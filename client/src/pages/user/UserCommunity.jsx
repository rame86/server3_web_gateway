import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { BookOpen, Heart, MessageCircle, Eye, PenLine, Search, TrendingUp, Bell } from 'lucide-react';
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
  '팬레터': { label: '팬레터', badgeClass: 'badge-rose' },
  '아티스트 레터': { label: '아티스트 레터', badgeClass: 'badge-lavender' },
  '공지사항': { label: '공지', badgeClass: 'bg-amber-100 text-amber-700' },
  '팬덤게시판': { label: '팬덤', badgeClass: 'badge-mint' },
  '자유게시판': { label: '자유', badgeClass: 'bg-gray-100 text-gray-600' }
};

function PostCard({ post }) {
  const [liked, setLiked] = useState(false);
  // DB에서 넘어온 category가 typeConfig에 없으면 '자유게시판' 기본값 사용
  const config = typeConfig[post.category] || typeConfig['자유게시판'];

  return (
    <div
      className="glass-card rounded-2xl p-4 soft-shadow hover:bg-rose-50/30 transition-colors cursor-pointer group"
      onClick={() => toast.info('게시글 상세보기 기능 준비 중입니다')}>
      
      <div className="flex items-start gap-3">
        {/* 프로필 이미지 (DB에 없으면 기본 rose 배경) */}
        {post.authorImage ? (
          <img src={post.authorImage} alt="author" className="w-10 h-10 rounded-full object-cover flex-shrink-0 ring-2 ring-white shadow-sm" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center flex-shrink-0 ring-2 ring-white text-[10px] font-bold text-rose-400">
            User
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${config.badgeClass}`}>
              {config.label}
            </span>
            {(post.isArtistPost || post.is_artist_post) && (
              <span className="text-xs text-rose-500 font-medium">Artist ✨</span>
            )}
          </div>
          <h3 className="font-semibold text-sm text-foreground mb-1 line-clamp-1 group-hover:text-rose-600 transition-colors">
            {post.title}
          </h3>
          <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{post.content}</p>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">{post.authorName || post.memberId || '익명'}</span>
            <span className="text-xs text-muted-foreground">
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

  // [DB 연동 로직]
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
       // 1. 로컬 스토리지에서 토큰 가져오기 (로그인 시 저장된 키 이름 확인 필요)
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token'); 
      
      // 2. application.properties의 context-path(/msa/core)를 포함한 풀 경로 작성
      // 프록시 설정이 없다면 http://localhost:8080을 앞에 붙여야 합니다.
      const API_URL = 'http://localhost:8080/msa/core/api/board/posts';

      const response = await fetch(API_URL, {
        method: 'GET',
        headers: {
          // 3. 401 에러 해결을 위한 Authorization 헤더
          'Authorization': token ? `Bearer ${token}` : '', 
          'Content-Type': 'application/json'
        }
      });

      // 401 에러(권한 없음) 발생 시 처리
      if (response.status === 401) {
        toast.error("로그인이 필요한 서비스입니다.");
        // 필요 시 로그인 페이지로 리다이렉트 로직 추가
        return;
      }
if (!response.ok) throw new Error(`데이터 로드 실패: ${response.status}`);
      
      const data = await response.json();
      setPosts(Array.isArray(data) ? data : []);
      
    } catch (error) {
      console.error("DB 연동 에러:", error);
      toast.error("게시글을 불러오지 못했습니다. 서버 연결을 확인하세요.");
    } finally {
      setLoading(false);
    }
  };
    fetchPosts();
  }, []);

  // 필터링 로직 (카테고리 매칭)
  const filteredPosts = activeBoard === 'all' ?
    posts :
    posts.filter((p) => p.category === activeBoard);

  return (
    <Layout role="user">
      <div className="p-4 lg:p-6 space-y-6">
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
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-xl btn-primary-gradient shadow-sm hover:opacity-90 transition-opacity">
            <PenLine size={14} />
            글쓰기
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="게시글 검색..."
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-rose-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 shadow-sm" />
        </div>

        {/* Board Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {boardTabs.map((tab) =>
            <button
              key={tab.key}
              onClick={() => setActiveBoard(tab.key)}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                activeBoard === tab.key ?
                'bg-rose-500 text-white shadow-md' :
                'bg-white border border-rose-100 text-muted-foreground hover:bg-rose-50'
              }`}>
              {tab.label}
            </button>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content (Posts) */}
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={16} className="text-rose-500" />
              <span className="text-sm font-semibold text-foreground">최신 게시글</span>
            </div>

            {loading ? (
              <div className="text-center py-20 animate-pulse text-rose-300">데이터를 가져오는 중입니다...</div>
            ) : filteredPosts.length > 0 ? (
              filteredPosts.map((post) => (
                <PostCard key={post.boardId || post.id} post={post} />
              ))
            ) : (
              <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-rose-200">
                <BookOpen size={40} className="text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">표시할 게시글이 없습니다.</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Notice Section */}
            <div className="glass-card rounded-2xl p-4 soft-shadow">
              <div className="flex items-center gap-2 mb-3">
                <Bell size={16} className="text-amber-500" />
                <h3 className="font-semibold text-sm text-foreground">공지사항</h3>
              </div>
              <div className="space-y-2">
                {posts.filter(p => p.category === '공지사항').slice(0, 4).map((notice, i) => (
                  <div key={i} className="flex items-start gap-2 cursor-pointer hover:bg-amber-50 rounded-lg p-1.5 -mx-1.5 transition-colors">
                    <div className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-1.5 flex-shrink-0" />
                    <p className="text-xs text-foreground line-clamp-1">{notice.title}</p>
                  </div>
                ))}
                {posts.filter(p => p.category === '공지사항').length === 0 && (
                  <p className="text-[11px] text-muted-foreground">등록된 공지가 없습니다.</p>
                )}
              </div>
            </div>

            {/* Hot Posts Section */}
            <div className="glass-card rounded-2xl p-4 soft-shadow">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp size={16} className="text-rose-500" />
                <h3 className="font-semibold text-sm text-foreground">실시간 인기</h3>
              </div>
              <div className="space-y-2">
                {[...posts].sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0)).slice(0, 5).map((post, i) => (
                  <div key={post.boardId || i} className="flex items-start gap-2 cursor-pointer hover:bg-rose-50 rounded-lg p-1.5 -mx-1.5 transition-colors">
                    <span className={`text-xs font-bold w-4 flex-shrink-0 ${i < 3 ? 'text-rose-500' : 'text-muted-foreground'}`}>
                      {i + 1}
                    </span>
                    <p className="text-xs text-foreground line-clamp-1">{post.title}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Write Fan Letter Banner */}
            <div
              className="rounded-2xl p-4 cursor-pointer hover:shadow-md transition-all shadow-sm"
              style={{ background: 'linear-gradient(135deg, #FFF1F2 0%, #F5F3FF 100%)' }}
              onClick={() => toast.info('팬레터 쓰기 기능 준비 중입니다')}>
              <div className="flex items-center gap-2 mb-2">
                <Heart size={16} className="text-rose-500" fill="currentColor" />
                <h3 className="font-semibold text-sm text-foreground">팬레터 쓰기</h3>
              </div>
              <p className="text-xs text-muted-foreground mb-3 font-medium">아티스트에게 따뜻한 마음을 전하세요</p>
              <button className="w-full py-2 text-xs font-bold text-white rounded-xl btn-primary-gradient shadow-sm">
                작성하기
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}