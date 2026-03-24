import { useLocation } from "wouter";
import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Star, Heart, Search, ChevronRight } from 'lucide-react';
import { formatNumber } from '@/lib/data';
import { toast } from 'sonner';
import { coreApi } from '@/lib/api';

export default function UserArtists() {
  const [searchQuery, setSearchQuery] = useState('');
  const [artistList, setArtistList] = useState([]); // 🌟 서버 데이터를 담을 상태
  const [followed, setFollowed] = useState([]);    // 🌟 팔로우한 ID 리스트
  const [, setLocation] = useLocation();

  const gatewayUrl = (import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost').replace(/\/$/, '');

  const resolveImageUrl = (url) => {
      if (!url) return 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=600&auto=format&fit=crop';
      if (url.startsWith('http')) return url;
      return `${gatewayUrl}${url}`; // /images/core/profile/... 앞에 URL 붙이기
  };

  // 1. 아티스트 목록 가져오기
  useEffect(() => {
    const fetchArtists = async () => {
      try {
        const artistList = await coreApi.get('/artist/list');
        setArtistList(artistList.data);
      } catch (err) {
        toast.error("아티스트 목록을 불러오지 못했습니다.");
      }
    };
    fetchArtists();
  }, []);

  // 2. 팔로우 토글 API 연결
  const handleFollow = async (artistId) => {
    try {
      const artistList = await coreApi.post(`/artist/follow/${artistId}`);
      toast.success(artistList.data);
      
      setFollowed(prev => 
        prev.includes(artistId) ? prev.filter(id => id !== artistId) : [...prev, artistId]
      );
    } catch (err) {
      toast.error("팔로우 처리에 실패했습니다.");
    }
  };

  const filtered = artistList.filter((a) =>
    (a.stageName || "").includes(searchQuery) || (a.category || "").includes(searchQuery)
  );

  return (
    <Layout role="user">
      <div className="p-4 lg:p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
            아티스트 탐색
          </h1>
          <p className="text-sm text-muted-foreground">좋아하는 아티스트를 팔로우하고 팬덤에 가입하세요</p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="아티스트 또는 그룹 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-rose-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" />
        </div>

        {/* Artist Grid - 🌟 3열 그리드 복구 */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((artist) => {
            const isFollowed = followed.includes(artist.memberId);
            return (
              <div key={artist.memberId} className="glass-card rounded-2xl overflow-hidden soft-shadow hover-lift">
                {/* Cover - 🌟 높이 28 복구 */}
                <div className="relative h-28">
                  <img
                    src={resolveImageUrl(artist.profileImageUrl)}
                    className="w-full h-full object-cover" />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  <div className="absolute top-2 right-2 flex items-center gap-1 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full">
                    <Star size={10} className="text-amber-400" fill="currentColor" />
                    <span className="text-xs font-semibold text-foreground">인증</span>
                  </div>
                </div>

                {/* Profile Section - 🌟 중첩 구조 복구 */}
                <div className="px-4 pb-4 relative z-10">
                  <div className="flex items-end gap-3 -mt-6 mb-3">
                    <img
                        src={resolveImageUrl(artist.profileImageUrl)}
                        alt={artist.stageName}
                        className="w-14 h-14 rounded-2xl object-cover ring-3 ring-white shadow-md flex-shrink-0"
                    />

                    <div className="pb-1 drop-shadow-md">
                      <p className="font-bold text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">{artist.stageName}</p>
                      <p className="text-xs text-white/90 drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">{artist.category || 'Artist'}</p>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground mb-3 line-clamp-2 h-8">{artist.description}</p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    <span className="badge-rose px-2 py-0.5 rounded-full text-xs font-medium">#{(artist.category || 'K-POP').split('/')[0].trim()}</span>
                    <span className="badge-rose px-2 py-0.5 rounded-full text-xs font-medium">#{(artist.category || '').split('/')[1]?.trim() || 'ARTIST'}</span>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <div className="text-center">
                      <p className="text-sm font-bold text-foreground">{formatNumber(artist.followerCount || 0)}</p>
                      <p className="text-xs text-muted-foreground">팬</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-foreground">0</p>
                      <p className="text-xs text-muted-foreground">이벤트</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-foreground truncate px-1">LUMINA</p>
                      <p className="text-xs text-muted-foreground">팬덤명</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleFollow(artist.memberId)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-semibold transition-all ${isFollowed ?
                        'bg-rose-50 text-rose-600 border border-rose-200' :
                        'btn-primary-gradient text-white shadow-sm'}`
                      }>
                      <Heart size={14} fill={isFollowed ? 'currentColor' : 'none'} />
                      {isFollowed ? '팔로잉' : '팔로우'}
                    </button>
                    <button
                      onClick={() => setLocation(`/artists/${artist.memberId}`)}
                      className="flex items-center justify-center gap-1 px-3 py-2 rounded-xl text-sm font-semibold bg-gray-50 text-muted-foreground hover:bg-gray-100 transition-colors">
                      페이지 <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}