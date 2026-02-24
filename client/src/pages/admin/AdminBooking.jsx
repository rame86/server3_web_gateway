/*
 * FanVerse - Admin Booking Management
 * Soft Bloom Design: Event approval queue
 */

import { useState } from 'react';
import Layout from '@/components/Layout';
import { Calendar, Check, X, Eye, Clock, MapPin, Users, Ticket } from 'lucide-react';
import { events, formatPrice, eventTypeLabel } from '@/lib/data';
import { toast } from 'sonner';

const pendingEvents = [
{ id: 301, title: 'NOVA 단독 팬미팅 "STAR NIGHT"', artistName: 'NOVA', type: 'fanmeeting', date: '2026-04-15', venue: 'KSPO DOME', capacity: 5000, price: 88000, image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=200&fit=crop', submittedDate: '2026-02-18' },
{ id: 302, title: '이하은 팬사인회', artistName: '이하은', type: 'fansign', date: '2026-03-28', venue: '홍대 YES24 라이브홀', capacity: 200, price: 55000, image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=200&fit=crop', submittedDate: '2026-02-17' },
{ id: 303, title: 'BLOSSOM 팬파티 "BLOOM"', artistName: 'BLOSSOM', type: 'fanparty', date: '2026-03-20', venue: '강남 이벤트홀', capacity: 300, price: 45000, image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=200&fit=crop', submittedDate: '2026-02-16' }];


export default function AdminBooking() {
  const [activeTab, setActiveTab] = useState('pending');
  const [approvedIds, setApprovedIds] = useState([]);
  const [rejectedIds, setRejectedIds] = useState([]);

  const pendingList = pendingEvents.filter((e) => !approvedIds.includes(e.id) && !rejectedIds.includes(e.id));

  return (
    <Layout role="admin">
      <div className="p-4 lg:p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
            예매 승인 관리
          </h1>
          <p className="text-sm text-muted-foreground">이벤트 등록 요청을 검토하고 승인합니다</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="glass-card rounded-2xl p-4 text-center soft-shadow">
            <p className="text-xl font-bold text-amber-600" style={{ fontFamily: "'DM Sans', sans-serif" }}>{pendingList.length}</p>
            <p className="text-xs text-muted-foreground">승인 대기</p>
          </div>
          <div className="glass-card rounded-2xl p-4 text-center soft-shadow">
            <p className="text-xl font-bold text-teal-600" style={{ fontFamily: "'DM Sans', sans-serif" }}>{approvedIds.length}</p>
            <p className="text-xs text-muted-foreground">승인 완료</p>
          </div>
          <div className="glass-card rounded-2xl p-4 text-center soft-shadow">
            <p className="text-xl font-bold text-foreground" style={{ fontFamily: "'DM Sans', sans-serif" }}>{events.length}</p>
            <p className="text-xs text-muted-foreground">전체 이벤트</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 bg-amber-50 p-1 rounded-2xl">
          {[
          { key: 'pending', label: `대기 중 (${pendingList.length})` },
          { key: 'all', label: '전체 이벤트' }].
          map((tab) =>
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            activeTab === tab.key ?
            'bg-white text-amber-600 shadow-sm' :
            'text-muted-foreground hover:text-foreground'}`
            }>
            
              {tab.label}
            </button>
          )}
        </div>

        {activeTab === 'pending' &&
        <div className="space-y-4">
            {pendingList.length === 0 ?
          <div className="text-center py-16">
                <Calendar size={48} className="text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground">처리할 이벤트가 없습니다</p>
              </div> :

          pendingList.map((event) =>
          <div key={event.id} className="glass-card rounded-2xl overflow-hidden soft-shadow">
                  <div className="flex flex-col sm:flex-row">
                    <div className="relative sm:w-48 h-36 sm:h-auto flex-shrink-0">
                      <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
                      <div className="absolute top-2 left-2">
                        <span className="badge-rose px-2 py-1 rounded-lg text-xs font-bold">
                          {eventTypeLabel[event.type]}
                        </span>
                      </div>
                    </div>
                    <div className="p-4 flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-bold text-foreground">{event.title}</h3>
                          <p className="text-sm text-rose-500 font-medium">{event.artistName}</p>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                          <Clock size={11} />
                          {event.submittedDate}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Calendar size={12} className="text-rose-400" />
                          {event.date}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <MapPin size={12} className="text-rose-400" />
                          {event.venue}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Users size={12} className="text-rose-400" />
                          {event.capacity.toLocaleString()}석
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-600">
                          <Ticket size={12} />
                          {formatPrice(event.price)}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                    onClick={() => {
                      setApprovedIds([...approvedIds, event.id]);
                      toast.success(`"${event.title}" 이벤트가 승인되었습니다`);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-white rounded-xl bg-teal-500 hover:bg-teal-600 transition-colors">
                    
                          <Check size={16} />
                          승인
                        </button>
                        <button
                    onClick={() => {
                      setRejectedIds([...rejectedIds, event.id]);
                      toast.warning(`"${event.title}" 이벤트가 거절되었습니다`);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-red-600 rounded-xl bg-red-50 hover:bg-red-100 transition-colors">
                    
                          <X size={16} />
                          거절
                        </button>
                        <button
                    onClick={() => toast.info('상세 검토 기능 준비 중입니다')}
                    className="px-4 py-2.5 text-sm font-semibold text-muted-foreground rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                    
                          <Eye size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
          )
          }
          </div>
        }

        {activeTab === 'all' &&
        <div className="space-y-3">
            {events.map((event) =>
          <div key={event.id} className="glass-card rounded-2xl p-4 soft-shadow flex items-center gap-4">
                <img src={event.image} alt={event.title} className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-foreground line-clamp-1">{event.title}</p>
                  <p className="text-xs text-muted-foreground">{event.date} · {event.venue}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-rose-600 font-semibold">{formatPrice(event.price)}</span>
                    <span className="text-xs text-muted-foreground">잔여 {event.remaining}석</span>
                  </div>
                </div>
                <span className="px-2 py-1 rounded-full text-xs font-semibold bg-teal-100 text-teal-700 flex-shrink-0">
                  승인됨
                </span>
              </div>
          )}
          </div>
        }
      </div>
    </Layout>);

}