/*
 * Lumina - 프로필 수정 모달
 * 역할: 회원 기본 정보 및 아티스트 전용 프로필 수정 기능 제공
 * 특징: Framer Motion 없이 순수 CSS와 상태값으로 슬라이드 애니메이션 구현
 */

import { useState, useEffect } from 'react';
import { X, User, Music, Camera, ChevronDown } from 'lucide-react';

export default function ProfileEditModal({ isOpen, onClose, role }) {
  // --- 상태 관리 ---
  const [activeTab, setActiveTab] = useState('member'); // 아티스트일 경우 '회원정보' vs '아티스트 프로필' 탭 전환
  const [visible, setVisible] = useState(false);       // DOM 렌더링 여부
  const [animating, setAnimating] = useState(false);   // 애니메이션 클래스/스타일 적용 여부

  // 회원 기본 정보 폼 데이터
  const [memberForm, setMemberForm] = useState({
    name: localStorage.getItem('userName') || '',
    nick_name: '',
    email: '',
    phone: '',
    address: '',
    age: '',
  });

  // 아티스트 전용 프로필 폼 데이터 (role === 'artist' 일 때만 사용)
  const [artistForm, setArtistForm] = useState({
    stage_name: '',
    category: '',
    description: '',
    community_link: '',
    profile_image_url: '',
  });

  // --- 애니메이션 로직 ---
  // 모달이 열릴 때/닫힐 때 부드러운 전환을 위해 requestAnimationFrame과 setTimeout 사용
  useEffect(() => {
    if (isOpen) {
      setVisible(true); // 1. 먼저 DOM에 노출
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setAnimating(true)); // 2. 다음 프레임에서 애니메이션(트랜지션) 시작
      });
    } else {
      setAnimating(false); // 1. 애니메이션(트랜지션) 역행
      const t = setTimeout(() => setVisible(false), 350); // 2. 트랜지션 완료 후 DOM에서 제거
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  if (!visible) return null; // 열려있지 않을 때는 아무것도 렌더링하지 않음

  // --- 이벤트 핸들러 ---
  // 회원 정보 입력 변경 처리
  const handleMemberChange = (e) => {
    setMemberForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // 아티스트 정보 입력 변경 처리
  const handleArtistChange = (e) => {
    setArtistForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // 폼 제출 (현재는 API 준비 중 알림만 표시)
  const handleSubmit = (e) => {
    e.preventDefault();
    alert('API 연결 준비 중입니다.');
  };

  const isArtist = role === 'artist'; // 아티스트 권한 여부 확인

  return (
    <>
      {/* 배경 오버레이 (클릭 시 닫힘) */}
      <div
        className="fixed inset-0 z-50 transition-all duration-350"
        style={{
          background: animating ? 'rgba(0,0,0,0.45)' : 'rgba(0,0,0,0)',
          backdropFilter: animating ? 'blur(4px)' : 'blur(0px)',
          WebkitBackdropFilter: animating ? 'blur(4px)' : 'blur(0px)',
        }}
        onClick={onClose}
      />

      {/* 모달 패널 (우측 슬라이드인 방식) */}
      <div
        className="fixed top-0 right-0 h-full z-50 flex flex-col"
        style={{
          width: 'min(480px, 100vw)',
          background: 'rgba(255,255,255,0.97)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          boxShadow: '-8px 0 40px rgba(180,100,120,0.15)',
          transform: animating ? 'translateX(0)' : 'translateX(100%)', // animating 값에 따라 슬라이드 제어
          transition: 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {/* 상단 헤더 영역 */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-rose-100">
          <div>
            <h2 className="text-xl font-bold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
              정보 수정
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isArtist ? '회원 정보와 아티스트 프로필을 수정하세요' : '내 정보를 수정하세요'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-rose-50 transition-colors text-muted-foreground hover:text-rose-500"
          >
            <X size={20} />
          </button>
        </div>

        {/* 탭 전환 영역 (아티스트 권한일 때만 노출) */}
        {isArtist && (
          <div className="flex px-6 pt-4 gap-2">
            <button
              onClick={() => setActiveTab('member')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${activeTab === 'member'
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'bg-rose-50 text-rose-500 hover:bg-rose-100'
                }`}
            >
              <User size={14} />
              회원 정보
            </button>
            <button
              onClick={() => setActiveTab('artist')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${activeTab === 'artist'
                  ? 'bg-violet-500 text-white shadow-sm'
                  : 'bg-violet-50 text-violet-500 hover:bg-violet-100'
                }`}
            >
              <Music size={14} />
              아티스트 프로필
            </button>
          </div>
        )}

        {/* 메인 폼 스크롤 영역 */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* [1] 회원 정보 섹션: 일반 유저거나 아티스트의 'member' 탭일 때 표시 */}
            {(!isArtist || activeTab === 'member') && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-100 space-y-4">
                  <h3 className="text-sm font-semibold text-rose-700 flex items-center gap-1.5">
                    <User size={14} /> 기본 정보
                  </h3>
                  {/* 입력 필드들 (이름, 닉네임, 이메일, 전화번호, 나이, 주소) */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1">이름</label>
                      <input type="text" name="name" value={memberForm.name} onChange={handleMemberChange} className="..." />
                    </div>
                    {/* ... (중략) ... */}
                  </div>
                </div>
                <button type="submit" className="w-full py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-xl font-bold text-sm shadow-sm">
                  회원 정보 저장
                </button>
              </div>
            )}

            {/* [2] 아티스트 프로필 섹션: 아티스트이면서 'artist' 탭일 때만 표시 */}
            {isArtist && activeTab === 'artist' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-violet-50/60 border border-violet-100 space-y-4">
                  <h3 className="text-sm font-semibold text-violet-700 flex items-center gap-1.5">
                    <Music size={14} /> 아티스트 프로필
                  </h3>
                  {/* 아티스트 필드들 (활동명, 카테고리, 소개, 링크, 이미지 URL) */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1">활동명</label>
                      <input type="text" name="stage_name" value={artistForm.stage_name} onChange={handleArtistChange} className="..." />
                    </div>
                    {/* ... (중략) ... */}
                  </div>
                  {/* 이미지 URL 입력 및 미리보기 기능 */}
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">프로필 이미지 URL</label>
                    <div className="flex gap-2">
                      <input type="url" name="profile_image_url" value={artistForm.profile_image_url} onChange={handleArtistChange} className="..." />
                      {artistForm.profile_image_url && (
                        <img src={artistForm.profile_image_url} className="w-10 h-10 rounded-xl object-cover border" alt="preview" />
                      )}
                    </div>
                  </div>
                </div>
                <button type="submit" className="w-full py-3 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-xl font-bold text-sm shadow-sm">
                  아티스트 프로필 저장
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </>
  );
}