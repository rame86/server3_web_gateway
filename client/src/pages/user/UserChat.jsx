/*
 * Lumina - User Chat Page
 * Soft Bloom Design: AI chatbot + artist chat + friend chat
 */

import { useState } from 'react';
import Layout from '@/components/Layout';
import { Bot, Users, Send, Sparkles, Heart, Search } from 'lucide-react';
import { artists } from '@/lib/data';
import { toast } from 'sonner';

const chatTabs = [
{ key: 'ai', label: 'AI 챗봇', icon: <Bot size={16} /> },
{ key: 'artist', label: '아티스트', icon: <Heart size={16} /> },
{ key: 'friends', label: '친구', icon: <Users size={16} /> }];


const mockMessages = [
{ id: 1, sender: 'bot', text: '안녕하세요! 저는 이하은의 AI 챗봇이에요 💕 무엇이든 물어보세요!', time: '14:30' },
{ id: 2, sender: 'user', text: '안녕! 새 앨범은 언제 나와?', time: '14:31' },
{ id: 3, sender: 'bot', text: '새 앨범 준비 중이에요! 곧 좋은 소식 전해드릴게요 🌸 기대해주세요!', time: '14:31' },
{ id: 4, sender: 'user', text: '팬미팅 때 어떤 노래 불러줄 거야?', time: '14:32' },
{ id: 5, sender: 'bot', text: '팬들이 가장 좋아하는 곡들로 준비하고 있어요! 깜짝 선물도 있을 거예요 ✨', time: '14:32' }];


