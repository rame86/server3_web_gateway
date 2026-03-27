import { useEffect, useState, useCallback } from 'react';
import Layout from '@/components/Layout';
import { 
  Heart, MessageCircle, PlaySquare, ShoppingBag, 
  Bell, Gift, Sparkles, LayoutDashboard, X, 
  Send, Play, MessageSquare, ShoppingCart,
  Star, User as UserIcon, Calendar
} from 'lucide-react';
import { toast } from 'sonner';
import { coreApi, payApi } from '@/lib/api';

// 목업 데이터 (고정)
const mockMedia = [
  { id: 1, title: "'Starry Night' M/V Behind The Scenes", img: "https://images.unsplash.com/photo-1598387181032-a3103a2db5b3?q=80&w=400" },
  { id: 2, title: "NOVA World Tour in Seoul Highlight", img: "https://images.unsplash.com/photo-1540039155732-6762e1c9cc1f?q=80&w=400" },
];

const mockShop = [
  { id: 1, name: "NOVA 공식 응원봉 ver.2", price: 35000, img: "https://images.unsplash.com/photo-1520483601560-389dff434fdf?q=80&w=300" },
  { id: 2, name: "정규 3집 'ECLIPSE' 포토북 세트", price: 28000, img: "https://images.unsplash.com/photo-1544640808-32ca72ac7f37?q=80&w=300" },
];

