import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import Layout from '@/components/Layout';
import { 
  User, Phone, MapPin, Lock, Camera, Save, Mail, 
  Calendar, Sparkles, Image as ImageIcon, Star
} from 'lucide-react';
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

export default function ArtistProfile() {
  const [, setLocation] = useLocation();
  const fileInputRef = useRef(null);
  const fandomInputRef = useRef(null); // 🌟 팬덤 이미지 업로드용 Ref

  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const userRole = localStorage.getItem('role') || 'artist';
  const isArtist = userRole === 'artist';
  const themeText = isArtist ? 'text-violet-600' : 'text-rose-600';

  const [formData, setFormData] = useState({
    email: '',
    name: '',
    phone: '',
    age: '',
    address: '',
    profileImageUrl: '',
    fandomName: '',      // 추가
    fandomImage: ''   // 추가
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    newPasswordConfirm: ''
  });

  // 🌟 모달에서 수정할 팬덤 전용 임시 상태 (모달 열 때 formData값으로 초기화)
  const [fandomForm, setFandomForm] = useState({
    fandomName: '',
    fandomImage: ''
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

  // 🌟 모달이 열릴 때 메인 화면의 데이터를 복사 (취소했을 때 원본 유지 목적)
  useEffect(() => {
    if (isUpgradeModalOpen) {
      setFandomForm({
        fandomName: formData.fandomName || '',
        fandomImage: formData.fandomImage || ''
      });
    }
  }, [isUpgradeModalOpen, formData]);

  // DB 컬럼 구조에 맞춰 신청 폼 상태값 최신화
  const [upgradeForm, setUpgradeForm] = useState({
    artistName: '',   // (stageName -> artistName)
    subCategory: '', // (category -> subCategory)
    description: '',
    profileImageUrl: '',
    communityLink: ''
  });

  // 🌟 모달 내 입력값 변경 처리 함수 (추가)
  const handleFandomChange = (e) => {
    setFandomForm({ ...fandomForm, [e.target.name]: e.target.value });
  };

  // 🌟 팬덤 정보 수정 제출 (모달 전용)
  const handleFandomSubmit = async () => {
    try {
      setIsSubmitting(true);
      toast.loading('팬덤 정보를 업데이트 중이야...');

      // 핵심 주석: 기존 API를 활용하여 팬덤 정보를 업데이트
      await coreApi.post('/artist/update-fandom', {
        ...formData,
        fandomName: fandomForm.fandomName, 
        fandomImage: fandomForm.fandomImage
      });

      toast.dismiss();
      toast.success('팬덤 브랜딩이 변경되었어! ✨');

      // 메인 화면 데이터 즉시 반영
      setFormData(prev => ({ 
        ...prev, 
        fandomName: fandomForm.fandomName, 
        fandomImage: fandomForm.fandomImage 
      }));
      setIsUpgradeModalOpen(false);
    } catch (error) {
      toast.dismiss();
      toast.error('정보 수정에 실패했어.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 🌟 모달 내부 이미지 업로드 함수 (수민 수정내용 API 연결 완료)
  const handleFandomImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      toast.loading('팬덤 이미지 사전 업로드 중...');
      const uploadData = new FormData();
      // 핵심 주석 2: 수민님이 자바에서 설정한 @RequestParam("bgImageFile")과 파라미터명을 맞춤
      uploadData.append('bgImageFile', file); 

      // 핵심 주석 3: 수민님이 만드신 자바 @PostMapping("/bg-image") 엔드포인트 호출
      // (coreApi 내부적으로 GATEWAY_URL + '/msa/core'가 베이스로 설정되어 있다고 가정)
      // 만약 경로가 다르다면 api.js에서 별도 인스턴스를 쓰거나 풀 경로 입력 필요
      const res = await coreApi.post('/artist/bg-image', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // 핵심 주석 4: 서버가 반환한 저장된 URL을 팬덤 폼 상태에 저장 (미리보기 반영)
      setFandomForm(prev => ({ ...prev, fandomImage: res.data.url }));
      toast.dismiss();
      toast.success('이미지 업로드 완료! 하단의 저장 버튼을 눌러주세요.');
    } catch (error) {
      toast.dismiss();
      console.error("❌ 팬덤 이미지 사전 업로드 에러:", error);
      toast.error('이미지 업로드 실패');
    }
  };

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

  // 아티스트 전환 신청 API 호출 함수
  const handleUpgradeSubmit = async () => {
    // 1. 유효성 검사
    if (!upgradeForm.artistName || !upgradeForm.subCategory || !upgradeForm.description) {
      toast.error('신청 정보를 모두 입력해 주세요!');
      return;
    }

    try {
      setIsSubmitting(true);
      toast.loading('아티스트 전환 신청을 접수 중이야...');

      // 로컬스토리지에서 로그인한 유저의 ID 가져오기 (프로젝트 키 이름에 맞게 확인 필수!)
      const currentUserId = localStorage.getItem('memberId') || localStorage.getItem('userId');

      // 자바 DTO 구조에 맞게 데이터 재구성 (유저 ID 추가)
      const payload = {
        memberId: Number(currentUserId),       // 누가 신청하는지 서버에 알려줌
        artistName: upgradeForm.artistName,
        subCategory: upgradeForm.subCategory,
        description: upgradeForm.description,
        imageUrl: `${upgradeForm.profileImageUrl}|${upgradeForm.communityLink}`
      };

      await coreApi.post('/artist/apply', payload);

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

  // 수정된 이미지 업로드 함수
  const handleImageUpload = async (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      toast.loading('이미지 업로드 중...');
      const uploadData = new FormData();
      
      // 서버 파라미터명 분기 처리
      if (type === 'profile') {
        uploadData.append('profileImage', file);
      } else {
        uploadData.append('bgImageFile', file);
      }

      // API 경로 분기 처리
      const endpoint = type === 'profile' ? '/member/profile/image' : '/artist/bg-image';
      
      const res = await coreApi.post(endpoint, uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // 성공 시 대상 상태 업데이트
      if (type === 'profile') {
        setFormData(prev => ({ ...prev, profileImageUrl: res.data.url }));
        toast.dismiss();
        toast.success('프로필 이미지가 변경되었어! 하단의 저장 버튼을 눌러줘.');
      } else {
        // 모달용 팬덤 이미지 업데이트
        setFandomForm(prev => ({ ...prev, fandomImage: res.data.url }));
        toast.dismiss();
        toast.success('팬덤 이미지가 업로드되었어!');
      }

    } catch (error) {
      toast.dismiss();
      console.error("❌ 업로드 에러:", error);
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
                  onChange={(e) => handleImageUpload(e, 'profile')}
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
                    className="w-full py-2.5 text-xs font-bold bg-violet-600 text-white rounded-xl hover:bg-violet-700 active:scale-95 transition-all flex items-center justify-center gap-2 mt-2"
                  >
                    <Sparkles size={14} fill="currentColor" />
                    팬덤 브랜딩 수정
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
      {/* 🌟 모달: 아티스트 전환 신청에서 '팬덤 정보 수정'용으로 내용 변경 */}
      <Dialog open={isUpgradeModalOpen} onOpenChange={setIsUpgradeModalOpen}>
        <DialogContent className="sm:max-w-[460px] rounded-[32px] p-0 overflow-hidden bg-white border-none shadow-2xl">
          <div className="p-8 space-y-6">
            <DialogHeader className="text-center">
              <div className="w-14 h-14 bg-violet-100 rounded-2xl flex items-center justify-center text-violet-600 mx-auto mb-2">
                <Sparkles size={28} fill="currentColor" />
              </div>
              <DialogTitle className="text-2xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
                Fandom Branding
              </DialogTitle>
              <DialogDescription className="text-xs">
                팬덤 커뮤니티와 굿즈에 사용될 브랜딩 정보를 수정하세요.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-5">
              {/* 팬덤명 입력 */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-400 ml-1 uppercase">Fandom Name</label>
                <input
                  name="fandomName"
                  value={fandomForm.fandomName}
                  onChange={handleFandomChange}
                  placeholder="팬덤 이름을 입력하세요"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-violet-200 outline-none"
                />
              </div>

              {/* 팬덤 이미지 수정 (모달 버전) */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-400 ml-1 uppercase">Fandom Identity Image</label>
                <div className="flex items-center gap-4 p-4 bg-violet-50/30 rounded-2xl border border-dashed border-violet-200">
                  <div className="relative cursor-pointer group flex-shrink-0" onClick={() => fandomInputRef.current?.click()}>
                    <input type="file" ref={fandomInputRef} className="hidden" accept="image/*" onChange={handleFandomImageUpload} />
                    <img 
                      src={fandomForm.fandomImage || "https://placehold.co/100x100?text=F"} 
                      className="w-16 h-16 rounded-xl object-cover shadow-sm border border-violet-100"
                    />
                    <div className="absolute inset-0 bg-black/30 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera size={16} className="text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] text-violet-600 font-bold mb-1">Identity Image</p>
                    <p className="text-[10px] text-slate-500 font-medium leading-relaxed">팬덤명과 함께 대표 이미지로 사용됩니다.</p>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="flex gap-2 pt-2">
              <button onClick={() => setIsUpgradeModalOpen(false)} className="flex-1 py-3.5 rounded-2xl font-bold text-gray-400 hover:bg-gray-50 transition-all">취소</button>
              <button
                onClick={handleFandomSubmit}
                disabled={isSubmitting}
                className="flex-[2] py-3.5 rounded-2xl font-bold bg-violet-600 text-white shadow-lg hover:bg-violet-700 transition-all disabled:opacity-50"
              >
                {isSubmitting ? '수정 중...' : '브랜딩 정보 저장'}
              </button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}