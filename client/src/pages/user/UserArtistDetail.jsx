/*
 * Lumina - Artist Detail Page
 * Soft Bloom Design: 아티스트 상세 정보, 탭 기반 콘텐츠 제공 (명세서 요구사항 반영)
 */

import { useEffect, useState } from 'react';
// Layout 중복 import 제거!
import Layout from '@/components/Layout';
import { 
  Heart, MessageCircle, PlaySquare, ShoppingBag, 
  Bell, Gift, Sparkles, Calendar, LayoutDashboard 
} from 'lucide-react';
import { toast } from 'sonner';
import { coreApi } from '@/lib/api'; 

const initialArtistData = {
  id: 1,
  name: "김지수",
  group: "NOVA",
  // 실제 콘서트/무대 느낌의 배경 이미지
  coverImage: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=1200&auto=format&fit=crop",
  // 실제 프로필 느낌의 인물 이미지
  image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=150&auto=format&fit=crop",
  followers: 520000,
  fandom: "STARLIGHT",
  description: "감성적인 보컬과 퍼포먼스로 팬들의 마음을 사로잡는 아티스트",
  tags: ["보컬", "K-POP", "댄스"],
  isFollowed: true
};

// [수정] wouter는 Route로 연결된 컴포넌트에 params를 props로 자동으로 내려줘!
export default function UserArtistDetail({ params }) {
  // 파라미터에서 바로 id 꺼내기
  const id = params?.id;
  
  const [artist, setArtist] = useState(initialArtistData);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // API 연동 전이므로 임시로 놔둠
    /* const fetchArtist = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const { data } = await coreApi.get(`/artist/${id}`);
        setArtist(data);
      } catch (err) {
        toast.error('아티스트 정보를 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    };
    fetchArtist();
    */
  }, [id]); // 의존성 배열에 id 추가

  const tabs = [
    { id: 'dashboard', label: '대쉬보드', icon: LayoutDashboard },
    { id: 'media', label: '미디어', icon: PlaySquare },
    { id: 'community', label: '커뮤니티 (팬/아티스트/공지)', icon: Bell },
    { id: 'shop', label: '굿즈샵', icon: ShoppingBag },
    { id: 'chatbot', label: '가상챗봇', icon: MessageCircle },
    { id: 'ai_recommend', label: 'AI 추천', icon: Sparkles },
  ];

  const handleDonation = () => {
    toast.success(`${artist.name}님에게 포인트를 후원했습니다!`);
  };

  const handleFollowToggle = async () => {
    try {
      setArtist(prev => ({ ...prev, isFollowed: !prev.isFollowed }));
      toast.info(`팔로우 상태가 변경되었습니다.`);
    } catch (error) {
      toast.error('팔로우 요청 처리에 실패했습니다.');
    }
  };

  if (loading) return <Layout role="user"><div className="p-6">로딩 중...</div></Layout>;

  return (
    <Layout role="user">
      <div className="pb-10">
        <div className="relative h-64 md:h-80 w-full">
          <img 
            src={artist.coverImage} 
            alt="cover" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          
          <div className="absolute bottom-0 left-0 w-full p-6 lg:px-12 flex flex-col md:flex-row items-end md:items-center justify-between gap-4">
            <div className="flex items-end gap-4">
              <img 
                src={artist.image} 
                alt={artist.name} 
                className="w-24 h-24 md:w-32 md:h-32 rounded-2xl object-cover ring-4 ring-white shadow-xl"
              />
              <div className="pb-2">
                <div className="flex items-center gap-2 mb-1">
                  <span className="badge-rose px-2 py-0.5 rounded-full text-xs font-bold">{artist.fandom}</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-md">{artist.name}</h1>
                <p className="text-white/90 drop-shadow-sm">{artist.group} • 팬 {artist.followers.toLocaleString()}명</p>
              </div>
            </div>

            <div className="flex gap-3 w-full md:w-auto">
              <button 
                onClick={handleDonation}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-amber-400 text-amber-950 font-bold hover:bg-amber-500 transition-colors shadow-lg"
              >
                <Gift size={18} />
                후원하기
              </button>
              <button 
                onClick={handleFollowToggle}
                className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold transition-all shadow-lg
                  ${artist.isFollowed 
                    ? 'bg-white/20 backdrop-blur-md text-white border border-white/30 hover:bg-white/30' 
                    : 'btn-primary-gradient text-white'}`}
              >
                <Heart size={18} fill={artist.isFollowed ? 'currentColor' : 'none'} />
                {artist.isFollowed ? '팔로잉' : '팔로우'}
              </button>
            </div>
          </div>
        </div>

        <div className="p-4 lg:p-6 lg:px-12 space-y-6">
          <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-2 border-b border-border">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors whitespace-nowrap
                  ${activeTab === tab.id 
                    ? 'bg-rose-50 text-rose-600 border border-rose-200 shadow-sm' 
                    : 'text-muted-foreground hover:bg-gray-50'}`}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="fade-in-up mt-6">
            {activeTab === 'dashboard' && (
              <div className="grid md:grid-cols-2 gap-4">
                <div className="glass-card p-6 rounded-2xl">
                  <h3 className="font-bold flex items-center gap-2 mb-4"><Bell size={18}/> 최근 공지 및 일정</h3>
                  <p className="text-sm text-muted-foreground">최근 등록된 일정 요약 게시판 영역...</p>
                </div>
                <div className="glass-card p-6 rounded-2xl">
                  <h3 className="font-bold flex items-center gap-2 mb-4"><PlaySquare size={18}/> 최근 아티스트 미디어</h3>
                  <p className="text-sm text-muted-foreground">동영상 썸네일 리스트 영역...</p>
                </div>
              </div>
            )}

            {activeTab === 'media' && (
              <div className="glass-card p-6 rounded-2xl text-center min-h-[300px] flex items-center justify-center">
                <p className="text-muted-foreground">아티스트 전용 미디어(영상) 스트리밍 플레이어 컴포넌트 위치</p>
              </div>
            )}

            {activeTab === 'community' && (
              <div className="glass-card p-6 rounded-2xl">
                <h3 className="font-bold mb-4">팬레터 / 아티스트 레터 / 공지사항</h3>
                <p className="text-sm text-muted-foreground">종합 커뮤니티 API에서 해당 아티스트 ID로 필터링하여 끌어오는 영역 (게시판 리스트)</p>
              </div>
            )}

            {activeTab === 'chatbot' && (
              <div className="glass-card border-rose-200 border-2 p-6 rounded-2xl min-h-[400px] flex flex-col">
                <div className="bg-rose-50 p-4 rounded-xl mb-4 flex items-center gap-3">
                  <MessageCircle className="text-rose-500" />
                  <div>
                    <h3 className="font-bold text-rose-900">아티스트 AI 가상 챗봇</h3>
                    <p className="text-xs text-rose-600">아티스트의 페르소나를 학습한 AI와 대화해보세요!</p>
                  </div>
                </div>
                <div className="flex-1 flex items-center justify-center bg-gray-50 rounded-xl border border-dashed">
                  <p className="text-muted-foreground text-sm">채팅 UI 컴포넌트 위치</p>
                </div>
              </div>
            )}

            {activeTab === 'ai_recommend' && (
              <div className="glass-card p-6 rounded-2xl">
                <h3 className="font-bold flex items-center gap-2 mb-4"><Sparkles size={18}/> AI 알고리즘 작품 추천</h3>
                <p className="text-sm text-muted-foreground">취향 분석 기반 추천 콘텐츠 리스트 위치</p>
              </div>
            )}

            {activeTab === 'shop' && (
              <div className="glass-card p-6 rounded-2xl">
                <h3 className="font-bold flex items-center gap-2 mb-4"><ShoppingBag size={18}/> 아티스트 전용 굿즈</h3>
                <p className="text-sm text-muted-foreground">굿즈샵 API 연동 후 리스트 출력 영역</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}