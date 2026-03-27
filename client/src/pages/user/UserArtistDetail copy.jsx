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

// 목업 데이터 (미디어 및 샵)
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

        // 1. 기본 정보 병렬 조회
        const [artistRes, followRes, payRes] = await Promise.all([
          coreApi.get(`/artist/${memberId}`),
          coreApi.get('/artist/my-follows').catch(() => ({ data: [] })),
          payApi.get('/payment/').catch(() => ({ data: { currentBalance: 0 } }))
        ]);
        
        const artistData = artistRes.data;
        const isFollowed = Array.isArray(followRes.data) && followRes.data.some(f => f.memberId === memberId);
        
        setArtist({ ...artistData, isFollowed });
        if (payRes.data?.currentBalance !== undefined) setMyPoints(payRes.data.currentBalance);

        // 2. 게시글 정보 조회
        const targetId = artistData?.artistId || memberId; 
        const [noticeRes, letterRes] = await Promise.all([
          coreApi.get(`/artist/${targetId}/notices`).catch(() => ({ data: [] })),
          coreApi.get(`/artist/${targetId}/fan-letters`).catch(() => ({ data: [] }))
        ]);

        // 데이터가 잘 오는지 콘솔로 확인해보세요!
        console.log("Notices:", noticeRes.data);
        console.log("Letters:", letterRes.data);

        setAnnouncements(Array.isArray(noticeRes.data) ? noticeRes.data : []);
        setFanLetters(Array.isArray(letterRes.data) ? letterRes.data : []);

      } catch (err) {
        console.error(err);
        toast.error("정보를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, [memberId]);

  // [수정 포인트] 필터링 조건을 좀 더 포괄적으로 변경하여 데이터가 누락되지 않게 함
  // 1. 공지사항: category에 '공지'라는 단어가 포함되어 있으면 모두 포함
  const latestNotices = announcements
    .filter(p => p.category?.includes('공지'))
    .slice(0, 1);

  // 2. 아티스트 레터: role이 'ARTIST'이거나 category가 '아티스트'인 경우
  const latestArtistLetters = fanLetters
    .filter(p => p.authorRole === 'ARTIST' || p.category === '아티스트')
    .slice(0, 1);

  // 3. 팬레터: 위 두 조건에 해당하지 않는 나머지 모든 글
  const latestFanLetters = fanLetters
    .filter(p => 
      !p.category?.includes('공지') && 
      p.authorRole !== 'ARTIST' && 
      p.category !== '아티스트'
    )
    .slice(0, 1);

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
      const nextFollowStatus = !artist.isFollowed;
      setArtist(p => ({ ...p, isFollowed: nextFollowStatus }));
      toast.success(nextFollowStatus ? '팔로우 성공!' : '팔로우 취소');
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
    const userMsg = { sender: 'user', text: chatMessage };
    setChatHistory(prev => [...prev, userMsg]);
    setChatMessage('');
    
    setTimeout(() => {
      setChatHistory(prev => [...prev, { sender: 'ai', text: '항상 너의 곁에서 응원하고 있어 💖' }]);
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
          <img src={artist.fandomImage || "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=1200"} className="w-full h-full object-cover" alt="fandom" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 w-full p-6 lg:px-12 flex flex-col md:flex-row items-end md:items-center justify-between gap-4">
            <div className="flex items-end gap-4 text-white">
              <img src={artist.profileImageUrl || "https://placehold.co/200x200"} className="w-24 h-24 md:w-32 md:h-32 rounded-2xl object-cover ring-4 ring-white/20 shadow-2xl" alt="profile" />
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
            {/* 1. 대쉬보드 */}
            {activeTab === 'dashboard' && (
              <div className="grid md:grid-cols-2 gap-6">
                <div className="glass-card p-6 rounded-2xl bg-white border border-gray-100 shadow-sm">
                  <h3 className="font-bold flex items-center gap-2 mb-4 text-gray-800"><Bell size={18} className="text-rose-500"/> 최근 주요 소식</h3>
                  <div className="space-y-3">
                    {/* 공지사항 */}
                    {latestNotices.map(notice => (
                      <div key={`notice-${notice.boardId}`} onClick={() => handleDashboardPostClick(notice)} className="p-3 rounded-xl bg-gray-50 border border-gray-100 hover:border-gray-300 cursor-pointer transition-colors">
                        <div className="flex justify-between mb-1">
                          <span className="text-[10px] font-bold text-gray-600 bg-gray-200 px-2 py-0.5 rounded-md uppercase">Notice</span>
                          <span className="text-[10px] text-muted-foreground">{notice.createdAt?.split('T')[0]}</span>
                        </div>
                        <p className="text-sm font-semibold line-clamp-1">{notice.title}</p>
                      </div>
                    ))}
                    {/* 아티스트 글 */}
                    {latestArtistLetters.map(letter => (
                      <div key={`artist-${letter.boardId}`} onClick={() => handleDashboardPostClick(letter)} className="p-3 rounded-xl bg-rose-50 border border-rose-100 hover:border-rose-300 cursor-pointer transition-colors">
                        <div className="flex justify-between mb-1">
                          <span className="text-[10px] font-bold text-rose-600 uppercase">Artist</span>
                          <span className="text-[10px] text-muted-foreground">{letter.createdAt?.split('T')[0]}</span>
                        </div>
                        <p className="text-sm font-semibold line-clamp-1">{letter.title}</p>
                      </div>
                    ))}
                    {/* 팬레터 글 */}
                    {latestFanLetters.map(letter => (
                      <div key={`fan-${letter.boardId}`} onClick={() => handleDashboardPostClick(letter)} className="p-3 rounded-xl bg-blue-50 border border-blue-100 hover:border-blue-300 cursor-pointer transition-colors">
                        <div className="flex justify-between mb-1">
                          <span className="text-[10px] font-bold text-blue-600 uppercase">Fan</span>
                          <span className="text-[10px] text-muted-foreground">{letter.createdAt?.split('T')[0]}</span>
                        </div>
                        <p className="text-sm font-semibold line-clamp-1">{letter.title}</p>
                      </div>
                    ))}
                    
                    {/* [체크] 데이터가 하나라도 있으면 위 목록이 나오고, 아예 없으면 아래 문구가 나옵니다. */}
                    {latestNotices.length === 0 && latestArtistLetters.length === 0 && latestFanLetters.length === 0 && (
                      <div className="py-10 text-center text-gray-300 text-sm italic border-2 border-dashed border-gray-100 rounded-xl">
                        등록된 최신 소식이 없습니다.
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="glass-card p-6 rounded-2xl bg-white border border-gray-100 shadow-sm">
                  <h3 className="font-bold flex items-center gap-2 mb-4 text-gray-800"><PlaySquare size={18} className="text-rose-500"/> 최근 미디어</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {mockMedia.map(media => (
                      <div key={media.id} className="group relative rounded-xl overflow-hidden aspect-video cursor-pointer">
                        <img src={media.img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={media.title} />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Play className="text-white fill-white" size={24} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {/* ... 나머지 탭(media, community, shop, chatbot)은 이전 코드와 동일 ... */}
            {activeTab === 'media' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {mockMedia.map(media => (
                  <div key={media.id} className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm group cursor-pointer">
                    <div className="relative aspect-video">
                      <img src={media.img} className="w-full h-full object-cover" alt={media.title} />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-all">
                        <Play className="text-white fill-white" size={32} />
                      </div>
                    </div>
                    <div className="p-4">
                      <p className="font-bold text-gray-800 line-clamp-1">{media.title}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

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

            {activeTab === 'shop' && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {mockShop.map(item => (
                  <div key={item.id} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all">
                    <img src={item.img} className="w-full aspect-square object-cover rounded-xl mb-4" alt={item.name} />
                    <h4 className="font-bold text-sm mb-1 line-clamp-1">{item.name}</h4>
                    <p className="text-rose-500 font-bold text-lg">{item.price.toLocaleString()}원</p>
                    <button className="w-full mt-3 py-2 bg-gray-900 text-white rounded-lg text-xs font-bold hover:bg-rose-500 transition-colors flex items-center justify-center gap-2">
                      <ShoppingCart size={14} /> 담기
                    </button>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'chatbot' && (
              <div className="max-w-2xl mx-auto flex flex-col h-[500px] bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
                <div className="p-4 bg-rose-500 text-white font-bold flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  {artist.stageName} AI와 대화 중
                </div>
                <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/50">
                  {chatHistory.map((chat, idx) => (
                    <div key={idx} className={`flex ${chat.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] p-3 px-4 rounded-2xl text-sm shadow-sm ${chat.sender === 'user' ? 'bg-rose-500 text-white rounded-tr-none' : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'}`}>
                        {chat.text}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-4 bg-white border-t flex gap-2">
                  <input value={chatMessage} onChange={(e) => setChatMessage(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} placeholder="메시지를 입력하세요..." className="flex-1 bg-gray-100 border-none rounded-xl px-4 text-sm focus:ring-2 focus:ring-rose-500 outline-none" />
                  <button onClick={handleSendMessage} className="p-3 bg-rose-500 text-white rounded-xl hover:bg-rose-600 transition-colors"><Send size={18} /></button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 모달: 게시글 상세 */}
      {selectedPost && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedPost(null)}>
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b flex items-center justify-between">
              <h4 className="font-bold flex items-center gap-2"><Star size={18} className="text-amber-400 fill-amber-400" /> 상세 내용</h4>
              <button onClick={() => setSelectedPost(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={24} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-8 space-y-6">
              {postDetailLoading ? (
                <div className="py-20 text-center flex flex-col items-center gap-4 text-rose-500">
                  <div className="w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
                  불러오는 중...
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-rose-500 uppercase tracking-widest">{selectedPost.category || 'POST'}</span>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">{selectedPost.title}</h2>
                    <p className="text-xs text-gray-400 flex items-center gap-1"><Calendar size={12} /> {selectedPost.createdAt?.split('T')[0]}</p>
                  </div>
                  <div className="h-px bg-gray-100 w-full" />
                  <div className="text-gray-700 whitespace-pre-wrap leading-relaxed min-h-[200px] text-lg">{selectedPost.content}</div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 모달: 후원하기 */}
      {isDonateOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setIsDonateOpen(false)}>
          <div className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><Gift size={22} className="text-rose-500" /> 포인트 후원</h3>
            <div className="bg-rose-50 p-5 rounded-2xl mb-8 text-center border border-rose-100">
              <p className="text-[11px] font-bold text-rose-400 mb-1 uppercase tracking-wider">My Balance</p>
              <p className="text-3xl font-bold text-rose-600">{myPoints.toLocaleString()} P</p>
            </div>
            <div className="relative mb-10">
              <input type="number" value={donateAmount} onChange={(e) => setDonateAmount(e.target.value)} placeholder="0" className="w-full text-center text-4xl font-bold py-3 border-b-2 border-rose-500 focus:outline-none bg-transparent" />
              <span className="absolute right-0 bottom-4 font-bold text-gray-400">P</span>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setIsDonateOpen(false)} className="flex-1 bg-gray-100 py-4 rounded-2xl font-bold hover:bg-gray-200 transition-colors">취소</button>
              <button onClick={executeDonation} className="flex-[2] bg-rose-500 text-white py-4 rounded-2xl font-bold shadow-lg shadow-rose-200 hover:bg-rose-600 active:scale-95 transition-all">후원 보내기</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}