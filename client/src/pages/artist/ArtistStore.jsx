/*
 * Lumina - Artist Store Management
 * Soft Bloom Design: Goods listing and registration for artists
 */

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { cn } from "@/lib/utils";
import { Package, Plus, Search, Clock, Check, MoreVertical, Image as ImageIcon, DollarSign, Archive, Loader2 } from 'lucide-react';
import { goodsItems, formatPrice } from '@/lib/data';
import { toast } from 'sonner';
import { shopApi, coreApi } from '@/lib/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function ArtistStore() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [isAdding, setIsAdding] = useState(false);
  const [isSubmitConfirmOpen, setIsSubmitConfirmOpen] = useState(false);
  const [pendingFormData, setPendingFormData] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  
  const memberId = localStorage.getItem('memberId');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // 1. 아티스트 목록 조회 (이름 매칭용)
        const artistRes = await coreApi.get('/artist/list');
        const artistsData = artistRes.data || [];

        // 2. 전체 상품 조회
        const shopRes = await shopApi.get('shop/');
        
        // 내 상품만 필터링
        const myProducts = shopRes.data.filter(item => String(item.sellerId) === String(memberId));
        
        const mapped = myProducts.map(item => {
          const artist = artistsData.find(a => String(a.memberId) === String(item.sellerId));
          return {
            id: item.productId,
            name: item.title,
            artistId: item.sellerId,
            artistName: artist ? artist.stageName : '아티스트',
            price: item.basePrice,
            image: item.imageUrl,
            category: item.category, // OFFICIAL, UNOFFICIAL, SECONDHAND
            stock: 100, // 임시 기입
            status: item.isActive,
            rating: 4.5,
            reviews: 10
          };
        });
        setProducts(mapped);
      } catch (error) {
        console.error('Failed to fetch artist store data:', error);
        toast.error('데이터를 가져오는 데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [memberId]);

  const filteredGoods = products.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    if (activeTab === 'all') return matchesSearch;
    const categoryMap = {
      official: 'OFFICIAL',
      unofficial: 'UNOFFICIAL',
      secondhand: 'SECONDHAND'
    };
    return matchesSearch && (item.category === categoryMap[activeTab] || item.category === activeTab);
  });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  // 폼 제출 시: 데이터 수집 후 확인 모달만 오픈
  const handleSubmit = async (e) => {
    e.preventDefault();

    const title = e.target.title.value;
    const category = e.target.category.value;
    const itemCategory = e.target.itemCategory.value;
    const price = e.target.price.value;
    const description = e.target.description.value;
    // 아티스트는 본인 ID를 자동으로 사용
    const artistId = localStorage.getItem('memberId');
    const stockQuantity = parseInt(e.target.stockQuantity.value || '0', 10);

    if (!artistId) {
      toast.error('로그인 정보를 확인해주세요.');
      return;
    }

    setPendingFormData({ title, category, itemCategory, price, description, artistId, stockQuantity });
    setIsSubmitConfirmOpen(true);
  };

  // 확인 후 실제 API 호출
  const handleConfirmedSubmit = async () => {
    setIsSubmitConfirmOpen(false);
    if (!pendingFormData) return;

    const { title, category, itemCategory, price, description, artistId, stockQuantity } = pendingFormData;

    try {
      const endpoint = category === 'OFFICIAL' ? '/product/official' : '/product/unofficial';
      const requesterName = localStorage.getItem('username') || '아티스트';

      const formData = new FormData();
      formData.append('goodsName', title);
      formData.append('price', parseFloat(price));
      formData.append('description', description);
      formData.append('goodsType', category);
      formData.append('itemCategory', itemCategory);
      formData.append('requesterName', requesterName);
      formData.append('artistId', artistId);
      formData.append('stockQuantity', stockQuantity);
      if (imageFile) {
        formData.append('imageFile', imageFile);
      }

      await shopApi.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success('굿즈 등록 요청이 완료되었습니다. 관리자 승인 후 게시됩니다.');
      setIsAdding(false);
      setImageFile(null);
      setImagePreview(null);
      setPendingFormData(null);
    } catch (error) {
      console.error(error);
      toast.error('등록 요청에 실패했습니다.');
    }
  };

  if (loading) {
    return (
      <Layout role="artist">
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <Loader2 size={40} className="text-violet-500 animate-spin" />
          <p className="text-muted-foreground font-medium">상품 목록을 불러오는 중입니다...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout role="artist">
      <div className="p-4 lg:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
              굿즈 관리
            </h1>
            <p className="text-sm text-muted-foreground">판매 중인 굿즈와 등록 요청 상태를 확인합니다</p>
          </div>

          <Dialog open={isAdding} onOpenChange={setIsAdding}>
            <DialogTrigger asChild>
              <button className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 text-white font-bold rounded-2xl shadow-lg hover:bg-violet-700 transition-all hover-lift">
                <Plus size={18} />
                새 굿즈 등록
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] rounded-3xl">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>새 굿즈 등록 요청 (Product Spec)</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">굿즈 명칭 (Title)</Label>
                  <Input id="title" placeholder="상품 이름을 입력하세요" required className="rounded-xl border-violet-100 focus:ring-violet-300" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">판매 유형 (Category)</Label>
                    <select id="category" className="w-full h-10 px-3 bg-white border border-violet-100 rounded-xl text-sm focus:ring-2 focus:ring-violet-300 focus:outline-none">
                      <option value="OFFICIAL">공식 굿즈 (OFFICIAL)</option>
                      <option value="UNOFFICIAL">팬메이드 (UNOFFICIAL)</option>
                      <option value="SECONDHAND">중고 (SECONDHAND)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="itemCategory">상품 카테고리</Label>
                    <select id="itemCategory" className="w-full h-10 px-3 bg-white border border-violet-100 rounded-xl text-sm focus:ring-2 focus:ring-violet-300 focus:outline-none">
                      <option value="GOODS">굿즈</option>
                      <option value="ALBUM">앤범</option>
                      <option value="PHOTOBOOK">포토북</option>
                      <option value="CLOTHING">의류</option>
                      <option value="ACCESSORY">액세서리</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">판매 가격</Label>
                  <Input id="price" type="number" step="1" placeholder="0" required className="rounded-xl border-violet-100" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">상품 설명 (Description)</Label>
                  <Textarea id="description" placeholder="상세 설명을 적어주세요 (Text)" className="rounded-xl border-violet-100 min-h-[100px]" />
                </div>

                {/* 판매 수량 */}
                <div className="space-y-2">
                  <Label htmlFor="stockQuantity">판매 수량 (Stock Quantity)</Label>
                  <Input
                    id="stockQuantity"
                    type="number"
                    min="0"
                    defaultValue="0"
                    placeholder="0"
                    required
                    className="rounded-xl border-violet-100"
                  />
                </div>

                <div className="space-y-2">
                  <Label>상품 이미지</Label>
                  <label
                    htmlFor="imageFile"
                    className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-violet-200 rounded-2xl cursor-pointer bg-violet-50 hover:bg-violet-100 transition-colors relative overflow-hidden"
                  >
                    {imagePreview ? (
                      <>
                        <img src={imagePreview} alt="미리보기" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                          <p className="text-white text-xs font-semibold">클릭하여 변경</p>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-violet-400">
                        <ImageIcon size={28} />
                        <span className="text-xs font-semibold">클릭하여 이미지 선택</span>
                        <span className="text-[10px] text-muted-foreground">JPG, PNG, WEBP (최대 50MB)</span>
                      </div>
                    )}
                    <input
                      id="imageFile"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-4 opacity-70">
                   <div className="space-y-1">
                      <p className="text-[10px] text-muted-foreground ml-1">Seller Type (Auto)</p>
                      <Input disabled value="ARTIST" className="h-8 text-xs rounded-lg" />
                   </div>
                   <div className="space-y-1">
                      <p className="text-[10px] text-muted-foreground ml-1">Status (Auto)</p>
                      <Input disabled value="PENDING 승인 대기" className="h-8 text-xs rounded-lg" />
                   </div>
                </div>
                <DialogFooter className="pt-4">
                  <Button type="button" variant="ghost" onClick={() => setIsAdding(false)} className="rounded-xl">취소</Button>
                  <Button type="submit" className="bg-violet-600 hover:bg-violet-700 rounded-xl px-8">등록 요청</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search & Tabs */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="굿즈 이름으로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-11 bg-white border-violet-100 rounded-2xl focus:ring-violet-300"
            />
          </div>
          <div className="flex gap-1 bg-violet-50 p-1 rounded-2xl overflow-x-auto">
            {['all', 'official', 'unofficial'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-6 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap",
                  activeTab === tab ? "bg-white text-violet-600 shadow-sm" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {tab === 'all' ? '전체' : tab === 'official' ? '공식' : '팬메이드'}
              </button>
            ))}
          </div>
        </div>

        {/* Goods List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGoods.length > 0 ? (
            filteredGoods.map((item) => (
              <div key={item.id} className="glass-card rounded-3xl overflow-hidden soft-shadow group hover-lift transition-all">
                <div className="relative h-48 overflow-hidden">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-3 right-3 flex gap-2">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-bold shadow-sm backdrop-blur-md",
                      item.category.toLowerCase() === 'official' ? "bg-rose-500/80 text-white" : "bg-violet-500/80 text-white"
                    )}>
                      {item.category.toUpperCase()}
                    </span>
                  </div>
                  <div className="absolute top-3 left-3">
                    <span className="flex items-center gap-1.5 px-3 py-1 bg-teal-500/90 text-white rounded-full text-[10px] font-bold backdrop-blur-md">
                      <Check size={10} /> {item.status !== false ? '판매 중' : '중지됨'}
                    </span>
                  </div>
                </div>

                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-bold text-foreground leading-tight line-clamp-2">{item.name}</h3>
                    <button className="p-1.5 text-muted-foreground hover:bg-violet-50 rounded-lg transition-colors">
                      <MoreVertical size={16} />
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <DollarSign size={14} className="text-violet-400" />
                        판매가
                      </div>
                      <span className="font-bold text-foreground">{formatPrice(item.price)}</span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Archive size={14} className="text-violet-400" />
                        재고 현황
                      </div>
                      <span className={cn(
                        "font-semibold",
                        item.stock < 10 ? "text-rose-500" : "text-foreground"
                      )}>{item.stock}개 남음</span>
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-violet-50 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock size={12} />
                      마지막 수량 업데이트: 2시간 전
                    </div>
                    <button className="text-xs font-bold text-violet-600 hover:text-violet-700 underline underline-offset-4">
                      상세 분석
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-20 text-center glass-card rounded-3xl">
              <Package size={48} className="mx-auto text-violet-200 mb-4" />
              <p className="text-muted-foreground">조건에 맞는 굿즈가 없습니다.</p>
            </div>
          )}
        </div>
      </div>

      {/* 상품 등록 확인 모달 */}
      <Dialog open={isSubmitConfirmOpen} onOpenChange={setIsSubmitConfirmOpen}>
        <DialogContent className="sm:max-w-sm p-0 overflow-hidden bg-white rounded-3xl border-none">
          <DialogHeader className="hidden">
            <DialogTitle>등록 확인</DialogTitle>
          </DialogHeader>
          <div className="p-8 space-y-5 text-center">
            <div className="w-16 h-16 bg-violet-50 rounded-2xl flex items-center justify-center mx-auto">
              <Package size={32} className="text-violet-500" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground">상품을 등록 신청할까요?</h3>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                <span className="font-semibold text-foreground">{pendingFormData?.title}</span><br />
                관리자 승인 후 스토어에 게시됩니다.
              </p>
            </div>
            {pendingFormData && (
              <div className="px-4 py-3 bg-violet-50 rounded-2xl text-sm text-violet-700 font-medium text-left space-y-1">
                <div className="flex justify-between"><span className="text-muted-foreground">판매 유형</span><span>{pendingFormData.category}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">상품 카테고리</span><span>{pendingFormData.itemCategory}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">판매가</span><span>{Number(pendingFormData.price).toLocaleString()}원</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">수량</span><span>{pendingFormData.stockQuantity}개</span></div>
              </div>
            )}
            <div className="flex gap-3 pt-1">
              <button
                onClick={() => setIsSubmitConfirmOpen(false)}
                className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-all"
              >
                취소
              </button>
              <button
                onClick={handleConfirmedSubmit}
                className="flex-[1.5] py-3 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-2xl shadow-lg active:scale-95 transition-all"
              >
                등록 신청
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
