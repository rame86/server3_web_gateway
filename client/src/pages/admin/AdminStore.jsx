/*
 * Lumina - Admin Store Management
 * Soft Bloom Design: Goods approval queue (Full Version)
 */

import { useState } from 'react';
import Layout from '@/components/Layout';
import { 
  Package, Check, X, Eye, Clock, User, 
  Tag, Info, AlertCircle, Image as ImageIcon, ChevronRight
} from 'lucide-react';
import { goodsItems, formatPrice } from '@/lib/data';
import { toast } from 'sonner';

// [1] 데이터 구조 확장: 세부 카테고리, 유저 정보, 상세 이미지 추가
const pendingGoods = [
  { 
    id: 201, name: 'NOVA 공식 포토카드 세트 (한정판)', artistName: 'NOVA', price: 35000, 
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop', 
    category: 'official', subCategory: '잡화', submittedDate: '2026-02-18', 
    description: '공식 포토카드 12종 세트입니다. 멤버별 친필 사인이 포함된 스페셜 에디션입니다.', 
    stock: 500,
    user: { name: '노바엔터', email: 'nova_official@ent.com', role: 'ARTIST' },
    detailImages: [
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1554034483-04fac7d3b818?w=400&h=400&fit=crop'
    ]
  },
  { 
    id: 202, name: '이하은 팬메이드 아크릴 키링', artistName: '이하은', price: 8500, 
    image: 'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=400&h=400&fit=crop', 
    category: 'unofficial', subCategory: '잡화/인형', submittedDate: '2026-02-17', 
    description: '팬이 직접 디자인한 귀여운 아크릴 키링입니다. 투명도가 높습니다.', 
    stock: 50,
    user: { name: '홍길동', email: 'gildong@example.com', role: 'USER' },
    detailImages: ['https://images.unsplash.com/photo-1626197031107-c0903b21008a?w=400&h=400&fit=crop']
  },
  { 
    id: 203, name: 'BLOSSOM 공식 응원봉', artistName: 'BLOSSOM', price: 45000, 
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop', 
    category: 'official', subCategory: '응원도구', submittedDate: '2026-02-16', 
    description: 'BLOSSOM 공식 응원봉 2세대. 블루투스 연동 기능을 지원합니다.', 
    stock: 1000,
    user: { name: '블로썸즈', email: 'admin@blossom.com', role: 'ARTIST' },
    detailImages: []
  },
  { 
    id: 204, name: '김지수 팬아트 포스터', artistName: '김지수', price: 12000, 
    image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=400&fit=crop', 
    category: 'unofficial', subCategory: '의류/포스터', submittedDate: '2026-02-15', 
    description: '김지수 아티스트의 팬아트 A3 포스터 세트입니다.', 
    stock: 30,
    user: { name: '아트러버', email: 'art@naver.com', role: 'USER' },
    detailImages: []
  },
  { 
    id: 205, name: 'NOVA 공식 후드티', artistName: 'NOVA', price: 89000, 
    image: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=400&h=400&fit=crop', 
    category: 'official', subCategory: '의류', submittedDate: '2026-02-14', 
    description: '고품질 면 소재의 NOVA 공식 후드티입니다. 사계절 착용 가능합니다.', 
    stock: 200,
    user: { name: '노바엔터', email: 'nova_official@ent.com', role: 'ARTIST' },
    detailImages: ['https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=400&fit=crop']
  }
];

const categoryLabel = {
  official: { label: '공식 굿즈', class: 'badge-rose' },
  unofficial: { label: '팬메이드', class: 'badge-lavender' },
  used: { label: '중고거래', class: 'bg-gray-100 text-gray-600' }
};

