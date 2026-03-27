import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Layout from '@/components/Layout';
import { 
  Heart, MessageCircle, PlaySquare, ShoppingBag, 
  Bell, Gift, Sparkles, LayoutDashboard, X, 
  Send, Play, MessageSquare, ShoppingCart,
  Star, User as UserIcon, Calendar, ArrowRight, Music 
} from 'lucide-react';
import { toast } from 'sonner';
import { coreApi } from '@/lib/api';
// 기존 데이터 및 유틸리티 import
import { posts, goodsItems, formatPrice } from '@/lib/data';

const COMMUNITY_BG = 'https://private-us-east-1.manuscdn.com/sessionFile/umqDS2iCyxhwdKkQqabwQ5/sandbox/5OYI281mcXf2naQYMxZ8bN-img-5_1771469988000_na1fn_Y29tbXVuaXR5LWJn.png';

const mediaVideos = [
  { id: 1, title: '이하은 - "봄날의 꿈" MV', thumbnail: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=225&fit=crop', views: '2.4M', duration: '3:42' },
  { id: 2, title: '팬미팅 비하인드 영상', thumbnail: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=225&fit=crop', views: '890K', duration: '8:15' },
  { id: 3, title: '연습실 브이로그', thumbnail: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=225&fit=crop', views: '1.2M', duration: '12:30' }
];

const fandomTabs = [
  { key: 'dashboard', label: '대시보드' },
  { key: 'media', label: '미디어' },
  { key: 'letters', label: '레터' },
  { key: 'goods', label: '굿즈' }
];

export default function ArtistFandom() {
  // --- 상태 관리 ---
  const [artist, setArtist] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [fanLetters, setFanLetters] = useState([]);
  const [artistLetters, setArtistLetters] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  // 게시글 상세보기 모달 상태
  const [selectedPost, setSelectedPost] = useState(null);
  const [postDetailLoading, setPostDetailLoading] = useState(false);

  // --- 데이터 페칭 로직 통합 ---
  const fetchAllData = useCallback(async () => {
    const loggedInMemberId = localStorage.getItem('memberId'); 
    if (!loggedInMemberId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      // 1. 아티스트 정보 가져오기
      const artistRes = await coreApi.get(`/artist/${loggedInMemberId}`);
      const artistData = artistRes.data;
      setArtist(artistData);

      // 2. 아티스트 ID를 기반으로 관련 데이터 병렬 로드
      const targetId = artistData?.artistId || loggedInMemberId;
      
      const [fanRes, artistLetterRes, noticeRes] = await Promise.all([
        coreApi.get(`/artist/${targetId}/fan-letters`).catch(() => ({ data: [] })),
        coreApi.get(`/artist/${targetId}/artist-letters`).catch(() => ({ data: [] })),
        coreApi.get(`/artist/${targetId}/notices`).catch(() => ({ data: [] }))
      ]);

      setFanLetters(Array.isArray(fanRes.data) ? fanRes.data : []);
      setArtistLetters(Array.isArray(artistLetterRes.data) ? artistLetterRes.data : []);
      setAnnouncements(Array.isArray(noticeRes.data) ? noticeRes.data : []);

    } catch (err) {
      console.error("데이터 로딩 에러:", err);
      toast.error("정보를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // --- 레터 작성 핸들러 ---
  const handleWriteLetter = async () => {
    if (!artist) return;
    const title = prompt("레터 제목을 입력하세요:");
    const content = prompt("내용을 입력하세요:");
    
    if (!title || !content) return;

    try {
      await coreApi.post('/artist/artist-letter', {
        title,
        content,
        artistId: artist.artistId
      });
      toast.success("아티스트 레터가 등록되었습니다! ✨");
      // 목록 새로고침
      const res = await coreApi.get(`/artist/${artist.artistId}/artist-letters`);
      setArtistLetters(res.data);
    } catch (error) {
      toast.error("작성 권한이 없거나 오류가 발생했습니다.");
    }
  };

  // --- 게시글 상세 정보 가져오기 ---
  const handleOpenPost = useCallback(async (post) => {
    const boardId = post.boardId || post.id;
    if (!boardId) return;
    
    try {
      setPostDetailLoading(true);
      setSelectedPost(post); 
      const res = await coreApi.get(`/board/${boardId}`);
      setSelectedPost(res.data);
    } catch (err) {
      toast.error("게시글 내용을 불러오는 데 실패했습니다.");
    } finally {
      setPostDetailLoading(false);
    }
  }, []);

  if (loading) return <Layout role="artist"><div className="p-10 text-center text-rose-500 font-bold italic tracking-widest">Lumina 관리 페이지 로딩 중...</div></Layout>;
  if (!artist) return <Layout role="artist"><div className="p-10 text-center">아티스트 정보를 찾을 수 없습니다.</div></Layout>;

  return (
    <Layout role="artist">
      <div className="p-4 lg:p-6 space-y-6">
        {/* 헤더 영역 */}
        <div className="relative overflow-hidden rounded-3xl h-44 shadow-lg">
          <img src={artist.fandomImage || COMMUNITY_BG} alt="cover" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <div className="flex items-center gap-2 mb-1 text-white/80 text-sm font-medium">
              <Heart size={16} className="text-rose-300" fill="currentColor" />
              <span>{artist.fandomName} 팬덤</span>
            </div>
            <h1 className="text-2xl font-bold text-white">
              {artist.stageName} 팬덤 관리
            </h1>
            <p className="text-white/70 text-sm">팬들과 소통하고 특별한 콘텐츠를 공유하세요</p>
          </div>
        </div>

        {/* 탭 네비게이션 */}
        <div className="flex gap-2 bg-rose-50 p-1 rounded-2xl overflow-x-auto">
          {fandomTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-shrink-0 flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === tab.key ? 'bg-white text-rose-600 shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 탭별 콘텐츠 */}
        <div className="fade-in-up mt-6">
          {/* 1. 대시보드 */}
          {activeTab === 'dashboard' && (
            <div className="grid lg:grid-cols-2 gap-4">
              <div className="glass-card rounded-2xl p-4 bg-white border border-rose-50 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold flex items-center gap-2 text-gray-800"><Heart size={16} className="text-rose-500" /> 최근 팬레터</h3>
                  <button onClick={() => setActiveTab('letters')} className="text-xs text-rose-500 font-semibold flex items-center gap-1">전체 <ArrowRight size={12}/></button>
                </div>
                <div className="space-y-2">
                  {(fanLetters.length > 0 ? fanLetters : posts.filter(p => p.type === 'fanletter')).slice(0, 3).map((post) => (
                    <div key={post.boardId || post.id} onClick={() => handleOpenPost(post)} className="flex items-center justify-between p-3 rounded-xl border border-rose-50 hover:bg-rose-50 cursor-pointer transition-all">
                      <p className="text-sm font-semibold truncate max-w-[200px]">{post.title}</p>
                      <span className="text-[10px] text-gray-400">{post.createdAt?.split('T')[0] || post.date}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-card rounded-2xl p-4 bg-white border border-violet-50 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold flex items-center gap-2 text-gray-800"><MessageCircle size={16} className="text-violet-500" /> 최근 공지</h3>
                  <button onClick={() => setActiveTab('letters')} className="text-xs badge-lavender px-2 py-1 rounded-full">+ 작성</button>
                </div>
                {(announcements.length > 0 ? announcements : posts.filter(p => p.type === 'artist-letter')).slice(0, 2).map((post) => (
                  <div key={post.boardId || post.id} onClick={() => handleOpenPost(post)} className="p-3 mb-2 rounded-xl bg-violet-50/50 border border-violet-50 hover:bg-violet-50 cursor-pointer transition-all">
                    <p className="text-sm font-semibold truncate">{post.title}</p>
                    <p className="text-[10px] text-violet-400 mt-1">등록됨</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. 미디어 */}
          {activeTab === 'media' && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mediaVideos.map((video) => (
                <div key={video.id} className="glass-card rounded-2xl overflow-hidden hover-lift cursor-pointer shadow-sm bg-white">
                  <div className="relative aspect-video">
                    <img src={video.thumbnail} className="w-full h-full object-cover" alt={video.title} />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center"><Play size={20} className="text-white" fill="white" /></div>
                  </div>
                  <div className="p-3">
                    <p className="font-semibold text-sm">{video.title}</p>
                    <p className="text-xs text-muted-foreground">{video.views} 조회</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 3. 레터 관리 */}
          {activeTab === 'letters' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-foreground">레터 관리</h2>
                <button
                  onClick={handleWriteLetter}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-xl btn-primary-gradient shadow-sm"
                >
                  + 아티스트 레터 작성
                </button>
              </div>

              <div className="grid lg:grid-cols-2 gap-6">
                {/* 팬레터 영역 */}
                <div>
                  <h3 className="font-semibold text-xs text-muted-foreground mb-3 px-2 tracking-widest uppercase">Fan Letters</h3>
                  {fanLetters.length > 0 ? fanLetters.map((post) => (
                    <div key={post.boardId} onClick={() => handleOpenPost(post)} className="glass-card rounded-2xl p-4 mb-3 bg-white border border-gray-100 hover:shadow-md transition-shadow cursor-pointer">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-full bg-rose-100 flex items-center justify-center text-rose-500 font-bold flex-shrink-0">
                          {post.authorName?.[0] || 'U'}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-sm text-foreground truncate">{post.title}</p>
                          <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{post.content}</p>
                          <p className="text-[10px] text-muted-foreground mt-1">{post.authorName} · {new Date(post.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                  )) : <p className="text-center py-10 text-xs text-muted-foreground bg-gray-50 rounded-2xl">아직 팬레터가 없습니다.</p>}
                </div>

                {/* 아티스트 레터 영역 */}
                <div>
                  <h3 className="font-semibold text-xs text-muted-foreground mb-3 px-2 tracking-widest uppercase">My Letters</h3>
                  {artistLetters.length > 0 ? artistLetters.map((post) => (
                    <div key={post.boardId} onClick={() => handleOpenPost(post)} className="glass-card rounded-2xl p-4 mb-3 bg-violet-50/50 border-l-4 border-violet-400 hover:shadow-md transition-shadow cursor-pointer">
                      <p className="font-semibold text-sm text-foreground">{post.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{post.content}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-[10px] text-muted-foreground">{new Date(post.createdAt).toLocaleDateString()}</span>
                        <span className="text-[10px] text-violet-600 font-bold">❤ {post.likeCount || 0}</span>
                      </div>
                    </div>
                  )) : (
                    <div className="p-10 text-center bg-gray-50 rounded-2xl border-2 border-dashed">
                      <p className="text-xs text-muted-foreground">작성한 레터가 없습니다.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 4. 굿즈 */}
          {activeTab === 'goods' && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {goodsItems.filter(g => g.artistId === artist.artistId || g.artistId === 3).map((item) => (
                <div key={item.id} className="glass-card rounded-2xl overflow-hidden bg-white p-3 shadow-sm border border-gray-100">
                  <img src={item.image} alt={item.name} className="w-full h-36 object-cover rounded-xl mb-2" />
                  <p className="font-semibold text-xs line-clamp-1">{item.name}</p>
                  <p className="text-sm font-bold text-rose-600 mt-1">{formatPrice(item.price)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 게시글 상세보기 모달 */}
      {selectedPost && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col fade-in-up">
            <div className="p-5 border-b flex justify-between items-center">
              <div className="flex items-center gap-2 text-rose-500 font-bold"><MessageSquare size={20} /> <span>포스트 상세보기</span></div>
              <button onClick={() => setSelectedPost(null)}><X size={24} className="text-gray-400" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-8 space-y-6">
              {postDetailLoading ? (
                <div className="py-20 text-center"><div className="w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto" /></div>
              ) : (
                <>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedPost.title}</h2>
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span>{selectedPost.authorName || selectedPost.author || '아티스트'}</span>
                      <span className="w-px h-2 bg-gray-200" />
                      <span>{selectedPost.createdAt?.replace('T', ' ').slice(0, 16) || selectedPost.date}</span>
                    </div>
                  </div>
                  <div className="h-px bg-rose-50" />
                  <div className="text-gray-700 leading-relaxed whitespace-pre-wrap min-h-[200px]">{selectedPost.content}</div>
                </>
              )}
            </div>
            <div className="p-5 border-t bg-gray-50 flex justify-end gap-2">
              <button className="px-6 py-2 bg-rose-50 text-rose-600 rounded-xl font-bold text-sm">수정</button>
              <button onClick={() => setSelectedPost(null)} className="px-6 py-2 bg-gray-900 text-white rounded-xl font-bold text-sm">닫기</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}