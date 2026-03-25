/*
 * Lumina - User Store Page
 * Soft Bloom Design: Goods shop with filtering, product cards
 */

import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import Layout from '@/components/Layout';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ShoppingBag, Search, Filter, Star, Heart, ShoppingCart, Tag, Loader2, Package, Plus, Image as ImageIcon } from 'lucide-react';
import { cn } from "@/lib/utils";
import { formatPrice } from '@/lib/data';
import { toast } from 'sonner';
import { shopApi, coreApi } from '@/lib/api';

const STORE_BANNER = 'https://private-us-east-1.manuscdn.com/sessionFile/umqDS2iCyxhwdKkQqabwQ5/sandbox/5OYI281mcXf2naQYMxZ8bN-img-3_1771469995000_na1fn_c3RvcmUtYmFubmVy.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvdW1xRFMyaUN5eGh3ZEtrUXFhYndRNS9zYW5kYm94LzVPWUkyODFtY1hmMm5hUVlNeFo4Yk4taW1nLTNfMTc3MTQ2OTk5NTAwMF9uYTFmbl9jM1J2Y21VdFltRnVibVZ5LnBuZz94LW9zcy1wcm9jZXNzPWltYWdlL3Jlc2l6ZSx3XzE5MjAsaF8xOTIwL2Zvcm1hdCx3ZWJwL3F1YWxpdHkscV84MCIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTc5ODc2MTYwMH19fV19&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=S6eW5vgVm6XszGBI~5NJLohyz1gX2utvIhf5xyaFfjZvUuZExvd8CLx0tJVpjHLF7Q1tJp0wjt~GQ49qIXhAgcEXp3LZtjSUkgdkfR0qoCnjkuhTT-mmw8pHSJm-ySJMVjSfZmWoazcNSMA3K~Ewpsb1Fvi~gBT~isRfg2fkElPpBALw1UmvyX4o-vfbw18vlBp-TRVokhS10GUSy-NL6I6Au0MQcnHCwRNa5hUpEeDN9aOlbPfIbh6LpN8f~OKUAMjE6aAJepBfbK8LoNCctsecUKk4aHsooodJ6nU5oudE8Z0PPw~TlPpnXBnkBwPYEjfZX2dRsaXlDetbd2bpFQ__';

const categoryTabs = [
  { key: 'all', label: '전체' },
  { key: 'official', label: '공식 굿즈' },
  { key: 'unofficial', label: '팬메이드' },
  { key: 'used', label: '중고거래' }];


function GoodsCard({ item }) {
  const [, setLocation] = useLocation();
  const [wishlisted, setWishlisted] = useState(false);
  const discount = item.originalPrice ?
    Math.round((1 - item.price / item.originalPrice) * 100) :
    0;

  return (
    <div className="glass-card rounded-2xl overflow-hidden hover-lift soft-shadow group">
      <div className="relative cursor-pointer" onClick={() => setLocation(`/user/store/${item.id}`)}>
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300" />

        {item.badge &&
          <div className="absolute top-2 left-2">
            <span className={`px-2 py-1 rounded-lg text-xs font-bold ${item.badge === '중고' ? 'badge-lavender' : item.badge === '한정판' ? 'bg-amber-100 text-amber-700' : 'badge-rose'}`
            }>
              {item.badge}
            </span>
          </div>
        }
        <button
          onClick={async (e) => {
            e.stopPropagation();
            try {
              await shopApi.post('/shop/wishlist', { productId: item.id });
              setWishlisted(!wishlisted);
              toast.success(wishlisted ? '위시리스트에서 제거했습니다' : '위시리스트에 추가했습니다');
            } catch (error) {
              toast.error('요청 처리에 실패했습니다.');
            }
          }}
          className="absolute top-2 right-2 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:scale-110 transition-transform">

          <Heart
            size={14}
            className={wishlisted ? 'text-rose-500' : 'text-muted-foreground'}
            fill={wishlisted ? 'currentColor' : 'none'} />

        </button>
      </div>
      <div className="p-3">
        <div className="cursor-pointer" onClick={() => setLocation(`/user/store/${item.id}`)}>
          <p className="text-xs text-rose-500 font-semibold mb-1">{item.artistName}</p>
          <p className="font-semibold text-sm text-foreground line-clamp-2 mb-2">{item.name}</p>
          <div className="flex items-center gap-1 mb-2">
            <Star size={12} className="text-amber-400" fill="currentColor" />
            <span className="text-xs font-semibold text-foreground">{item.rating}</span>
            <span className="text-xs text-muted-foreground">({item.reviews})</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <span className="font-bold text-foreground">{formatPrice(item.price)}</span>
            {item.originalPrice &&
              <span className="text-xs text-muted-foreground line-through ml-1">{formatPrice(item.originalPrice)}</span>
            }
          </div>
          <button
            onClick={async (e) => {
              e.stopPropagation();
              try {
                await shopApi.post('/shop/cart', { productId: item.id, quantity: 1 });
                toast.success(`${item.name}을(를) 장바구니에 담았습니다`);
              } catch (error) {
                toast.error('장바구니 담기에 실패했습니다.');
              }
            }}
            className="p-2 rounded-xl btn-primary-gradient shadow-sm">

            <ShoppingCart size={14} className="text-white" />
          </button>
        </div>
      </div>
    </div>);

}