export default function UserArtistDetail({ params }) {
  const memberId = params?.id ? parseInt(params.id) : null; 
  
  const [artist, setArtist] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [fanLetters, setFanLetters] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);

  const [selectedPost, setSelectedPost] = useState(null);
  const [postDetailLoading, setPostDetailLoading] = useState(false);

  const [isDonateOpen, setIsDonateOpen] = useState(false); 
  const [donateAmount, setDonateAmount] = useState(''); 
  const [myPoints, setMyPoints] = useState(0); 
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { sender: 'ai', text: '안녕! 오늘 하루도 잘 보냈어? 기다리고 있었어 😊' }
  ]);

  useEffect(() => {
    if (!memberId) return;

    const fetchAllData = async () => {
      try {
        setLoading(true);
        // 포인트 정보 조회
        payApi.get('/payment/').then(res => {
          if (res.data?.currentBalance !== undefined) setMyPoints(res.data.currentBalance);
        }).catch(() => {});

        // 아티스트 및 팔로우 정보
        const [artistRes, followRes] = await Promise.all([
          coreApi.get(`/artist/${memberId}`),
          coreApi.get('/artist/my-follows').catch(() => ({ data: [] }))
        ]);
        
        const artistData = artistRes.data;
        const isFollowed = Array.isArray(followRes.data) && followRes.data.some(f => f.memberId === memberId);
        setArtist({ ...artistData, isFollowed });

        // 공지 및 팬레터 조회
        const targetId = artistData?.artistId || memberId; 
        const [noticeRes, letterRes] = await Promise.all([
          coreApi.get(`/artist/${targetId}/notices`).catch(() => ({ data: [] })),
          coreApi.get(`/artist/${targetId}/fan-letters`).catch(() => ({ data: [] }))
        ]);

        setAnnouncements(Array.isArray(noticeRes.data) ? noticeRes.data : []);
        setFanLetters(Array.isArray(letterRes.data) ? letterRes.data : []);

      } catch (err) {
        toast.error("정보를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, [memberId]);

  // [중요 수정] 데이터 필터링 로직: 중복 방지를 위해 authorRole과 category를 엄격히 구분
  const latestNotices = announcements.filter(p => p.category === '공지사항').slice(0, 2);
  
  // 아티스트레터: 작성자가 ARTIST인 경우만
  const latestArtistLetters = fanLetters.filter(p => p.authorRole === 'ARTIST').slice(0, 2);
  
  // 팬레터: 작성자가 USER이면서 공지사항이 아닌 경우만
  const latestFanLetters = fanLetters.filter(p => p.authorRole === 'USER' && p.category !== '공지사항').slice(0, 2);

  const handleOpenPost = useCallback(async (post) => {
    if (!post?.boardId) return;
    try {
      setPostDetailLoading(true);
      setSelectedPost(post); 
      const res = await coreApi.get(`/board/${post.boardId}`);
      setSelectedPost(res.data); 
    } catch (err) {
      toast.error("게시글 로딩 실패");
    } finally {
      setPostDetailLoading(false);
    }
  }, []);

  const handleDashboardPostClick = (post) => {
    setActiveTab('community');
    handleOpenPost(post);
  };

  const handleFollowToggle = async () => {
    try {
      await coreApi.post(`/artist/follow/${memberId}`);
      setArtist(p => ({ ...p, isFollowed: !p.isFollowed }));
      toast.success(artist.isFollowed ? '팔로우 취소' : '팔로우 성공!');
    } catch (e) {
      toast.error('요청 실패');
    }
  };

  const executeDonation = async () => {
    const amount = parseInt(donateAmount);
    if (!amount || amount <= 0) { toast.error('금액을 입력해주세요.'); return; }
    if (amount > myPoints) { toast.error('포인트가 부족합니다.'); return; }
    try {
      await coreApi.post('/artist/donate', { artistId: memberId, amount: amount });
      setMyPoints(prev => prev - amount);
      setIsDonateOpen(false);
      setDonateAmount('');
      toast.success(`${artist?.stageName}님에게 후원했습니다!`);
    } catch (e) {
      toast.error('후원 실패');
    }
  };

  const handleSendMessage = () => {
    if (!chatMessage.trim()) return;
    setChatHistory(prev => [...prev, { sender: 'user', text: chatMessage }]);
    setChatMessage('');
    setTimeout(() => {
      setChatHistory(prev => [...prev, { sender: 'ai', text: '항상 널 응원하고 있어 💖' }]);
    }, 1000);
  };

  const tabs = [
    { id: 'dashboard', label: '대쉬보드', icon: LayoutDashboard },
    { id: 'media', label: '미디어', icon: PlaySquare },
    { id: 'community', label: '커뮤니티', icon: Bell },
    { id: 'shop', label: '굿즈샵', icon: ShoppingBag },
    { id: 'chatbot', label: '가상챗봇', icon: MessageCircle },
  ];

  if (!memberId) return <Layout role="user"><div className="p-10 text-center">잘못된 접근입니다.</div></Layout>;
  if (loading) return <Layout role="user"><div className="p-10 text-center text-rose-500 font-bold italic">Lumina 로딩 중...</div></Layout>;
  if (!artist) return <Layout role="user"><div className="p-10 text-center">정보가 없습니다.</div></Layout>;

  return (
    <Layout role="user">
      <div className="pb-10 relative">
        {/* 프로필 상단 영역 */}
        <div className="relative h-64 md:h-80 w-full overflow-hidden">
          <img src={artist.fandomImage || "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=1200"} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 w-full p-6 lg:px-12 flex flex-col md:flex-row items-end md:items-center justify-between gap-4">
            <div className="flex items-end gap-4 text-white">
              <img src={artist.profileImageUrl || "https://placehold.co/200x200"} className="w-24 h-24 md:w-32 md:h-32 rounded-2xl object-cover ring-4 ring-white/20 shadow-2xl" />
              <div className="pb-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/90 mb-2 inline-block uppercase tracking-wider">Lumina Artist</span>
                <h1 className="text-3xl md:text-4xl font-bold">{artist.stageName}</h1>
                <p className="opacity-90 text-sm">팬 {artist.followerCount?.toLocaleString() || 0}명</p>
              </div>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <button onClick={() => setIsDonateOpen(true)} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-amber-400 text-amber-950 font-bold shadow-lg active:scale-95 transition-all">
                <Gift size={18} /> 후원하기
              </button>
              <button onClick={handleFollowToggle} className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold shadow-lg active:scale-95 transition-all ${artist.isFollowed ? 'bg-white/20 text-white' : 'bg-rose-500 text-white'}`}>
                <Heart size={18} fill={artist.isFollowed ? 'currentColor' : 'none'} /> {artist.isFollowed ? '팔로잉' : '팔로우'}
              </button>
            </div>
          </div>
        </div>

        <div className="p-4 lg:p-6 lg:px-12 space-y-6">
          {/* 탭 네비게이션 */}
          <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-2 border-b border-gray-100">
            {tabs.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-rose-50 text-rose-600 border border-rose-100 shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}>
                <tab.icon size={16} /> {tab.label}
              </button>
            ))}
          </div>

          <div className="mt-6">
            {/* 대쉬보드 영역 */}
            {activeTab === 'dashboard' && (
              <div className="grid md:grid-cols-2 gap-6">
                <div className="glass-card p-6 rounded-2xl bg-white border border-gray-100 shadow-sm">
                  <h3 className="font-bold flex items-center gap-2 mb-4 text-gray-800"><Bell size={18} className="text-rose-500"/> 최근 주요 소식</h3>
                  <div className="space-y-3">
                    {/* 1. 공지사항 출력 */}
                    {latestNotices.map(notice => (
                      <div key={`notice-${notice.boardId}`} onClick={() => handleDashboardPostClick(notice)} className="p-3 rounded-xl bg-gray-50 border border-gray-100 hover:border-gray-300 cursor-pointer">
                        <div className="flex justify-between mb-1">
                          <span className="text-[10px] font-bold text-gray-600 bg-gray-200 px-2 py-0.5 rounded-md uppercase">Notice</span>
                          <span className="text-[10px] text-muted-foreground">{notice.createdAt?.split('T')[0]}</span>
                        </div>
                        <p className="text-sm font-semibold line-clamp-1">{notice.title}</p>
                      </div>
                    ))}

                    {/* 2. 아티스트 글 출력 */}
                    {latestArtistLetters.map(letter => (
                      <div key={`artist-${letter.boardId}`} onClick={() => handleDashboardPostClick(letter)} className="p-3 rounded-xl bg-rose-50 border border-rose-100 hover:border-rose-300 cursor-pointer">
                        <div className="flex justify-between mb-1">
                          <span className="text-[10px] font-bold text-rose-600 uppercase">Artist</span>
                          <span className="text-[10px] text-muted-foreground">{letter.createdAt?.split('T')[0]}</span>
                        </div>
                        <p className="text-sm font-semibold line-clamp-1">{letter.title}</p>
                      </div>
                    ))}

                    {/* 3. 팬레터 글 출력 */}
                    {latestFanLetters.map(letter => (
                      <div key={`fan-${letter.boardId}`} onClick={() => handleDashboardPostClick(letter)} className="p-3 rounded-xl bg-blue-50 border border-blue-100 hover:border-blue-300 cursor-pointer">
                        <div className="flex justify-between mb-1">
                          <span className="text-[10px] font-bold text-blue-600 uppercase">Fan</span>
                          <span className="text-[10px] text-muted-foreground">{letter.createdAt?.split('T')[0]}</span>
                        </div>
                        <p className="text-sm font-semibold line-clamp-1">{letter.title}</p>
                      </div>
                    ))}

                    {/* 데이터가 아예 없을 때만 문구 노출 */}
                    {latestNotices.length === 0 && latestArtistLetters.length === 0 && latestFanLetters.length === 0 && (
                      <div className="py-10 text-center text-gray-300 text-sm italic">등록된 소식이 없습니다.</div>
                    )}
                  </div>
                </div>

                {/* 최근 미디어 영역 */}
                <div className="glass-card p-6 rounded-2xl bg-white border border-gray-100 shadow-sm">
                  <h3 className="font-bold flex items-center gap-2 mb-4 text-gray-800"><PlaySquare size={18} className="text-rose-500"/> 최근 미디어</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {mockMedia.map(media => (
                      <div key={media.id} className="group relative rounded-xl overflow-hidden aspect-video cursor-pointer">
                        <img src={media.img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Play className="text-white fill-white" size={24} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {/* 다른 탭은 이전과 동일 (Community, Media, Shop 등) */}
            {activeTab === 'community' && (
               <div className="glass-card p-6 rounded-2xl bg-white border border-gray-100 shadow-sm">
                 <h3 className="font-bold flex items-center gap-2 mb-6 text-gray-800"><MessageSquare size={18} className="text-rose-500"/> 소통 공간</h3>
                 <div className="space-y-3">
                   {announcements.map((notice) => (
                     <div key={notice.boardId} onClick={() => handleOpenPost(notice)} className="flex items-center justify-between p-4 border border-rose-100 rounded-xl bg-rose-50/30 hover:bg-rose-50 cursor-pointer transition-all">
                       <div className="flex items-center gap-4">
                         <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-gray-800 text-white uppercase">공지</span>
                         <p className="font-medium text-sm">{notice.title}</p>
                       </div>
                       <span className="text-xs text-muted-foreground">{notice.createdAt?.split('T')[0]}</span>
                     </div>
                   ))}
                   {fanLetters.map((letter) => (
                     <div key={letter.boardId} onClick={() => handleOpenPost(letter)} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl bg-white hover:shadow-md cursor-pointer transition-all">
                       <div className="flex items-center gap-4">
                         <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase ${letter.authorRole === 'ARTIST' ? 'bg-rose-500 text-white' : 'bg-rose-100 text-rose-600'}`}>
                           {letter.authorRole === 'ARTIST' ? '아티스트' : '팬레터'}
                         </span>
                         <p className="font-medium text-sm">{letter.title}</p>
                       </div>
                       <span className="text-xs text-muted-foreground">{letter.createdAt?.split('T')[0]}</span>
                     </div>
                   ))}
                 </div>
               </div>
            )}
          </div>
        </div>
      </div>

      {/* 모달: 게시글 상세 */}
      {selectedPost && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-5 border-b flex items-center justify-between">
              <h4 className="font-bold">POST</h4>
              <button onClick={() => setSelectedPost(null)}><X size={24} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-8 space-y-6">
              {postDetailLoading ? (
                <div className="py-10 text-center">불러오는 중...</div>
              ) : (
                <>
                  <h2 className="text-2xl font-bold">{selectedPost.title}</h2>
                  <div className="h-px bg-gray-100 w-full" />
                  <div className="text-gray-700 whitespace-pre-wrap min-h-[200px]">{selectedPost.content}</div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 모달: 후원하기 */}
      {isDonateOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl">
            <h3 className="text-xl font-bold mb-6">포인트 후원</h3>
            <div className="bg-rose-50 p-5 rounded-2xl mb-8 text-center">
              <p className="text-[11px] font-bold text-rose-400 mb-1 uppercase">My Balance</p>
              <p className="text-2xl font-bold text-rose-600">{myPoints.toLocaleString()} P</p>
            </div>
            <input type="number" value={donateAmount} onChange={(e) => setDonateAmount(e.target.value)} placeholder="0" className="w-full text-center text-3xl font-bold py-3 border-b-2 border-rose-500 focus:outline-none mb-10" />
            <div className="flex gap-2">
              <button onClick={() => setIsDonateOpen(false)} className="flex-1 bg-gray-100 py-4 rounded-2xl font-bold">취소</button>
              <button onClick={executeDonation} className="flex-[2] bg-rose-500 text-white py-4 rounded-2xl font-bold">후원 보내기</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}