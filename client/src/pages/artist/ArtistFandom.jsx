import { useState, useEffect, useCallback } from 'react';
import Layout from '@/components/Layout';
import { 
  Heart, MessageCircle, PlaySquare, ShoppingBag, 
  Bell, Gift, Sparkles, LayoutDashboard, X, 
  Send, Play, MessageSquare, ShoppingCart,
  Star, User as UserIcon, Calendar, ArrowRight, Music, PenLine
} from 'lucide-react';
import { toast } from 'sonner';
import { coreApi } from '@/lib/api';
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
  const [artist, setArtist] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [fanLetters, setFanLetters] = useState([]);
  const [artistLetters, setArtistLetters] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null);
  const [postDetailLoading, setPostDetailLoading] = useState(false);
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [newLetterTitle, setNewLetterTitle] = useState('');
  const [newLetterContent, setNewLetterContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- 데이터 페칭 로직 수정 ---
  const fetchAllData = useCallback(async () => {
    const loggedInMemberId = localStorage.getItem('memberId'); 
    if (!loggedInMemberId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      // 1. 먼저 아티스트 정보를 가져옵니다.
      const artistRes = await coreApi.get(`/artist/${loggedInMemberId}`);
      const artistData = artistRes.data;
      setArtist(artistData);

      // 2. 아티스트 정보(특히 PK인 memberId)가 확실히 있을 때만 후속 데이터를 가져옵니다.
      // 컨트롤러 경로 상 {id}는 보통 아티스트의 고유 식별자(memberId 기반)를 사용합니다.
      const targetId = artistData?.memberId || loggedInMemberId;
      
      if (targetId && targetId !== 'undefined') {
        const [fanRes, artistLetterRes, noticeRes] = await Promise.all([
          coreApi.get(`/artist/${targetId}/fan-letters`).catch(() => ({ data: [] })),
          coreApi.get(`/artist/${targetId}/artist-letters`).catch(() => ({ data: [] })),
          coreApi.get(`/artist/${targetId}/notices`).catch(() => ({ data: [] }))
        ]);

        setFanLetters(Array.isArray(fanRes.data) ? fanRes.data : []);
        setArtistLetters(Array.isArray(artistLetterRes.data) ? artistLetterRes.data : []);
        setAnnouncements(Array.isArray(noticeRes.data) ? noticeRes.data : []);
      }

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

  // --- 레터 작성 핸들러 수정 ---
  const handleSubmitLetter = async (e) => {
    e.preventDefault();
    if (!artist || !newLetterTitle.trim() || !newLetterContent.trim()) {
        toast.error("제목과 내용을 모두 입력해주세요.");
        return;
    }

    try {
      setIsSubmitting(true);
      // 백엔드 컨트롤러에 맞게 DTO 구조 전송
      await coreApi.post('/artist/artist-letter', {
        title: newLetterTitle,
        content: newLetterContent,
        category: "아티스트 레터", // 컨트롤러에서 설정하지만 명시적으로 전송
        artistId: artist.artistId, // FK 관계를 위해 전달
        artistPost: true           // 아티스트가 쓴 글임을 표시
      });
      
      toast.success("아티스트 레터가 성공적으로 등록되었습니다! ✨");
      
      setNewLetterTitle('');
      setNewLetterContent('');
      setIsWriteModalOpen(false);
      
      // 목록 새로고침 (undefined 방지를 위해 artist.memberId 사용)
      const targetId = artist.memberId || artist.artistId;
      const res = await coreApi.get(`/artist/${targetId}/artist-letters`);
      setArtistLetters(res.data);
      
    } catch (error) {
      console.error("작성 에러:", error);
      toast.error("레터 등록 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
          {activeTab === 'dashboard' && (
            <div className="grid lg:grid-cols-2 gap-4">
              <div className="glass-card rounded-2xl p-4 bg-white border border-rose-50 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold flex items-center gap-2 text-gray-800"><Heart size={16} className="text-rose-500" /> 최근 팬레터</h3>
                  <button onClick={() => setActiveTab('letters')} className="text-xs text-rose-500 font-semibold flex items-center gap-1">전체 <ArrowRight size={12}/></button>
                </div>
                <div className="space-y-2">
                  {fanLetters.slice(0, 3).map((post) => (
                    <div key={post.boardId || post.id} onClick={() => handleOpenPost(post)} className="flex items-center justify-between p-3 rounded-xl border border-rose-50 hover:bg-rose-50 cursor-pointer transition-all">
                      <p className="text-sm font-semibold truncate max-w-[200px]">{post.title}</p>
                      <span className="text-[10px] text-gray-400">{post.createdAt?.split('T')[0]}</span>
                    </div>
                  ))}
                  {fanLetters.length === 0 && <p className="text-xs text-center text-gray-400 py-4">최근 팬레터가 없습니다.</p>}
                </div>
              </div>

              <div className="glass-card rounded-2xl p-4 bg-white border border-violet-50 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold flex items-center gap-2 text-gray-800"><MessageCircle size={16} className="text-violet-500" /> 최근 내 레터</h3>
                  <button onClick={() => setIsWriteModalOpen(true)} className="text-xs badge-lavender px-2 py-1 rounded-full">+ 작성</button>
                </div>
                {artistLetters.slice(0, 2).map((post) => (
                  <div key={post.boardId || post.id} onClick={() => handleOpenPost(post)} className="p-3 mb-2 rounded-xl bg-violet-50/50 border border-violet-50 hover:bg-violet-50 cursor-pointer transition-all">
                    <p className="text-sm font-semibold truncate">{post.title}</p>
                    <p className="text-[10px] text-violet-400 mt-1">발행 완료</p>
                  </div>
                ))}
                {artistLetters.length === 0 && <p className="text-xs text-center text-gray-400 py-4">작성한 레터가 없습니다.</p>}
              </div>
            </div>
          )}

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

          {activeTab === 'letters' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-foreground">레터 관리</h2>
                <button onClick={() => setIsWriteModalOpen(true)} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-xl btn-primary-gradient shadow-sm">
                  <PenLine size={16} /> 아티스트 레터 작성
                </button>
              </div>

              <div className="grid lg:grid-cols-2 gap-6">
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
                  )) : <div className="p-10 text-center bg-gray-50 rounded-2xl border-2 border-dashed"><p className="text-xs text-muted-foreground">작성한 레터가 없습니다.</p></div>}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'goods' && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {goodsItems.filter(g => g.artistId === artist.artistId).map((item) => (
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

      {/* 모달 등 생략... (위의 원본 구조 유지) */}
      
      {/* 아티스트 레터 작성 모달 */}
      {isWriteModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden fade-in-up">
            <form onSubmit={handleSubmitLetter}>
              <div className="p-6 border-b flex justify-between items-center bg-violet-50/30">
                <div className="flex items-center gap-2 text-violet-600 font-bold">
                  <Sparkles size={20} />
                  <span>새 아티스트 레터 작성</span>
                </div>
                <button type="button" onClick={() => setIsWriteModalOpen(false)}>
                  <X size={24} className="text-gray-400" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <input 
                  type="text"
                  value={newLetterTitle}
                  onChange={(e) => setNewLetterTitle(e.target.value)}
                  placeholder="제목을 입력하세요"
                  className="w-full px-4 py-3 rounded-xl border border-gray-100 focus:ring-2 focus:ring-violet-500/20 text-sm font-medium outline-none"
                />
                <textarea 
                  value={newLetterContent}
                  onChange={(e) => setNewLetterContent(e.target.value)}
                  placeholder="팬들에게 메시지를 남겨보세요 ✨"
                  rows={8}
                  className="w-full px-4 py-3 rounded-xl border border-gray-100 focus:ring-2 focus:ring-violet-500/20 text-sm leading-relaxed outline-none resize-none"
                />
              </div>
              <div className="p-6 bg-gray-50 flex gap-3">
                <button type="button" onClick={() => setIsWriteModalOpen(false)} className="flex-1 py-3 bg-white border text-gray-600 rounded-xl font-bold text-sm">취소</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 py-3 bg-violet-600 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-violet-200">
                  {isSubmitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Send size={16} /> 레터 발행</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 포스트 상세 모달 */}
      {selectedPost && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col fade-in-up">
            <div className="p-5 border-b flex justify-between items-center">
              <div className="flex items-center gap-2 text-rose-500 font-bold"><MessageSquare size={20} /> <span>상세 내용</span></div>
              <button onClick={() => setSelectedPost(null)}><X size={24} className="text-gray-400" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-8 space-y-6">
              {postDetailLoading ? (
                <div className="py-20 text-center"><div className="w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto" /></div>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedPost.title}</h2>
                  <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">{selectedPost.content}</div>
                </>
              )}
            </div>
            <div className="p-5 border-t bg-gray-50 flex justify-end gap-2">
              <button onClick={() => setSelectedPost(null)} className="px-6 py-2 bg-gray-900 text-white rounded-xl font-bold text-sm">닫기</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}