export default function UserStore() {
  const [, setLocation] = useLocation();
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [dbArtists, setDbArtists] = useState([]);
  const [activeArtistId, setActiveArtistId] = useState('all');
  const [sortBy, setSortBy] = useState('none'); // none, price-low, price-high
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  // 현재 로그인한 유저의 역할 확인
  const userRole = localStorage.getItem('role') || 'USER'; // ADMIN, ARTIST, USER 등
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const title = e.target.title.value;
    const category = e.target.category.value;
    const price = e.target.price.value;
    const description = e.target.description.value;

    try {
      const isOfficial = category === 'OFFICIAL';
      const endpoint = isOfficial ? '/product/official' :
        category === 'SECONDHAND' ? '/product/secondhand' : '/product/unofficial';

      const formData = new FormData();
      formData.append('goodsName', title);
      formData.append('price', parseFloat(price));
      formData.append('description', description);
      formData.append('goodsType', category);
      formData.append('requesterName', userRole === 'ARTIST' ? '아티스트' : '일반유저');
      if (imageFile) {
        formData.append('imageFile', imageFile);
      }

      await shopApi.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success('굿즈 등록 요청이 완료되었습니다.');
      setIsAdding(false);
      setImageFile(null);
      setImagePreview(null);
      // 등록 후 목록 새로고침 가능
    } catch (error) {
      console.error(error);
      toast.error('등록 요청에 실패했습니다.');
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // 1. 아티스트 목록 조회 (Core API)
        const artistRes = await coreApi.get('/artist/list');
        const artistsData = (artistRes.data || []).map(a => ({
          artistId: a.memberId,
          name: a.stageName,
          image: a.profileImageUrl,
          category: a.category
        }));
        setDbArtists(artistsData);

        // 2. 상품 목록 조회 (Shop API)
        const shopRes = await shopApi.get('shop/');

        // Map backend DTO to frontend format
        const mappedProducts = shopRes.data.map(item => {
          // 아티스트 ID(memberId)로 실제 이름 찾기
          const artist = artistsData.find(a => String(a.artistId) === String(item.sellerId));
          return {
            id: item.productId,
            name: item.title,
            artistId: item.sellerId,
            artistName: artist ? artist.name : (item.sellerType === 'ARTIST' ? '아티스트' : '유저'),
            price: item.basePrice,
            image: item.imageUrl,
            category: item.category === 'OFFICIAL' ? 'official' :
              item.category === 'UNOFFICIAL' ? 'unofficial' : 'used',
            stock: 100,
            rating: 4.5,
            reviews: 10,
            badge: item.category === 'OFFICIAL' ? 'OFFICIAL' :
              item.category === 'SECONDHAND' ? '중고' : null
          };
        });
        setProducts(mappedProducts);
      } catch (error) {
        console.error('Failed to fetch store data:', error);
        toast.error('데이터를 가져오는 데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredItems = products.filter((item) => {
    // 1. 카테고리 필터 (전체/공식/팬메이드/중고)
    const matchCategory = activeCategory === 'all' || item.category === activeCategory;

    // 2. 검색어 필터 (상품명 또는 아티스트명)
    const matchSearch = searchQuery === '' ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.artistName.toLowerCase().includes(searchQuery.toLowerCase());

    // 3. 아티스트 특정 필터
    const matchArtistId = activeArtistId === 'all' || String(item.artistId) === String(activeArtistId);

    return matchCategory && matchSearch && matchArtistId;
  }).sort((a, b) => {
    if (sortBy === 'price-low') return a.price - b.price;
    if (sortBy === 'price-high') return b.price - a.price;
    return 0;
  });

  if (loading) {
    return (
      <Layout role="user">
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <Loader2 size={40} className="text-rose-500 animate-spin" />
          <p className="text-muted-foreground font-medium">상품 목록을 불러오는 중입니다...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout role="user">
      <div className="p-4 lg:p-6 space-y-6">
        {/* Banner */}
        <div className="relative overflow-hidden rounded-3xl h-36">
          <img src={STORE_BANNER} alt="굿즈 샵" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent" />
          <div className="absolute inset-0 flex items-center px-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <ShoppingBag size={18} className="text-white" />
                <span className="text-white/80 text-sm font-medium">Lumina Store</span>
              </div>
              <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
                굿즈 샵
              </h1>
              <p className="text-white/70 text-sm">공식 굿즈부터 팬메이드, 중고거래까지</p>
            </div>
          </div>
          {/* 우상단 - 위시리스트 / 장바구니 바로가기 */}
          <div className="absolute top-3 right-3 flex gap-2">
            <button
              onClick={() => setLocation('/user/store/orders')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-xl text-xs font-semibold text-rose-600 shadow hover:bg-white transition-colors"
            >
              <Package size={13} />
              주문 내역
            </button>
            <button
              onClick={() => setLocation('/user/store/wishlist')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-xl text-xs font-semibold text-rose-600 shadow hover:bg-white transition-colors"
            >
              <Heart size={13} fill="currentColor" />
              위시리스트
            </button>
            <button
              onClick={() => setLocation('/user/store/cart')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-xl text-xs font-semibold text-rose-600 shadow hover:bg-white transition-colors"
            >
              <ShoppingCart size={13} />
              장바구니
            </button>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="굿즈 또는 아티스트 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-rose-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent" />

          </div>
          <Dialog open={isAdding} onOpenChange={setIsAdding}>
            <DialogTrigger asChild>
              <button className="flex items-center gap-2 px-4 py-2.5 bg-rose-500 text-white font-bold rounded-xl shadow hover:bg-rose-600 transition-colors">
                <Plus size={16} />
                새 굿즈 등록
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] rounded-3xl">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>굿즈 등록하기</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">상품명</Label>
                  <Input id="title" placeholder="상품 이름을 입력하세요" required className="rounded-xl border-rose-100 focus:ring-rose-300" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">분류</Label>
                    <select id="category" className="w-full h-10 px-3 bg-white border border-rose-100 rounded-xl text-sm focus:ring-2 focus:ring-rose-300 focus:outline-none">
                      <option value="OFFICIAL">공식굿즈</option>
                      <option value="SECONDHAND">중고굿즈</option>
                      <option value="unofficial">팬메이드</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">판매 가격</Label>
                    <Input id="price" type="number" step="1" placeholder="0" required className="rounded-xl border-rose-100" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">상품 설명</Label>
                  <Textarea id="description" placeholder="상세 설명을 적어주세요" className="rounded-xl border-rose-100 min-h-[100px]" />
                </div>
                <div className="space-y-2">
                  <Label>상품 이미지</Label>
                  <label htmlFor="imageFile" className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-rose-200 rounded-2xl cursor-pointer bg-rose-50 hover:bg-rose-100 transition-colors relative overflow-hidden">
                    {imagePreview ? (
                      <>
                        <img src={imagePreview} alt="미리보기" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                          <p className="text-white text-xs font-semibold">클릭하여 변경</p>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-rose-400">
                        <ImageIcon size={28} />
                        <span className="text-xs font-semibold">클릭하여 이미지 선택</span>
                        <span className="text-[10px] text-muted-foreground">JPG, PNG, WEBP (최대 10MB)</span>
                      </div>
                    )}
                    <input id="imageFile" type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                  </label>
                </div>
                <DialogFooter className="pt-4">
                  <Button type="button" variant="ghost" onClick={() => setIsAdding(false)} className="rounded-xl">취소</Button>
                  <Button type="submit" className="bg-rose-500 hover:bg-rose-600 rounded-xl px-8 text-white">등록 완료</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <button
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-rose-100 rounded-xl text-sm font-medium text-muted-foreground hover:bg-rose-50 transition-colors">
                <Filter size={16} />
                {sortBy === 'price-low' ? '가격 낮은순' : sortBy === 'price-high' ? '가격 높은순' : '필터'}
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[300px] rounded-3xl">
              <DialogHeader>
                <DialogTitle className="text-lg font-bold">정렬 및 필터</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-2 py-4">
                <Button
                  variant={sortBy === 'none' ? 'default' : 'outline'}
                  onClick={() => { setSortBy('none'); }}
                  className="rounded-xl justify-start"
                >기본순</Button>
                <Button
                  variant={sortBy === 'price-low' ? 'default' : 'outline'}
                  onClick={() => { setSortBy('price-low'); }}
                  className="rounded-xl justify-start"
                >가격 낮은순</Button>
                <Button
                  variant={sortBy === 'price-high' ? 'default' : 'outline'}
                  onClick={() => { setSortBy('price-high'); }}
                  className="rounded-xl justify-start"
                >가격 높은순</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Artist Filter List */}
        <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
          <button
            onClick={() => setActiveArtistId('all')}
            className={cn(
              "flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all shadow-sm",
              activeArtistId === 'all'
                ? "bg-rose-500 text-white shadow-md active-lift"
                : "bg-white border border-rose-100 text-muted-foreground hover:bg-rose-50"
            )}>
            전체 아티스트
          </button>
          {dbArtists.map((artist) =>
            <button
              key={artist.artistId}
              onClick={() => setActiveArtistId(artist.artistId)}
              className={cn(
                "flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-white border rounded-full text-xs font-medium transition-all shadow-sm",
                String(activeArtistId) === String(artist.artistId)
                  ? "border-rose-300 bg-rose-50 text-rose-600 ring-2 ring-rose-300/20"
                  : "border-rose-100 text-muted-foreground hover:bg-rose-50"
              )}>
              {artist.image ? (
                <img src={artist.image} alt={artist.name} className="w-5 h-5 rounded-full object-cover" />
              ) : (
                <div className="w-5 h-5 rounded-full bg-rose-100 flex items-center justify-center">
                  <Package size={10} className="text-rose-300" />
                </div>
              )}
              {artist.name}
            </button>
          )}
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 bg-rose-50 p-1 rounded-2xl">
          {categoryTabs.map((tab) =>
            <button
              key={tab.key}
              onClick={() => setActiveCategory(tab.key)}
              className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${activeCategory === tab.key ?
                'bg-white text-rose-600 shadow-sm' :
                'text-muted-foreground hover:text-foreground'}`
              }>

              {tab.label}
            </button>
          )}
        </div>

        {/* Results count */}
        <div className="flex items-center gap-2">
          <Tag size={14} className="text-muted-foreground" />
          <span className="text-sm text-muted-foreground">{filteredItems.length}개의 상품</span>
        </div>

        {/* Goods Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredItems.map((item) =>
            <GoodsCard key={item.id} item={item} />
          )}
        </div>

        {filteredItems.length === 0 &&
          <div className="text-center py-16">
            <ShoppingBag size={48} className="text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">검색 결과가 없습니다</p>
          </div>
        }
      </div>
    </Layout>);

}