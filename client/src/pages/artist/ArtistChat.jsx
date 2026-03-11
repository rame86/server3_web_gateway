/*
 * Lumina - Artist Fan Chat
 * Soft Bloom Design: Premium real-time messaging interface for artists
 */

import { useState, useEffect, useRef } from 'react';
import Layout from '@/components/Layout';
import { cn } from "@/lib/utils";
import { Send, Users, MessageSquare, Shield, Smile, Paperclip, MoreHorizontal, User, Sparkles, Clock, Bell, Info, Search } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function ArtistChat() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: '별빛팬',
      content: '오늘 공연 너무 고생하셨어요!! 💜',
      time: '15:24',
      isArtist: false,
    },
    {
      id: 2,
      sender: '이하은',
      content: '팬 여러분 덕분에 무사히 마칠 수 있었어요. 다들 조심히 들어가세요! 👋',
      time: '15:30',
      isArtist: true,
    },
    {
      id: 3,
      sender: 'Petal_0325',
      content: '언니 목소리 정말 꿀이에요... 다음 앨범 벌써 기대중!',
      time: '15:31',
      isArtist: false,
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [activeRoom, setActiveRoom] = useState(1);
  const scrollRef = useRef(null);

  const rooms = [
    { id: 1, name: '오늘 공연 어땠나요? (공식)', participants: 342, lastMessage: '조심히 들어가세요! 👋', time: '15:30' },
    { id: 2, name: '미공개 곡 스포일러 🤫', participants: 128, lastMessage: '쉿! 이건 우리만...', time: '어제' },
    { id: 3, name: '팬레터 읽어주는 시간', participants: 520, lastMessage: '지수님 너무 예뻐요', time: '오전 11시' },
  ];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const newMessage = {
      id: messages.length + 1,
      sender: '이하은', // Artist name
      content: inputValue,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
      isArtist: true,
    };

    setMessages([...messages, newMessage]);
    setInputValue('');
    toast.success('메시지가 성공적으로 전송되었습니다.');
  };

  return (
    <Layout role="artist">
      <div className="flex h-[calc(100vh-64px-48px)] lg:h-[calc(100vh-64px)] overflow-hidden bg-violet-50/30">
        
        {/* Room List (Sidebar) */}
        <div className="w-80 border-r border-violet-100 bg-white flex flex-col hidden md:flex">
          <div className="p-4 border-b border-violet-50 flex items-center justify-between">
            <h2 className="font-bold text-lg flex items-center gap-2" style={{ fontFamily: "'Playfair Display', serif" }}>
              <MessageSquare className="text-violet-500" size={20} />
              팬 채팅방
            </h2>
            <button className="p-2 hover:bg-violet-50 rounded-xl transition-colors text-muted-foreground">
              <MoreHorizontal size={18} />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {rooms.map((room) => (
              <button
                key={room.id}
                onClick={() => setActiveRoom(room.id)}
                className={cn(
                  "w-full p-4 rounded-3xl flex flex-col items-start gap-1 transition-all group",
                  activeRoom === room.id 
                    ? "bg-violet-600 text-white shadow-lg scale-[1.02]" 
                    : "hover:bg-violet-50 text-foreground"
                )}
              >
                <div className="flex justify-between w-full items-center">
                  <span className="font-bold truncate text-sm">{room.name}</span>
                  <span className={cn("text-[10px]", activeRoom === room.id ? "text-violet-200" : "text-muted-foreground")}>
                    {room.time}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-1">
                  <Users size={12} className={activeRoom === room.id ? "text-violet-200" : "text-violet-400"} />
                  <span className={cn("text-xs font-medium", activeRoom === room.id ? "text-violet-100 opacity-80" : "text-muted-foreground")}>
                    {room.participants}명 참여 중
                  </span>
                </div>
                <p className={cn(
                  "text-xs truncate w-full text-left mt-2",
                  activeRoom === room.id ? "text-violet-100/70" : "text-muted-foreground"
                )}>
                  {room.lastMessage}
                </p>
              </button>
            ))}
          </div>
          
          <div className="p-4 border-t border-violet-50 bg-violet-50/30">
             <div className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-violet-100 shadow-sm">
                <Avatar className="w-10 h-10 border-2 border-violet-200">
                  <AvatarImage src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop" />
                  <AvatarFallback>LH</AvatarFallback>
                </Avatar>
                <div>
                   <p className="text-xs font-bold leading-none">이하은 <Sparkles size={10} className="inline text-violet-500 mb-0.5" /></p>
                   <p className="text-[10px] text-teal-600 font-bold mt-1 inline-flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-pulse"></span>
                      접속 중
                   </p>
                </div>
             </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-white">
          {/* Header */}
          <div className="h-16 border-b border-violet-50 flex items-center justify-between px-6 bg-white/80 backdrop-blur-md sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-violet-100 rounded-2xl flex items-center justify-center text-violet-600">
                <Users size={20} />
              </div>
              <div>
                <h3 className="font-bold text-sm leading-none">{rooms.find(r => r.id === activeRoom)?.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                   <p className="text-[10px] text-muted-foreground">실시간 참여 {rooms.find(r => r.id === activeRoom)?.participants}명</p>
                   <span className="w-0.5 h-0.5 bg-gray-300 rounded-full"></span>
                   <button className="text-[10px] text-violet-600 font-bold hover:underline">공지사항 확인</button>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              <button className="p-2.5 hover:bg-violet-50 rounded-xl transition-colors text-muted-foreground tooltip-trigger">
                <Bell size={18} />
              </button>
              <button className="p-2.5 hover:bg-violet-50 rounded-xl transition-colors text-muted-foreground">
                <Search size={18} />
              </button>
              <button className="p-2.5 hover:bg-violet-50 rounded-xl transition-colors text-muted-foreground lg:hidden">
                <Info size={18} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-violet-50/20 to-transparent"
          >
            <div className="text-center py-6">
               <span className="px-5 py-1.5 bg-violet-100 text-violet-700 rounded-full text-[10px] font-bold shadow-sm">
                  2026년 3월 11일
               </span>
            </div>

            {messages.map((msg) => (
              <div key={msg.id} className={cn(
                "flex items-end gap-3 max-w-[85%]",
                msg.isArtist ? "ml-auto flex-row-reverse" : "mr-auto"
              )}>
                {!msg.isArtist && (
                  <Avatar className="w-8 h-8 shrink-0 mb-1 border-2 border-violet-50">
                    <AvatarFallback className="bg-violet-100 text-violet-600 text-[10px] font-bold">P</AvatarFallback>
                  </Avatar>
                )}
                
                <div className="flex flex-col gap-1.5">
                  {!msg.isArtist && (
                    <span className="text-[10px] font-bold text-muted-foreground ml-1">{msg.sender}</span>
                  )}
                  <div className={cn(
                    "px-5 py-3 rounded-3xl text-sm shadow-sm",
                    msg.isArtist 
                      ? "bg-violet-600 text-white rounded-br-none font-medium" 
                      : "bg-white border border-violet-50 text-foreground rounded-bl-none"
                  )}>
                    {msg.content}
                  </div>
                </div>
                <span className="text-[9px] text-muted-foreground mb-1 shrink-0 px-1">
                  {msg.time}
                </span>
              </div>
            ))}
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-violet-50">
             <div className="max-w-4xl mx-auto relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                   <button className="p-1.5 text-muted-foreground hover:bg-violet-50 rounded-lg transition-colors">
                      <Paperclip size={18} />
                   </button>
                   <button className="p-1.5 text-muted-foreground hover:bg-violet-50 rounded-lg transition-colors">
                      <Smile size={18} />
                   </button>
                </div>
                <form onSubmit={handleSend}>
                   <Input 
                      placeholder="팬들에게 메시지를 남겨보세요..." 
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      className="h-14 pl-24 pr-16 bg-violet-50/50 border-transparent focus:bg-white focus:border-violet-200 rounded-[2rem] transition-all text-sm shadow-inner"
                   />
                   <button 
                      type="submit"
                      disabled={!inputValue.trim()}
                      className={cn(
                        "absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-md hover-scale",
                        inputValue.trim() ? "bg-violet-600 text-white" : "bg-violet-100 text-violet-300"
                      )}
                   >
                      <Send size={18} />
                   </button>
                </form>
             </div>
             <p className="text-[10px] text-center text-muted-foreground mt-3 flex items-center justify-center gap-1.5 uppercase tracking-widest font-bold">
                <Shield size={10} className="text-teal-500" />
                모든 대화는 운영 정책에 따라 관리됩니다
             </p>
          </div>
        </div>

        {/* Right Info Panel (Desktop) */}
        <div className="w-80 border-l border-violet-100 bg-white hidden lg:flex flex-col">
           <div className="p-6 text-center border-b border-violet-50">
              <h4 className="font-bold text-sm mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>참여 중인 팬 분포</h4>
              <div className="flex flex-col gap-3">
                 <div className="space-y-1.5">
                    <div className="flex justify-between text-[10px] font-bold px-1">
                       <span>국내 팬</span>
                       <span className="text-violet-600">68%</span>
                    </div>
                    <div className="h-1.5 bg-violet-50 rounded-full overflow-hidden">
                       <div className="h-full bg-violet-500" style={{ width: '68%' }}></div>
                    </div>
                 </div>
                 <div className="space-y-1.5">
                    <div className="flex justify-between text-[10px] font-bold px-1">
                       <span>해외 팬</span>
                       <span className="text-violet-400">32%</span>
                    </div>
                    <div className="h-1.5 bg-violet-50 rounded-full overflow-hidden">
                       <div className="h-full bg-violet-300" style={{ width: '32%' }}></div>
                    </div>
                 </div>
              </div>
           </div>
           
           <div className="flex-1 p-6">
              <div className="flex items-center justify-between mb-4">
                 <h4 className="font-bold text-sm" style={{ fontFamily: "'Playfair Display', serif" }}>실시간 활발한 팬</h4>
                 <Users size={14} className="text-muted-foreground" />
              </div>
              <div className="space-y-4">
                 {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-100 to-rose-50 flex items-center justify-center text-[10px] font-bold text-violet-600 border border-violet-50">
                          P{i}
                       </div>
                       <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold truncate">Petal_Fan_{i}23</p>
                          <p className="text-[10px] text-muted-foreground">멤버십 레벨 {6-i}</p>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
           
           <div className="p-6 border-t border-violet-50">
              <Button variant="outline" className="w-full rounded-2xl border-violet-100 bg-violet-50/30 font-bold text-xs text-violet-600 h-11 hover:bg-violet-100">
                 채팅 내역 리포트 확인
              </Button>
           </div>
        </div>
      </div>
    </Layout>
  );
}
