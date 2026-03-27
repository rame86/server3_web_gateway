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

// 목업 데이터 (UI 확인용)
const mockMedia = [
  { id: 1, title: "'Starry Night' M/V Behind The Scenes", img: "https://images.unsplash.com/photo-1598387181032-a3103a2db5b3?q=80&w=400" },
  { id: 2, title: "NOVA World Tour in Seoul Highlight", img: "https://images.unsplash.com/photo-1540039155732-6762e1c9cc1f?q=80&w=400" },
  { id: 3, title: "Special Dance Practice Video", img: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=400" },
  { id: 4, title: "Lumina Studio Live Session", img: "https://images.unsplash.com/photo-1514525253361-bee871871771?q=80&w=400" },
];

const mockShop = [
  { id: 1, name: "NOVA 공식 응원봉 ver.2", price: 35000, img: "https://images.unsplash.com/photo-1520483601560-389dff434fdf?q=80&w=300" },
  { id: 2, name: "정규 3집 'ECLIPSE' 포토북 세트", price: 28000, img: "https://images.unsplash.com/photo-1544640808-32ca72ac7f37?q=80&w=300" },
];

export default function UserArtistDetail({ params }) {
  const memberId = params?.id; 
  
  const [artist, setArtist] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [fanLetters, setFanLetters] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);

  // 게시글 상세보기 상태
  const [selectedPost, setSelectedPost] = useState(null);
  const [postDetailLoading, setPostDetailLoading] = useState(false);

  const [isDonateOpen, setIsDonateOpen] = useState(false); 
  const [donateAmount, setDonateAmount] = useState(''); 
  const [myPoints, setMyPoints] = useState(0); 
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { sender: 'ai', text: '안녕! 오늘 하루도 잘 보냈어? 기다리고 있었어 😊' }
  ]);

  // 전체 데이터 로드
  useEffect(() => {
    if (!memberId) return;

    const fetchAllData = async () => {
      try {
        setLoading(true);

        // 포인트 정보
        payApi.get('/payment/')
          .then(res => {
            if (res.data?.currentBalance !== undefined) setMyPoints(res.data.currentBalance);
          }).catch(() => console.warn("포인트 정보를 가져올 수 없습니다."));

        // 아티스트 정보 및 팔로우 상태
        const artistRes = await coreApi.get(`/artist/${memberId}`);
        const artistData = artistRes.data;
        
        const followRes = await coreApi.get('/artist/my-follows').catch(() => ({ data: [] }));
        const isFollowed = Array.isArray(followRes.data) && followRes.data.some(f => f.memberId === parseInt(memberId));
        
        setArtist({ ...artistData, isFollowed });

        // 공지 및 팬레터 목록
        const targetId = artistData?.artistId || memberId; 
        const [noticeRes, letterRes] = await Promise.all([
          coreApi.get(`/artist/${targetId}/notices`).catch(() => ({ data: [] })),
          coreApi.get(`/artist/${targetId}/fan-letters`).catch(() => ({ data: [] }))
        ]);

        setAnnouncements(Array.isArray(noticeRes.data) ? noticeRes.data : []);
        setFanLetters(Array.isArray(letterRes.data) ? letterRes.data : []);

      } catch (err) {
        console.error("데이터 로딩 에러:", err);
        toast.error("정보를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, [memberId]);

  // 게시글 상세 정보 가져오기
  const handleOpenPost = useCallback(async (post) => {
    if (!post?.boardId) return;
    
    try {
      setPostDetailLoading(true);
      setSelectedPost(post); 
      
      const res = await coreApi.get(`/board/${post.boardId}`);
      setSelectedPost(res.data); 
    } catch (err) {
      console.error("게시글 상세 로딩 실패:", err);
      toast.error("게시글 내용을 불러오는데 실패했습니다.");
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
      toast.success(artist.isFollowed ? '팔로우가 취소되었습니다.' : '아티스트를 팔로우했습니다!');
    } catch (e) {
      toast.error('요청 처리 중 오류가 발생했습니다.');
    }
  };

  const executeDonation = async () => {
    const amount = parseInt(donateAmount);
    if (!amount || amount <= 0) { toast.error('금액을 입력해주세요.'); return; }
    if (amount > myPoints) { toast.error('포인트가 부족합니다.'); return; }

    try {
      await coreApi.post('/artist/donate', { artistId: parseInt(memberId), amount: amount });
      setMyPoints(prev => prev - amount);
      setIsDonateOpen(false);
      setDonateAmount('');
      toast.success(`${artist?.stageName}님에게 후원했습니다! 🎉`);
    } catch (e) {
      toast.error('후원 처리 중 오류가 발생했습니다.');
    }
  };

  const handleSendMessage = () => {
    if (!chatMessage.trim()) return;
    setChatHistory([...chatHistory, { sender: 'user', text: chatMessage }]);
    setChatMessage('');
    setTimeout(() => {
      setChatHistory(prev => [...prev, { sender: 'ai', text: '그랬구나! 나도 항상 널 응원하고 있어 💖' }]);
    }, 1000);
  };

  const tabs = [
    { id: 'dashboard', label: '대쉬보드', icon: LayoutDashboard },
    { id: 'media', label: '미디어', icon: PlaySquare },
    { id: 'community', label: '커뮤니티', icon: Bell },
    { id: 'shop', label: '굿즈샵', icon: ShoppingBag },
    { id: 'chatbot', label: '가상챗봇', icon: MessageCircle },
    { id: 'ai_recommend', label: 'AI 추천', icon: Sparkles },
  ];

  const latestNotice = announcements?.length > 0 ? announcements[0] : null;
  const latestArtistLetter = fanLetters?.find(l => l.isArtist === true || l.authorRole === 'ARTIST') || (fanLetters?.length > 0 ? fanLetters[0] : null);
  const latestFanLetter = fanLetters?.find(l => l.isArtist === false && l.authorRole !== 'ARTIST') || (fanLetters?.length > 1 ? fanLetters[1] : fanLetters[0]);
  
  if (loading) return <Layout role="user"><div className="p-10 text-center text-rose-500 font-bold italic tracking-widest">Lumina 로딩 중...</div></Layout>;
  if (!artist) return <Layout role="user"><div className="p-10 text-center">아티스트 정보가 없습니다.</div></Layout>;

  return (
    <Layout role="user">
      <div className="pb-10 relative">
        {/* 헤더 영역 */}
        <div className="relative h-64 md:h-80 w-full overflow-hidden">
          <img src={artist.fandomImage || "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=1200"} alt="cover" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 w-full p-6 lg:px-12 flex flex-col md:flex-row items-end md:items-center justify-between gap-4">
            <div className="flex items-end gap-4 text-white">
              <img src={artist.profileImageUrl || "https://placehold.co/200x200"} alt={artist.stageName} className="w-24 h-24 md:w-32 md:h-32 rounded-2xl object-cover ring-4 ring-white/20 backdrop-blur-sm shadow-2xl transition-transform hover:scale-105" />
              <div className="pb-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/90 mb-2 inline-block uppercase tracking-wider">Lumina Fandom</span>
                <h1 className="text-3xl md:text-4xl font-bold drop-shadow-lg">{artist.stageName}</h1>
                <p className="opacity-90 text-sm font-medium">{artist.category || 'Artist'} • 팬 {artist.followerCount?.toLocaleString() || 0}명</p>
              </div>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <button onClick={() => setIsDonateOpen(true)} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-orange-400 text-amber-950 font-bold hover:from-amber-500 hover:to-orange-500 transition-all shadow-lg active:scale-95">
                <Gift size={18} /> 후원하기
              </button>
              <button onClick={handleFollowToggle} className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold transition-all shadow-lg active:scale-95 ${artist.isFollowed ? 'bg-white/20 backdrop-blur-md text-white border border-white/30 hover:bg-white/30' : 'bg-rose-500 text-white hover:bg-rose-600'}`}>
                <Heart size={18} fill={artist.isFollowed ? 'currentColor' : 'none'} /> {artist.isFollowed ? '팔로잉' : '팔로우'}
              </button>
            </div>
          </div>
        </div>

        {/* 메인 콘텐츠 */}
        <div className="p-4 lg:p-6 lg:px-12 space-y-6">
          {/* 커스텀 탭 네비게이션 */}
          <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-2 border-b border-gray-100">
            {tabs.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-rose-50 text-rose-600 border border-rose-100 shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}>
                <tab.icon size={16} /> {tab.label}
              </button>
            ))}
          </div>

          <div className="fade-in-up mt-6">
            {/* 1. 대쉬보드 */}
            {activeTab === 'dashboard' && (
              <div className="grid md:grid-cols-2 gap-6">
                <div className="glass-card p-6 rounded-2xl bg-white border border-gray-100 shadow-sm">
                  <h3 className="font-bold flex items-center gap-2 mb-4 text-gray-800"><Bell size={18} className="text-rose-500"/> 최근 주요 소식</h3>
                  <div className="space-y-3">
                    {latestNotice && (
                      <div onClick={() => handleDashboardPostClick(latestNotice)} className="p-3 rounded-xl bg-gray-50 border border-gray-100 hover:border-gray-300 cursor-pointer transition-all active:scale-[0.98]">
                        <div className="flex justify-between mb-1"><span className="text-[10px] font-bold text-gray-600 bg-gray-200 px-2 py-0.5 rounded-md uppercase">Notice</span><span className="text-[10px] text-muted-foreground">{latestNotice.createdAt?.split('T')[0]}</span></div>
                        <p className="text-sm font-semibold line-clamp-1">{latestNotice.title}</p>
                      </div>
                    )}
                    {latestArtistLetter && (
                      <div onClick={() => handleDashboardPostClick(latestArtistLetter)} className="p-3 rounded-xl bg-rose-50 border border-rose-100 hover:border-rose-300 cursor-pointer transition-all active:scale-[0.98]">
                        <div className="flex justify-between mb-1"><span className="text-[10px] font-bold text-rose-600 uppercase">Artist</span><span className="text-[10px] text-muted-foreground">{latestArtistLetter.createdAt?.split('T')[0]}</span></div>
                        <p className="text-sm font-semibold line-clamp-1">{latestArtistLetter.title}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="glass-card p-6 rounded-2xl bg-white border border-gray-100 shadow-sm">
                  <h3 className="font-bold flex items-center gap-2 mb-4 text-gray-800"><PlaySquare size={18} className="text-rose-500"/> 최근 미디어</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {mockMedia.slice(0, 2).map(media => (
                      <div key={media.id} className="group relative rounded-xl overflow-hidden aspect-video cursor-pointer shadow-sm">
                        <img src={media.img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <Play className="text-white fill-white" size={24} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 📍 2. 미디어 탭 (복원 완료) */}
            {activeTab === 'media' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {mockMedia.map(media => (
                  <div key={media.id} className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 cursor-pointer transition-all hover:shadow-xl">
                    <div className="aspect-video relative overflow-hidden">
                      <img src={media.img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-all">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                          <Play size={24} fill="white" />
                        </div>
                      </div>
                      <span className="absolute bottom-3 right-3 bg-black/60 text-white text-[10px] px-2 py-1 rounded font-bold">03:45</span>
                    </div>
                    <div className="p-4">
                      <h4 className="font-bold text-gray-800 line-clamp-1 group-hover:text-rose-600 transition-colors">{media.title}</h4>
                      <div className="flex items-center gap-2 mt-2 text-gray-400 text-[11px] font-medium">
                        <span>{artist.stageName}</span>
                        <span className="w-0.5 h-0.5 bg-gray-300 rounded-full" />
                        <span>2026.03.27</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 3. 커뮤니티 */}
            {activeTab === 'community' && (
              <div className="glass-card p-6 rounded-2xl bg-white border border-gray-100 shadow-sm">
                <h3 className="font-bold flex items-center gap-2 mb-6 text-gray-800"><MessageSquare size={18} className="text-rose-500"/> 팬 여러분께</h3>
                <div className="space-y-3">
                  {announcements.map((notice) => (
                    <div key={notice.boardId} onClick={() => handleOpenPost(notice)} className="flex items-center justify-between p-4 border border-rose-100 rounded-xl bg-rose-50/30 hover:bg-rose-50 cursor-pointer group transition-all">
                      <div className="flex items-center gap-4">
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-gray-800 text-white uppercase">공지</span>
                        <p className="font-medium text-sm group-hover:text-rose-600">{notice.title}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">{notice.createdAt?.split('T')[0]}</span>
                    </div>
                  ))}
                  {fanLetters.map((letter) => (
                    <div key={letter.boardId} onClick={() => handleOpenPost(letter)} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl bg-white hover:shadow-md cursor-pointer group transition-all">
                      <div className="flex items-center gap-4">
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-rose-100 text-rose-600 uppercase">팬레터</span>
                        <p className="font-medium text-sm group-hover:text-rose-600">{letter.title}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">{letter.createdAt?.split('T')[0]}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. 굿즈샵 */}
            {activeTab === 'shop' && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {mockShop.map(item => (
                  <div key={item.id} className="group bg-white p-3 rounded-2xl border border-gray-100 hover:shadow-lg transition-all cursor-pointer">
                    <div className="aspect-square rounded-xl mb-3 overflow-hidden relative bg-gray-50 shadow-inner">
                      <img src={item.img} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      <button className="absolute bottom-2 right-2 bg-white/90 backdrop-blur p-2 rounded-full shadow-md text-gray-700 hover:text-rose-500 transition-all">
                        <ShoppingCart size={16} />
                      </button>
                    </div>
                    <p className="font-semibold text-sm line-clamp-2 px-1 text-gray-800">{item.name}</p>
                    <p className="font-bold text-rose-600 mt-1 px-1">{item.price.toLocaleString()}원</p>
                  </div>
                ))}
              </div>
            )}
            
            {/* 5. 가상챗봇 */}
            {activeTab === 'chatbot' && (
              <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-gray-100 shadow-2xl overflow-hidden h-[550px] flex flex-col">
                <div className="bg-rose-500 p-4 text-white flex items-center justify-between shadow-md">
                  <div className="flex items-center gap-3">
                    <img src={artist.profileImageUrl} className="w-10 h-10 rounded-full bg-white object-cover" />
                    <span className="font-bold">{artist.stageName} AI</span>
                  </div>
                  <X size={20} className="cursor-pointer opacity-60" onClick={() => setActiveTab('dashboard')} />
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
                  {chatHistory.map((chat, idx) => (
                    <div key={idx} className={`flex ${chat.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] p-3.5 rounded-2xl text-[13px] ${chat.sender === 'user' ? 'bg-rose-500 text-white rounded-tr-none' : 'bg-white border border-gray-100 text-gray-800 rounded-tl-none'}`}>
                        {chat.text}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-4 border-t bg-white flex gap-2">
                  <input type="text" value={chatMessage} onChange={(e) => setChatMessage(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()} placeholder="메시지 입력..." className="flex-1 bg-gray-100 border-none rounded-2xl px-5 py-3 text-sm focus:ring-2 focus:ring-rose-500/20 focus:outline-none" />
                  <button onClick={handleSendMessage} className="p-3 bg-rose-500 text-white rounded-2xl shadow-lg active:scale-95 transition-all"><Send size={20} /></button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 게시글 상세보기 모달 */}
      {selectedPost && (
        <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center p-0 md:p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl h-[85vh] md:h-auto md:max-h-[85vh] rounded-t-3xl md:rounded-3xl shadow-2xl overflow-hidden flex flex-col">
            <div className="p-5 border-b flex items-center justify-between">
              <h4 className="font-bold">POST</h4>
              <button onClick={() => setSelectedPost(null)}><X size={24} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
              {postDetailLoading ? (
                <div className="py-20 text-center text-gray-400">내용을 불러오고 있어요...</div>
              ) : (
                <>
                  <div className="space-y-3">
                    <h2 className="text-2xl font-bold text-gray-900">{selectedPost.title}</h2>
                    <p className="text-xs text-gray-400">{selectedPost.createdAt?.replace('T', ' ').slice(0, 16)}</p>
                  </div>
                  <div className="h-px bg-gray-100 w-full" />
                  <div className="text-gray-700 leading-relaxed whitespace-pre-wrap min-h-[250px]">
                    {selectedPost.content || "내용이 없습니다."}
                  </div>
                </>
              )}
            </div>
            <div className="p-5 border-t bg-gray-50 flex justify-end">
              <button onClick={() => setSelectedPost(null)} className="px-6 py-2 bg-gray-900 text-white rounded-xl font-bold">닫기</button>
            </div>
          </div>
        </div>
      )}

      {/* 후원 모달 */}
      {isDonateOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl">
            <h3 className="text-xl font-bold text-gray-900 mb-6">포인트 후원</h3>
            <div className="bg-rose-50 p-5 rounded-2xl mb-8 text-center border border-rose-100">
              <p className="text-[11px] font-bold text-rose-400 mb-1 uppercase">My Balance</p>
              <p className="text-2xl font-bold text-rose-600">{myPoints.toLocaleString()} P</p>
            </div>
            <input type="number" value={donateAmount} onChange={(e) => setDonateAmount(e.target.value)} placeholder="0" className="w-full text-center text-3xl font-bold py-3 border-b-2 border-rose-500 focus:outline-none mb-10" />
            <button onClick={executeDonation} className="w-full bg-rose-500 text-white py-4 rounded-2xl font-bold hover:bg-rose-600 transition-all shadow-xl active:scale-95">후원 보내기</button>
          </div>
        </div>
      )}
    </Layout>
  );
}