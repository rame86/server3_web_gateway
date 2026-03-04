// UserCommunityStyles.jsx
export const styles = {
  container: "p-4 lg:p-6 space-y-6 max-w-5xl mx-auto",
  header: "flex items-center justify-between",
  title: "text-2xl font-bold text-foreground",
  writeBtn: "flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-xl bg-rose-500 shadow-md hover:bg-rose-600 transition-all",
  searchWrapper: "relative",
  searchInput: "w-full pl-10 pr-4 py-3 bg-white border border-rose-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 shadow-sm",
  tabWrapper: "flex gap-2 overflow-x-auto pb-1 no-scrollbar",
  tabBtn: (isActive) => `flex-shrink-0 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
    isActive ? 'bg-rose-500 text-white shadow-md' : 'bg-white border border-rose-50 text-gray-400 hover:bg-rose-50'
  }`,
  grid: "grid lg:grid-cols-3 gap-6",
  mainCol: "lg:col-span-2 space-y-1",
  sidebar: "space-y-4",
  glassCard: "glass-card rounded-2xl p-4 border border-rose-50 shadow-sm bg-white",
  letterCard: "rounded-2xl p-5 cursor-pointer border border-rose-100 bg-gradient-to-br from-rose-50 to-purple-50"
};

export const typeConfig = {
  '팬레터': { label: '팬레터', badgeClass: 'bg-rose-100 text-rose-600' },
  '아티스트 레터': { label: '아티스트 레터', badgeClass: 'bg-purple-100 text-purple-600' },
  '공지사항': { label: '공지', badgeClass: 'bg-amber-100 text-amber-700' },
  '팬덤게시판': { label: '팬덤', badgeClass: 'bg-teal-100 text-teal-600' },
  '자유게시판': { label: '자유', badgeClass: 'bg-gray-100 text-gray-600' }
};