export default function AdminStore() {
  const [activeTab, setActiveTab] = useState('pending');
  const [approvedIds, setApprovedIds] = useState([]);
  const [rejectedIds, setRejectedIds] = useState([]);

  // [2] 상태 관리: 상세보기 및 거절 사유 모달 전용
  const [detailItem, setDetailItem] = useState(null);
  const [rejectItem, setRejectItem] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const handleApprove = (id, name) => {
    setApprovedIds([...approvedIds, id]);
    toast.success(`"${name}" 굿즈가 승인되었습니다`);
    if (detailItem?.id === id) setDetailItem(null);
  };

  const handleRejectSubmit = () => {
    if (!rejectReason.trim()) {
      toast.error('거절 사유를 입력해주세요');
      return;
    }
    setRejectedIds([...rejectedIds, rejectItem.id]);
    toast.warning(`"${rejectItem.name}" 거절되었습니다. 사유: ${rejectReason}`);
    setRejectItem(null);
    setRejectReason('');
  };

  const pendingList = pendingGoods.filter((g) => !approvedIds.includes(g.id) && !rejectedIds.includes(g.id));

  return (
    <Layout role="admin">
      <div className="p-4 lg:p-6 space-y-6 fade-in-up">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground gradient-text" style={{ fontFamily: "'Playfair Display', serif" }}>
            굿즈 승인 관리
          </h1>
          <p className="text-sm text-muted-foreground font-medium">등록 요청된 굿즈를 검토하고 승인합니다</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="glass-card rounded-2xl p-4 text-center soft-shadow border-amber-100">
            <p className="text-xl font-bold text-amber-600" style={{ fontFamily: "'DM Sans', sans-serif" }}>{pendingList.length}</p>
            <p className="text-xs text-muted-foreground font-semibold">승인 대기</p>
          </div>
          <div className="glass-card rounded-2xl p-4 text-center soft-shadow border-teal-100">
            <p className="text-xl font-bold text-teal-600" style={{ fontFamily: "'DM Sans', sans-serif" }}>{approvedIds.length}</p>
            <p className="text-xs text-muted-foreground font-semibold">승인 완료</p>
          </div>
          <div className="glass-card rounded-2xl p-4 text-center soft-shadow border-red-100">
            <p className="text-xl font-bold text-red-600" style={{ fontFamily: "'DM Sans', sans-serif" }}>{rejectedIds.length}</p>
            <p className="text-xs text-muted-foreground font-semibold">거절</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 bg-secondary/50 p-1.5 rounded-2xl border border-border/50">
          {[
            { key: 'pending', label: `대기 중 (${pendingList.length})` },
            { key: 'approved', label: '최근 등록 굿즈' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
                activeTab === tab.key ? 'bg-white text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'pending' && (
          <div className="space-y-4">
            {pendingList.length === 0 ? (
              <div className="text-center py-24 glass-card rounded-[2rem] border-dashed border-2">
                <Package size={48} className="text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground font-medium">검토할 굿즈가 없습니다</p>
              </div>
            ) : (
              pendingList.map((item) => (
                <div key={item.id} className="glass-card rounded-[2rem] overflow-hidden soft-shadow hover-lift border border-border/50">
                  <div className="flex flex-col sm:flex-row">
                    {/* 이미지 및 카테고리 정보 */}
                    <div className="relative sm:w-44 h-44 sm:h-auto flex-shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold shadow-sm ${categoryLabel[item.category].class}`}>
                          {categoryLabel[item.category].label}
                        </span>
                        <span className="bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-bold text-slate-600 shadow-sm">
                          {item.subCategory}
                        </span>
                      </div>
                    </div>

                    {/* 카드 본문 */}
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between mb-1">
                          <div>
                            <h3 className="font-bold text-lg text-foreground leading-tight">{item.name}</h3>
                            <p className="text-sm text-primary font-bold">{item.artistName}</p>
                          </div>
                          <div className="flex items-center gap-1 text-[11px] text-amber-600 bg-amber-50 px-2 py-1 rounded-full font-bold">
                            <Clock size={12} /> {item.submittedDate}
                          </div>
                        </div>

                        {/* [3] 등록 유저 정보 표시 */}
                        <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-3 mb-4 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          <div className="bg-white p-1 rounded-full shadow-sm">
                            <User size={12} className="text-primary" />
                          </div>
                          <span className="font-bold text-slate-700">{item.user.name}</span>
                          <span className="opacity-70 font-medium">({item.user.email})</span>
                          <span className="ml-auto text-[9px] bg-slate-200 px-1.5 py-0.5 rounded text-slate-500 font-bold">
                            {item.user.role}
                          </span>
                        </div>
                      </div>

                      {/* 가격 및 액션 버튼 */}
                      <div className="flex items-end justify-between pt-4 border-t border-border/40">
                        <div>
                          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-0.5">Price & Stock</p>
                          <div className="flex items-baseline gap-2">
                            <span className="text-xl font-bold text-foreground font-dm-sans">{formatPrice(item.price)}</span>
                            <span className="text-xs text-muted-foreground font-medium">재고 {item.stock}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setDetailItem(item)} // 상세보기 모달 오픈
                            className="p-3 rounded-2xl bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors shadow-sm"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => setRejectItem(item)} // 거절 사유 모달 오픈
                            className="px-6 py-3 text-sm font-bold text-red-500 rounded-2xl bg-red-50 hover:bg-red-100 transition-colors border border-red-100 shadow-sm"
                          >
                            <X size={18} className="inline mr-1" /> 거절
                          </button>
                          <button
                            onClick={() => handleApprove(item.id, item.name)}
                            className="px-8 py-3 text-sm font-bold text-white rounded-2xl btn-primary-gradient shadow-md"
                          >
                            <Check size={18} className="inline mr-1" /> 승인
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* 승인 완료 탭 */}
        {activeTab === 'approved' && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {goodsItems.map((item) => (
              <div key={item.id} className="glass-card rounded-[1.5rem] overflow-hidden soft-shadow hover-lift">
                <div className="relative aspect-square">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  <div className="absolute top-2 right-2 w-7 h-7 bg-teal-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                    <Check size={14} className="text-white" />
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-[10px] text-rose-500 font-bold">{item.artistName}</p>
                  <p className="font-bold text-sm text-foreground line-clamp-1 mt-0.5">{item.name}</p>
                  <p className="text-sm font-bold text-primary mt-1 font-dm-sans">{formatPrice(item.price)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* [4] 상세 보기 모달 */}
        {detailItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm fade-in-up">
            <div className="glass-card w-full max-w-2xl rounded-[2.5rem] overflow-hidden shadow-2xl bg-white border border-rose-100">
              <div className="p-6 border-b border-border flex justify-between items-center bg-secondary/30">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-primary/10 rounded-xl">
                    <ImageIcon className="text-primary" size={20} />
                  </div>
                  <h2 className="text-xl font-bold font-playfair">굿즈 상세 검토</h2>
                </div>
                <button onClick={() => setDetailItem(null)} className="p-2 hover:bg-white rounded-full transition-all">
                  <X size={24} className="text-muted-foreground" />
                </button>
              </div>
              <div className="p-8 max-h-[75vh] overflow-y-auto space-y-8 custom-scrollbar">
                {/* 이미지 갤러리 */}
                <div className="space-y-4">
                  <div className="aspect-video w-full rounded-3xl overflow-hidden shadow-md border border-border">
                    <img src={detailItem.image} className="w-full h-full object-cover" alt="main" />
                  </div>
                  <div className="grid grid-cols-4 gap-3">
                    {detailItem.detailImages?.map((img, idx) => (
                      <div key={idx} className="aspect-square rounded-2xl overflow-hidden border border-border shadow-sm">
                        <img src={img} className="w-full h-full object-cover" alt="detail" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* 정보 그리드 */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-secondary/40 p-4 rounded-2xl border border-border/50">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Artist / Team</p>
                    <p className="font-bold text-primary">{detailItem.artistName}</p>
                  </div>
                  <div className="bg-secondary/40 p-4 rounded-2xl border border-border/50">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Classification</p>
                    <p className="font-bold text-foreground">{categoryLabel[detailItem.category].label} • {detailItem.subCategory}</p>
                  </div>
                </div>

                {/* 상세 설명 */}
                <div className="space-y-2">
                  <h4 className="font-bold text-sm flex items-center gap-2 text-foreground">
                    <Info size={16} className="text-primary" /> 상세 설명
                  </h4>
                  <div className="bg-slate-50 p-6 rounded-3xl text-sm leading-relaxed text-slate-600 border border-slate-100">
                    {detailItem.description}
                  </div>
                </div>

                {/* 등록자 계정 정보 */}
                <div className="bg-rose-50 p-5 rounded-3xl border border-rose-100 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                      <User className="text-primary" size={24} />
                    </div>
                    <div>
                      <p className="text-[10px] text-rose-400 font-bold uppercase">Submitted By</p>
                      <p className="font-bold text-rose-900">{detailItem.user.name}</p>
                      <p className="text-xs text-rose-700/60 font-medium">{detailItem.user.email}</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-lg bg-white text-rose-500 text-[10px] font-black shadow-sm">
                    {detailItem.user.role}
                  </span>
                </div>
              </div>

              {/* 하단 액션 */}
              <div className="p-6 bg-slate-50 border-t border-border flex gap-3">
                <button 
                  onClick={() => setDetailItem(null)}
                  className="flex-1 py-4 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors"
                >
                  닫기
                </button>
                <button 
                  onClick={() => handleApprove(detailItem.id, detailItem.name)}
                  className="flex-[2] py-4 rounded-2xl btn-primary-gradient text-white font-bold shadow-lg"
                >
                  해당 굿즈 승인 처리
                </button>
              </div>
            </div>
          </div>
        )}

        {/* [5] 거절 사유 입력 모달 */}
        {rejectItem && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-md transition-all">
            <div className="glass-card w-full max-w-md rounded-[2.5rem] p-8 space-y-6 bg-white shadow-2xl border border-red-100 fade-in-up">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100 shadow-inner">
                  <AlertCircle size={32} />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 font-playfair">거절 사유 입력</h2>
                <p className="text-sm text-muted-foreground mt-2 font-medium">
                  "{rejectItem.name}" 등록을 거절하시겠습니까?<br/>판매자에게 전달될 사유를 상세히 적어주세요.
                </p>
              </div>
              
              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-400 uppercase ml-1">Reason for Rejection</label>
                <textarea 
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="예: 상품 이미지가 선명하지 않습니다. 상세 설명에 저작권 위반 소지가 있는 이미지가 포함되어 있습니다."
                  className="w-full h-36 p-5 rounded-3xl bg-slate-50 border-none focus:ring-4 focus:ring-red-100 text-sm leading-relaxed placeholder:text-slate-300 transition-all shadow-inner"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  onClick={() => { setRejectItem(null); setRejectReason(''); }}
                  className="flex-1 py-4 font-bold text-slate-400 hover:text-slate-600 transition-colors"
                >
                  취소
                </button>
                <button 
                  onClick={handleRejectSubmit}
                  className="flex-[1.5] py-4 rounded-2xl bg-red-500 text-white font-bold shadow-xl hover:bg-red-600 active:scale-95 transition-all"
                >
                  거절 확정하기
                </button>
              </div>
            </div>
          </div>
        )}
    </Layout>
  );
}