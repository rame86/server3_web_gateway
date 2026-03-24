/*
 * Lumina - Artist Detail Page
 * Soft Bloom Design: 아티스트 상세 정보, 탭 기반 콘텐츠 제공 및 후원 기능
 */

import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import {
  Heart, MessageCircle, PlaySquare, ShoppingBag,
  Bell, Gift, Sparkles, LayoutDashboard, X,
  Send, Play, MessageSquare, ThumbsUp, ShoppingCart, CalendarDays
} from 'lucide-react';
import { toast } from 'sonner';
import { coreApi, resApi } from '@/lib/api';

const mockMedia = [
  { id: 1, title: "'Starry Night' M/V Behind The Scenes", img: "https://images.unsplash.com/photo-1598387181032-a3103a2db5b3?q=80&w=400&auto=format&fit=crop" },
  { id: 2, title: "NOVA World Tour in Seoul Highlight", img: "https://images.unsplash.com/photo-1540039155732-6762e1c9cc1f?q=80&w=400&auto=format&fit=crop" },
];

const mockShop = [
  { id: 1, name: "NOVA 공식 응원봉 ver.2", price: 35000, img: "https://images.unsplash.com/photo-1520483601560-389dff434fdf?q=80&w=300&auto=format&fit=crop" },
  { id: 2, name: "정규 3집 'ECLIPSE' 포토북 세트", price: 28000, img: "https://images.unsplash.com/photo-1544640808-32ca72ac7f37?q=80&w=300&auto=format&fit=crop" },
  { id: 3, name: "NOVA 로고 후드티 (Black)", price: 45000, img: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=300&auto=format&fit=crop" },
  { id: 4, name: "월드투어 기념 스티커 팩", price: 8000, img: "https://images.unsplash.com/photo-1572375992501-4b0892d50c69?q=80&w=300&auto=format&fit=crop" },
];
// ------------------------------------------

export default function UserArtistDetail({ params }) {
  const id = params?.id;

  const [artist, setArtist] = useState({
    id: 0,
    name: "로딩 중...",
    group: "",
    coverImage: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=1200&auto=format&fit=crop",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=150&auto=format&fit=crop",
    followers: 0,
    fandom: "",
    description: "",
    tags: [],
    isFollowed: false
  });
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [notices, setNotices] = useState([]);

  // 후원 모달 상태
  const [isDonateOpen, setIsDonateOpen] = useState(false);
  const [donateAmount, setDonateAmount] = useState('');
  const [myPoints, setMyPoints] = useState(0);

  // 가상 챗봇 상태
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { sender: 'ai', text: '안녕! 오늘 하루도 잘 보냈어? 기다리고 있었어 😊' }
  ]);

  useEffect(() => {
    const fetchArtistData = async () => {
      if (!id) return;
      setLoading(true);
      try {
        // 내 포인트 잔액 가져오기
        coreApi.get('/member/my-info')
          .then(res => {
            if (res.data?.payment?.balance) setMyPoints(res.data.payment.balance);
          }).catch(e => console.error(e));

        // 1. 아티스트 정보 & 팔로우 상태
        const [artistRes, followRes] = await Promise.all([
          coreApi.get('/artist/list'),
          coreApi.get('/artist/my-follows').catch(() => ({ data: [] }))
        ]);

        const foundArtist = artistRes.data.find(a => a.memberId === parseInt(id));
        if (foundArtist) {
          const isFollowed = followRes.data.some(f => f.memberId === parseInt(id));
          const finalArtistName = foundArtist.stageName || foundArtist.artistName || "이름 없음";

          setArtist({
            id: foundArtist.memberId,
            name: finalArtistName,
            group: foundArtist.category || "",
            coverImage: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=1200&auto=format&fit=crop",
            image: foundArtist.profileImageUrl || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=150&auto=format&fit=crop",
            followers: foundArtist.followerCount || 0,
            fandom: 'STARLIGHT',
            description: foundArtist.description || "아티스트 소개가 없습니다.",
            tags: [foundArtist.category].filter(Boolean),
            isFollowed
          });

          // 2. 공지사항 (Board) & 최근일정 (Events)
          const [boardRes, eventsRes] = await Promise.all([
            coreApi.get(`/artist/board/${id}?category=전체`).catch(() => ({ data: [] })),
            resApi.get('/events').catch(() => ({ data: [] }))
          ]);

          const mappedNotices = (boardRes.data || []).slice(0, 3).map(b => ({
            id: `board_${b.boardId}`,
            type: b.category || "공지사항",
            title: b.title,
            date: new Date(b.regDate).toLocaleDateString()
          }));

          const rawEvents = eventsRes.data?.events || eventsRes.data || [];
          const matchedEvents = Array.isArray(rawEvents) ? rawEvents
            .filter(e => e.artist_name === finalArtistName)
            .slice(0, 3)
            .map(e => ({
              id: `event_${e.event_id}`,
              type: "일정",
              title: e.title,
              date: e.event_date ? new Date(e.event_date).toLocaleDateString() : 'TBD'
            })) : [];

          // 날짜 혹은 최신순 정렬 없이 결합
          setNotices([...mappedNotices, ...matchedEvents]);
        }
      } catch (err) {
        console.error(err);
        toast.error('정보를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };
    fetchArtistData();
  }, [id]);

  const tabs = [
    { id: 'dashboard', label: '대쉬보드', icon: LayoutDashboard },
    { id: 'media', label: '미디어', icon: PlaySquare },
    { id: 'community', label: '커뮤니티 (팬/아티스트/공지)', icon: Bell },
    { id: 'shop', label: '굿즈샵', icon: ShoppingBag },
    { id: 'chatbot', label: '가상챗봇', icon: MessageCircle },
    { id: 'ai_recommend', label: 'AI 추천', icon: Sparkles },
  ];

  // 팔로우 토글 액션
  const handleFollowToggle = async () => {
    try {
      await coreApi.post(`/artist/follow/${id}`);
      setArtist(p => ({ ...p, isFollowed: !p.isFollowed }));
      toast.success(artist.isFollowed ? '팔로우가 취소되었습니다.' : '아티스트를 팔로우했습니다!');
    } catch (e) {
      toast.error('요청 처리 중 오류가 발생했습니다.');
    }
  };

  // 후원 실행
  const executeDonation = async () => {
    const amount = parseInt(donateAmount);
    if (!amount || isNaN(amount) || amount <= 0) {
      toast.error('올바른 후원 금액을 입력해주세요.');
      return;
    }
    if (amount > myPoints) {
      toast.error('보유 포인트가 부족합니다. 충전 후 이용해주세요.');
      return;
    }

    try {
      toast.loading('후원 처리 중...');
      const req = { artistId: parseInt(id), amount: amount };
      const res = await coreApi.post('/artist/donate', req);

      toast.dismiss();
      toast.success(`${artist.name}님에게 ${amount.toLocaleString()} P를 후원했습니다! 🎉`);
      setIsDonateOpen(false);
      setDonateAmount('');
      setMyPoints(prev => prev - amount); // UI 차감 업데이트
    } catch (e) {
      toast.dismiss();
      const serverMsg = e.response?.data || '후원 요청 중 오류가 발생했습니다.';
      toast.error(typeof serverMsg === 'string' ? serverMsg : '잔액 부족 또는 서버 오류입니다.');
    }
  };

  // 챗봇 메시지 전송
  const handleSendMessage = () => {
    if (!chatMessage.trim()) return;
    setChatHistory([...chatHistory, { sender: 'user', text: chatMessage }]);
    setChatMessage('');
    // AI 응답 시뮬레이션
    setTimeout(() => {
      setChatHistory(prev => [...prev, { sender: 'ai', text: '그랬구나! 나도 항상 널 응원하고 있어 💖' }]);
    }, 1000);
  };

  if (loading) return <Layout role="user"><div className="p-6">로딩 중...</div></Layout>;

  return (
    <Layout role="user">
      <div className="pb-10 relative">
        {/* === 아티스트 헤더 영역 === */}
        <div className="relative h-64 md:h-80 w-full">
          <img src={artist.coverImage} alt="cover" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          <div className="absolute bottom-0 left-0 w-full p-6 lg:px-12 flex flex-col md:flex-row items-end md:items-center justify-between gap-4">
            <div className="flex items-end gap-4">
              <img src={artist.image} alt={artist.name} className="w-24 h-24 md:w-32 md:h-32 rounded-2xl object-cover ring-4 ring-white shadow-xl" />
              <div className="pb-2">
                <div className="flex items-center gap-2 mb-1">
                  <span className="badge-rose px-2 py-0.5 rounded-full text-xs font-bold">{artist.fandom}</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-md">{artist.name}</h1>
                <p className="text-white/90 drop-shadow-sm">{artist.group} • 팬 {artist.followers.toLocaleString()}명</p>
              </div>
            </div>

            <div className="flex gap-3 w-full md:w-auto">
              <button onClick={() => setIsDonateOpen(true)} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-amber-400 text-amber-950 font-bold hover:bg-amber-500 transition-colors shadow-lg">
                <Gift size={18} /> 후원하기
              </button>
              <button onClick={handleFollowToggle} className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold transition-all shadow-lg ${artist.isFollowed ? 'bg-white/20 backdrop-blur-md text-white border border-white/30 hover:bg-white/30' : 'btn-primary-gradient text-white'}`}>
                <Heart size={18} fill={artist.isFollowed ? 'currentColor' : 'none'} /> {artist.isFollowed ? '팔로잉' : '팔로우'}
              </button>
            </div>
          </div>
        </div>

        {/* === 탭 네비게이션 === */}
        <div className="p-4 lg:p-6 lg:px-12 space-y-6">
          <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-2 border-b border-border">
            {tabs.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors whitespace-nowrap ${activeTab === tab.id ? 'bg-rose-50 text-rose-600 border border-rose-200 shadow-sm' : 'text-muted-foreground hover:bg-gray-50'}`}>
                <tab.icon size={16} /> {tab.label}
              </button>
            ))}
          </div>

          {/* === 탭 콘텐츠 영역 === */}
          <div className="fade-in-up mt-6">

            {/* 1. 대쉬보드 */}
            {activeTab === 'dashboard' && (
              <div className="grid md:grid-cols-2 gap-6">
                <div className="glass-card p-6 rounded-2xl">
                  <h3 className="font-bold flex items-center gap-2 mb-4 text-foreground"><Bell size={18} className="text-rose-500" /> 최근 공지 및 일정</h3>
                  <div className="space-y-3">
                    {notices.map(notice => (
                      <div key={notice.id} className="flex flex-col gap-1 p-3 rounded-xl hover:bg-rose-50/50 transition-colors cursor-pointer border border-transparent hover:border-rose-100">
                        <div className="flex items-center justify-between">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${notice.type === '일정' ? 'bg-amber-100 text-amber-600' : 'bg-rose-100 text-rose-600'}`}>{notice.type}</span>
                          <span className="text-xs text-muted-foreground">{notice.date}</span>
                        </div>
                        <p className="text-sm font-medium text-foreground line-clamp-1">{notice.title}</p>
                      </div>
                    ))}
                    {notices.length === 0 && <p className="text-sm text-gray-500 text-center py-4">등록된 공지나 일정이 없습니다.</p>}
                  </div>
                </div>

                <div className="glass-card p-6 rounded-2xl">
                  <h3 className="font-bold flex items-center gap-2 mb-4 text-foreground"><PlaySquare size={18} className="text-rose-500" /> 최근 아티스트 미디어</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {mockMedia.map(media => (
                      <div key={media.id} className="group relative rounded-xl overflow-hidden cursor-pointer aspect-video">
                        <img src={media.img} alt={media.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Play className="text-white" fill="white" size={24} />
                        </div>
                        <div className="absolute bottom-0 w-full bg-gradient-to-t from-black/80 to-transparent p-2">
                          <p className="text-white text-xs font-medium line-clamp-1">{media.title}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 2. 미디어 */}
            {activeTab === 'media' && (
              <div className="space-y-6">
                {/* 메인 비디오 플레이어 (모형) */}
                <div className="w-full bg-black rounded-2xl aspect-video relative flex items-center justify-center overflow-hidden group cursor-pointer shadow-lg">
                  <img src="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1200&auto=format&fit=crop" className="absolute inset-0 w-full h-full object-cover opacity-60" alt="player" />
                  <div className="w-16 h-16 bg-rose-500/90 rounded-full flex items-center justify-center z-10 group-hover:scale-110 transition-transform shadow-lg">
                    <Play size={28} className="text-white ml-1" fill="white" />
                  </div>
                  <div className="absolute bottom-6 left-6 z-10">
                    <span className="bg-rose-500 text-white text-xs font-bold px-2 py-1 rounded">LIVE</span>
                    <h2 className="text-2xl font-bold text-white mt-2 drop-shadow-md">NOVA World Tour 'ECLIPSE' in Seoul</h2>
                  </div>
                </div>
              </div>
            )}

            {/* 3. 커뮤니티 */}
            {activeTab === 'community' && (
              <div className="glass-card p-6 rounded-2xl">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold flex items-center gap-2"><MessageSquare size={18} className="text-rose-500" /> 팬레터 & 공지사항</h3>
                  <button className="text-sm bg-gray-100 px-4 py-2 rounded-lg font-medium hover:bg-gray-200">글쓰기</button>
                </div>
                <div className="space-y-4">
                  {[...notices.filter(n => n.type !== '일정'), { id: 'mock_fanletter_1', type: "팬레터", title: "언니 목소리 들으면 힘이나요!", date: "방금 전" }].map(item => (
                    <div key={item.id} className="flex items-center justify-between p-4 border border-border rounded-xl hover:shadow-md transition-shadow cursor-pointer bg-white">
                      <div className="flex items-center gap-4">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${item.type === '공지' || item.type === '공지사항' ? 'bg-gray-800 text-white' : item.type === '아티스트' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-600'}`}>
                          {item.type}
                        </span>
                        <p className="font-medium">{item.title}</p>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{item.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. 가상챗봇 */}
            {activeTab === 'chatbot' && (
              <div className="glass-card border-rose-200 border p-0 rounded-2xl flex flex-col h-[500px] overflow-hidden bg-white">
                {/* 챗봇 헤더 */}
                <div className="bg-rose-50 p-4 flex items-center gap-3 border-b border-rose-100">
                  <div className="relative">
                    <img src={artist.image} alt="bot" className="w-10 h-10 rounded-full object-cover border-2 border-white" />
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
                  </div>
                  <div>
                    <h3 className="font-bold text-rose-900">{artist.name} <span className="text-xs bg-rose-200 text-rose-700 px-1.5 py-0.5 rounded ml-1">AI</span></h3>
                    <p className="text-xs text-rose-600">현재 온라인</p>
                  </div>
                </div>

                {/* 채팅 내역 */}
                <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50/50">
                  {chatHistory.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm ${msg.sender === 'user'
                          ? 'bg-rose-500 text-white rounded-tr-sm'
                          : 'bg-white border border-gray-100 text-gray-800 rounded-tl-sm shadow-sm'
                        }`}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                </div>

                {/* 입력창 */}
                <div className="p-3 border-t border-gray-100 bg-white flex gap-2">
                  <input
                    type="text"
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="메시지를 입력해봐!"
                    className="flex-1 bg-gray-100 border-transparent rounded-xl px-4 focus:ring-rose-200 text-sm"
                  />
                  <button onClick={handleSendMessage} className="bg-rose-500 hover:bg-rose-600 text-white p-3 rounded-xl transition-colors">
                    <Send size={18} />
                  </button>
                </div>
              </div>
            )}

            {/* 5. AI 추천 */}
            {activeTab === 'ai_recommend' && (
              <div className="glass-card p-6 rounded-2xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-purple-100 p-2 rounded-xl"><Sparkles className="text-purple-600" size={20} /></div>
                  <div>
                    <h3 className="font-bold">AI가 분석한 취향 저격 콘텐츠</h3>
                    <p className="text-sm text-muted-foreground">이전 시청 기록을 바탕으로 추천해줄게!</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="group cursor-pointer">
                      <div className="aspect-[3/4] rounded-xl overflow-hidden mb-2 bg-gray-100 relative">
                        <img src={`https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=300&auto=format&fit=crop&sig=${i}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md text-white text-[10px] px-2 py-1 rounded">98% 일치</div>
                      </div>
                      <p className="font-bold text-sm line-clamp-1">추천 플레이리스트 {i}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1">AI 큐레이션</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 6. 굿즈샵 */}
            {activeTab === 'shop' && (
              <div className="glass-card p-6 rounded-2xl">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold flex items-center gap-2"><ShoppingBag size={18} className="text-rose-500" /> 공식 스토어</h3>
                  <span className="text-sm font-medium text-rose-500 cursor-pointer">더보기 &gt;</span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {mockShop.map(item => (
                    <div key={item.id} className="group">
                      <div className="aspect-square bg-gray-100 rounded-xl mb-3 overflow-hidden relative">
                        <img src={item.img} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        <button className="absolute bottom-2 right-2 bg-white/90 p-2 rounded-full shadow-md text-gray-700 hover:text-rose-500 transition-colors">
                          <ShoppingCart size={16} />
                        </button>
                      </div>
                      <p className="font-medium text-sm text-foreground line-clamp-2 leading-snug">{item.name}</p>
                      <p className="font-bold text-rose-600 mt-1">{item.price.toLocaleString()}원</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* === 후원 모달창 UI === */}
      {isDonateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 fade-in-up">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 relative shadow-2xl">
            <button onClick={() => setIsDonateOpen(false)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors">
              <X size={20} />
            </button>

            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Gift className="text-amber-500" size={24} />
              </div>
              <h2 className="text-xl font-bold text-foreground">아티스트 후원하기</h2>
              <p className="text-sm text-muted-foreground mt-1">{artist.name}님에게 응원의 마음을 전달하세요!</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-xl mb-6 flex justify-between items-center border border-gray-100">
              <span className="text-sm font-medium text-gray-600">내 보유 포인트</span>
              <span className="text-lg font-bold text-amber-600">{myPoints.toLocaleString()} P</span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-2">후원할 포인트</label>
                <input type="number" placeholder="금액을 입력해주세요" value={donateAmount} onChange={(e) => setDonateAmount(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white" />
              </div>

              <div className="grid grid-cols-4 gap-2">
                {[1000, 5000, 10000].map(amt => (
                  <button key={amt} onClick={() => setDonateAmount(String((parseInt(donateAmount || 0) + amt)))} className="py-2 text-sm font-medium rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors">
                    +{amt.toLocaleString()}
                  </button>
                ))}
                <button onClick={() => setDonateAmount(String(myPoints))} className="py-2 text-sm font-medium rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-800 transition-colors">전액</button>
              </div>

              <button onClick={executeDonation} className="w-full py-3.5 mt-4 rounded-xl font-bold bg-amber-400 text-amber-950 hover:bg-amber-500 transition-all shadow-md">
                후원하기
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}