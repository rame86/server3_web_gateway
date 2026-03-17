import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import Layout from '@/components/Layout';
import { User, Phone, MapPin, Lock, Star, Camera, Save, RefreshCw, Mail, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { coreApi } from '@/lib/api';
import { cn } from '@/lib/utils';
// 🌟 Button 컴포넌트 임포트 확인! (없다면 일반 button 태그로 대체 가능)
import { Button } from "@/components/ui/button"; 
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, 
  DialogDescription, DialogFooter 
} from "@/components/ui/dialog";


export default function UserProfile() {
  const [, setLocation] = useLocation();

  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const userRole = localStorage.getItem('userRole') || 'user'; 
  const isArtist = userRole === 'artist';
  const themeText = isArtist ? 'text-violet-600' : 'text-rose-600';

  // 1. 회원가입 필드와 일치하도록 상태 보강
  const [formData, setFormData] = useState({
    email: localStorage.getItem('userEmail') || '', // 이메일은 보통 readOnly
    name: localStorage.getItem('userName') || '',
    phone: '',
    age: '',      // 🌟 추가
    address: '',
  });

  // 🌟 아티스트 신청용 전용 상태 추가
  const [upgradeForm, setUpgradeForm] = useState({
    artistName: '',
    subCategory: '',
    description: '',
    imageUrl: ''
  });

  const handleUpgradeChange = (e) => {
    setUpgradeForm({ ...upgradeForm, [e.target.name]: e.target.value });
  };

  // 🌟 아티스트 전환 신청 API 호출 함수
  const handleUpgradeSubmit = async () => {
    // 필수값 체크
    if (!upgradeForm.artistName || !upgradeForm.subCategory || !upgradeForm.description) {
      toast.error('신청 정보를 모두 입력해 주세요!');
      return;
    }

    try {
      setIsSubmitting(true);
      toast.loading('아티스트 전환 신청을 접수 중입니다...');

      // 🌟 백엔드 API 호출 (DTO 구조에 맞춤)
      await coreApi.post('/member/upgrade-artist', {
        email: localStorage.getItem('userEmail'),
        ...upgradeForm // artistName, subCategory, description, imageUrl 포함
      });

      toast.dismiss();
      toast.success('신청이 완료되었습니다! 관리자 승인 후 메일로 알려드릴게요.');
      setIsUpgradeModalOpen(false);
    } catch (error) {
      toast.dismiss();
      toast.error('신청 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      // await coreApi.put('/member/update', formData);
      toast.success('회원 정보가 안전하게 변경되었습니다.');
    } catch (error) {
      toast.error('정보 수정 중 오류가 발생했습니다.');
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
              <div className="relative inline-block">
                <img 
                  src={isArtist 
                    ? "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop" 
                    : "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop"} 
                  className="w-24 h-24 rounded-full border-4 border-white shadow-md object-cover"
                />
                <button className={cn("absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg border transition-all", 
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
              <div className="space-y-4">
                <input type="password" placeholder="현재 비밀번호 확인" 
                  className="w-full px-4 py-3 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-gray-200" />
                <div className="grid grid-cols-2 gap-4">
                  <input type="password" placeholder="새 비밀번호" 
                    className="w-full px-4 py-3 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-gray-200" />
                  <input type="password" placeholder="새 비밀번호 다시 입력" 
                    className="w-full px-4 py-3 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-gray-200" />
                </div>
                <button className="w-full py-3.5 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black transition-all shadow-md">
                  비밀번호 재설정
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* 🌟 아티스트 전환 신청 팝업(Dialog) */}
      <Dialog open={isUpgradeModalOpen} onOpenChange={setIsUpgradeModalOpen}>
        <DialogContent className="sm:max-w-[460px] rounded-[32px] p-0 border-none shadow-2xl overflow-hidden bg-white outline-none">
          <div className="p-8 space-y-6">
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

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-400 ml-1 uppercase">Sub Category</label>
                <input 
                  name="subCategory" 
                  value={upgradeForm.subCategory} 
                  onChange={handleUpgradeChange}
                  placeholder="예: ECHO · 발라드 / K-POP"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-violet-200 outline-none transition-all"
                />
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

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-400 ml-1 uppercase">Profile Image URL</label>
                <div className="relative">
                  <Camera size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    name="imageUrl" 
                    value={upgradeForm.imageUrl} 
                    onChange={handleUpgradeChange}
                    placeholder="이미지 링크주소를 입력해 주세요"
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-violet-200 outline-none transition-all"
                  />
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