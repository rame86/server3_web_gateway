import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import {
  Heart, MessageCircle, PlaySquare, ShoppingBag,
  Bell, Gift, Sparkles, LayoutDashboard, X,
  Send, Play, MessageSquare, ShoppingCart
} from 'lucide-react';
import { toast } from 'sonner';
import { coreApi, payApi, resApi } from '@/lib/api';

const mockMedia = [
  { id: 1, title: "'Starry Night' M/V Behind The Scenes", img: "https://images.unsplash.com/photo-1598387181032-a3103a2db5b3?q=80&w=400&auto=format&fit=crop" },
  { id: 2, title: "NOVA World Tour in Seoul Highlight", img: "https://images.unsplash.com/photo-1540039155732-6762e1c9cc1f?q=80&w=400&auto=format&fit=crop" },
];

const mockShop = [
  { id: 1, name: "NOVA 공식 응원봉 ver.2", price: 35000, img: "https://images.unsplash.com/photo-1520483601560-389dff434fdf?q=80&w=300&auto=format&fit=crop" },
  { id: 2, name: "정규 3집 'ECLIPSE' 포토북 세트", price: 28000, img: "https://images.unsplash.com/photo-1544640808-32ca72ac7f37?q=80&w=300&auto=format&fit=crop" },
];

