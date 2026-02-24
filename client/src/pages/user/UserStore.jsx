/*
 * FanVerse - User Store Page
 * Soft Bloom Design: Goods shop with filtering, product cards
 */

import { useState } from 'react';
import { useLocation } from 'wouter';
import Layout from '@/components/Layout';
import { ShoppingBag, Search, Filter, Star, Heart, ShoppingCart, Tag } from 'lucide-react';
import { goodsItems, artists, formatPrice } from '@/lib/data';
import { toast } from 'sonner';

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
          onClick={() => {
            setWishlisted(!wishlisted);
            toast.success(wishlisted ? '위시리스트에서 제거했습니다' : '위시리스트에 추가했습니다');
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
            onClick={() => toast.success(`${item.name}을(를) 장바구니에 담았습니다`)}
            className="p-2 rounded-xl btn-primary-gradient shadow-sm">

            <ShoppingCart size={14} className="text-white" />
          </button>
        </div>
      </div>
    </div>);

}

export default function UserStore() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = goodsItems.filter((item) => {
    const matchCategory = activeCategory === 'all' || item.category === activeCategory;
    const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.artistName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

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
                <span className="text-white/80 text-sm font-medium">FanVerse Store</span>
              </div>
              <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
                굿즈 샵
              </h1>
              <p className="text-white/70 text-sm">공식 굿즈부터 팬메이드, 중고거래까지</p>
            </div>
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
          <button
            onClick={() => toast.info('필터 기능 준비 중입니다')}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-rose-100 rounded-xl text-sm font-medium text-muted-foreground hover:bg-rose-50 transition-colors">

            <Filter size={16} />
            필터
          </button>
        </div>

        {/* Artist Filter */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => toast.info('아티스트 필터 기능 준비 중입니다')}
            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-rose-500 text-white rounded-full text-xs font-semibold">

            전체 아티스트
          </button>
          {artists.map((artist) =>
            <button
              key={artist.id}
              onClick={() => toast.info(`${artist.name} 굿즈만 보기`)}
              className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-white border border-rose-100 rounded-full text-xs font-medium text-muted-foreground hover:bg-rose-50 transition-colors">

              <img src={artist.image} alt={artist.name} className="w-4 h-4 rounded-full object-cover" />
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