/*
 * Lumina - Manus 로그인 유도 다이얼로그
 * 역할: 서비스 이용을 위해 Manus 로그인이 필요함을 알리고 버튼 제공
 */

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button"; // Shadcn UI 기반 버튼
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle
} from "@/components/ui/dialog"; // Shadcn UI 기반 다이얼로그

export function ManusDialog({
  title,         // 다이얼로그 제목
  logo,          // 상단에 표시될 이미지 URL
  open = false,  // 다이얼로그 열림 상태 (외부 제어용)
  onLogin,       // 로그인 버튼 클릭 시 실행될 콜백 함수
  onOpenChange,  // 상태 변경 시 실행될 핸들러
  onClose        // 다이얼로그가 닫힐 때 실행될 추가 로직
}) {
  // 제어/비제어 컴포넌트 지원을 위한 내부 상태
  const [internalOpen, setInternalOpen] = useState(open);

  // 외부에서 open prop이 변경될 때 내부 상태 동기화
  useEffect(() => {
    if (!onOpenChange) {
      setInternalOpen(open);
    }
  }, [open, onOpenChange]);

  // 다이얼로그 개폐 핸들러
  const handleOpenChange = (nextOpen) => {
    // 외부 핸들러가 있으면 우선 호출, 없으면 내부 상태 업데이트
    if (onOpenChange) {
      onOpenChange(nextOpen);
    } else {
      setInternalOpen(nextOpen);
    }

    // 다이얼로그가 닫히는 시점(nextOpen === false)에 onClose 실행
    if (!nextOpen) {
      onClose?.();
    }
  };

  return (
    <Dialog
      // onOpenChange 존재 여부에 따라 제어/비제어 모드 결정
      open={onOpenChange ? open : internalOpen}
      onOpenChange={handleOpenChange}>

      {/* 다이얼로그 본체: 글래스모피즘 및 커스텀 디자인 적용 */}
      <DialogContent className="py-5 bg-[#f8f8f7] rounded-[20px] w-[400px] shadow-[0px_4px_11px_0px_rgba(0,0,0,0.08)] border border-[rgba(0,0,0,0.08)] backdrop-blur-2xl p-0 gap-0 text-center">

        {/* 상단 섹션: 로고 및 타이틀 */}
        <div className="flex flex-col items-center gap-2 p-5 pt-12">
          {/* 로고 이미지가 있을 경우에만 렌더링 */}
          {logo ?
            <div className="w-16 h-16 bg-white rounded-xl border border-[rgba(0,0,0,0.08)] flex items-center justify-center">
              <img src={logo} alt="Dialog graphic" className="w-10 h-10 rounded-md" />
            </div> :
            null}

          {/* 제목 렌더링 */}
          {title ?
            <DialogTitle className="text-xl font-semibold text-[#34322d] leading-[26px] tracking-[-0.44px]">
              {title}
            </DialogTitle> :
            null}

          {/* 안내 문구 */}
          <DialogDescription className="text-sm text-[#858481] leading-5 tracking-[-0.154px]">
            계속하려면 Manus 계정으로 로그인해주세요.
          </DialogDescription>
        </div>

        {/* 하단 섹션: 액션 버튼 */}
        <DialogFooter className="px-5 py-5">
          <Button
            onClick={onLogin}
            className="w-full h-10 bg-[#1a1a19] hover:bg-[#1a1a19]/90 text-white rounded-[10px] text-sm font-medium leading-5 tracking-[-0.154px]">
            Manus로 로그인하기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}