export default function UserArtistDetail({ params }) {
  const memberId = params?.id; // URL에서 넘어온 ID

  const [artist, setArtist] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [fanLetters, setFanLetters] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);

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

        // 1. 내 포인트 잔액 조회 (페이 서비스)
        payApi.get('/payment/')
          .then(res => {
            if (res.data?.currentBalance !== undefined) setMyPoints(res.data.currentBalance);
          }).catch(e => console.error("포인트 조회 실패:", e));

        // 2. 아티스트 기본 정보 및 팔로우 상태 조회 (코어 서비스)
        const [artistRes, followRes] = await Promise.all([
          coreApi.get(`/artist/${memberId}`),
          coreApi.get('/artist/my-follows').catch(() => ({ data: [] }))
        ]);

        const artistData = artistRes.data;
        const isFollowed = followRes.data.some(f => f.memberId === parseInt(memberId));
        
        setArtist({
          ...artistData,
          isFollowed
        });

        // 3. 아티스트의 게시판 데이터(공지/팬레터) 조회 (실제 Artist ID 사용)
        const realArtistId = artistData.artistId || 3; 
        const [noticeRes, letterRes] = await Promise.all([
          coreApi.get(`/artist/${realArtistId}/notices`).catch(() => ({ data: [] })),
          coreApi.get(`/artist/${realArtistId}/fan-letters`).catch(() => ({ data: [] }))
        ]);

        setAnnouncements(Array.isArray(noticeRes.data) ? noticeRes.data : []);
        setFanLetters(Array.isArray(letterRes.data) ? letterRes.data : []);

      } catch (err) {
        console.error("데이터 로딩 에러:", err);
        toast.error("데이터를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [memberId]);

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
      toast.loading('후원 처리 중...');
      await coreApi.post('/artist/donate', { artistId: artist.artistId, amount });
      setMyPoints(prev => prev - amount);
      setIsDonateOpen(false);
      setDonateAmount('');
      toast.dismiss();
      toast.success(`${artist?.stageName}님에게 후원했습니다! 🎉`);
    } catch (e) {
      toast.dismiss();
      toast.error('후원 중 오류가 발생했습니다.');
    }
  };

  const handleSendMessage = () => {
    if (!chatMessage.trim()) return;
    setChatHistory([...chatHistory, { sender: 'user', text: chatMessage }]);
    setChatMessage('');
    setTimeout(() => {
      setChatHistory(prev => [...prev, { sender: 'ai', text: '그랬구나! 나도 항상 정은님을 응원하고 있어 💖' }]);
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

  if (loading) return <Layout role="user"><div className="p-10 text-center text-rose-500 font-bold">Lumina 로딩 중...</div></Layout>;
  if (!artist) return <Layout role="user"><div className="p-10 text-center">아티스트 정보가 없습니다.</div></Layout>;

  return (
    <Layout role="user">
      <div className="pb-10 relative">
        {/* 헤더 영역 */}
        <div className="relative h-64 md:h-80 w-full">
          <img src={artist.coverImageUrl || "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=1200"} alt="cover" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 w-full p-6 lg:px-12 flex flex-col md:flex-row items-end md:items-center justify-between gap-4">
            <div className="flex items-end gap-4">
              <img src={artist.profileImageUrl || "https://placehold.co/200x200"} alt={artist.stageName} className="w-24 h-24 md:w-32 md:h-32 rounded-2xl object-cover ring-4 ring-white shadow-xl" />
              <div className="pb-2 text-white">
                <span className="badge-rose px-2 py-0.5 rounded-full text-xs font-bold bg-rose-500/80 mb-2 inline-block">LUMINA 팬덤</span>
                <h1 className="text-3xl md:text-4xl font-bold drop-shadow-md">{artist.stageName}</h1>
                <p className="opacity-90">{artist.category || 'Artist'} • 팬 {artist.followerCount?.toLocaleString() || 0}명</p>
              </div>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <button onClick={() => setIsDonateOpen(true)} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-amber-400 text-amber-950 font-bold hover:bg-amber-500 transition-colors shadow-lg">
                <Gift size={18} /> 후원하기
              </button>
              <button onClick={handleFollowToggle} className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold transition-all shadow-lg ${artist.isFollowed ? 'bg-white/20 backdrop-blur-md text-white border border-white/30 hover:bg-white/30' : 'bg-rose-500 text-white'}`}>
                <Heart size={18} fill={artist.isFollowed ? 'currentColor' : 'none'} /> {artist.isFollowed ? '팔로잉' : '팔로우'}
              </button>
            </div>
          </div>
        </div>

        {/* 탭 메뉴 */}
        <div className="p-4 lg:p-6 lg:px-12 space-y-6">
          <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-2 border-b border-border">
            {tabs.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors whitespace-nowrap ${activeTab === tab.id ? 'bg-rose-50 text-rose-600 border border-rose-200 shadow-sm' : 'text-muted-foreground hover:bg-gray-50'}`}>
                <tab.icon size={16} /> {tab.label}
              </button>
            ))}
          </div>

          <div className="mt-6">
            {activeTab === 'dashboard' && (
              <div className="grid md:grid-cols-2 gap-6">
                <div className="glass-card p-6 rounded-2xl bg-white border">
                  <h3 className="font-bold flex items-center gap-2 mb-4 text-foreground"><Bell size={18} className="text-rose-500"/> 최근 공지사항</h3>
                  <div className="space-y-3">
                    {announcements.length > 0 ? (
                      announcements.slice(0, 3).map((notice) => (
                        <div key={notice.boardId} className="flex flex-col gap-1 p-3 rounded-xl hover:bg-rose-50/50 border border-transparent hover:border-rose-100 transition-colors">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-rose-600 bg-rose-100 px-2 py-0.5 rounded-md">{notice.category || 'NOTICE'}</span>
                            <span className="text-[10px] text-muted-foreground">{notice.createdAt?.split('T')[0]}</span>
                          </div>
                          <p className="text-sm font-medium text-foreground line-clamp-1">{notice.title}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-center py-10 text-xs text-muted-foreground">등록된 공지사항이 없습니다.</p>
                    )}
                  </div>
                </div>
                <div className="glass-card p-6 rounded-2xl bg-white border">
                  <h3 className="font-bold flex items-center gap-2 mb-4 text-foreground"><PlaySquare size={18} className="text-rose-500"/> 아티스트 한마디</h3>
                  <div className="bg-rose-50/30 p-4 rounded-xl border border-rose-100 italic text-sm text-rose-800">
                    "{artist.description || '반가워요! LUMINA에서 만나요.'}"
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'community' && (
              <div className="glass-card p-6 rounded-2xl bg-white border">
                <h3 className="font-bold flex items-center gap-2 mb-6"><MessageSquare size={18} className="text-rose-500"/> 팬레터 & 공지</h3>
                <div className="space-y-4">
                  {announcements.map((notice) => (
                    <div key={`notice-${notice.boardId}`} className="flex items-center justify-between p-4 border border-rose-100 rounded-xl bg-rose-50/20">
                      <div className="flex items-center gap-4"><span className="text-xs font-bold px-2.5 py-1 rounded-full bg-gray-800 text-white">공지</span><p className="font-medium text-sm">{notice.title}</p></div>
                      <span className="text-xs text-muted-foreground">{notice.createdAt?.split('T')[0]}</span>
                    </div>
                  ))}
                  {fanLetters.map((letter) => (
                    <div key={`letter-${letter.boardId}`} className="flex items-center justify-between p-4 border border-border rounded-xl bg-white hover:shadow-sm transition-shadow">
                      <div className="flex items-center gap-4"><span className="text-xs font-bold px-2.5 py-1 rounded-full bg-rose-100 text-rose-600">팬레터</span><p className="font-medium text-sm">{letter.title}</p></div>
                      <span className="text-xs text-muted-foreground">{letter.createdAt?.split('T')[0]}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* 챗봇 탭 생략 (기존 구조 유지 가능) */}
            {activeTab === 'chatbot' && (
                <div className="glass-card border-rose-200 border p-0 rounded-2xl flex flex-col h-[500px] overflow-hidden bg-white">
                    <div className="bg-rose-50 p-4 flex items-center gap-3 border-b border-rose-100">
                        <img src={artist.profileImageUrl} alt="bot" className="w-10 h-10 rounded-full object-cover" />
                        <div><h3 className="font-bold text-rose-900">{artist.stageName} AI</h3><p className="text-xs text-rose-600">현재 온라인</p></div>
                    </div>
                    <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50/50">
                        {chatHistory.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm ${msg.sender === 'user' ? 'bg-rose-500 text-white' : 'bg-white border'}`}>{msg.text}</div>
                            </div>
                        ))}
                    </div>
                    <div className="p-3 border-t bg-white flex gap-2">
                        <input type="text" value={chatMessage} onChange={(e) => setChatMessage(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()} className="flex-1 bg-gray-100 rounded-xl px-4" placeholder="메시지를 입력해봐!" />
                        <button onClick={handleSendMessage} className="bg-rose-500 text-white p-3 rounded-xl"><Send size={18} /></button>
                    </div>
                </div>
            )}
          </div>
        </div>
      </div>

      {/* 후원 모달 */}
      {isDonateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">포인트 후원</h3>
              <button onClick={() => setIsDonateOpen(false)} className="p-2 hover:bg-gray-100 rounded-full"><X size={20} /></button>
            </div>
            <div className="bg-gray-50 p-4 rounded-2xl mb-6">
              <p className="text-sm text-gray-500 mb-1">보유 포인트</p>
              <p className="text-xl font-bold text-rose-600">{myPoints.toLocaleString()} P</p>
            </div>
            <input type="number" value={donateAmount} onChange={(e) => setDonateAmount(e.target.value)} placeholder="얼마를 후원할까?" className="w-full text-center text-2xl font-bold py-4 border-b-2 border-rose-500 focus:outline-none mb-8" />
            <button onClick={executeDonation} className="w-full bg-rose-500 text-white py-4 rounded-2xl font-bold text-lg hover:bg-rose-600 transition-colors">후원하기</button>
          </div>
        </div>
      )}
    </Layout>
  );
}