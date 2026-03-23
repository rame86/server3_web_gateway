/*
 * Lumina - Admin Store Management
 * Soft Bloom Design: Goods approval queue (Full Version)
 */

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { 
  Package, Check, X, Eye, Clock, User, 
  Tag, Info, AlertCircle, Image as ImageIcon, ChevronRight, Code, RefreshCw, Loader2
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { formatPrice } from '@/lib/data';
import { toast } from 'sonner';
import { shopApi, coreApi } from '@/lib/api';

const categoryLabel = {
  official: { label: '공식 굿즈', class: 'badge-rose' },
  unofficial: { label: '팬메이드', class: 'badge-lavender' },
  used: { label: '중고거래', class: 'bg-gray-100 text-gray-600' },
  // 백엔드에서 대문자나 다른 값으로 올 경우를 대비한 안전장치 추가
  SHOP: { label: '스토어 굿즈', class: 'badge-rose' },
  official_goods: { label: '공식 굿즈', class: 'badge-rose' } 
};

export default function AdminStore() {
  const [activeTab, setActiveTab] = useState('pending');
  const [approvedIds, setApprovedIds] = useState([]);
  const [rejectedIds, setRejectedIds] = useState([]);

  // [2] 상태 관리: 상세보기 및 거절 사유 모달 전용
  const [detailItem, setDetailItem] = useState(null);
  const [rejectItem, setRejectItem] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  // --- [백엔드 API 연동 추가 부분] ---
  const [pendingGoods, setPendingGoods] = useState([]);
  const [approvedGoods, setApprovedGoods] = useState([]);
  const [showJson, setShowJson] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchPendingGoods = async () => {
    try {
      const response = await coreApi.get('/admin/shop/approvalList');
      const mappedData = response.data.map(item => ({
        ...item,
        id: item.approvalId,
        name: item.goodsName || '이름 없음', 
        image: item.imageUrl || 'https://via.placeholder.com/400', 
        category: item.goodsType ? item.goodsType.toLowerCase() : 'official',
        subCategory: item.goodsType || '분류 없음',
        submittedDate: item.createdAt ? item.createdAt.split('T')[0] : '날짜 없음',
        description: item.description || '상세 설명이 없습니다.',
        stock: item.stockQuantity || 0,
        user: { name: item.requesterName || '알 수 없음', email: '정보 없음', role: 'ARTIST' }
      }));
      setPendingGoods(mappedData);
    } catch (error) {
      console.error(error);
      toast.error('승인 대기 목록을 불러오지 못했습니다.');
    }
  };

  // 처음 들어올 때 데이터 가져오기
  useEffect(() => {
    fetchPendingGoods();
  }, []);

  // 승인 버튼 눌렀을 때
  const handleApprove = async (id, name, productId) => {
    try {
      await coreApi.post('/admin/shop/confirm', {
        approvalId: id,
        productId: productId,
        status: 'CONFIRMED'
      });
      setApprovedIds([...approvedIds, id]);
      toast.success(`"${name}" 굿즈가 승인되었습니다`);
      if (detailItem?.id === id) setDetailItem(null);
      
      fetchPendingGoods(); // 승인 후 목록 새로고침
    } catch (error) {
      toast.error('승인 처리 중 오류가 발생했습니다.');
    }
  };

  // 거절 버튼 눌렀을 때
  const handleRejectSubmit = async () => {
    if (!rejectReason.trim()) {
      toast.error('거절 사유를 입력해주세요');
      return;
    }
    try {
      await coreApi.post('/admin/shop/confirm', {
        approvalId: rejectItem.id,
        productId: rejectItem.productId,
        status: 'REJECTED',
        reason: rejectReason
      });
      setRejectedIds([...rejectedIds, rejectItem.id]);
      toast.warning(`"${rejectItem.name}" 거절되었습니다. 사유: ${rejectReason}`);
      setRejectItem(null);
      setRejectReason('');
      
      fetchPendingGoods(); // 거절 후 목록 새로고침
    } catch (error) {
      toast.error('거절 처리 중 오류가 발생했습니다.');
    }
  };
  // ------------------------------------

  const pendingList = pendingGoods.filter((g) => !approvedIds.includes(g.id) && !rejectedIds.includes(g.id));

  return (
    <Layout role="admin">
      <div className="p-4 lg:p-6 space-y-6 fade-in-up">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground gradient-text" style={{ fontFamily: "'Playfair Display', serif" }}>
              굿즈 승인 관리
            </h1>
            <p className="text-sm text-muted-foreground font-medium">등록 요청된 굿즈를 검토하고 승인합니다</p>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              setLoading(true);
              Promise.all([fetchPendingGoods(), fetchApprovedGoods()]).finally(() => setLoading(false));
            }}
            disabled={loading}
            className="rounded-xl border-rose-100 text-rose-500 hover:bg-rose-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <RefreshCw className="w-4 h-4 mr-2" />}
            데이터 새로고침
          </Button>
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
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold shadow-sm ${categoryLabel[item.category]?.class || 'bg-slate-100'}`}>
                          {categoryLabel[item.category]?.label || item.category}
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
                            onClick={() => setDetailItem(item)} 
                            className="p-3 rounded-2xl bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors shadow-sm"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => setRejectItem(item)} 
                            className="px-6 py-3 text-sm font-bold text-red-500 rounded-2xl bg-red-50 hover:bg-red-100 transition-colors border border-red-100 shadow-sm"
                          >
                            <X size={18} className="inline mr-1" /> 거절
                          </button>
                          <button
                            onClick={() => handleApprove(item.id, item.name, item.productId)}
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
            {approvedGoods.map((item) => (
              <div key={item.id} className="glass-card rounded-[1.5rem] overflow-hidden soft-shadow hover-lift border border-border/50">
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

        {/* JSON 데이터 보기 토글 (요청사항 반영) */}
        <div className="mt-8 pt-8 border-t border-dashed">
          <button 
            onClick={() => setShowJson(!showJson)}
            className="flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors mx-auto"
          >
            <Code size={14} />
            {showJson ? 'JSON 데이터 숨기기' : 'RAW JSON 데이터 보기'}
          </button>
          
          {showJson && (
            <div className="mt-4 p-4 bg-slate-900 rounded-2xl overflow-x-auto shadow-inner border border-slate-800">
              <pre className="text-[10px] text-teal-400 font-mono leading-relaxed">
                {JSON.stringify({ 
                  activeTab, 
                  pendingSummary: pendingList.map(p => ({ id: p.id, name: p.name, status: p.status })),
                  shopGoodsSummary: approvedGoods.map(g => ({ id: g.id, name: g.name, price: g.price }))
                }, null, 2)}
              </pre>
            </div>
          )}
        </div>
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
                    <p className="font-bold text-foreground">{categoryLabel[detailItem.category]?.label || detailItem.category} • {detailItem.subCategory}</p>
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
                  onClick={() => handleApprove(detailItem.id, detailItem.name, detailItem.productId)}
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