const friendChats = [
{ id: 1, name: '달빛소녀', image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop', lastMsg: '팬미팅 같이 가자!', time: '방금', unread: 2 },
{ id: 2, name: 'STARLIGHT 팬클럽', image: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=100&h=100&fit=crop', lastMsg: '오늘 방송 봤어요?', time: '5분 전', unread: 8 },
{ id: 3, name: '별빛모임', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop', lastMsg: '굿즈 공동구매 모집해요', time: '1시간 전', unread: 0 }];


export default function UserChat() {
  const [activeTab, setActiveTab] = useState('ai');
  const [selectedArtist, setSelectedArtist] = useState(artists[2]);
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState(mockMessages);

  const handleSend = () => {
    if (!inputText.trim()) return;
    const newMsg = { id: messages.length + 1, sender: 'user', text: inputText, time: '지금' };
    setMessages([...messages, newMsg]);
    setInputText('');
    setTimeout(() => {
      setMessages((prev) => [...prev, {
        id: prev.length + 1,
        sender: 'bot',
        text: '메시지 잘 받았어요! 🌸 AI 챗봇 기능이 곧 완성될 예정이에요.',
        time: '지금'
      }]);
    }, 800);
  };

  return (
    <Layout role="user">
      <div className="p-4 lg:p-6 h-[calc(100vh-64px)] flex flex-col gap-4">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
            채팅
          </h1>
          <p className="text-sm text-muted-foreground">아티스트 AI 챗봇, 1:1 채팅, 친구 채팅</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 bg-rose-50 p-1 rounded-2xl flex-shrink-0">
          {chatTabs.map((tab) =>
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-semibold transition-all ${
            activeTab === tab.key ?
            'bg-white text-rose-600 shadow-sm' :
            'text-muted-foreground hover:text-foreground'}`
            }>
            
              {tab.icon}
              {tab.label}
            </button>
          )}
        </div>

        {/* AI Chatbot */}
        {activeTab === 'ai' &&
        <div className="flex-1 flex flex-col gap-4 min-h-0">
            {/* Artist selector */}
            <div className="flex gap-2 overflow-x-auto pb-1 flex-shrink-0">
              {artists.slice(0, 4).map((artist) =>
            <button
              key={artist.id}
              onClick={() => setSelectedArtist(artist)}
              className={`flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl border transition-all ${
              selectedArtist.id === artist.id ?
              'border-rose-300 bg-rose-50' :
              'border-rose-100 bg-white hover:bg-rose-50'}`
              }>
              
                  <img src={artist.image} alt={artist.name} className="w-6 h-6 rounded-full object-cover" />
                  <span className="text-xs font-medium text-foreground">{artist.name}</span>
                  {selectedArtist.id === artist.id &&
              <span className="w-2 h-2 bg-rose-500 rounded-full" />
              }
                </button>
            )}
            </div>

            {/* Chat header */}
            <div className="glass-card rounded-2xl p-3 flex items-center gap-3 flex-shrink-0">
              <div className="relative">
                <img src={selectedArtist.image} alt={selectedArtist.name} className="w-10 h-10 rounded-full object-cover" />
                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-gradient-to-br from-violet-400 to-purple-500 rounded-full flex items-center justify-center">
                  <Bot size={8} className="text-white" />
                </div>
              </div>
              <div>
                <p className="font-semibold text-sm text-foreground">{selectedArtist.name} AI 챗봇</p>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-teal-400 rounded-full" />
                  <p className="text-xs text-muted-foreground">온라인 · 아티스트 페르소나 학습 완료</p>
                </div>
              </div>
              <div className="ml-auto">
                <span className="badge-lavender px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                  <Sparkles size={10} />
                  AI
                </span>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto space-y-3 min-h-0">
              {messages.map((msg) =>
            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} gap-2`}>
                  {msg.sender === 'bot' &&
              <img src={selectedArtist.image} alt="" className="w-8 h-8 rounded-full object-cover flex-shrink-0 self-end" />
              }
                  <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm ${
              msg.sender === 'user' ?
              'bg-gradient-to-br from-rose-400 to-pink-500 text-white rounded-br-sm' :
              'bg-white text-foreground rounded-bl-sm soft-shadow'}`
              }>
                    {msg.text}
                    <p className={`text-xs mt-1 ${msg.sender === 'user' ? 'text-white/70' : 'text-muted-foreground'}`}>
                      {msg.time}
                    </p>
                  </div>
                </div>
            )}
            </div>

            {/* Input */}
            <div className="flex gap-2 flex-shrink-0">
              <input
              type="text"
              placeholder={`${selectedArtist.name}에게 메시지 보내기...`}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="flex-1 px-4 py-3 bg-white border border-rose-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" />
            
              <button
              onClick={handleSend}
              className="w-12 h-12 rounded-2xl btn-primary-gradient flex items-center justify-center shadow-sm">
              
                <Send size={18} className="text-white" />
              </button>
            </div>
          </div>
        }

        {/* Artist Chat */}
        {activeTab === 'artist' &&
        <div className="flex-1 space-y-3 overflow-y-auto">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
              type="text"
              placeholder="아티스트 검색..."
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-rose-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" />
            
            </div>
            {artists.slice(0, 4).map((artist) =>
          <div
            key={artist.id}
            onClick={() => {
              setActiveTab('ai');
              setSelectedArtist(artist);
            }}
            className="glass-card rounded-2xl p-4 flex items-center gap-3 hover-lift cursor-pointer soft-shadow">
            
                <div className="relative">
                  <img src={artist.image} alt={artist.name} className="w-12 h-12 rounded-full object-cover" />
                  <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-teal-400 rounded-full border-2 border-white" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm text-foreground">{artist.name}</p>
                  <p className="text-xs text-muted-foreground">{artist.group} · {artist.fandom}</p>
                </div>
                <span className="badge-rose px-2 py-1 rounded-full text-xs font-semibold">채팅하기</span>
              </div>
          )}
          </div>
        }

        {/* Friends Chat */}
        {activeTab === 'friends' &&
        <div className="flex-1 space-y-3 overflow-y-auto">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                type="text"
                placeholder="친구 검색..."
                className="w-full pl-9 pr-4 py-2.5 bg-white border border-rose-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" />
              
              </div>
              <button
              onClick={() => toast.info('새 채팅 기능 준비 중입니다')}
              className="px-4 py-2.5 btn-primary-gradient text-white text-sm font-semibold rounded-xl shadow-sm">
              
                + 새 채팅
              </button>
            </div>
            {friendChats.map((chat) =>
          <div
            key={chat.id}
            onClick={() => toast.info('채팅 기능 준비 중입니다')}
            className="glass-card rounded-2xl p-4 flex items-center gap-3 hover-lift cursor-pointer soft-shadow">
            
                <img src={chat.image} alt={chat.name} className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-foreground">{chat.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{chat.lastMsg}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <p className="text-xs text-muted-foreground">{chat.time}</p>
                  {chat.unread > 0 &&
              <span className="w-5 h-5 bg-rose-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                      {chat.unread}
                    </span>
              }
                </div>
              </div>
          )}
          </div>
        }
      </div>
    </Layout>);

}