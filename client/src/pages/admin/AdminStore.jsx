/*
 * Lumina - Admin Store Management
 * Goods approval queue — connected to /msa/shop/admin/approval-list
 */

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { 
  Package, Check, X, Eye, Clock, User, 
  Info, AlertCircle, RefreshCw, Loader2, ShoppingBag, CheckCircle, XCircle
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';
import { shopApi } from '@/lib/api';

const statusConfig = {
  PENDING:  { label: '승인 대기', class: 'bg-amber-50 text-amber-600 border border-amber-200', icon: Clock },
  APPROVED: { label: '승인 완료', class: 'bg-teal-50 text-teal-600 border border-teal-200',  icon: CheckCircle },
  REJECTED: { label: '거절됨',   class: 'bg-red-50 text-red-500 border border-red-200',     icon: XCircle },
};

export default function AdminStore() {
  const [activeTab, setActiveTab] = useState('pending');
  const [approvedIds, setApprovedIds] = useState([]);
  const [rejectedIds, setRejectedIds] = useState([]);

  // [2] 상태 관리: 상세보기 및 거절 사유 모달 전용
  const [detailItem, setDetailItem] = useState(null);
  const [rejectItem, setRejectItem] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  // --- [백엔드 API 연동] ---
  const [pendingGoods, setPendingGoods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showJson, setShowJson] = useState(false);

  // GET /msa/shop/admin/approval-list → PENDING 상태 굿즈 목록
  const fetchPendingGoods = async () => {
    setLoading(true);
    try {
      const response = await shopApi.get('/admin/approval-list');
      // 응답: [{ approvalId, productId, requesterName, goodsName, status, active }, ...]
      const mappedData = (response.data || []).map(item => ({
        id: item.approvalId,
        productId: item.productId,
        name: item.goodsName || '이름 없음',
        requesterName: item.requesterName || '알 수 없음',
        status: item.status || 'PENDING',
        active: item.active,
      }));
      setPendingGoods(mappedData);
    } catch (error) {
      console.error(error);
      toast.error('승인 대기 목록을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 처음 들어올 때 데이터 가져오기
  useEffect(() => {
    fetchPendingGoods();
  }, []);

  // 승인 버튼
  const handleApprove = async (id, name, productId) => {
    try {
      await shopApi.post('/admin/approval', {
        approvalId: id,
        productId: productId,
        status: 'APPROVED'
      });
      setApprovedIds([...approvedIds, id]);
      toast.success(`"${name}" 굿즈가 승인되었습니다`);
      if (detailItem?.id === id) setDetailItem(null);
      fetchPendingGoods();
    } catch (error) {
      console.error(error);
      toast.error('승인 처리 중 오류가 발생했습니다.');
    }
  };

  // 거절 버튼
  const handleRejectSubmit = async () => {
    if (!rejectReason.trim()) {
      toast.error('거절 사유를 입력해주세요');
      return;
    }
    try {
      await shopApi.post('/admin/approval', {
        approvalId: rejectItem.id,
        productId: rejectItem.productId,
        status: 'REJECTED',
        reason: rejectReason
      });
      setRejectedIds([...rejectedIds, rejectItem.id]);
      toast.warning(`"${rejectItem.name}" 거절 처리되었습니다`);
      setRejectItem(null);
      setRejectReason('');
      fetchPendingGoods();
    } catch (error) {
      console.error(error);
      toast.error('거절 처리 중 오류가 발생했습니다.');
    }
  };
  // ------------------------------------

  const pendingList = pendingGoods.filter((g) => !approvedIds.includes(g.id) && !rejectedIds.includes(g.id));
  const processedCount = approvedIds.length + rejectedIds.length;

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
            onClick={fetchPendingGoods}
            disabled={loading}
            className="rounded-xl border-rose-100 text-rose-500 hover:bg-rose-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <RefreshCw className="w-4 h-4 mr-2" />}
            새로고침
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="glass-card rounded-2xl p-4 text-center soft-shadow border border-amber-100">
            <div className="w-8 h-8 bg-amber-50 rounded-xl flex items-center justify-center mx-auto mb-2">
              <Clock size={16} className="text-amber-500" />
            </div>
            <p className="text-xl font-bold text-amber-600">{pendingList.length}</p>
            <p className="text-xs text-muted-foreground font-semibold">승인 대기</p>
          </div>
          <div className="glass-card rounded-2xl p-4 text-center soft-shadow border border-teal-100">
            <div className="w-8 h-8 bg-teal-50 rounded-xl flex items-center justify-center mx-auto mb-2">
              <CheckCircle size={16} className="text-teal-500" />
            </div>
            <p className="text-xl font-bold text-teal-600">{approvedIds.length}</p>
            <p className="text-xs text-muted-foreground font-semibold">승인 완료</p>
          </div>
          <div className="glass-card rounded-2xl p-4 text-center soft-shadow border border-red-100">
            <div className="w-8 h-8 bg-red-50 rounded-xl flex items-center justify-center mx-auto mb-2">
              <XCircle size={16} className="text-red-400" />
            </div>
            <p className="text-xl font-bold text-red-500">{rejectedIds.length}</p>
            <p className="text-xs text-muted-foreground font-semibold">거절</p>
          </div>
        </div>

        {/* Loading overlay */}
        {loading && (
          <div className="flex items-center justify-center gap-2 py-2 text-sm text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>목록 불러오는 중...</span>
          </div>
        )}

        {/* 승인 대기 목록 */}
        <div className="space-y-3">
          {!loading && pendingList.length === 0 ? (
            <div className="text-center py-24 glass-card rounded-[2rem] border-2 border-dashed border-border">
              <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                <Package size={28} className="text-muted-foreground/50" />
              </div>
              <p className="text-muted-foreground font-semibold">검토할 굿즈 등록 요청이 없습니다</p>
              <p className="text-xs text-muted-foreground/60 mt-1">새로운 등록 요청이 들어오면 여기 표시됩니다</p>
            </div>
          ) : (
            pendingList.map((item) => (
              <div
                key={item.id}
                className="glass-card rounded-2xl soft-shadow hover-lift border border-border/50 overflow-hidden transition-all"
              >
                <div className="flex items-center gap-4 p-5">
                  {/* 아이콘 영역 */}
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-100 to-purple-100 flex items-center justify-center flex-shrink-0 shadow-inner">
                    <ShoppingBag size={24} className="text-rose-400" />
                  </div>

                  {/* 굿즈 정보 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="font-bold text-base text-foreground leading-tight truncate">{item.name}</h3>
                        <div className="flex items-center gap-1.5 mt-1">
                          <div className="w-4 h-4 bg-secondary rounded-full flex items-center justify-center">
                            <User size={9} className="text-muted-foreground" />
                          </div>
                          <span className="text-xs text-muted-foreground font-medium">{item.requesterName}</span>
                          <span className="text-muted-foreground/30">•</span>
                          <span className="text-[10px] text-muted-foreground/60 font-mono">ID #{item.id}</span>
                        </div>
                      </div>
                      {/* 상태 배지 */}
                      <span className={`flex-shrink-0 px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 ${statusConfig[item.status]?.class || 'bg-gray-100 text-gray-500'}`}>
                        {item.status === 'PENDING' && <Clock size={9} />}
                        {item.status === 'APPROVED' && <CheckCircle size={9} />}
                        {item.status === 'REJECTED' && <XCircle size={9} />}
                        {statusConfig[item.status]?.label || item.status}
                      </span>
                    </div>
                  </div>

                  {/* 액션 버튼 */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => setDetailItem(item)}
                      className="p-2.5 rounded-xl bg-secondary text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                      title="상세 보기"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => setRejectItem(item)}
                      className="px-4 py-2.5 text-xs font-bold text-red-500 rounded-xl bg-red-50 hover:bg-red-100 transition-colors border border-red-100"
                    >
                      <X size={14} className="inline mr-1" />거절
                    </button>
                    <button
                      onClick={() => handleApprove(item.id, item.name, item.productId)}
                      className="px-5 py-2.5 text-xs font-bold text-white rounded-xl btn-primary-gradient shadow-md"
                    >
                      <Check size={14} className="inline mr-1" />승인
                    </button>
                  </div>
                </div>

                {/* 하단 메타 정보 */}
                <div className="px-5 pb-3 flex items-center gap-3 border-t border-border/30 pt-3">
                  <span className="text-[10px] font-semibold text-muted-foreground/70">Product ID: {item.productId}</span>
                  <span className="text-muted-foreground/30">•</span>
                  <span className={`text-[10px] font-bold ${item.active ? 'text-teal-500' : 'text-slate-400'}`}>
                    {item.active ? '● 활성' : '○ 비활성'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* 처리된 항목 요약 (세션 내) */}
        {processedCount > 0 && (
          <div className="mt-4 p-4 rounded-2xl bg-secondary/50 border border-border/50">
            <p className="text-xs font-semibold text-muted-foreground text-center">
              이 세션에서 <span className="text-teal-600 font-bold">{approvedIds.length}건 승인</span>,
              <span className="text-red-500 font-bold ml-1">{rejectedIds.length}건 거절</span> 처리하였습니다.
            </p>
          </div>
        )}
      </div>

      {/* 상세 보기 모달 */}
        {detailItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm fade-in-up">
            <div className="glass-card w-full max-w-lg rounded-[2rem] overflow-hidden shadow-2xl bg-white border border-rose-100">
              <div className="p-5 border-b border-border flex justify-between items-center bg-secondary/30">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-primary/10 rounded-xl">
                    <ShoppingBag className="text-primary" size={18} />
                  </div>
                  <h2 className="text-lg font-bold">굿즈 등록 요청 상세</h2>
                </div>
                <button onClick={() => setDetailItem(null)} className="p-2 hover:bg-white rounded-full transition-all">
                  <X size={20} className="text-muted-foreground" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                {/* 굿즈 정보 */}
                <div className="space-y-3">
                  {[
                    { label: 'Approval ID', value: `#${detailItem.id}` },
                    { label: 'Product ID',  value: `#${detailItem.productId}` },
                    { label: '굿즈 이름',   value: detailItem.name },
                    { label: '요청자',      value: detailItem.requesterName },
                    { label: '상태',        value: statusConfig[detailItem.status]?.label || detailItem.status },
                    { label: '활성 여부',   value: detailItem.active ? '활성' : '비활성' },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between py-2.5 border-b border-border/30 last:border-0">
                      <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide">{label}</span>
                      <span className="text-sm font-semibold text-foreground">{value}</span>
                    </div>
                  ))}
                </div>

                {/* 요청자 정보 */}
                <div className="bg-rose-50 p-4 rounded-2xl border border-rose-100 flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                    <User className="text-primary" size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] text-rose-400 font-bold uppercase">Requested By</p>
                    <p className="font-bold text-rose-900 text-sm">{detailItem.requesterName}</p>
                  </div>
                </div>
              </div>

              {/* 하단 액션 */}
              <div className="p-5 bg-slate-50 border-t border-border flex gap-3">
                <button 
                  onClick={() => { setRejectItem(detailItem); setDetailItem(null); }}
                  className="flex-1 py-3.5 rounded-2xl text-sm font-bold text-red-500 bg-red-50 hover:bg-red-100 transition-colors border border-red-100"
                >
                  <X size={14} className="inline mr-1" />거절
                </button>
                <button 
                  onClick={() => handleApprove(detailItem.id, detailItem.name, detailItem.productId)}
                  className="flex-[2] py-3.5 rounded-2xl btn-primary-gradient text-white font-bold shadow-lg"
                >
                  <Check size={14} className="inline mr-1" />승인 처리
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