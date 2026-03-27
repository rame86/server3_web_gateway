import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation } from 'wouter';
import Layout from '@/components/Layout';
import { Heart, MessageCircle, Eye, PenLine, Search, TrendingUp, Bell, Paperclip, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { coreApi } from '@/lib/api';

// 스타일 파일 임포트
import { styles, typeConfig } from './UserCommunityStyles';

// API 게이트웨이 주소 설정
const API_BASE_URL = import.meta.env.VITE_API_GATEWAY_URL;

// 1. PostCard 컴포넌트 (개별 게시글 카드)
function PostCard({ post, onDetail }) {
  const [liked, setLiked] = useState(post.liked || false);
  const [currentLikeCount, setCurrentLikeCount] = useState(post.likeCount || 0);
  const [isProcessing, setIsProcessing] = useState(false);

  const config = typeConfig[post.category] || typeConfig['자유게시판'];
  const isArtist = post.artistPost === true;
  const authorName = post.authorName || `사용자${post.memberId}`;

  // 부모로부터 post 데이터가 갱신될 때 로컬 상태 동기화
  useEffect(() => {
    setLiked(post.liked || false);
    setCurrentLikeCount(post.likeCount || 0);
  }, [post.liked, post.likeCount]);

  // 좋아요 클릭 핸들러
  const handleLike = async (e) => {
    e.stopPropagation();
    if (isProcessing) return;

    setIsProcessing(true);
    try {
      const response = await coreApi.post(`/board/${post.boardId}/like`);
      if (response.status === 200) {
        const updatedCount = response.data; // 서버에서 반환된 최신 총 좋아요 수
        setCurrentLikeCount(updatedCount);
        setLiked(!liked);
        toast.success(!liked ? '좋아요!' : '좋아요를 취소했습니다');
      }
    } catch (error) {
      console.error("Like Error:", error);
      toast.error('요청 처리에 실패했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div
      className="glass-card rounded-2xl p-4 soft-shadow hover:bg-rose-50/30 transition-all cursor-pointer group mb-3 border border-rose-50/50"
      onClick={() => onDetail(post.boardId)}
    >
      <div className="flex items-start gap-3">
        {/* 아티스트/유저 아바타 표시 */}
        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ring-2 ring-white shadow-sm text-[9px] font-black ${isArtist ? 'bg-gradient-to-tr from-purple-600 to-indigo-400 text-white' : 'bg-rose-100 text-rose-400'}`}>
          {isArtist ? 'ARTIST' : 'USER'}
        </div>

        {/* 게시글 요약 내용 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${config.badgeClass}`}>{config.label}</span>
          </div>
          <h3 className="font-semibold text-sm text-foreground mb-1 line-clamp-1 group-hover:text-rose-600 transition-colors">
            {post.title}
            {post.storedFilePath && (<Paperclip size={14} className="inline-block ml-2 text-gray-400" />)}
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

      {/* 하단 통계 정보 (좋아요, 댓글, 조회수) */}
      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-rose-100">
        <button
          onClick={handleLike}
          disabled={isProcessing}
          className={`flex items-center gap-1 text-xs transition-colors ${liked ? 'text-rose-500 font-bold' : 'text-muted-foreground hover:text-rose-500'}`}
        >
          <Heart size={13} fill={liked ? 'currentColor' : 'none'} className={liked ? 'text-rose-500' : ''} />
          {/* 수동 계산을 없애고 서버 기반 상태값만 출력하여 중복 누적 방지 */}
          {currentLikeCount}
        </button>
        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
          <MessageCircle size={13} /> {post.commentCount || 0}
        </div>
        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
          <Eye size={13} /> {(post.viewCount || 0).toLocaleString()}
        </div>
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

// 2. 메인 UserCommunity 컴포넌트
export default function UserCommunity() {
  const [, setLocation] = useLocation();
  const [activeBoard, setActiveBoard] = useState('all');
  const [posts, setPosts] = useState([]);
  const [allPosts, setAllPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // 게시글 데이터 페칭
  const fetchPosts = useCallback(async (category) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken') || localStorage.getItem('TOKEN');
      const categoryParam = category === 'all' ? '' : category;
      const url = `${API_BASE_URL}/msa/core/board/list?category=${encodeURIComponent(categoryParam)}`;

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
      if (!response.ok) throw new Error("데이터 로드 실패");

      const data = await response.json();
      const rawResult = Array.isArray(data) ? data : (data.content || []);
      const result = rawResult.map(post => ({
        ...post,
        likeCount: (post.likeCount === null || isNaN(post.likeCount)) ? 0 : Number(post.likeCount),
        viewCount: post.viewCount || 0,
        commentCount: post.commentCount || 0
      }));

      setPosts(result);
      if (category === 'all') setAllPosts(result);
    } catch (error) {
      console.error("Fetch Error:", error);
      toast.error("서버와 통신 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }, [setLocation]);

  useEffect(() => {
    fetchPosts('all');
  }, [fetchPosts]);

  useEffect(() => {
    if (activeBoard !== 'all') {
      fetchPosts(activeBoard);
    } else {
      setPosts(allPosts);
    }
  }, [activeBoard, fetchPosts, allPosts]);

  const handleDetail = (boardId) => {
    if (!boardId) {
      toast.error("존재하지 않는 게시글입니다.");
      return;
    }
    setLocation(`/user/community/${boardId}`);
  };

  const filteredDisplayPosts = useMemo(() => {
    const term = searchQuery.toLowerCase().trim();
    if (!term) return posts;
    return posts.filter(p =>
      p.title?.toLowerCase().includes(term) ||
      p.content?.toLowerCase().includes(term)
    );
  }, [posts, searchQuery]);

  const noticePosts = useMemo(() => allPosts.filter(p => p.category === '공지사항').slice(0, 3), [allPosts]);
  const popularPosts = useMemo(() => [...allPosts].sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0)).slice(0, 5), [allPosts]);

  return (
    <Layout role="user">
      <div className={styles.container}>
        {/* 상단 배너 섹션 */}
        <div className="mb-10 text-center">
          <div className="relative h-44 w-full rounded-[2rem] overflow-hidden shadow-xl shadow-rose-100/50 group">
            <img 
              src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=1200" 
              alt="Community Banner"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-rose-400/20 via-black/40 to-black/70 flex flex-col justify-center items-center text-white p-6">
              <h1 className="text-3xl font-black mb-2 tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                종합 커뮤니티
              </h1>
              <div className="h-0.5 w-12 bg-rose-400 mb-3 rounded-full"></div>
              <p className="text-sm font-medium opacity-90 flex items-center gap-2">
                <Sparkles size={14} className="text-rose-300" />
                루미나 팬들과 함께 소통하는 공간
              </p>
            </div>
          </div>
        </div>

        {/* 검색 및 글쓰기 영역 */}
        <div className="flex justify-between items-center gap-4 mb-6">
          <div className={`${styles.searchWrapper} flex-1 mb-0`}>
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="궁금한 게시글을 검색해보세요..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>
          <button onClick={() => setLocation('/user/community/write')} className={styles.writeBtn}>
            <PenLine size={14} /> 글쓰기
          </button>
        </div>

        {/* 카테고리 탭 */}
        <div className={styles.tabWrapper}>
          {boardTabs.map((tab) => (
            <button key={tab.key} onClick={() => setActiveBoard(tab.key)} className={styles.tabBtn(activeBoard === tab.key)}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* 메인 콘텐츠 그리드 */}
        <div className={styles.grid}>
          <div className={styles.mainCol}>
            <div className="flex items-center gap-2 mb-3 px-1 text-sm font-bold text-gray-700">
              <TrendingUp size={16} className="text-rose-500" />
              최신 피드
            </div>
            {loading ? (
              <div className="py-20 text-center text-rose-300 animate-pulse text-sm">로딩 중...</div>
            ) : filteredDisplayPosts.length > 0 ? (
              filteredDisplayPosts.map((post) => (
                <PostCard key={post.boardId} post={post} onDetail={handleDetail} />
              ))
            ) : (
              <div className="text-center py-20 bg-white/50 rounded-3xl border border-dashed border-rose-100 text-muted-foreground text-sm">
                조회된 게시글이 없습니다.
              </div>
            )}
          </div>

          {/* 사이드바 영역 */}
          <aside className={styles.sidebar}>
            <div className={styles.glassCard}>
              <div className="flex items-center gap-2 mb-3 text-sm font-bold"><Bell size={16} className="text-amber-500" />공지사항</div>
              {noticePosts.map((n) => (
                <p key={n.boardId} className="text-xs text-gray-600 truncate cursor-pointer hover:text-rose-500 mb-2" onClick={() => handleDetail(n.boardId)}>• {n.title}</p>
              ))}
            </div>
            
            <div className={styles.glassCard}>
              <div className="flex items-center gap-2 mb-3 text-sm font-bold"><TrendingUp size={16} className="text-rose-500" />인기 포스트</div>
              {popularPosts.map((p, i) => (
                <div key={p.boardId} className="flex gap-2 mb-2 cursor-pointer group text-xs text-gray-600" onClick={() => handleDetail(p.boardId)}>
                  <span className={`font-bold ${i < 3 ? 'text-rose-500' : 'text-gray-300'}`}>{i + 1}</span>
                  <p className="truncate group-hover:text-rose-600 transition-colors">{p.title}</p>
                </div>
              ))}
            </div>

            <div className={styles.letterCard} onClick={() => setLocation('/user/community/write')}>
              <div className="flex items-center gap-2 mb-2 text-sm font-bold"><Heart size={16} className="text-rose-500" fill="currentColor" />팬레터 작성</div>
              <button className="w-full py-2.5 text-xs font-bold text-white bg-rose-500 rounded-xl hover:bg-rose-600 transition-all">지금 작성하기</button>
            </div>
          </aside>
        </div>
      </div>
    </Layout>
  );
}