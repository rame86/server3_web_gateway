/*
 * Lumina - Artist Booking & Event Management
 * Soft Bloom Design: Event management and proposal flow for artists
 */

import { useState } from 'react';
import Layout from '@/components/Layout';
import { cn } from "@/lib/utils";
import { Calendar, Plus, Search, MapPin, Users, Ticket, Clock, Check, MoreVertical, Image as ImageIcon, Sparkles, Map } from 'lucide-react';
import { events, formatPrice, eventTypeLabel, eventTypeBadgeClass } from '@/lib/data';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function ArtistBooking() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  // My events filtering (artistId 3 is Lee Ha-eun)
  const myEvents = events.filter(event => event.artistId === 3);

  const filteredEvents = myEvents.filter(event =>
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.venue.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    // FormData mapping to DB Schema:
    // title, artist_id, artist_name, event_type, description, price, total_capacity, available_seats, 
    // event_date, open_time, close_time, venue, address, latitude, longitude, image_url
    toast.success('이벤트 등록 요청이 완료되었습니다. 관리자 승인 후 티켓 판매가 시작됩니다.');
    setIsAdding(false);
  };

  return (
    <Layout role="artist">
      <div className="p-4 lg:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
              예매 및 이벤트 관리
            </h1>
            <p className="text-sm text-muted-foreground">개최 중인 이벤트와 신규 등록 제안 내역을 관리합니다 (DB Schema Sync)</p>
          </div>
          
          <Dialog open={isAdding} onOpenChange={setIsAdding}>
            <DialogTrigger asChild>
              <button className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 text-white font-bold rounded-2xl shadow-lg hover:bg-teal-700 transition-all hover-lift">
                <Plus size={18} />
                새 이벤트 등록
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px] rounded-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>새 이벤트(공연) 등록 요청 (Res Schema)</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">이벤트 제목 (Title)</Label>
                  <Input id="title" placeholder="공연 또는 이벤트 이름을 입력하세요" required className="rounded-xl border-teal-100 focus:ring-teal-300" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">이벤트 유형 (Event Type)</Label>
                    <select id="type" className="w-full h-10 px-3 bg-white border border-teal-100 rounded-xl text-sm focus:ring-2 focus:ring-teal-300 focus:outline-none">
                      <option value="CONCERT">콘서트 (CONCERT)</option>
                      <option value="FANMEETING">팬미팅 (FANMEETING)</option>
                      <option value="FANSIGN">팬사인회 (FANSIGN)</option>
                      <option value="FANPARTY">팬파티 (FANPARTY)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="event_date">진행 일시 (Event Date)</Label>
                    <Input id="event_date" type="datetime-local" required className="rounded-xl border-teal-100" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="venue">장소명 (Venue)</Label>
                    <Input id="venue" placeholder="예: KSPO DOME" required className="rounded-xl border-teal-100" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">상세 주소 (Address)</Label>
                    <Input id="address" placeholder="서울시 송파구 올림픽로 424" required className="rounded-xl border-teal-100" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="total_capacity">총 정원 (Capacity)</Label>
                    <Input id="total_capacity" type="number" placeholder="5000" required className="rounded-xl border-teal-100" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">티켓 가격 (Price - Integer)</Label>
                    <Input id="price" type="number" placeholder="0" required className="rounded-xl border-teal-100" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="open_time">예매 시작 (Open Time)</Label>
                    <Input id="open_time" type="datetime-local" required className="rounded-xl border-teal-100" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="close_time">예매 종료 (Close Time)</Label>
                    <Input id="close_time" type="datetime-local" required className="rounded-xl border-teal-100" />
                  </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="description">이벤트 상세 설명 (Description)</Label>
                    <Textarea id="description" placeholder="이벤트에 대한 상세 설명을 입력하세요" className="rounded-xl border-teal-100 min-h-[100px]" />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="image_url">포스터 이미지 URL (Image URL)</Label>
                    <div className="flex gap-2">
                      <Input id="image_url" placeholder="https://..." className="rounded-xl border-teal-100" />
                      <Button type="button" variant="outline" className="rounded-xl border-teal-200">
                        <ImageIcon size={18} />
                      </Button>
                    </div>
                </div>
                
                <DialogFooter className="pt-4">
                  <Button type="button" variant="ghost" onClick={() => setIsAdding(false)} className="rounded-xl">취소</Button>
                  <Button type="submit" className="bg-teal-600 hover:bg-teal-700 rounded-xl px-8 text-white">등록 제안하기</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <div className="flex gap-3 max-w-md">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="이벤트명 또는 장소 검색..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-11 bg-white border-teal-100 rounded-2xl focus:ring-teal-300 shadow-sm" 
            />
          </div>
        </div>

        {/* Analytics Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-2">
            <div className="glass-card rounded-3xl p-6 bg-gradient-to-br from-teal-500/10 to-transparent border-teal-100">
                <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="text-teal-500" size={20} />
                    <h2 className="font-bold text-lg" style={{ fontFamily: "'Playfair Display', serif" }}>실시간 예매 현황</h2>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-white/60 rounded-2xl border border-teal-50">
                        <p className="text-xs text-muted-foreground mb-1">총 예매 건수</p>
                        <p className="text-2xl font-bold text-teal-600">328건</p>
                    </div>
                    <div className="p-4 bg-white/60 rounded-2xl border border-teal-50">
                        <p className="text-xs text-muted-foreground mb-1">예정된 오프라인 이벤트</p>
                        <p className="text-2xl font-bold text-rose-500">2건</p>
                    </div>
                </div>
            </div>
            
            <div className="glass-card rounded-3xl p-6 bg-gradient-to-br from-violet-500/10 to-transparent border-violet-100">
                <div className="flex items-center gap-2 mb-4">
                    <Map className="text-violet-500" size={20} />
                    <h2 className="font-bold text-lg" style={{ fontFamily: "'Playfair Display', serif" }}>주요 지역 팬 분포</h2>
                </div>
                <div className="flex items-end gap-2 h-16">
                    <div className="flex-1 bg-violet-200 rounded-t-lg h-[40%]"></div>
                    <div className="flex-1 bg-violet-400 rounded-t-lg h-[80%]"></div>
                    <div className="flex-1 bg-violet-600 rounded-t-lg h-[100%]"></div>
                    <div className="flex-1 bg-violet-400 rounded-t-lg h-[60%]"></div>
                    <div className="flex-1 bg-violet-200 rounded-t-lg h-[30%]"></div>
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground mt-2">
                    <span>경기</span><span>서울</span><span>부산</span><span>대구</span><span>강원</span>
                </div>
            </div>
        </div>

        {/* Events Feed */}
        <div className="space-y-4">
          {filteredEvents.length > 0 ? (
            filteredEvents.map((event) => (
              <div key={event.id} className="glass-card rounded-3xl overflow-hidden soft-shadow hover-lift transition-all flex flex-col sm:flex-row">
                <div className="sm:w-64 h-48 sm:h-auto relative">
                    <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
                    <div className="absolute top-3 left-3">
                        <span className={cn("px-3 py-1 rounded-full text-xs font-bold shadow-md", eventTypeBadgeClass[event.type])}>
                            {eventTypeLabel[event.type]}
                        </span>
                    </div>
                </div>
                
                <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                        <div className="flex items-start justify-between mb-2">
                            <h3 className="text-xl font-bold text-foreground leading-tight">{event.title}</h3>
                            <button className="p-1.5 text-muted-foreground hover:bg-teal-50 rounded-lg transition-colors">
                                <MoreVertical size={18} />
                            </button>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-y-3 gap-x-6 mt-4">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Calendar size={16} className="text-teal-500" />
                                {event.date}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <MapPin size={16} className="text-teal-500" />
                                {event.venue}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Users size={16} className="text-teal-500" />
                                정원 {event.capacity}명
                            </div>
                            <div className="flex items-center gap-2 text-sm font-bold text-teal-600">
                                <Ticket size={16} />
                                {formatPrice(event.price)}
                            </div>
                        </div>
                    </div>
                    
                    <div className="mt-6 pt-4 border-t border-teal-50 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="text-xs">
                                <span className="text-muted-foreground">판매 완료: </span>
                                <span className="font-bold text-teal-600">{event.capacity - event.remaining} / {event.capacity}</span>
                            </div>
                            <div className="w-24 h-1.5 bg-teal-100 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-teal-500" 
                                    style={{ width: `${((event.capacity - event.remaining) / event.capacity) * 100}%` }}
                                ></div>
                            </div>
                        </div>
                        
                        <div className="flex gap-2">
                            <button className="px-4 py-2 text-xs font-bold text-muted-foreground border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                                내역 내려받기
                            </button>
                            <button className="px-4 py-2 text-xs font-bold text-white bg-teal-600 rounded-xl hover:bg-teal-700 shadow-sm transition-colors">
                                실시간 관리
                            </button>
                        </div>
                    </div>
                </div>
              </div>
            ))
          ) : (
            <div className="py-20 text-center glass-card rounded-3xl">
              <Calendar size={48} className="mx-auto text-teal-200 mb-4" />
              <p className="text-muted-foreground">검색된 이벤트가 없습니다.</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
