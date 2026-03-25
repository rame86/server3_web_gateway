import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import Layout from '@/components/Layout';
import { User, Phone, MapPin, Lock, Star, Camera, Save, RefreshCw, Mail, Calendar, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { coreApi } from '@/lib/api';
import { cn } from '@/lib/utils';
// 🌟 Button 컴포넌트 임포트 확인! (없다면 일반 button 태그로 대체 가능)
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter
} from "@/components/ui/dialog";


// 핵심 주석: 하드코딩 지양을 위한 아티스트 카테고리 상수 분리 (팬덤 플랫폼 맞춤 추천)
const ARTIST_CATEGORIES = [
  { value: 'K-POP / 지하돌', label: 'K-POP / 지하돌' },
  { value: '작가 / 웹툰', label: '작가 / 웹툰' },
  { value: '작가 / 애니', label: '작가 / 애니' },
  { value: '작가 / 소설', label: '작가 / 소설' },
  { value: '힙합 / 랩', label: '힙합 / 랩' },
  { value: '밴드 / 인디', label: '밴드 / 인디' },
  { value: '배우 / 연기자', label: '배우 / 연기자' },
  { value: '크리에이터 / 인플루언서', label: '크리에이터 / 인플루언서' },
  { value: '기타', label: '기타 (직접 입력)' }
];

