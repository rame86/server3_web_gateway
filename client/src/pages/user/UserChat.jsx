/*
 * Lumina - User Chat Page
 * Soft Bloom Design: AI chatbot + artist chat + friend chat
 */

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Bot, Users, Send, Sparkles, Heart, Search } from 'lucide-react';
import { toast } from 'sonner';
// ✅ 소켓 클라이언트 추가
import { io } from 'socket.io-client';
import { coreApi } from '@/lib/api';

const chatTabs = [
  { key: 'ai', label: 'AI 챗봇', icon: <Bot size={16} /> },
  { key: 'artist', label: '아티스트', icon: <Heart size={16} /> },
  { key: 'friends', label: '친구', icon: <Users size={16} /> }
];

const mockMessages = [
  { id: 1, sender: 'bot', text: '안녕하세요! Lumina AI 챗봇입니다 💕 무엇이든 물어보세요!', time: '14:30' },
];

const friendChats = [
  { id: 1, name: '달빛소녀', image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop', lastMsg: '팬미팅 같이 가자!', time: '방금', unread: 2 },
  { id: 2, name: 'STARLIGHT 팬클럽', image: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=100&h=100&fit=crop', lastMsg: '오늘 방송 봤어요?', time: '5분 전', unread: 8 },
  { id: 3, name: '별빛모임', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop', lastMsg: '굿즈 공동구매 모집해요', time: '1시간 전', unread: 0 }
];

// ✅ 1. 이미지 URL 생성 (하드코딩 제거, 환경변수 사용)
const getImgUrl = (path) => {
  if (!path) return "https://placehold.co/100x100?text=No+Image";
  
  // VITE_API_GATEWAY_URL이 없으면 빈 문자열(상대경로) 반환
  const baseUrl = import.meta.env.VITE_API_GATEWAY_URL || ''; 
  return path.startsWith('http') ? path : `${baseUrl}${path}`; 
};

export default function UserChat() {
  const [activeTab, setActiveTab] = useState('ai');
  const [inputText, setInputText] = useState('');
  
  // ✅ 3개 탭 각각의 메시지 상태 독립 관리
  const [aiMessages, setAiMessages] = useState(mockMessages);
  const [artistMessages, setArtistMessages] = useState([]); // 아티스트 탭 대화용
  const [friendMessages, setFriendMessages] = useState([]); // 친구 탭 대화용

  // ✅ 아티스트 데이터 및 선택 상태
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRealArtist, setSelectedRealArtist] = useState(null); // 아티스트 탭에서 선택한 사람

  // ✅ 소켓 및 친구 선택 상태
  const [socket, setSocket] = useState(null);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [selectedFriend, setSelectedFriend] = useState(null);

  // 1️⃣ 아티스트 목록 가져오기
  useEffect(() => {
    const fetchArtists = async () => {
      try {
        setLoading(true);
        const res = await coreApi.get('/artist/list');
        setArtists(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("아티스트 로드 실패:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchArtists();
  }, []);

  // 2️⃣ 소켓 연결 초기화 (통합 수신용)
  useEffect(() => {
    // ✅ 2. 소켓 서버 URL 하드코딩 제거
    const chatServerUrl = import.meta.env.VITE_CHAT_SERVER_URL || 'http://localhost:3003';
    const newSocket = io(chatServerUrl);
    
    setSocket(newSocket);
    
    newSocket.on("message", (msg) => {
      if (msg.userId !== 1) { // 내 메시지가 아닐 때만
        const incomingMsg = {
          id: Date.now(), 
          sender: msg.role === 'ARTIST' ? 'bot' : 'friend',
          text: msg.content, 
          time: new Date(msg.at || Date.now()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
        };

        if (msg.role === 'ARTIST') {
          setArtistMessages((prev) => [...prev, incomingMsg]);
        } else {
          setFriendMessages((prev) => [...prev, incomingMsg]);
        }
      }
    });

    return () => newSocket.close();
  }, []);

  // 3️⃣ 친구 채팅방 입장
  const joinFriendChat = (chat) => {
    if (!socket) return;
    setSelectedFriend(chat);
    setFriendMessages([]); // 방 이동 시 내용 초기화
    setCurrentRoom(chat.id); 

    socket.emit("join", { roomId: chat.id, userId: 1, role: "USER" });
    toast.success(`${chat.name} 채팅방 입장!`);
  };

  // 4️⃣ 통합 메시지 전송 로직
  const handleSend = () => {
    if (!inputText.trim()) return;

    const newMsg = { id: Date.now(), sender: 'user', text: inputText, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) };

    // 🟢 아티스트 탭 전송
    if (activeTab === 'artist' && selectedRealArtist) {
      setArtistMessages(prev => [...prev, newMsg]);
      setInputText('');
      // 아티스트 답장 시뮬레이션
      setTimeout(() => {
        setArtistMessages(prev => [...prev, { id: Date.now()+1, sender: 'bot', text: `${selectedRealArtist.stageName}: 메시지 고마워요! 곧 확인할게요 🌸`, time: '방금' }]);
      }, 800);
    } 
    // 🔵 친구 탭 전송 (소켓 연동)
    else if (activeTab === 'friends' && currentRoom && socket) {
      socket.emit("message", { roomId: currentRoom, userId: 1, role: "USER", type: "TEXT", content: inputText });
      setFriendMessages(prev => [...prev, newMsg]); // 화면에 즉시 표시
      setInputText('');
    } 
    // 🟣 AI 탭 전송
    else if (activeTab === 'ai') {
      setAiMessages(prev => [...prev, newMsg]);
      setInputText('');
      setTimeout(() => {
        setAiMessages(prev => [...prev, { id: Date.now()+1, sender: 'bot', text: 'Lumina AI 처리 중입니다...', time: '방금' }]);
      }, 800);
    }
  };
  
  // 로딩 처리
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
                // 탭 바꿀 때 선택 상태 초기화 (깔끔하게 유지)
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

        {/* ========================================== */}
        {/* 1. AI 챗봇 탭 (목록 지우고 단독 채팅창으로) */}
        {/* ========================================== */}
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

        {/* ========================================== */}
        {/* 2. 아티스트 채팅 탭 (목록 <-> 채팅방)        */}
        {/* ========================================== */}
        {activeTab === 'artist' && (
          <div className="flex-1 flex flex-col gap-4 min-h-0">
            {!selectedRealArtist ? (
              <div className="space-y-3 overflow-y-auto">
                <div className="relative mb-4">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input type="text" placeholder="아티스트 검색..." className="w-full pl-9 pr-4 py-2.5 bg-white border border-rose-100 rounded-xl text-sm text-black focus:outline-none" />
                </div>
                {artists.map((artist) => (
                  <div key={artist.memberId} onClick={() => { setSelectedRealArtist(artist); setArtistMessages([]); }} className="glass-card rounded-2xl p-4 flex items-center gap-3 hover:bg-rose-50 cursor-pointer shadow-sm bg-white">
                    <img src={getImgUrl(artist.profileImageUrl || artist.fandomImage)} className="w-12 h-12 rounded-full object-cover" />
                    <div className="flex-1">
                      <p className="font-bold text-sm text-black">{artist.stageName}</p>
                      <p className="text-xs text-muted-foreground">{artist.category}</p>
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
                
                {/* 아티스트 메시지 출력 영역 */}
                <div className="flex-1 overflow-y-auto space-y-4 p-4 bg-slate-50/50 rounded-xl">
                  {artistMessages.length === 0 && <div className="text-center text-xs text-gray-400 py-10">아티스트와 첫 대화를 시작해보세요!</div>}
                  {artistMessages.map((msg) => (
                    // ✅ justify-end (나) / justify-start (상대방) 적용
                    <div key={msg.id} className={`flex w-full ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                      
                      {/* 상대방(아티스트)일 때만 프로필 사진 표시 */}
                      {msg.sender !== 'user' && (
                        <img src={getImgUrl(selectedRealArtist.profileImageUrl || selectedRealArtist.fandomImage)} className="w-8 h-8 rounded-full object-cover mr-2 self-end" />
                      )}
                      
                      {/* 말풍선 스타일 */}
                      <div className={`max-w-[70%] px-4 py-2.5 text-sm shadow-sm ${
                        msg.sender === 'user' 
                          ? 'bg-rose-500 text-white rounded-[1.5rem] rounded-br-none' // 내가 보낸 건 핑크색, 오른쪽 아래 직각
                          : 'bg-white text-black border border-rose-100 rounded-[1.5rem] rounded-bl-none' // 상대방이 보낸 건 흰색, 왼쪽 아래 직각
                      }`}>
                        {msg.text}
                        {/* 시간 표시 (선택) */}
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

        {/* ========================================== */}
        {/* 3. 친구 채팅 탭 (목록 <-> 채팅방)            */}
        {/* ========================================== */}
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
                {friendChats.map((chat) => (
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
                
                {/* 친구 메시지 출력 영역 */}
                <div className="flex-1 overflow-y-auto space-y-4 min-h-0 p-4 bg-slate-50/50 rounded-xl">
                  {friendMessages.map((msg) => (
                    // ✅ justify-end (나) / justify-start (상대방) 적용
                    <div key={msg.id} className={`flex w-full ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                      
                      {/* 상대방(친구)일 때만 프로필 사진 표시 */}
                      {msg.sender !== 'user' && (
                        <img src={selectedFriend.image} className="w-8 h-8 rounded-full object-cover mr-2 self-end" />
                      )}
                      
                      {/* 말풍선 스타일 */}
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