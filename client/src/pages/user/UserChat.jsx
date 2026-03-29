/*
 * Lumina - User Chat Page
 * Soft Bloom Design: AI chatbot + artist chat + friend chat
 */

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Bot, Users, Send, Heart, Search } from 'lucide-react';
import { toast } from 'sonner';
import { coreApi } from '@/lib/api';

const chatTabs = [
  { key: 'ai', label: 'AI 챗봇', icon: <Bot size={16} /> },
  { key: 'artist', label: '아티스트', icon: <Heart size={16} /> },
  { key: 'friends', label: '친구', icon: <Users size={16} /> }
];

// 🌟 핵심 주석: 1. AI 챗봇 더미 데이터
const initialAiMessages = [
  { id: 1, sender: 'bot', text: '안녕하세요! Lumina AI 챗봇입니다 💕 무엇이든 물어보세요!', time: '방금' }
];

// 🌟 핵심 주석: 2. 친구 목록 더미 데이터
const friendChatsList = [
  { id: 1, name: '달빛소녀', image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop', lastMsg: '이번 팬미팅 티켓팅 성공했어?!', time: '방금', unread: 2 },
  { id: 2, name: 'STARLIGHT 팬클럽', image: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=100&h=100&fit=crop', lastMsg: '오늘 방송 봤어요? 미쳤음 ㅠㅠ', time: '5분 전', unread: 8 },
  { id: 3, name: '별빛모임', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop', lastMsg: '굿즈 공동구매 모집해요', time: '1시간 전', unread: 0 }
];

// 🌟 핵심 주석: 3. 친구별 상세 대화 더미 데이터
const mockFriendMessages = {
  1: [
    { id: 1, sender: 'friend', text: '야야야 이번 팬미팅 공지 봤어?', time: '14:00' },
    { id: 2, sender: 'user', text: '응 봤지!! 폼 미쳤더라 ㅠㅠㅠ', time: '14:05' },
    { id: 3, sender: 'friend', text: '이번 팬미팅 티켓팅 성공했어?!', time: '14:35' },
  ],
  2: [
    { id: 1, sender: 'friend', text: '오늘 방송 봤어요? 미쳤음 ㅠㅠ', time: '14:30' },
  ]
};

// 🌟 핵심 주석: 4. AI 랜덤 더미 답변 목록
const aiDummyResponses = [
  "그 부분은 제가 좀 더 알아볼게요! 😊",
  "정말 좋은 질문이네요! 루미나 이벤트 페이지에서 확인 가능합니다.",
  "현재 해당 기능은 더 멋지게 준비 중이에요 ㅠㅠ 조금만 기다려주세요!",
  "앗, 제가 아직 배우고 있는 내용이에요. 더 똑똑해져서 올게요! 🥺",
  "티켓 예매는 '예매' 탭을 이용하시면 가장 빠릅니다!",
  "루미나와 함께해주셔서 항상 감사합니다 💕 다른 궁금한 점은 없으신가요?"
];

// ✅ UserArtists 로직을 가져와서 더 안전해진 이미지 URL 처리기
const getImgUrl = (url) => {
  if (!url) return "https://placehold.co/100x100?text=No+Image";
  if (url.startsWith('http')) return url;
  const envGateway = import.meta.env.VITE_API_GATEWAY_URL;
  if (envGateway) {
      const cleanGateway = envGateway.replace(/\/$/, '');
      const cleanUrl = url.startsWith('/') ? url : `/${url}`;
      return `${cleanGateway}${cleanUrl}`;
  }
  return url.startsWith('/') ? url : `/${url}`; 
};

export default function UserChat() {
  const [activeTab, setActiveTab] = useState('ai');
  const [inputText, setInputText] = useState('');
  
  const [aiMessages, setAiMessages] = useState(initialAiMessages);
  const [artistMessages, setArtistMessages] = useState([]);
  const [friendMessages, setFriendMessages] = useState([]);

  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRealArtist, setSelectedRealArtist] = useState(null);
  const [selectedFriend, setSelectedFriend] = useState(null);

  // 1️⃣ 아티스트 목록 가져오기 (✅ UserArtists의 방탄 로직 완벽 이식!)
  useEffect(() => {
    const fetchArtists = async () => {
      try {
        setLoading(true);
        // 전체 아티스트 목록과 내 팔로우 목록을 동시에 호출
        const [artistRes, followRes] = await Promise.all([
          coreApi.get('/artist/list'),
          coreApi.get('/artist/my-follows')
        ]);
        
        // 데이터 안전하게 빼내기
        let baseArtists = artistRes.data?.data || artistRes.data?.content || artistRes.data || [];
        if (!Array.isArray(baseArtists)) baseArtists = [];

        let rawFollows = followRes.data?.data || followRes.data || [];
        if (!Array.isArray(rawFollows)) rawFollows = [];
        const followedIds = rawFollows.map(item => item.memberId || item);

        // 전체 목록에서 내가 팔로우한 아티스트만 필터링해서 채팅 목록에 띄움!
        const followedArtists = baseArtists.filter(artist => followedIds.includes(artist.memberId));
        setArtists(followedArtists);

      } catch (err) {
        console.error("아티스트 로드 실패:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchArtists();
  }, []);

  // 3️⃣ 친구 채팅방 입장
  const joinFriendChat = (chat) => {
    setSelectedFriend(chat);
    const initialMessages = mockFriendMessages[chat.id] || [
      { id: 1, sender: 'friend', text: `안녕하세요! ${chat.name} 방입니다.`, time: '방금' }
    ];
    setFriendMessages(initialMessages); 
  };

  // 4️⃣ 통합 메시지 전송 로직
  const handleSend = () => {
    if (!inputText.trim()) return;

    const newMsg = { id: Date.now(), sender: 'user', text: inputText, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) };

    if (activeTab === 'artist' && selectedRealArtist) {
      setArtistMessages(prev => [...prev, newMsg]);
      setInputText('');
      setTimeout(() => {
        setArtistMessages(prev => [...prev, { id: Date.now()+1, sender: 'bot', text: `${selectedRealArtist.stageName}: 메시지 고마워요! 곧 확인할게요 🌸`, time: '방금' }]);
      }, 800);
    } 
    else if (activeTab === 'friends' && selectedFriend) {
      setFriendMessages(prev => [...prev, newMsg]); 
      setInputText('');
      setTimeout(() => {
        setFriendMessages(prev => [...prev, { id: Date.now()+1, sender: 'friend', text: `(자동 답장) 지금은 바빠서 나중에 연락할게!`, time: '방금' }]);
      }, 1000);
    } 
    else if (activeTab === 'ai') {
      setAiMessages(prev => [...prev, newMsg]);
      setInputText('');
      setTimeout(() => {
        const randomIndex = Math.floor(Math.random() * aiDummyResponses.length);
        const randomReply = aiDummyResponses[randomIndex];
        setAiMessages(prev => [...prev, { id: Date.now()+1, sender: 'bot', text: randomReply, time: '방금' }]);
      }, 800);
    }
  };
  
  if (loading) return <Layout role="user"><div className="p-10 text-center text-rose-500 font-bold animate-pulse">데이터를 불러오는 중...</div></Layout>;

  return (
    <Layout role="user">
      <div className="p-4 lg:p-6 h-[calc(100vh-64px)] flex flex-col gap-4">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>채팅</h1>
          <p className="text-sm text-muted-foreground">3가지 모드로 대화해보세요</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 bg-rose-50 p-1 rounded-2xl flex-shrink-0">
          {chatTabs.map((tab) =>
            <button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key);
                if (tab.key !== 'artist') setSelectedRealArtist(null);
                if (tab.key !== 'friends') setSelectedFriend(null);
              }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                activeTab === tab.key ? 'bg-white text-rose-600 shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          )}
        </div>

        {/* 1. AI 챗봇 탭 */}
        {activeTab === 'ai' && (
          <div className="flex-1 flex flex-col gap-4 min-h-0">
            <div className="glass-card rounded-2xl p-3 flex items-center gap-3 flex-shrink-0 bg-white shadow-sm border border-rose-100">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center shadow-md">
                  <Bot size={20} className="text-white" />
                </div>
              </div>
              <div>
                <p className="font-semibold text-sm text-foreground">Lumina AI 챗봇</p>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-teal-400 rounded-full" />
                  <p className="text-xs text-muted-foreground">언제든 질문해주세요</p>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 p-1">
              {aiMessages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} gap-2`}>
                  <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm ${msg.sender === 'user' ? 'bg-gradient-to-br from-rose-400 to-pink-500 text-white rounded-br-none' : 'bg-white text-foreground rounded-bl-none shadow-sm border'}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2 flex-shrink-0">
              <input type="text" placeholder="AI에게 메시지 보내기..." value={inputText} onChange={(e) => setInputText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} className="flex-1 px-4 py-3 bg-white border border-rose-100 rounded-2xl text-sm text-black focus:outline-none focus:ring-2 focus:ring-rose-300 shadow-sm" />
              <button onClick={handleSend} className="w-12 h-12 rounded-2xl bg-rose-500 flex items-center justify-center text-white active:scale-95"><Send size={18} /></button>
            </div>
          </div>
        )}

        {/* 2. 아티스트 채팅 탭 */}
        {activeTab === 'artist' && (
          <div className="flex-1 flex flex-col gap-4 min-h-0">
            {!selectedRealArtist ? (
              <div className="space-y-3 overflow-y-auto">
                <div className="relative mb-4">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input type="text" placeholder="아티스트 검색..." className="w-full pl-9 pr-4 py-2.5 bg-white border border-rose-100 rounded-xl text-sm text-black focus:outline-none" />
                </div>
                {artists.map((artist) => (
                  <div key={artist.memberId} 
                    onClick={() => { 
                      setSelectedRealArtist(artist); 
                      setArtistMessages([
                        { id: 1, sender: 'bot', text: `안녕! 나 ${artist.stageName}(이)야 🥰 오늘도 응원해줘서 고마워!`, time: '오전 10:00' },
                        { id: 2, sender: 'bot', text: '오늘 밥은 잘 챙겨 먹었어?', time: '오전 10:01' }
                      ]); 
                    }} 
                    className="glass-card rounded-2xl p-4 flex items-center gap-3 hover:bg-rose-50 cursor-pointer shadow-sm bg-white"
                  >
                    <img src={getImgUrl(artist.profileImageUrl || artist.fandomImage)} className="w-12 h-12 rounded-full object-cover" />
                    <div className="flex-1">
                      <p className="font-bold text-sm text-black">{artist.stageName}</p>
                      <p className="text-xs text-muted-foreground">{artist.category || 'Artist'}</p>
                    </div>
                    <span className="badge-rose px-3 py-1.5 rounded-full text-xs font-bold bg-rose-50 text-rose-500">채팅하기</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex-1 flex flex-col gap-4 min-h-0">
                <div className="glass-card rounded-2xl p-3 flex items-center gap-3 bg-white border border-rose-100">
                  <button onClick={() => setSelectedRealArtist(null)} className="text-xs text-rose-500 font-bold px-2 py-1 bg-rose-50 rounded-lg">〈 뒤로</button>
                  <img src={getImgUrl(selectedRealArtist.profileImageUrl || selectedRealArtist.fandomImage)} className="w-10 h-10 rounded-full object-cover" />
                  <p className="font-bold text-sm text-black">{selectedRealArtist.stageName}</p>
                </div>
                
                <div className="flex-1 overflow-y-auto space-y-4 p-4 bg-slate-50/50 rounded-xl">
                  {artistMessages.map((msg) => (
                    <div key={msg.id} className={`flex w-full ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                      {msg.sender !== 'user' && (
                        <img src={getImgUrl(selectedRealArtist.profileImageUrl || selectedRealArtist.fandomImage)} className="w-8 h-8 rounded-full object-cover mr-2 self-end" />
                      )}
                      <div className={`max-w-[70%] px-4 py-2.5 text-sm shadow-sm ${
                        msg.sender === 'user' 
                          ? 'bg-rose-500 text-white rounded-[1.5rem] rounded-br-none' 
                          : 'bg-white text-black border border-rose-100 rounded-[1.5rem] rounded-bl-none'
                      }`}>
                        {msg.text}
                        <div className={`text-[10px] mt-1 text-right ${msg.sender === 'user' ? 'text-white/70' : 'text-gray-400'}`}>
                          {msg.time}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input type="text" placeholder="메시지 입력..." value={inputText} onChange={(e) => setInputText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} className="flex-1 px-4 py-3 bg-white border border-rose-100 rounded-2xl text-sm text-black focus:outline-none" />
                  <button onClick={handleSend} className="w-12 h-12 rounded-2xl bg-rose-500 flex items-center justify-center text-white active:scale-95"><Send size={18} /></button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 3. 친구 채팅 탭 */}
        {activeTab === 'friends' && (
          <div className="flex-1 flex flex-col gap-4 min-h-0">
            {!selectedFriend ? (
              <div className="flex-1 space-y-3 overflow-y-auto">
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input type="text" placeholder="친구 검색..." className="w-full pl-9 pr-4 py-2.5 bg-white border border-rose-100 rounded-xl text-sm text-black focus:outline-none" />
                  </div>
                  <button onClick={() => toast.info('새 채팅 기능 준비 중입니다')} className="px-4 py-2.5 btn-primary-gradient text-white text-sm font-semibold rounded-xl">+ 새 채팅</button>
                </div>
                {friendChatsList.map((chat) => (
                  <div key={chat.id} onClick={() => joinFriendChat(chat)} className="glass-card rounded-2xl p-4 flex items-center gap-3 hover-lift cursor-pointer shadow-sm bg-white">
                    <img src={chat.image} className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-black">{chat.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{chat.lastMsg}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex-1 flex flex-col gap-4 min-h-0">
                <div className="glass-card rounded-2xl p-3 flex items-center gap-3 flex-shrink-0 bg-white border border-rose-100">
                  <button onClick={() => setSelectedFriend(null)} className="text-xs text-rose-500 font-bold px-2 py-1 bg-rose-50 rounded-lg">〈 뒤로</button>
                  <img src={selectedFriend.image} className="w-10 h-10 rounded-full object-cover" />
                  <p className="font-bold text-sm text-black">{selectedFriend.name}</p>
                </div>
                
                <div className="flex-1 overflow-y-auto space-y-4 min-h-0 p-4 bg-slate-50/50 rounded-xl">
                  {friendMessages.map((msg) => (
                    <div key={msg.id} className={`flex w-full ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                      {msg.sender !== 'user' && (
                        <img src={selectedFriend.image} className="w-8 h-8 rounded-full object-cover mr-2 self-end" />
                      )}
                      <div className={`max-w-[70%] px-4 py-2.5 text-sm shadow-sm ${
                        msg.sender === 'user' 
                          ? 'bg-rose-500 text-white rounded-[1.5rem] rounded-br-none' 
                          : 'bg-white text-black border border-rose-100 rounded-[1.5rem] rounded-bl-none'
                      }`}>
                        {msg.text}
                        <div className={`text-[10px] mt-1 text-right ${msg.sender === 'user' ? 'text-white/70' : 'text-gray-400'}`}>
                          {msg.time}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 flex-shrink-0">
                  <input type="text" placeholder="친구에게 메시지 보내기..." value={inputText} onChange={(e) => setInputText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} className="flex-1 px-4 py-3 bg-white border border-rose-100 rounded-2xl text-sm text-black focus:outline-none" />
                  <button onClick={handleSend} className="w-12 h-12 rounded-2xl bg-rose-500 flex items-center justify-center text-white active:scale-95"><Send size={18} /></button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}