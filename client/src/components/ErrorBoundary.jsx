/*
 * Lumina - 에러 바운더리 컴포넌트
 * 역할: 하위 컴포넌트 트리에서 발생한 런타임 에러를 포착하여 화이트아웃(화면 멈춤)을 방지하고 대체 UI를 표시
 */

import { cn } from "@/lib/utils";
import { AlertTriangle, RotateCcw } from "lucide-react"; // 경고 및 새로고침 아이콘
import { Component } from "react"; // 에러 바운더리는 클래스 컴포넌트 사용이 필수임

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    // 에러 발생 여부 및 에러 정보를 담는 상태 초기화
    this.state = { hasError: false, error: null };
  }

  // 하위 컴포넌트에서 에러 발생 시 호출되어 다음 렌더링에서 에러 UI를 보여주도록 상태 업데이트
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      // --- 에러 발생 시 노출되는 대체 UI ---
      return (
        <div className="flex items-center justify-center min-h-screen p-8 bg-background">
          <div className="flex flex-col items-center w-full max-w-2xl p-8">
            {/* 경고 아이콘 */}
            <AlertTriangle
              size={48}
              className="text-destructive mb-6 flex-shrink-0" />

            <h2 className="text-xl mb-4">예기치 않은 오류가 발생했습니다.</h2>

            {/* 에러 스택 트레이스 표시 영역 (디버깅용) */}
            <div className="p-4 w-full rounded bg-muted overflow-auto mb-6">
              <pre className="text-sm text-muted-foreground whitespace-break-spaces">
                {this.state.error?.stack}
              </pre>
            </div>

            {/* 페이지 새로고침 버튼 (복구 시도) */}
            <button
              onClick={() => window.location.reload()}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg",
                "bg-primary text-primary-foreground",
                "hover:opacity-90 cursor-pointer"
              )}>
              <RotateCcw size={16} />
              페이지 새로고침
            </button>
          </div>
        </div>
      );
    }

    // 에러가 없을 경우 하위 컴포넌트(children)를 정상적으로 렌더링
    return this.props.children;
  }
}

export default ErrorBoundary;