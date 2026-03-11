import { useState, useEffect } from 'react';
import { useLocation, useParams } from 'wouter';
import Layout from '@/components/Layout';
import { Calendar, MapPin, Ticket, ChevronLeft, Heart, Share2, Info, X } from 'lucide-react';
import { formatPrice, eventTypeLabel, eventTypeBadgeClass } from '@/lib/data';
import { toast } from 'sonner';
import { resApi } from '@/lib/api';
import { MapView } from '@/components/Map';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

export default function UserEventDetail() {
    const [, setLocation] = useLocation();
    const params = useParams();
    const eventId = params.id;
    const [event, setEvent] = useState(null);
    const [wishlisted, setWishlisted] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isMapOpen, setIsMapOpen] = useState(false);

    useEffect(() => {
        const fetchEventDetail = async () => {
            try {
                setLoading(true);
                const { data } = await resApi.get(`/events/${eventId}`);
                const e = data.event || data;
                
                // Map backend snake_case to frontend camelCase
                setEvent({
                    id: e.event_id,
                    title: e.title,
                    artistId: e.artist_id ? Number(e.artist_id) : null,
                    artistName: e.artist_name || 'Artist',
                    type: (e.event_type || 'fanmeeting').toLowerCase(),
                    date: e.event_date ? new Date(e.event_date).toLocaleDateString() : 'TBD',
                    time: e.open_time ? new Date(e.open_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'TBD',
                    venue: e.venue || e.location_name || 'KSPO DOME',
                    capacity: e.total_capacity || 0,
                    remaining: e.available_seats || 0,
                    price: e.price || 0,
                    image: (e.images && e.images.length > 0) ? e.images[0] : 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&h=300&fit=crop',
                    description: e.description || ''
                });
            } catch (error) {
                toast.error('이벤트 상세 정보를 가져오는데 실패했습니다.');
                console.error('Fetch event detail error:', error);
            } finally {
                setLoading(false);
            }
        };

        if (eventId) {
            fetchEventDetail();
        }
    }, [eventId]);

    const handleMapReady = async (map) => {
        try {
            // First set the existing venue name if available
            if (event?.venue && event.venue !== 'KSPO DOME') {
                map.addMarker({ lat: 37.5203, lng: 127.1155 }, event.venue);
            }

            // Then fetch precise coordinates/details from backend
            const { data } = await resApi.get(`/events/${eventId}/location`);
            
            if (data) {
                const location = { 
                    lat: parseFloat(data.lat || 37.5203), 
                    lng: parseFloat(data.lng || 127.1155) 
                };
                map.setCenter(location);
                map.addMarker(location, data.venue || data.location_name || event?.venue);
            }
        } catch (error) {
            console.error("Failed to fetch event location:", error);
            // Even if fetch fails, show the initial marker with the event's venue name
            if (event?.venue) {
                map.addMarker({ lat: 37.5203, lng: 127.1155 }, event.venue);
            }
        }
    };

    if (loading) {
        return (
            <Layout role="user">
                <div className="p-4 lg:p-6 flex justify-center items-center h-64">
                    <p className="text-muted-foreground">이벤트 정보를 불러오는 중...</p>
                </div>
            </Layout>
        );
    }

    if (!event) {
        return (
            <Layout role="user">
                <div className="p-4 lg:p-6 flex flex-col justify-center items-center h-64">
                    <p className="text-muted-foreground mb-4">이벤트를 찾을 수 없습니다.</p>
                    <button onClick={() => setLocation('/user/events')} className="text-rose-600 hover:underline">
                        목록으로 돌아가기
                    </button>
                </div>
            </Layout>
        );
    }

    return (
        <Layout role="user">
            <div className="p-4 lg:p-6 space-y-6 pb-24">
                {/* Navigation */}
                <button
                    onClick={() => setLocation('/user/events')}
                    className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                    <ChevronLeft size={16} />
                    목록으로 돌아가기
                </button>

                {/* Hero Section */}
                <div className="relative overflow-hidden rounded-3xl h-64 lg:h-80 w-full group">
                    <img src={event.image} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
                        <div>
                            <span className={`px-2.5 py-1 rounded-lg text-xs font-bold mb-3 inline-block ${eventTypeBadgeClass[event.type]}`}>
                                {eventTypeLabel[event.type]}
                            </span>
                            <h1 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                                {event.title}
                            </h1>
                            <p className="text-white/80 font-medium">아티스트: {event.artistName}</p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => {
                                    setWishlisted(!wishlisted);
                                    toast.success(wishlisted ? '위시리스트에서 뺐습니다' : '위시리스트에 담았습니다');
                                }}
                                className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center hover:bg-white/30 transition-colors"
                            >
                                <Heart size={18} className={wishlisted ? "text-rose-400" : "text-white"} fill={wishlisted ? "currentColor" : "none"} />
                            </button>
                            <button onClick={() => toast.info('링크가 복사되었습니다')} className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center hover:bg-white/30 transition-colors">
                                <Share2 size={18} className="text-white" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Content Details */}
                <div className="grid lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="glass-card p-6 rounded-3xl soft-shadow">
                            <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                                <Info size={18} className="text-rose-400" /> 상세 정보
                            </h2>
                            <div className="space-y-4">
                                <p className="text-muted-foreground text-sm leading-relaxed">
                                    팬 여러분들의 성원에 힘입어 마련된 스페셜 {eventTypeLabel[event.type]}입니다.
                                    잊지 못할 특별한 무대와 팬들과 함께하는 다채로운 이벤트가 준비되어 있습니다.
                                    아티스트와 가장 가까이에서 소통할 수 있는 기회를 놓치지 마세요!
                                </p>
                                <div className="p-4 bg-rose-50 rounded-2xl">
                                    <h3 className="text-sm font-semibold text-rose-700 mb-2">공연/행사 관람 유의사항</h3>
                                    <ul className="text-xs text-rose-600/80 space-y-1 list-disc list-inside">
                                        <li>행사 시작 1시간 전부터 입장 가능합니다.</li>
                                        <li>본인 확인을 위해 신분증과 예매 내역을 지참해주세요.</li>
                                        <li>행사장 내 사진/영상 촬영은 지정된 시간에만 가능합니다.</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {/* Sticky Summary Card */}
                        <div className="glass-card p-6 rounded-3xl soft-shadow sticky top-20">
                            <h3 className="font-bold text-lg mb-4 pb-4 border-b border-rose-100">예매 요약</h3>

                            <div className="space-y-4 mb-6">
                                <div className="flex gap-3 items-start">
                                    <div className="mt-0.5 p-2 bg-rose-50 rounded-xl text-rose-500"><Calendar size={16} /></div>
                                    <div>
                                        <p className="text-xs text-muted-foreground font-medium mb-0.5">일시</p>
                                        <p className="text-sm font-bold text-foreground">{event.date} {event.time}</p>
                                    </div>
                                </div>

                                <div className="flex gap-3 items-start">
                                    <div className="mt-0.5 p-2 bg-rose-50 rounded-xl text-rose-500"><MapPin size={16} /></div>
                                    <div>
                                        <p className="text-xs text-muted-foreground font-medium mb-0.5">장소</p>
                                        <p className="text-sm font-bold text-foreground">{event.venue}</p>
                                        <button 
                                            onClick={() => setIsMapOpen(true)}
                                            className="text-xs text-rose-500 font-medium mt-1 hover:underline"
                                        >
                                            지도 보기
                                        </button>
                                    </div>
                                </div>

                                <div className="flex gap-3 items-start">
                                    <div className="mt-0.5 p-2 bg-rose-50 rounded-xl text-rose-500"><Ticket size={16} /></div>
                                    <div>
                                        <p className="text-xs text-muted-foreground font-medium mb-0.5">티켓 가격</p>
                                        <p className="text-sm font-bold text-foreground">{formatPrice(event.price)}</p>
                                        <p className="text-xs text-muted-foreground mt-0.5">잔여석 {event.remaining}석</p>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => setLocation(`/user/booking/${event.id}`)}
                                className="w-full flex justify-center items-center gap-2 py-3.5 btn-primary-gradient text-white rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all"
                            >
                                예약 진행하기 <ChevronLeft size={16} className="rotate-180" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Map Modal */}
                <Dialog open={isMapOpen} onOpenChange={setIsMapOpen}>
                    <DialogContent className="sm:max-w-2xl p-0 overflow-hidden bg-white rounded-3xl border-none">
                        <DialogHeader className="p-6 pb-2">
                            <DialogTitle className="text-xl font-bold flex items-center gap-2">
                                <MapPin className="text-rose-500" size={20} />
                                공연장 위치 안내
                            </DialogTitle>
                        </DialogHeader>
                        <div className="p-6 pt-0 space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-bold text-foreground">{event.venue}</p>
                                    <p className="text-xs text-muted-foreground">정확한 위치는 지도를 참조해주세요.</p>
                                </div>
                            </div>
                            <div className="rounded-2xl overflow-hidden border border-rose-100 h-[400px]">
                                <MapView 
                                    className="h-full w-full"
                                    onMapReady={handleMapReady}
                                />
                            </div>
                            <div className="flex justify-end pt-2">
                                <button 
                                    onClick={() => setIsMapOpen(false)}
                                    className="px-6 py-2 bg-rose-50 text-rose-600 font-bold rounded-xl text-sm hover:bg-rose-100 transition-colors"
                                >
                                    닫기
                                </button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </Layout>
    );
}
