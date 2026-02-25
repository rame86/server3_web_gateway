/*
 * Lumina - User Events & Booking Page
 * Soft Bloom Design: Event cards with booking flow
 */

import { useState } from 'react';
import { useLocation } from 'wouter';
import Layout from '@/components/Layout';
import { Calendar, MapPin, Users, Ticket, Search, Filter } from 'lucide-react';
import { events, bookings, formatPrice, eventTypeLabel, eventTypeBadgeClass } from '@/lib/data';
import { toast } from 'sonner';

const EVENT_BANNER = 'https://private-us-east-1.manuscdn.com/sessionFile/umqDS2iCyxhwdKkQqabwQ5/sandbox/5OYI281mcXf2naQYMxZ8bN-img-4_1771469993000_na1fn_ZXZlbnQtYmFubmVy.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvdW1xRFMyaUN5eGh3ZEtrUXFhYndRNS9zYW5kYm94LzVPWUkyODFtY1hmMm5hUVlNeFo4Yk4taW1nLTRfMTc3MTQ2OTk5MzAwMF9uYTFmbl9aWFpsYm5RdFltRnVibVZ5LnBuZz94LW9zcy1wcm9jZXNzPWltYWdlL3Jlc2l6ZSx3XzE5MjAsaF8xOTIwL2Zvcm1hdCx3ZWJwL3F1YWxpdHkscV84MCIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTc5ODc2MTYwMH19fV19&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=SpS9~fyVvbYsm2qctqJZV9eUrlIfhyCabWJgO-3X5SXV2pHfoLaIwtRR7ue8UIvhE3Yng8ezsBmKmhnHeDqN0FT-1aftlegleiZ6X8~5TtlKRrpO5wjQmWXVdO--NP31HCS0i55-KKwDDcNu~XzhMXd1lgbpZ9CRTP5eHveHhlJlsdAVoePEwGYZDhXZoSAe7TF1VEVQ16GXCSk1k63Poa0dON-KDYYNzP1NTW7kXD-aHpMalMS7WTrQbeqDv3lr3Dynh~jEekjHzTnuRpERwFfcMZEaBQ213--VePnE6oNHUb~pnkMQdc7myD2YF~EA~OkcBxEoLNJXBN~HtICNzw__';

const tabs = [
  { key: 'events', label: '이벤트 목록' },
  { key: 'my-bookings', label: '내 예매 내역' }];


const statusConfig = {
  confirmed: { label: '예매 확정', class: 'bg-teal-100 text-teal-700' },
  pending: { label: '대기 중', class: 'bg-amber-100 text-amber-700' },
  cancelled: { label: '취소됨', class: 'bg-gray-100 text-gray-600' }
};

export default function UserEvents() {
  const [activeTab, setActiveTab] = useState('events');
  const [, setLocation] = useLocation();

  return (
    <Layout role="user">
      <div className="p-4 lg:p-6 space-y-6">
        {/* Banner */}
        <div className="relative overflow-hidden rounded-3xl h-36">
          <img src={EVENT_BANNER} alt="이벤트" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
          <div className="absolute inset-0 flex items-center px-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Calendar size={18} className="text-white" />
                <span className="text-white/80 text-sm font-medium">Events</span>
              </div>
              <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
                이벤트 & 예매
              </h1>
              <p className="text-white/70 text-sm">팬미팅, 팬사인회, 팬파티 예매</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 bg-rose-50 p-1 rounded-2xl">
          {tabs.map((tab) =>
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === tab.key ?
                  'bg-white text-rose-600 shadow-sm' :
                  'text-muted-foreground hover:text-foreground'}`
              }>

              {tab.label}
            </button>
          )}
        </div>

        {activeTab === 'events' &&
          <>
            {/* Search */}
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="이벤트 검색..."
                  className="w-full pl-9 pr-4 py-2.5 bg-white border border-rose-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" />

              </div>
              <button
                onClick={() => toast.info('필터 기능 준비 중입니다')}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-rose-100 rounded-xl text-sm font-medium text-muted-foreground hover:bg-rose-50 transition-colors">

                <Filter size={16} />
                필터
              </button>
            </div>

            {/* Event type filter */}
            <div className="flex gap-2 overflow-x-auto pb-1">
              {['전체', '팬미팅', '팬사인회', '팬파티', '콘서트'].map((type) =>
                <button
                  key={type}
                  onClick={() => toast.info(`${type} 필터 적용`)}
                  className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${type === '전체' ?
                      'bg-rose-500 text-white' :
                      'bg-white border border-rose-100 text-muted-foreground hover:bg-rose-50'}`
                  }>

                  {type}
                </button>
              )}
            </div>

            {/* Events List */}
            <div className="space-y-4">
              {events.map((event) =>
                <div key={event.id} className="glass-card rounded-2xl overflow-hidden soft-shadow hover-lift">
                  <div className="flex flex-col sm:flex-row">
                    <div className="relative sm:w-48 h-36 sm:h-auto flex-shrink-0">
                      <img
                        src={event.image}
                        alt={event.title}
                        className="w-full h-full object-cover" />

                      <div className="absolute top-2 left-2">
                        <span className={`px-2 py-1 rounded-lg text-xs font-bold ${eventTypeBadgeClass[event.type]}`}>
                          {eventTypeLabel[event.type]}
                        </span>
                      </div>
                    </div>
                    <div className="p-4 flex-1">
                      <h3 className="font-bold text-foreground mb-2">{event.title}</h3>
                      <div className="space-y-1.5 mb-3">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar size={14} className="text-rose-400" />
                          {event.date} {event.time}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin size={14} className="text-rose-400" />
                          {event.venue}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Users size={14} className="text-rose-400" />
                          잔여석 {event.remaining}석 / {event.capacity}석
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xl font-bold text-rose-600">{formatPrice(event.price)}</span>
                          <span className="text-xs text-muted-foreground ml-1">/ 1인</span>
                        </div>
                        <button
                          onClick={() => setLocation(`/user/events/${event.id}`)}
                          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-xl btn-primary-gradient shadow-sm">

                          <Ticket size={14} />
                          예매하기
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        }

        {activeTab === 'my-bookings' &&
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
              내 예매 내역
            </h2>
            {bookings.map((booking) =>
              <div key={booking.id} className="glass-card rounded-2xl p-4 soft-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-foreground text-sm">{booking.eventTitle}</h3>
                    <p className="text-xs text-muted-foreground">{booking.artistName}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${statusConfig[booking.status].class}`}>
                    {statusConfig[booking.status].label}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Calendar size={12} className="text-rose-400" />
                    {booking.date}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MapPin size={12} className="text-rose-400" />
                    {booking.venue}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Ticket size={12} className="text-rose-400" />
                    {booking.seats}매
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-600">
                    {formatPrice(booking.totalPrice)}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => toast.info('예매 상세 정보 기능 준비 중입니다')}
                    className="flex-1 py-2 text-xs font-semibold text-rose-600 bg-rose-50 rounded-xl hover:bg-rose-100 transition-colors">

                    상세보기
                  </button>
                  {booking.status !== 'cancelled' &&
                    <button
                      onClick={() => toast.warning('취소 신청이 접수되었습니다')}
                      className="flex-1 py-2 text-xs font-semibold text-muted-foreground bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">

                      취소/환불
                    </button>
                  }
                </div>
              </div>
            )}
          </div>
        }
      </div>
    </Layout>);

}