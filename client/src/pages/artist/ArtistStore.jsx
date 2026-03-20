/*
 * Lumina - Artist Store Management
 * Soft Bloom Design: Goods listing and registration for artists
 */

import { useState } from 'react';
import Layout from '@/components/Layout';
import { cn } from "@/lib/utils";
import { Package, Plus, Search, Filter, Clock, Check, X, MoreVertical, Image as ImageIcon, Tag, DollarSign, Archive } from 'lucide-react';
import { goodsItems, formatPrice } from '@/lib/data';
import { toast } from 'sonner';
import { shopApi } from '@/lib/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function ArtistStore() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [isAdding, setIsAdding] = useState(false);

  // My goods filtering (id 3 is Lee Ha-eun's artistId from data.js)
  const myGoods = goodsItems.filter(item => item.artistId === 3);

  const filteredGoods = myGoods.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    if (activeTab === 'all') return matchesSearch;
    const categoryMap = {
      official: 'OFFICIAL',
      unofficial: 'FANMADE'
    };
    return matchesSearch && (item.category === activeTab || item.category === categoryMap[activeTab]);
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const title = e.target.title.value;
    const category = e.target.category.value;
    const price = e.target.price.value;
    const description = e.target.description.value;
    
    try {
      const endpoint = category === 'OFFICIAL' || category === 'ALBUM' ? '/product/official' : '/product/unofficial';
      
      await shopApi.post(endpoint, {
        goodsName: title,
        price: parseFloat(price),
        description: description,
        goodsType: category,
        requesterName: '아티스트' // placeholder
      });

      toast.success('굿즈 등록 요청이 완료되었습니다. 관리자 승인 후 게시됩니다.');
      setIsAdding(false);
    } catch (error) {
      console.error(error);
      toast.error('등록 요청에 실패했습니다.');
    }
  };

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
                    <Label htmlFor="category">카테고리 (Category)</Label>
                    <select id="category" className="w-full h-10 px-3 bg-white border border-violet-100 rounded-xl text-sm focus:ring-2 focus:ring-violet-300 focus:outline-none">
                      <option value="OFFICIAL">공식 굿즈 (OFFICIAL)</option>
                      <option value="FANMADE">팬메이드 (FANMADE)</option>
                      <option value="ALBUM">앨범 (ALBUM)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">판매 가격 (Price - Numeric)</Label>
                    <Input id="price" type="number" step="0.01" placeholder="0.00" required className="rounded-xl border-violet-100" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">상품 설명 (Description)</Label>
                  <Textarea id="description" placeholder="상세 설명을 적어주세요 (Text)" className="rounded-xl border-violet-100 min-h-[100px]" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="image_url">이미지 URL (Image URL)</Label>
                  <div className="flex gap-2">
                    <Input id="image_url" placeholder="https://..." className="rounded-xl border-violet-100" />
                    <Button type="button" variant="outline" className="rounded-xl border-violet-200">
                      <ImageIcon size={18} />
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 opacity-70">
                   <div className="space-y-1">
                      <p className="text-[10px] text-muted-foreground ml-1">Seller ID (Auto)</p>
                      <Input disabled value="3" className="h-8 text-xs rounded-lg" />
                   </div>
                   <div className="space-y-1">
                      <p className="text-[10px] text-muted-foreground ml-1">Seller Type (Auto)</p>
                      <Input disabled value="ARTIST" className="h-8 text-xs rounded-lg" />
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
    </Layout>
  );
}
