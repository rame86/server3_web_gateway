/*
 * Lumina - 지도 뷰어 컴포넌트
 * 역할: 구글 지도를 임베드하여 위치를 보여주고, 카카오 맵 길찾기 링크 제공
 */

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { ExternalLink, Map as MapIcon, Loader2 } from "lucide-react"; // UI 아이콘

export function MapView({
  className,
  initialCenter = { lat: 37.5509, lng: 126.9410 }, // 초기 중심점 (기본값: 서강대학교)
  onMapReady // 부모 컴포넌트에서 지도를 제어하기 위한 콜백 함수
}) {
  const [venueName, setVenueName] = useState(""); // 장소명 상태
  const [location, setLocation] = useState(initialCenter); // 위도/경도 좌표 상태
  const [loading, setLoading] = useState(true); // 지도 로딩 상태

  // 부모 컴포넌트에게 지도를 제어할 수 있는 함수들을 전달
  useEffect(() => {
    if (onMapReady) {
      onMapReady({
        // 중심점 변경 함수
        setCenter: (pos) => setLocation(pos),
        // 줌 조절 (현재 기능 미구현)
        setZoom: () => { },
        // 마커 추가 및 장소명 설정 함수
        addMarker: (pos, title) => {
          setLocation(pos);
          setVenueName(title);
        }
      });
    }
  }, [onMapReady]);

  // 구글 지도 임베드 URL 생성 (좌표 기반)
  const googleEmbedUrl = `https://maps.google.com/maps?q=${location.lat},${location.lng}&hl=ko&z=16&output=embed`;

  // 카카오 맵 연동 URL (장소명이 있으면 검색으로, 없으면 좌표로 이동)
  const kakaoSearchUrl = venueName
    ? `https://map.kakao.com/link/search/${encodeURIComponent(venueName)}`
    : `https://map.kakao.com/link/map/${encodeURIComponent('공연장 환경')},${location.lat},${location.lng}`;

  return (
    <div className={cn("relative w-full h-[450px] bg-rose-50/20 flex flex-col rounded-2xl border border-rose-100 overflow-hidden", className)}>

      {/* 지도 표시 영역 */}
      <div className="relative flex-1 bg-gray-100">
        {/* 지도 로딩 중에 보여줄 스피너 */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm z-10 transition-opacity">
            <Loader2 className="w-8 h-8 text-rose-500 animate-spin" />
          </div>
        )}
        {/* 구글 지도 iframe */}
        <iframe
          src={googleEmbedUrl}
          className="w-full h-full border-none"
          title="Map View"
          allowFullScreen
          onLoad={() => setLoading(false)} // 로딩 완료 시 스피너 제거
        />
      </div>

      {/* 하단 정보 및 카카오 맵 버튼 영역 */}
      <div className="p-4 bg-white border-t border-rose-50 flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* 장소 정보 표시 */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-rose-50 rounded-lg text-rose-500">
            <MapIcon size={18} />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">{venueName || "공연장 위치"}</p>
            <p className="text-[10px] text-muted-foreground italic">Powered by Google Maps</p>
          </div>
        </div>

        {/* 외부 카카오 맵 연결 버튼 */}
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