export default function UserProfile() {
  const [, setLocation] = useLocation();
  const fileInputRef = useRef(null);

  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const userRole = localStorage.getItem('userRole') || 'user';
  const isArtist = userRole === 'artist';
  const themeText = isArtist ? 'text-violet-600' : 'text-rose-600';

  const [formData, setFormData] = useState({
    email: '',
    name: '',
    phone: '',
    age: '',
    address: '',
    profileImageUrl: ''
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    newPasswordConfirm: ''
  });

  // 회원 정보 불러오기
  useEffect(() => {
    const fetchMyInfo = async () => {
      try {
        const res = await coreApi.get('/member/my-info');
        setFormData(prev => ({
          ...prev,
          ...res.data
        }));
      } catch (e) {
        console.error('Failed to fetch user info', e);
      }
    };
    fetchMyInfo();
  }, []);

  // 🌟 수정된 초기 상태값
  const [upgradeForm, setUpgradeForm] = useState({
    artistName: '',
    fandomName: '',    // 추가
    subCategory: '',
    description: '',
    communityLink: '',
    bgImageFile: null  // 파일 객체를 저장할 곳 추가
  });

  // select 박스에서 선택한 값을 추적하기 위한 전용 상태
  const [selectedCategory, setSelectedCategory] = useState('');

  const handleUpgradeChange = (e) => {
    setUpgradeForm({ ...upgradeForm, [e.target.name]: e.target.value });
  };

  const handleCategorySelect = (e) => {
    const value = e.target.value;
    setSelectedCategory(value);

    if (value !== '기타') {
      setUpgradeForm({ ...upgradeForm, subCategory: value });
    } else {
      setUpgradeForm({ ...upgradeForm, subCategory: '' });
    }
  };

  const handleUpgradeSubmit = async () => {
    // 1. 필수값 유효성 검사 (팬덤명과 배경 이미지도 체크)
    if (!upgradeForm.artistName || !upgradeForm.fandomName || !upgradeForm.subCategory || !upgradeForm.bgImageFile) {
      toast.error('필수 정보를 모두 입력하고 배경 이미지를 선택해 주세요!');
      return;
    }

    try {
      setIsSubmitting(true);
      toast.loading('아티스트 전환 신청을 접수 중이야...');

      const currentUserId = localStorage.getItem('memberId') || localStorage.getItem('userId');

      // 🌟 2. 파일 전송을 위한 FormData 생성
      const formData = new FormData();
      formData.append('memberId', Number(currentUserId));
      formData.append('artistName', upgradeForm.artistName);
      formData.append('fandomName', upgradeForm.fandomName); // 추가된 필드
      formData.append('subCategory', upgradeForm.subCategory);
      formData.append('description', upgradeForm.description);
      formData.append('communityLink', upgradeForm.communityLink);
      
      // 실제 이미지 파일 담기
      formData.append('bgImageFile', upgradeForm.bgImageFile); 

      // 🌟 3. 전송 (multipart/form-data 헤더는 axios가 알아서 잡아주지만 명시해도 좋음)
      await coreApi.post('/artist/apply', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.dismiss();
      toast.success('신청 완료! 관리자 승인 후 알려줄게.');
      setIsUpgradeModalOpen(false);
    } catch (error) {
      toast.dismiss();
      console.error("❌ 전환 신청 에러:", error);
      toast.error('신청 중 오류가 발생했어.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await coreApi.post('/member/update', formData);
      toast.success('회원 정보가 안전하게 변경되었습니다.');
      // Update local storage name if changed
      if (formData.name) localStorage.setItem('userName', formData.name);
      if (formData.profileImageUrl) localStorage.setItem('userImage', formData.profileImageUrl);
      
      // 레이아웃의 좌측 프로필 이미지가 즉시 변경사항을 반영하게끔 페이지 자동 새로고침 처리
      setTimeout(() => {
        window.location.reload();
      }, 1000);

    } catch (error) {
      toast.error('정보 수정 중 오류가 발생했습니다.');
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.newPasswordConfirm) {
      toast.error('새 비밀번호가 일치하지 않습니다.');
      return;
    }
    try {
      await coreApi.post('/member/password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      toast.success('비밀번호가 성공적으로 변경되었습니다.');
      setPasswordForm({ currentPassword: '', newPassword: '', newPasswordConfirm: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || '비밀번호 변경 중 오류가 발생했습니다.');
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      toast.loading('이미지 업로드 중...');
      const uploadData = new FormData();
      uploadData.append('profileImage', file);

      const res = await coreApi.post('/member/profile/image', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setFormData(prev => ({ ...prev, profileImageUrl: res.data.url }));
      toast.dismiss();
      toast.success('이미지 임시 업로드 완료! 하단의 저장 버튼을 눌러주세요.');
    } catch (error) {
      toast.dismiss();
      console.error(error);
      toast.error('이미지 업로드에 실패했습니다.');
    }
  };

  return (
    <Layout role={userRole}>
      <div className="p-4 lg:p-8 max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
              {isArtist ? '아티스트 설정' : '마이페이지'}
            </h1>
            <p className="text-sm text-muted-foreground">회원가입 시 입력한 정보를 확인하고 수정할 수 있습니다.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* 프로필 카드 섹션 (왼쪽) */}
          <div className="md:col-span-1 space-y-6">
            <div className={cn("glass-card p-6 rounded-[32px] text-center space-y-4 shadow-sm border",
              isArtist ? "border-violet-100" : "border-rose-100")}>
              <div className="relative inline-block cursor-pointer" onClick={handleImageClick}>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
                <img
                  src={formData.profileImageUrl || (isArtist
                    ? "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop"
                    : "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop")}
                  className="w-24 h-24 rounded-full border-4 border-white shadow-md object-cover"
                  alt="Profile"
                />
                <button type="button" className={cn("absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg border transition-all",
                  isArtist ? "text-violet-500 border-violet-100" : "text-rose-500 border-rose-100")}>
                  <Camera size={14} />
                </button>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{formData.name}님</h2>
                <div className="flex items-center justify-center gap-1 mt-1">
                  <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full uppercase",
                    isArtist ? "bg-violet-100 text-violet-600" : "bg-rose-100 text-rose-600")}>
                    {userRole}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 space-y-2">
                <div className="flex justify-between text-[11px]">
                  <span className="text-muted-foreground">멤버십 등급</span>
                  <span className="font-bold text-gray-700 underline underline-offset-4 decoration-rose-300">LUMINA SILVER</span>
                </div>
                {/* 🌟 아티스트 전환 신청 버튼 (기존 알림창 대신 팝업을 열게 수정) */}
                {!isArtist && (
                  <button
                    onClick={() => setIsUpgradeModalOpen(true)} // 팝업 열기
                    className="w-full py-2.5 text-xs font-bold bg-violet-50 text-violet-600 rounded-xl hover:bg-violet-100 transition-all flex items-center justify-center gap-2 mt-2"
                  >
                    <Star size={14} fill="currentColor" />
                    아티스트 전환 신청
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* 상세 정보 변경 폼 (오른쪽) */}
          <div className="md:col-span-2 space-y-6">
            <div className="glass-card p-8 rounded-[32px] shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                <User size={20} className={themeText} />
                개인정보 관리
              </h3>

              <form onSubmit={handleUpdateProfile} className="space-y-5">
                {/* 이메일 (Read-only) */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 ml-1 flex items-center gap-1">
                    <Mail size={12} /> 이메일 (변경 불가)
                  </label>
                  <input name="email" value={formData.email} readOnly
                    className="w-full px-4 py-3 bg-gray-100/50 border border-gray-100 rounded-2xl text-sm text-gray-500 cursor-not-allowed outline-none" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* 이름 */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 ml-1">이름</label>
                    <input name="name" value={formData.name} onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-rose-200 outline-none transition-all" />
                  </div>
                  {/* 연락처 */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 ml-1">연락처</label>
                    <input name="phone" value={formData.phone} onChange={handleChange} placeholder="010-0000-0000"
                      className="w-full px-4 py-3 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-rose-200 outline-none transition-all" />
                  </div>
                </div>

                {/* 나이/연령대 필드 추가 */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 ml-1 flex items-center gap-1">
                    <Calendar size={12} /> 나이 (연령대)
                  </label>
                  <input name="age" value={formData.age} onChange={handleChange} placeholder="예: 20대, 25 등"
                    className="w-full px-4 py-3 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-rose-200 outline-none transition-all" />
                </div>

                {/* 주소 필드 */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 ml-1 flex items-center gap-1">
                    <MapPin size={12} /> 배송지 주소
                  </label>
                  <input name="address" value={formData.address} onChange={handleChange} placeholder="굿즈 배송을 위한 정확한 주소를 입력해주세요"
                    className="w-full px-4 py-3 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-rose-200 outline-none transition-all" />
                </div>

                <button type="submit" className={cn("w-full py-4 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 mt-4",
                  isArtist ? "bg-gradient-to-r from-violet-500 to-purple-600" : "btn-primary-gradient")}>
                  <Save size={18} />
                  정보 수정 완료
                </button>
              </form>
            </div>

            {/* 보안(비밀번호) 섹션 */}
            <div className="glass-card p-8 rounded-[32px] shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                <Lock size={20} className={themeText} />
                비밀번호 변경
              </h3>
              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <input type="password" name="currentPassword" value={passwordForm.currentPassword} onChange={handlePasswordChange} placeholder="현재 비밀번호 확인"
                  className="w-full px-4 py-3 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-gray-200" required />
                <div className="grid grid-cols-2 gap-4">
                  <input type="password" name="newPassword" value={passwordForm.newPassword} onChange={handlePasswordChange} placeholder="새 비밀번호"
                    className="w-full px-4 py-3 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-gray-200" required />
                  <input type="password" name="newPasswordConfirm" value={passwordForm.newPasswordConfirm} onChange={handlePasswordChange} placeholder="새 비밀번호 다시 입력"
                    className="w-full px-4 py-3 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-gray-200" required />
                </div>
                <button type="submit" className="w-full py-3.5 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black transition-all shadow-md">
                  비밀번호 재설정
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* 🌟 아티스트 전환 신청 팝업(Dialog) */}
      <Dialog open={isUpgradeModalOpen} onOpenChange={setIsUpgradeModalOpen}>
        <DialogContent className="sm:max-w-[460px] rounded-[32px] p-0 border-none shadow-2xl bg-white outline-none overflow-hidden">          
          <div className="max-h-[85vh] overflow-y-auto custom-scrollbar p-8 pt-10">
            <DialogHeader className="text-center space-y-2">
              <div className="w-14 h-14 bg-violet-100 rounded-2xl flex items-center justify-center text-violet-600 mx-auto mb-2">
                <Star size={28} fill="currentColor" />
              </div>
              <DialogTitle className="text-2xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
                Artist Upgrade
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                루미나의 아티스트로 활동하기 위한 기본 정보를 입력해 주세요.
              </DialogDescription>
            </DialogHeader>

            {/* 🌟 신청 양식 (DTO 기반) */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-400 ml-1 uppercase">Artist Name</label>
                <input
                  name="artistName"
                  value={upgradeForm.artistName}
                  onChange={handleUpgradeChange}
                  placeholder="활동하실 아티스트명을 입력하세요"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-violet-200 outline-none transition-all"
                />
              </div>

              {/* 핵심 주석: 새로 추가된 팬덤명 입력란 */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-400 ml-1 uppercase">Fandom Name</label>
                <input
                  name="fandomName" // 상태값의 키와 일치
                  value={upgradeForm.fandomName}
                  onChange={handleUpgradeChange}
                  placeholder="팬덤 이름을 입력해주세요 (예: 아미, 블링크)"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-violet-200 outline-none transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-400 ml-1 uppercase">Sub Category</label>
                {/* 핵심 주석: 카테고리 선택 셀렉트 박스 */}
                <select
                  value={selectedCategory}
                  onChange={handleCategorySelect}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-violet-200 outline-none transition-all text-gray-700"
                >
                  <option value="" disabled>카테고리를 선택해주세요</option>
                  {ARTIST_CATEGORIES.map(category => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
                {/* 핵심 주석: '기타' 선택 시에만 렌더링되는 직접 입력 폼 */}
                {selectedCategory === '기타' && (
                  <input
                    name="subCategory"
                    value={upgradeForm.subCategory}
                    onChange={handleUpgradeChange}
                    placeholder="활동 분야를 직접 입력해주세요"
                    className="w-full px-4 py-3 mt-2 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-violet-200 outline-none transition-all"
                  />
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-400 ml-1 uppercase">Description</label>
                <textarea
                  name="description"
                  value={upgradeForm.description}
                  onChange={handleUpgradeChange}
                  placeholder="팬들에게 보여줄 한 줄 소개를 적어주세요"
                  rows={2}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-violet-200 outline-none transition-all resize-none"
                />
              </div>

              {/* 🌟 핵심 주석: 새로 추가된 커뮤니티 링크 입력창 */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-400 ml-1 uppercase">Community Link</label>
                <input
                  name="communityLink" // 상태값의 키와 일치
                  value={upgradeForm.communityLink}
                  onChange={handleUpgradeChange}
                  placeholder="팬덤 커뮤니티나 공식 SNS 주소"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm outline-none"
                />
              </div>

              {/* 🌟 기존 Background URL 대신 파일 업로드로 변경 */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-400 ml-1 uppercase">Dashboard Background Image</label>
                <div className="group relative">
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-200 rounded-[24px] bg-gray-50 hover:bg-violet-50 hover:border-violet-200 transition-all cursor-pointer overflow-hidden relative">
                      {/* 선택된 파일 미리보기가 있으면 표시, 없으면 업로드 아이콘 표시 */}
                      {upgradeForm.bgImageFile ? (
                        <div className="flex flex-col items-center p-4">
                          <ImageIcon size={24} className="text-violet-500 mb-2" />
                          <span className="text-xs font-medium text-gray-600 truncate max-w-[200px]">
                            {upgradeForm.bgImageFile.name}
                          </span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-violet-500 mb-3 group-hover:scale-110 transition-transform">
                            <ImageIcon size={20} />
                          </div>
                          <p className="text-xs text-gray-500 font-medium">이미지 파일을 선택해주세요</p>
                          <p className="text-[10px] text-gray-400 mt-1">PNG, JPG (MAX. 5MB)</p>
                        </div>
                      )}
                      <input 
                        type="file" 
                        name="bgImageFile"
                        className="hidden" 
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            setUpgradeForm(prev => ({ ...prev, bgImageFile: file }));
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>
            {/* 안내 문구 */}
            <div className="bg-violet-50 p-4 rounded-2xl flex items-start gap-3">
              <Mail size={16} className="text-violet-500 mt-0.5" />
              <div className="text-[11px] text-violet-700 leading-relaxed">
                신청하신 정보는 관리자 검토 후 계정 권한이 부여됩니다.
                추가 계약 서류는 이메일로 발송됩니다.
                {/* 추가 계약 서류는 <strong>{formData.email}</strong>로 발송됩니다. */}
              </div>
            </div>

            <DialogFooter className="flex gap-2 pt-2">
              <button
                onClick={() => setIsUpgradeModalOpen(false)}
                className="flex-1 py-3.5 rounded-2xl font-bold text-gray-400 hover:bg-gray-50 transition-all"
              >
                취소
              </button>
              <button
                onClick={handleUpgradeSubmit}
                disabled={isSubmitting}
                className="flex-1 py-3.5 rounded-2xl font-bold bg-violet-600 text-white shadow-lg shadow-violet-100 hover:bg-violet-700 active:scale-95 transition-all disabled:opacity-50"
              >
                {isSubmitting ? '신청 중...' : '전환 신청하기'}
              </button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}