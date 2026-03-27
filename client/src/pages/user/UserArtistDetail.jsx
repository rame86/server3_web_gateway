import { useEffect, useState, useCallback, useMemo } from 'react';
import Layout from '@/components/Layout';
import { 
  Heart, MessageCircle, PlaySquare, ShoppingBag, 
  Bell, Gift, Sparkles, LayoutDashboard, X, 
  Send, Play, MessageSquare, ShoppingCart,
  Star, User as UserIcon, Calendar, Megaphone
} from 'lucide-react';
import { toast } from 'sonner';
import { coreApi, payApi } from '@/lib/api';

// 목업 데이터
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

  // 날짜 포맷팅 헬퍼
  const formatDate = (dateStr) => dateStr ? dateStr.split('T')[0] : '';

  useEffect(() => {
    if (!memberId) return;

    const fetchAllData = async () => {
      try {
        setLoading(true);

        // 1. 기본 정보, 팔로우 상태, 포인트 병렬 조회 (MSA 구조 대응)
        const [artistRes, followRes, payRes] = await Promise.allSettled([
          coreApi.get(`/artist/${memberId}`),
          coreApi.get('/artist/my-follows'),
          payApi.get('/payment/')
        ]);
        
        // 아티스트 데이터 추출
        const artistData = artistRes.status === 'fulfilled' 
          ? (Array.isArray(artistRes.value.data) ? artistRes.value.data[0] : artistRes.value.data)
          : null;

        if (!artistData) throw new Error("Artist not found");

        // 팔로우 상태 확인
        const isFollowed = followRes.status === 'fulfilled' && Array.isArray(followRes.value.data)
          ? followRes.value.data.some(f => f.artistId === artistData.artistId || f.memberId === memberId)
          : false;
        
        setArtist({ ...artistData, isFollowed });
        setMyPoints(payRes.status === 'fulfilled' ? (payRes.value.data?.currentBalance ?? 0) : 0);

        // 2. 게시글 정보 조회 (Artist ID 우선 사용)
        const targetId = artistData.artistId || memberId; 
        const [noticeRes, letterRes] = await Promise.allSettled([
          coreApi.get(`/artist/${targetId}/notices`),
          coreApi.get(`/artist/${targetId}/fan-letters`)
        ]);

        setAnnouncements(noticeRes.status === 'fulfilled' ? noticeRes.value.data : []);
        setFanLetters(letterRes.status === 'fulfilled' ? letterRes.value.data : []);

      } catch (err) {
        console.error("Data Load Error:", err);
        toast.error("정보를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, [memberId]);

  // 대시보드 필터링 (Memoization)
  const dashboardData = useMemo(() => {
    const notices = announcements
      .filter(p => p.category?.includes('공지') || p.type?.includes('NOTICE'))
      .slice(0, 1);

    const artistLetters = fanLetters
      .filter(p => p.authorRole === 'ARTIST' || p.category === '아티스트' || p.artistPost)
      .slice(0, 1);

    const commonFanLetters = fanLetters
      .filter(p => 
        !p.category?.includes('공지') && 
        p.authorRole !== 'ARTIST' && 
        p.category !== '아티스트' &&
        !p.artistPost
      )
      .slice(0, 1);

    return { notices, artistLetters, commonFanLetters };
  }, [announcements, fanLetters]);

  const handleOpenPost = useCallback(async (post) => {
    if (!post?.boardId) return;
    try {
      setSelectedPost(post); 
      setPostDetailLoading(true);
      const res = await coreApi.get(`/board/${post.boardId}`);
      setSelectedPost(res.data); 
    } catch (err) {
      toast.error("상세 내용을 불러올 수 없습니다.");
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
      setArtist(prev => ({ 
        ...prev, 
        isFollowed: nextFollowStatus, 
        followerCount: nextFollowStatus ? (prev.followerCount + 1) : (prev.followerCount - 1) 
      }));
      toast.success(nextFollowStatus ? `${artist.stageName}님을 팔로우합니다! ✨` : '팔로우를 취소했습니다.');
    } catch (e) {
      toast.error('팔로우 처리 중 오류가 발생했습니다.');
    }
  };

  const executeDonation = async () => {
    const amount = parseInt(donateAmount);
    if (isNaN(amount) || amount <= 0) { toast.error('올바른 금액을 입력해주세요.'); return; }
    if (amount > myPoints) { toast.error('보유 포인트가 부족합니다.'); return; }
    
    try {
      await coreApi.post('/artist/donate', { artistId: memberId, amount: amount });
      setMyPoints(prev => prev - amount);
      setIsDonateOpen(false);
      setDonateAmount('');
      toast.success(`${artist?.stageName}님에게 마음을 전달했습니다! 💖`);
    } catch (e) {
      toast.error('후원 처리에 실패했습니다.');
    }
  };

  const handleSendMessage = () => {
    if (!chatMessage.trim()) return;
    const userMsg = { sender: 'user', text: chatMessage };
    setChatHistory(prev => [...prev, userMsg]);
    setChatMessage('');
    
    setTimeout(() => {
      setChatHistory(prev => [...prev, { 
        sender: 'ai', 
        text: `${artist?.stageName} AI: ${chatMessage.includes('안녕') ? '반가워!' : '항상 응원해줘서 고마워요.'} Lumina에서 더 즐거운 시간 보내길 바라! ✨` 
      }]);
    }, 800);
  };

  const tabs = [
    { id: 'dashboard', label: '대쉬보드', icon: LayoutDashboard },
    { id: 'media', label: '미디어', icon: PlaySquare },
    { id: 'community', label: '커뮤니티', icon: Bell },
    { id: 'shop', label: '굿즈샵', icon: ShoppingBag },
    { id: 'chatbot', label: '가상챗봇', icon: MessageCircle },
  ];

  if (!memberId) return <Layout role="user"><div className="p-10 text-center">잘못된 접근입니다.</div></Layout>;
  if (loading) return <Layout role="user"><div className="p-10 text-center text-rose-500 font-bold animate-pulse">Lumina 데이터를 불러오는 중...</div></Layout>;
  if (!artist) return <Layout role="user"><div className="p-10 text-center font-bold py-20 text-slate-400 text-xl">아티스트 정보를 찾을 수 없습니다.</div></Layout>;

  return (
    <Layout role="user">
      <div className="pb-10 relative">
        {/* 아티스트 헤더 */}
        <div className="relative h-64 md:h-80 w-full overflow-hidden">
          <img src={artist.fandomImage || "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=1200"} className="w-full h-full object-cover" alt="fandom" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
          <div className="absolute bottom-0 left-0 w-full p-6 lg:px-12 flex flex-col md:flex-row items-end md:items-center justify-between gap-4">
            <div className="flex items-end gap-5 text-white">
              <img src={artist.profileImageUrl || "https://placehold.co/200x200"} className="w-24 h-24 md:w-36 md:h-36 rounded-3xl object-cover ring-4 ring-white/30 shadow-2xl" alt="profile" />
              <div className="pb-2">
                <div className="flex items-center gap-2 mb-2">
                   <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-black bg-rose-500 text-white uppercase tracking-tighter">Official Artist</span>
                </div>
                <h1 className="text-3xl md:text-5xl font-black tracking-tight">{artist.stageName}</h1>
                <p className="opacity-80 text-sm font-bold mt-1">Fandom {artist.followerCount?.toLocaleString() || 0} Members</p>
              </div>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <button onClick={() => setIsDonateOpen(true)} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-amber-400 text-amber-950 font-black shadow-lg hover:bg-amber-300 transition-all active:scale-95">
                <Gift size={18} /> 후원하기
              </button>
              <button onClick={handleFollowToggle} className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl font-black shadow-lg active:scale-95 transition-all ${artist.isFollowed ? 'bg-white/10 text-white border border-white/20' : 'bg-rose-500 text-white'}`}>
                <Heart size={18} fill={artist.isFollowed ? 'currentColor' : 'none'} /> {artist.isFollowed ? '팔로잉' : '팔로우'}
              </button>
            </div>
          </div>
        </div>

        <div className="p-4 lg:p-6 lg:px-12 space-y-6">
          {/* 탭 네비게이션 */}
          <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-2 border-b border-gray-100">
            {tabs.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-slate-900 text-white shadow-xl' : 'text-gray-400 hover:bg-gray-50'}`}>
                <tab.icon size={16} /> {tab.label}
              </button>
            ))}
          </div>

          <div className="mt-6">
            {activeTab === 'dashboard' && (
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                  <h3 className="font-black text-lg flex items-center gap-2 mb-6 text-slate-900"><Megaphone size={20} className="text-rose-500"/> 최근 업데이트 소식</h3>
                  <div className="space-y-4">
                    {dashboardData.notices.map(notice => (
                      <div key={`notice-${notice.boardId}`} onClick={() => handleDashboardPostClick(notice)} className="group p-5 rounded-3xl bg-slate-900 text-white cursor-pointer transition-all hover:translate-y-[-2px] hover:shadow-xl">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-[10px] font-black text-rose-400 uppercase">Official Notice</span>
                          <span className="text-[10px] opacity-50 font-bold">{formatDate(notice.createdAt)}</span>
                        </div>
                        <p className="text-sm font-bold group-hover:text-rose-300 transition-colors">{notice.title}</p>
                      </div>
                    ))}
                    {dashboardData.artistLetters.map(letter => (
                      <div key={`artist-${letter.boardId}`} onClick={() => handleDashboardPostClick(letter)} className="group p-5 rounded-3xl bg-rose-50 border border-rose-100 cursor-pointer transition-all hover:translate-y-[-2px]">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-[10px] font-black text-rose-500 uppercase">Artist Letter</span>
                          <span className="text-[10px] text-rose-300 font-bold">{formatDate(letter.createdAt)}</span>
                        </div>
                        <p className="text-sm font-bold text-slate-800 line-clamp-1">{letter.title}</p>
                      </div>
                    ))}
                    {dashboardData.commonFanLetters.map(letter => (
                      <div key={`fan-${letter.boardId}`} onClick={() => handleDashboardPostClick(letter)} className="group p-5 rounded-3xl bg-white border border-slate-100 cursor-pointer transition-all hover:bg-slate-50">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-[10px] font-black text-slate-400 uppercase">New Fan Letter</span>
                          <span className="text-[10px] text-slate-300 font-bold">{formatDate(letter.createdAt)}</span>
                        </div>
                        <p className="text-sm font-bold text-slate-600 line-clamp-1">{letter.title}</p>
                      </div>
                    ))}
                    {Object.values(dashboardData).every(arr => arr.length === 0) && (
                      <div className="py-20 text-center text-slate-300 font-bold italic border-2 border-dashed border-slate-50 rounded-[2rem]">
                        아직 업데이트된 소식이 없어요. 🕊️
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                  <h3 className="font-black text-lg flex items-center gap-2 mb-6 text-slate-900"><PlaySquare size={20} className="text-rose-500"/> 미디어 하이라이트</h3>
                  <div className="grid grid-cols-1 gap-4">
                    {mockMedia.slice(0, 1).map(media => (
                      <div key={media.id} className="group relative rounded-[2rem] overflow-hidden aspect-video cursor-pointer shadow-lg">
                        <img src={media.img} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={media.title} />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-6">
                          <Play className="text-white fill-rose-500 mb-3" size={32} />
                          <p className="text-white font-bold text-sm">{media.title}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'media' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mockMedia.map(media => (
                  <div key={media.id} className="bg-white rounded-[2rem] overflow-hidden border border-slate-100 shadow-sm group cursor-pointer hover:shadow-xl transition-all">
                    <div className="relative aspect-video">
                      <img src={media.img} className="w-full h-full object-cover" alt={media.title} />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/50 transition-all">
                        <Play className="text-white fill-white group-hover:scale-125 transition-transform" size={40} />
                      </div>
                    </div>
                    <div className="p-5">
                      <p className="font-bold text-slate-800 line-clamp-1">{media.title}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'community' && (
               <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                 <h3 className="font-black text-xl flex items-center gap-2 mb-8 text-slate-900"><MessageSquare size={22} className="text-rose-500"/> 아티스트 & 팬 소통 공간</h3>
                 <div className="space-y-3">
                   {announcements.map((notice) => (
                     <div key={`ann-${notice.boardId}`} onClick={() => handleOpenPost(notice)} className="flex items-center justify-between p-5 border border-slate-900 rounded-3xl bg-slate-900 text-white hover:shadow-xl cursor-pointer transition-all">
                       <div className="flex items-center gap-4">
                         <span className="text-[10px] font-black px-3 py-1 rounded-full bg-rose-500 text-white uppercase">NOTICE</span>
                         <p className="font-bold text-sm line-clamp-1">{notice.title}</p>
                       </div>
                       <span className="text-[10px] opacity-40 font-bold">{formatDate(notice.createdAt)}</span>
                     </div>
                   ))}
                   {fanLetters.map((letter) => (
                     <div key={`fanlist-${letter.boardId}`} onClick={() => handleOpenPost(letter)} className="flex items-center justify-between p-5 border border-slate-100 rounded-3xl bg-white hover:bg-slate-50 cursor-pointer transition-all">
                       <div className="flex items-center gap-4">
                         <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase ${letter.authorRole === 'ARTIST' || letter.artistPost ? 'bg-rose-50 text-rose-500' : 'bg-slate-100 text-slate-400'}`}>
                           {letter.authorRole === 'ARTIST' || letter.artistPost ? 'ARTIST' : 'FAN'}
                         </span>
                         <p className="font-bold text-sm text-slate-700 line-clamp-1">{letter.title}</p>
                       </div>
                       <span className="text-[10px] text-slate-300 font-bold">{formatDate(letter.createdAt)}</span>
                     </div>
                   ))}
                   {announcements.length === 0 && fanLetters.length === 0 && (
                      <div className="py-20 text-center text-slate-300 font-bold">작성된 게시글이 없습니다.</div>
                   )}
                 </div>
               </div>
            )}

            {activeTab === 'shop' && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {mockShop.map(item => (
                  <div key={item.id} className="bg-white rounded-[2.5rem] p-5 border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
                    <div className="relative overflow-hidden rounded-3xl mb-4 aspect-square">
                       <img src={item.img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={item.name} />
                    </div>
                    <h4 className="font-bold text-slate-800 text-sm mb-1 line-clamp-1 px-1">{item.name}</h4>
                    <p className="text-rose-500 font-black text-lg px-1 mb-4">{item.price.toLocaleString()}원</p>
                    <button className="w-full py-3.5 bg-slate-900 text-white rounded-2xl text-xs font-black hover:bg-rose-500 transition-colors flex items-center justify-center gap-2">
                      <ShoppingCart size={16} /> 굿즈 담기
                    </button>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'chatbot' && (
              <div className="max-w-2xl mx-auto flex flex-col h-[550px] bg-white rounded-[3rem] border border-slate-100 shadow-2xl overflow-hidden">
                <div className="p-6 bg-slate-900 text-white font-black flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 bg-rose-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(244,63,94,0.8)]" />
                    {artist.stageName} AI Chat
                  </div>
                  <Sparkles size={18} className="text-rose-400" />
                </div>
                <div className="flex-1 overflow-y-auto p-8 space-y-5 bg-slate-50/50">
                  {chatHistory.map((chat, idx) => (
                    <div key={idx} className={`flex ${chat.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] p-4 px-5 rounded-[1.5rem] text-sm font-bold shadow-sm ${chat.sender === 'user' ? 'bg-rose-500 text-white rounded-tr-none' : 'bg-white text-slate-800 rounded-tl-none border border-slate-100'}`}>
                        {chat.text}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-5 bg-white border-t border-slate-100 flex gap-3">
                  <input value={chatMessage} onChange={(e) => setChatMessage(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} placeholder="메시지를 입력하세요..." className="flex-1 bg-slate-100 border-none rounded-2xl px-6 text-sm font-bold focus:ring-2 focus:ring-rose-500 outline-none" />
                  <button onClick={handleSendMessage} className="p-4 bg-slate-900 text-white rounded-2xl hover:bg-rose-500 transition-all active:scale-95"><Send size={18} /></button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 게시글 상세 모달 */}
      {selectedPost && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md" onClick={() => setSelectedPost(null)}>
          <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-50 flex items-center justify-between">
              <span className="text-[10px] font-black text-rose-500 bg-rose-50 px-4 py-1.5 rounded-full uppercase">Lumina Content</span>
              <button onClick={() => setSelectedPost(null)} className="p-2.5 hover:bg-slate-50 rounded-full transition-all text-slate-400"><X size={24} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-10 space-y-8">
              {postDetailLoading ? (
                <div className="py-20 text-center flex flex-col items-center gap-5 text-rose-500 font-black animate-pulse">데이터를 가져오는 중입니다...</div>
              ) : (
                <>
                  <div className="space-y-4">
                    <span className="text-xs font-black text-rose-400 bg-rose-50 px-3 py-1 rounded-lg uppercase">{selectedPost.category || 'POST'}</span>
                    <h2 className="text-3xl font-black text-slate-900">{selectedPost.title}</h2>
                    <div className="flex items-center gap-4 text-[10px] text-slate-400 font-black uppercase">
                       <span className="flex items-center gap-1.5"><UserIcon size={14}/> {selectedPost.authorName || artist.stageName}</span>
                       <span className="flex items-center gap-1.5"><Calendar size={14} /> {formatDate(selectedPost.createdAt)}</span>
                    </div>
                  </div>
                  <div className="h-px bg-slate-100 w-full" />
                  <div className="text-slate-700 whitespace-pre-wrap leading-[1.8] min-h-[200px] text-lg">{selectedPost.content}</div>
                </>
              )}
            </div>
            <div className="p-6 bg-slate-50/50">
              <button onClick={() => setSelectedPost(null)} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-rose-500 transition-all">닫기</button>
            </div>
          </div>
        </div>
      )}

      {/* 후원 모달 */}
      {isDonateOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md" onClick={() => setIsDonateOpen(false)}>
          <div className="bg-white rounded-[3rem] p-10 w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-2xl font-black mb-8 flex items-center gap-3 text-slate-900">
              <div className="p-2.5 bg-rose-500 rounded-2xl text-white"><Gift size={20} /></div>
              포인트 후원
            </h3>
            <div className="bg-slate-900 p-6 rounded-[2rem] mb-8 text-center">
              <p className="text-[10px] font-black text-rose-400 mb-2 uppercase opacity-80">My Current Balance</p>
              <p className="text-4xl font-black text-white">{myPoints.toLocaleString()} <span className="text-lg opacity-50">P</span></p>
            </div>
            <div className="relative mb-12">
              <input 
                type="number" 
                value={donateAmount} 
                onChange={(e) => setDonateAmount(e.target.value)} 
                placeholder="0" 
                className="w-full text-center text-5xl font-black py-4 border-b-4 border-rose-500 focus:outline-none bg-transparent text-slate-900" 
              />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setIsDonateOpen(false)} className="flex-1 bg-slate-100 py-5 rounded-[1.5rem] font-black text-slate-500">취소</button>
              <button 
                onClick={executeDonation} 
                disabled={!donateAmount || parseInt(donateAmount) <= 0 || parseInt(donateAmount) > myPoints}
                className="flex-[2] bg-rose-500 text-white py-5 rounded-[1.5rem] font-black hover:bg-rose-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                후원 보내기
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}