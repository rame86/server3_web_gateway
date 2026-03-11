/**
 * 커뮤니티 페이지에서 공통으로 사용하는 스타일 설정 객체
 */
export const styles = {
  // 레이아웃 컨테이너
  container: "p-4 lg:p-6 space-y-6 max-w-5xl mx-auto",
  
  // 헤더 섹션
  header: "flex items-center justify-between",
  title: "text-2xl font-bold text-foreground",
  writeBtn: "flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-xl bg-rose-500 shadow-md hover:bg-rose-600 transition-all active:scale-95",
  
  // 검색바 관련
  searchWrapper: "relative",
  searchInput: "w-full pl-10 pr-4 py-3 bg-white border border-rose-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 shadow-sm transition-all",
  
  // 탭 메뉴 관련
  tabWrapper: "flex gap-2 overflow-x-auto pb-1 no-scrollbar items-center",
  tabBtn: (isActive) => `flex-shrink-0 px-5 py-2.5 rounded-xl text-sm font-bold transition-all border ${
    isActive 
      ? 'bg-rose-500 text-white shadow-md border-rose-500' 
      : 'bg-white border-rose-50 text-gray-400 hover:bg-rose-50 hover:text-rose-400'
  }`,
  
  // 메인 그리드 구조
  grid: "grid lg:grid-cols-3 gap-6",
  mainCol: "lg:col-span-2 space-y-1",
  sidebar: "space-y-4",
  
  // 카드 및 사이드바 요소
  glassCard: "rounded-2xl p-4 border border-rose-50 shadow-sm bg-white/80 backdrop-blur-sm",
  letterCard: "rounded-2xl p-5 cursor-pointer border border-rose-100 bg-gradient-to-br from-rose-50 to-purple-50 hover:shadow-md transition-shadow"
};

/**
 * 게시판 카테고리별 레이블 및 배지 스타일 설정
 */
export const typeConfig = {
  '팬레터': { label: '팬레터', badgeClass: 'bg-rose-100 text-rose-600' },
  '아티스트 레터': { label: '아티스트 레터', badgeClass: 'bg-purple-100 text-purple-600' },
  '공지사항': { label: '공지', badgeClass: 'bg-amber-100 text-amber-700' },
  '팬덤게시판': { label: '팬덤', badgeClass: 'bg-teal-100 text-teal-600' },
  '자유게시판': { label: '자유', badgeClass: 'bg-gray-100 text-gray-600' }
};