/*
 * ProfileEditModal - 회원정보 수정 모달
 * user: 회원 기본정보 수정
 * artist: 회원정보 + 아티스트 프로필 수정
 */

import { useState, useEffect } from 'react';
import { X, User, Music, Camera, ChevronDown } from 'lucide-react';

export default function ProfileEditModal({ isOpen, onClose, role }) {
  const [activeTab, setActiveTab] = useState('member');
  const [visible, setVisible] = useState(false);
  const [animating, setAnimating] = useState(false);

  // 멤버 정보 폼
  const [memberForm, setMemberForm] = useState({
    name: localStorage.getItem('userName') || '',
    nick_name: '',
    email: '',
    phone: '',
    address: '',
    age: '',
  });

  // 아티스트 정보 폼
  const [artistForm, setArtistForm] = useState({
    stage_name: '',
    category: '',
    description: '',
    community_link: '',
    profile_image_url: '',
  });

  // 모달 열기/닫기 애니메이션
  useEffect(() => {
    if (isOpen) {
      setVisible(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setAnimating(true));
      });
    } else {
      setAnimating(false);
      const t = setTimeout(() => setVisible(false), 350);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  if (!visible) return null;

  const handleMemberChange = (e) => {
    setMemberForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleArtistChange = (e) => {
    setArtistForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: API 연결 (추후 추가)
    alert('API 연결 준비 중입니다.');
  };

  const isArtist = role === 'artist';

  return (
    <>
      {/* 어두운 배경 오버레이 */}
      <div
        className="fixed inset-0 z-50 transition-all duration-350"
        style={{
          background: animating ? 'rgba(0,0,0,0.45)' : 'rgba(0,0,0,0)',
          backdropFilter: animating ? 'blur(4px)' : 'blur(0px)',
          WebkitBackdropFilter: animating ? 'blur(4px)' : 'blur(0px)',
        }}
        onClick={onClose}
      />

      {/* 모달 패널 - 오른쪽에서 슬라이드인 */}
      <div
        className="fixed top-0 right-0 h-full z-50 flex flex-col"
        style={{
          width: 'min(480px, 100vw)',
          background: 'rgba(255,255,255,0.97)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          boxShadow: '-8px 0 40px rgba(180,100,120,0.15)',
          transform: animating ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {/* 헤더 */}
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

        {/* 아티스트 탭 전환 */}
        {isArtist && (
          <div className="flex px-6 pt-4 gap-2">
            <button
              onClick={() => setActiveTab('member')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'member'
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'bg-rose-50 text-rose-500 hover:bg-rose-100'
              }`}
            >
              <User size={14} />
              회원 정보
            </button>
            <button
              onClick={() => setActiveTab('artist')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'artist'
                  ? 'bg-violet-500 text-white shadow-sm'
                  : 'bg-violet-50 text-violet-500 hover:bg-violet-100'
              }`}
            >
              <Music size={14} />
              아티스트 프로필
            </button>
          </div>
        )}

        {/* 폼 영역 */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* 회원 정보 탭 */}
            {(!isArtist || activeTab === 'member') && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-100 space-y-4">
                  <h3 className="text-sm font-semibold text-rose-700 flex items-center gap-1.5">
                    <User size={14} /> 기본 정보
                  </h3>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1">이름</label>
                      <input
                        type="text"
                        name="name"
                        value={memberForm.name}
                        onChange={handleMemberChange}
                        placeholder="실명"
                        className="w-full px-3 py-2.5 bg-white border border-rose-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1">닉네임</label>
                      <input
                        type="text"
                        name="nick_name"
                        value={memberForm.nick_name}
                        onChange={handleMemberChange}
                        placeholder="닉네임"
                        className="w-full px-3 py-2.5 bg-white border border-rose-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">이메일</label>
                    <input
                      type="email"
                      name="email"
                      value={memberForm.email}
                      onChange={handleMemberChange}
                      placeholder="이메일 주소"
                      className="w-full px-3 py-2.5 bg-white border border-rose-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 transition"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1">전화번호</label>
                      <input
                        type="tel"
                        name="phone"
                        value={memberForm.phone}
                        onChange={handleMemberChange}
                        placeholder="010-0000-0000"
                        className="w-full px-3 py-2.5 bg-white border border-rose-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1">나이</label>
                      <input
                        type="number"
                        name="age"
                        value={memberForm.age}
                        onChange={handleMemberChange}
                        placeholder="나이"
                        min="1" max="120"
                        className="w-full px-3 py-2.5 bg-white border border-rose-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">주소</label>
                    <input
                      type="text"
                      name="address"
                      value={memberForm.address}
                      onChange={handleMemberChange}
                      placeholder="주소를 입력하세요"
                      className="w-full px-3 py-2.5 bg-white border border-rose-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 transition"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-xl font-bold text-sm hover:opacity-90 transition-opacity shadow-sm"
                >
                  회원 정보 저장
                </button>
              </div>
            )}

            {/* 아티스트 프로필 탭 */}
            {isArtist && activeTab === 'artist' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-violet-50/60 border border-violet-100 space-y-4">
                  <h3 className="text-sm font-semibold text-violet-700 flex items-center gap-1.5">
                    <Music size={14} /> 아티스트 프로필
                  </h3>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1">활동명 (stage name)</label>
                      <input
                        type="text"
                        name="stage_name"
                        value={artistForm.stage_name}
                        onChange={handleArtistChange}
                        placeholder="활동명"
                        className="w-full px-3 py-2.5 bg-white border border-violet-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1">카테고리</label>
                      <select
                        name="category"
                        value={artistForm.category}
                        onChange={handleArtistChange}
                        className="w-full px-3 py-2.5 bg-white border border-violet-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 transition appearance-none"
                      >
                        <option value="">선택</option>
                        <option value="K-POP">K-POP</option>
                        <option value="주술회전">주술회전</option>
                        <option value="인디">인디</option>
                        <option value="힙합">힙합</option>
                        <option value="밴드">밴드</option>
                        <option value="기타">기타</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">소개</label>
                    <textarea
                      name="description"
                      value={artistForm.description}
                      onChange={handleArtistChange}
                      placeholder="아티스트 소개를 입력하세요"
                      rows={3}
                      className="w-full px-3 py-2.5 bg-white border border-violet-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 transition resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">커뮤니티 링크</label>
                    <input
                      type="url"
                      name="community_link"
                      value={artistForm.community_link}
                      onChange={handleArtistChange}
                      placeholder="https://..."
                      className="w-full px-3 py-2.5 bg-white border border-violet-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">프로필 이미지 URL</label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        name="profile_image_url"
                        value={artistForm.profile_image_url}
                        onChange={handleArtistChange}
                        placeholder="https://..."
                        className="flex-1 px-3 py-2.5 bg-white border border-violet-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 transition"
                      />
                      {artistForm.profile_image_url && (
                        <img
                          src={artistForm.profile_image_url}
                          onError={e => e.target.style.display = 'none'}
                          className="w-10 h-10 rounded-xl object-cover border border-violet-200"
                          alt="preview"
                        />
                      )}
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-xl font-bold text-sm hover:opacity-90 transition-opacity shadow-sm"
                >
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
