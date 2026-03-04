import { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation } from 'wouter';
import Layout from '@/components/Layout';
import { Heart, MessageCircle, Eye, PenLine, Search, TrendingUp, Bell } from 'lucide-react';
import { toast } from 'sonner';

// 스타일 파일 임포트
import { styles, typeConfig } from './UserCommunityStyles';

function PostCard({ post, onDetail }) {
  const [liked, setLiked] = useState(false);
  const config = typeConfig[post.category] || typeConfig['자유게시판'];
  
  // 포스트맨 응답 데이터 구조 반영
  const isArtist = post.artistPost === true; 
  const authorName = post.authorName || `User_${post.memberId || '익명'}`;

  return (
    <div
      className="glass-card rounded-2xl p-4 soft-shadow hover:bg-rose-50/30 transition-all cursor-pointer group mb-3 border border-rose-50/50" 
      onClick={() => onDetail(post.boardId)}
    >
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ring-2 ring-white shadow-sm text-[9px] font-black ${isArtist ? 'bg-gradient-to-tr from-purple-600 to-indigo-400 text-white' : 'bg-rose-100 text-rose-400'}`}>
          {isArtist ? 'ARTIST' : 'USER'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${config.badgeClass}`}>{config.label}</span>
          </div>
          <h3 className="font-semibold text-sm text-foreground mb-1 line-clamp-1 group-hover:text-rose-600 transition-colors">
            {post.title}
          </h3>
          <p className="text-xs text-muted-foreground line-clamp-2 mb-2 leading-relaxed">
            {post.content}
          </p>
          <div className="flex items-center gap-3 text-[11px]">
            <span className={`font-bold ${isArtist ? 'text-purple-600' : 'text-rose-400'}`}>{authorName}</span>
            <span className="text-gray-400">
              {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : '-'}
            </span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-rose-100 text-xs text-muted-foreground">
        <button 
          onClick={(e) => { e.stopPropagation(); setLiked(!liked); }} 
          className="flex items-center gap-1 hover:text-rose-500"
        >
          <Heart size={13} className={liked ? 'text-rose-500' : ''} fill={liked ? 'currentColor' : 'none'} /> 
          { (post.likeCount || 0) + (liked ? 1 : 0) }
        </button>
        <div className="flex items-center gap-1"><MessageCircle size={13} /> {post.commentCount || 0}</div>
        <div className="flex items-center gap-1"><Eye size={13} /> {(post.viewCount || 0).toLocaleString()}</div>
      </div>
    </div>
  );
}

const boardTabs = [
  { key: 'all', label: '전체' },
  { key: '팬레터', label: '팬레터' },
  { key: '아티스트 레터', label: '아티스트 레터' },
  { key: '공지사항', label: '공지사항' },
  { key: '팬덤게시판', label: '팬덤게시판' },
  { key: '자유게시판', label: '자유게시판' }
];

export default function UserCommunity() {
  const [, setLocation] = useLocation();
  const [activeBoard, setActiveBoard] = useState('all');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(''); 

  // [DB 연동 로직 - 충돌 해결 통합본]
  const fetchPosts = useCallback(async (category) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('TOKEN');
      const categoryParam = category === 'all' ? '전체' : category;
      const url = `http://localhost/msa/core/board/list?category=${encodeURIComponent(categoryParam)}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 401) {
        localStorage.removeItem('TOKEN');
        toast.error("인증이 만료되었습니다.");
        setLocation('/login');
        return;
      }

      if (!response.ok) throw new Error("Load Failed");
      
      const data = await response.json();
      setPosts(Array.isArray(data) ? data : (data.content || []));
    } catch (error) {
      console.error("Fetch Error:", error);
      toast.error("게시글을 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }, [setLocation]);

  useEffect(() => { 
    fetchPosts(activeBoard); 
  }, [activeBoard, fetchPosts]);

  const handleDetail = (boardId) => {
    if (!boardId) return;
    setLocation(`/user/community/${boardId}`);
  };

  // 실시간 필터링: searchQuery가 변할 때마다 즉시 반영
  const filteredDisplayPosts = useMemo(() => {
    const term = searchQuery.toLowerCase().trim();
    if (!term) return posts;
    
    return posts.filter(p => 
      p.title?.toLowerCase().includes(term) || 
      p.content?.toLowerCase().includes(term)
    );
  }, [posts, searchQuery]);

  return (
    <Layout role="user">
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title} style={{ fontFamily: "'Playfair Display', serif" }}>종합 커뮤니티</h1>
            <p className="text-sm text-muted-foreground">Redis 세션 기반 커뮤니티</p>
          </div>
          <button onClick={() => setLocation('/user/community/write')} className={styles.writeBtn}>
            <PenLine size={14} /> 글쓰기
          </button>
        </div>

        <div className={styles.searchWrapper}>
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text" 
            placeholder="검색어를 입력하세요..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput} 
          />
        </div>

        <div className={styles.tabWrapper}>
          {boardTabs.map((tab) => (
            <button key={tab.key} onClick={() => setActiveBoard(tab.key)} className={styles.tabBtn(activeBoard === tab.key)}>
              {tab.label}
            </button>
          ))}
        </div>

        <div className={styles.grid}>
          <div className={styles.mainCol}>
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp size={16} className="text-rose-500" />
              <span className="text-sm font-bold">최신 게시글</span>
            </div>
            {loading ? (
              <div className="text-center py-20 text-rose-300">로딩 중...</div>
            ) : filteredDisplayPosts.length > 0 ? (
              filteredDisplayPosts.map((post) => (
                <PostCard 
                  key={post.boardId} 
                  post={post} 
                  onDetail={handleDetail} 
                />
              ))
            ) : (
              <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-rose-200 text-muted-foreground text-sm">
                조회된 게시글이 없습니다.
              </div>
            )}
          </div>

          <aside className={styles.sidebar}>
            <div className={styles.glassCard}>
              <div className="flex items-center gap-2 mb-3"><Bell size={16} className="text-amber-500" /><h3 className="font-bold text-sm">공지사항</h3></div>
              {posts.filter(p => p.category === '공지사항').slice(0, 3).map((n) => (
                <p key={n.boardId} className="text-xs text-gray-600 truncate cursor-pointer hover:text-rose-500 mb-2" onClick={() => handleDetail(n.boardId)}>• {n.title}</p>
              ))}
            </div>

            <div className={styles.glassCard}>
              <div className="flex items-center gap-2 mb-3"><TrendingUp size={16} className="text-rose-500" /><h3 className="font-bold text-sm">인기 포스트</h3></div>
              {[...posts].sort((a,b) => (b.likeCount || 0) - (a.likeCount || 0)).slice(0, 5).map((p, i) => (
                <div key={p.boardId} className="flex gap-2 mb-2 cursor-pointer group" onClick={() => handleDetail(p.boardId)}>
                  <span className={`text-xs font-bold ${i < 3 ? 'text-rose-500' : 'text-gray-300'}`}>{i+1}</span>
                  <p className="text-xs text-gray-600 truncate group-hover:text-rose-600">{p.title}</p>
                </div>
              ))}
            </div>

            <div className={styles.letterCard} onClick={() => setLocation('/user/community/write')}>
              <div className="flex items-center gap-2 mb-2"><Heart size={16} className="text-rose-500" fill="currentColor" /><h3 className="font-bold text-sm">팬레터 작성</h3></div>
              <button className="w-full py-2.5 text-xs font-bold text-white bg-rose-500 rounded-xl transition-transform active:scale-95">지금 작성하기</button>
            </div>
          </aside>
        </div>
      </div>
    </Layout>
  );
}