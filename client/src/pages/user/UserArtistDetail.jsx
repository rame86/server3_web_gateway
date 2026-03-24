import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { 
  Heart, MessageCircle, PlaySquare, ShoppingBag, 
  Bell, Gift, Sparkles, LayoutDashboard, X, 
  Send, MessageSquare
} from 'lucide-react';
import { toast } from 'sonner';
import { coreApi } from '@/lib/api';

export default function UserArtistDetail({ params }) {
  const memberId = params?.id; // URL의 12
  
  const [artist, setArtist] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [fanLetters, setFanLetters] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);

  const [isDonateOpen, setIsDonateOpen] = useState(false); 
  const [donateAmount, setDonateAmount] = useState(''); 
  const [myPoints, setMyPoints] = useState(15000); 
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { sender: 'ai', text: '안녕! 오늘 하루도 잘 보냈어? 기다리고 있었어 😊' }
  ]);

  useEffect(() => {
    if (!memberId) return;

    const fetchAllData = async () => {
      try {
        setLoading(true);
        // 1. 아티스트 정보 먼저 가져오기
        const artistRes = await coreApi.get(`/artist/${memberId}`);
        const artistData = artistRes.data;
        setArtist(artistData);

        // 2. 로그에서 확인된 실제 Artist ID 3 사용
        const realArtistId = artistData.artistId || 3; 

        // 3. 공지 및 팬레터 호출
        const [noticeRes, letterRes] = await Promise.all([
          coreApi.get(`/artist/${realArtistId}/notices`),
          coreApi.get(`/artist/${realArtistId}/fan-letters`)
        ]);

        console.log("📢 Notices Data Raw:", noticeRes.data);
        console.log("💌 Letters Data Raw:", letterRes.data);

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

  const executeDonation = () => {
    const amount = parseInt(donateAmount);
    if (!amount || amount <= 0) { toast.error('금액을 입력해주세요.'); return; }
    if (amount > myPoints) { toast.error('포인트가 부족합니다.'); return; }
    setMyPoints(prev => prev - amount);
    setIsDonateOpen(false);
    setDonateAmount('');
    toast.success(`${artist?.stageName}님에게 후원했습니다! 🎉`);
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
            </div>
          </div>
        </div>

        {/* 탭 메뉴 및 컨텐츠 */}
        <div className="p-4 lg:p-6 lg:px-12 space-y-6">
          <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-2 border-b border-border">
            {tabs.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors whitespace-nowrap ${activeTab === tab.id ? 'bg-rose-50 text-rose-600 border border-rose-200 shadow-sm' : 'text-muted-foreground hover:bg-gray-50'}`}>
                <tab.icon size={16} /> {tab.label}
              </button>
            ))}
          </div>

          <div className="fade-in-up mt-6">
            {activeTab === 'dashboard' && (
              <div className="grid md:grid-cols-2 gap-6">
                <div className="glass-card p-6 rounded-2xl bg-white border">
                  <h3 className="font-bold flex items-center gap-2 mb-4 text-foreground"><Bell size={18} className="text-rose-500"/> 최근 공지사항</h3>
                  <div className="space-y-3">
                    {announcements.length > 0 ? (
                      announcements.slice(0, 3).map((notice) => (
                        <div key={notice.boardId} className="flex flex-col gap-1 p-3 rounded-xl hover:bg-rose-50/50 border border-transparent hover:border-rose-100 transition-colors">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-rose-600 bg-rose-100 px-2 py-0.5 rounded-md">
                              {notice.category || 'NOTICE'}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              {notice.createdAt ? new Date(notice.createdAt).toLocaleDateString() : '오늘'}
                            </span>
                          </div>
                          {/* 로그 확인 결과 필드명은 title입니다 */}
                          <p className="text-sm font-medium text-foreground line-clamp-1">{notice.title}</p>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-10">
                         <p className="text-xs text-muted-foreground">등록된 공지사항이 없습니다.</p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="glass-card p-6 rounded-2xl bg-white border">
                  <h3 className="font-bold flex items-center gap-2 mb-4 text-foreground"><PlaySquare size={18} className="text-rose-500"/> 아티스트 한마디</h3>
                  <div className="bg-rose-50/30 p-4 rounded-xl border border-rose-100 italic text-sm text-rose-800">
                    "{artist.description || '반가워요!'}"
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'community' && (
              <div className="glass-card p-6 rounded-2xl bg-white border">
                <h3 className="font-bold flex items-center gap-2 mb-6"><MessageSquare size={18} className="text-rose-500"/> 팬레터 & 공지</h3>
                <div className="space-y-4">
                  {/* 공지사항 출력 */}
                  {announcements.map((notice) => (
                    <div key={`notice-${notice.boardId}`} className="flex items-center justify-between p-4 border border-rose-100 rounded-xl bg-rose-50/20">
                      <div className="flex items-center gap-4">
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-gray-800 text-white">공지</span>
                        <p className="font-medium text-sm">{notice.title}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">{notice.createdAt?.split('T')[0]}</span>
                    </div>
                  ))}
                  {/* 팬레터 출력 */}
                  {fanLetters.map((letter) => (
                    <div key={`letter-${letter.boardId}`} className="flex items-center justify-between p-4 border border-border rounded-xl bg-white hover:shadow-sm transition-shadow">
                      <div className="flex items-center gap-4">
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-rose-100 text-rose-600">팬레터</span>
                        <p className="font-medium text-sm">{letter.title}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">{letter.createdAt?.split('T')[0]}</span>
                    </div>
                  ))}
                  {announcements.length === 0 && fanLetters.length === 0 && (
                    <p className="text-center py-10 text-muted-foreground">작성된 게시물이 없습니다.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}