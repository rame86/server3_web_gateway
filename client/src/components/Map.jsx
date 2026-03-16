import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { ExternalLink, Map as MapIcon, Loader2 } from "lucide-react";

export function MapView({
  className,
  initialCenter = { lat: 37.5509, lng: 126.9410 }, // 기본값 서강대
  onMapReady
}) {
  const [venueName, setVenueName] = useState("");
  const [location, setLocation] = useState(initialCenter);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (onMapReady) {
      onMapReady({
        setCenter: (pos) => setLocation(pos),
        setZoom: () => {}, 
        addMarker: (pos, title) => {
            setLocation(pos);
            setVenueName(title);
        }
      });
    }
  }, [onMapReady]);

  // [중요 수정] 구글맵 URL 오타 고침!
  const googleEmbedUrl = `https://maps.google.com/maps?q=${location.lat},${location.lng}&hl=ko&z=16&output=embed`;
  
  const kakaoSearchUrl = venueName 
    ? `https://map.kakao.com/link/search/${encodeURIComponent(venueName)}`
    : `https://map.kakao.com/link/map/${encodeURIComponent('공연장')},${location.lat},${location.lng}`;

  return (
    <div className={cn("relative w-full h-[450px] bg-rose-50/20 flex flex-col rounded-2xl border border-rose-100 overflow-hidden", className)}>
      <div className="relative flex-1 bg-gray-100">
        {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm z-10 transition-opacity">
                <Loader2 className="w-8 h-8 text-rose-500 animate-spin" />
            </div>
        )}
        <iframe
          src={googleEmbedUrl}
          className="w-full h-full border-none"
          title="Map View"
          allowFullScreen
          onLoad={() => setLoading(false)}
        />
      </div>

      {/* MapView 내장 카카오맵 버튼 영역 */}
      <div className="p-4 bg-white border-t border-rose-50 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-50 rounded-lg text-rose-500">
                <MapIcon size={18} />
            </div>
            <div>
                <p className="text-sm font-bold text-foreground">{venueName || "공연장 위치"}</p>
                <p className="text-[10px] text-muted-foreground italic">Powered by Google Maps</p>
            </div>
        </div>
        
        <a 
          href={kakaoSearchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-5 py-2.5 bg-[#FEE500] hover:bg-[#FDD835] text-[#3C1E1E] font-bold rounded-xl shadow-sm text-xs transition-colors"
        >
          카카오 맵에서 길찾기 <ExternalLink size={14} />
        </a>
      </div>
    </div>
  );
}