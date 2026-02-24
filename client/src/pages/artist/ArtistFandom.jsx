/*
 * FanVerse - Artist Fandom Page
 * Soft Bloom Design: Fandom dashboard with media, fan letters, artist letters
 */

import { useState } from 'react';
import Layout from '@/components/Layout';
import { Heart, Play, ShoppingBag, MessageCircle, Music, ArrowRight } from 'lucide-react';
import { posts, goodsItems, formatPrice } from '@/lib/data';
import { toast } from 'sonner';

const COMMUNITY_BG = 'https://private-us-east-1.manuscdn.com/sessionFile/umqDS2iCyxhwdKkQqabwQ5/sandbox/5OYI281mcXf2naQYMxZ8bN-img-5_1771469988000_na1fn_Y29tbXVuaXR5LWJn.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvdW1xRFMyaUN5eGh3ZEtrUXFhYndRNS9zYW5kYm94LzVPWUkyODFtY1hmMm5hUVlNeFo4Yk4taW1nLTVfMTc3MTQ2OTk4ODAwMF9uYTFmbl9ZMjl0YlhWdWFYUjVMV0puLnBuZz94LW9zcy1wcm9jZXNzPWltYWdlL3Jlc2l6ZSx3XzE5MjAsaF8xOTIwL2Zvcm1hdCx3ZWJwL3F1YWxpdHkscV84MCIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTc5ODc2MTYwMH19fV19&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=OvONeHWS3LykVQuFiWpaS9XzYUba7kOgqlmKutALRgmkL1rsA5hsFdmwcq2unDO6R2o9vPx9GqglrQWYWE0hJ6J1jnfqLDTYrTwdIsqxeq8LG~sstZuDujh-aCYwYF75GhuAGbhqHcE38Mh4M2FlLfsbyaw~cLXxXtBNBj1fvsq5GNewSaMl5OffFwdKKtE2~6ZgnECETh-6JZF9kouzD1Msz-AmZqK6oLXCB1IMhOVBNVJ~ryvIpZ7F4d4hh6xEqYFPJ6j-HmiCU~xm6iqIevuIh5Due7kYDaH2B~c6v4geO9ctighiLnGwwXlUAkhXgJkLtu-~dPbn5D7EKXDpWg__';

const mediaVideos = [
{ id: 1, title: '이하은 - "봄날의 꿈" MV', thumbnail: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=225&fit=crop', views: '2.4M', duration: '3:42' },
{ id: 2, title: '팬미팅 비하인드 영상', thumbnail: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=225&fit=crop', views: '890K', duration: '8:15' },
{ id: 3, title: '연습실 브이로그', thumbnail: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=225&fit=crop', views: '1.2M', duration: '12:30' }];


const fandomTabs = [
{ key: 'dashboard', label: '대시보드' },
{ key: 'media', label: '미디어' },
{ key: 'letters', label: '레터' },
{ key: 'goods', label: '굿즈' }];


export default function ArtistFandom() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <Layout role="artist">
      <div className="p-4 lg:p-6 space-y-6">
        {/* Fandom Header */}
        <div className="relative overflow-hidden rounded-3xl">
          <img src={COMMUNITY_BG} alt="팬덤" className="w-full h-44 object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <div className="flex items-center gap-2 mb-1">
              <Heart size={16} className="text-rose-300" fill="currentColor" />
              <span className="text-white/80 text-sm font-medium">PETAL 팬덤</span>
            </div>
            <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
              이하은 팬덤 페이지
            </h1>
            <p className="text-white/70 text-sm">팬들과 소통하고 특별한 콘텐츠를 공유하세요</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 bg-rose-50 p-1 rounded-2xl overflow-x-auto">
          {fandomTabs.map((tab) =>
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-shrink-0 flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            activeTab === tab.key ?
            'bg-white text-rose-600 shadow-sm' :
            'text-muted-foreground hover:text-foreground'}`
            }>
            
              {tab.label}
            </button>
          )}
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' &&
        <div className="grid lg:grid-cols-2 gap-4">
            {/* Recent Fan Letters */}
            <div className="glass-card rounded-2xl p-4 soft-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Heart size={16} className="text-rose-500" />
                  <h3 className="font-bold text-foreground">최근 팬레터</h3>
                </div>
                <button onClick={() => setActiveTab('letters')} className="text-xs text-rose-500 font-semibold flex items-center gap-1">
                  전체 <ArrowRight size={12} />
                </button>
              </div>
              {posts.filter((p) => p.type === 'fanletter').map((post) =>
            <div key={post.id} className="flex items-start gap-2 py-2 border-b border-rose-50 last:border-0">
                  <img src={post.authorImage} alt="" className="w-7 h-7 rounded-full object-cover flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground line-clamp-1">{post.title}</p>
                    <p className="text-xs text-muted-foreground">{post.author}</p>
                  </div>
                  <span className="text-xs text-rose-500 flex items-center gap-0.5">
                    <Heart size={10} fill="currentColor" /> {post.likes}
                  </span>
                </div>
            )}
            </div>

            {/* Artist Letters */}
            <div className="glass-card rounded-2xl p-4 soft-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <MessageCircle size={16} className="text-violet-500" />
                  <h3 className="font-bold text-foreground">아티스트 레터</h3>
                </div>
                <button
                onClick={() => toast.info('아티스트 레터 작성 기능 준비 중입니다')}
                className="text-xs badge-lavender px-2 py-1 rounded-full font-semibold">
                
                  + 작성
                </button>
              </div>
              {posts.filter((p) => p.type === 'artist-letter').map((post) =>
            <div key={post.id} className="p-3 rounded-xl bg-violet-50 mb-2">
                  <p className="text-sm font-semibold text-foreground">{post.title}</p>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{post.content}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs text-muted-foreground">{post.createdAt}</span>
                    <span className="text-xs text-violet-600 flex items-center gap-0.5">
                      <Heart size={10} /> {post.likes.toLocaleString()}
                    </span>
                  </div>
                </div>
            )}
            </div>

            {/* Media Preview */}
            <div className="glass-card rounded-2xl p-4 soft-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Music size={16} className="text-teal-500" />
                  <h3 className="font-bold text-foreground">최근 미디어</h3>
                </div>
                <button onClick={() => setActiveTab('media')} className="text-xs text-teal-500 font-semibold flex items-center gap-1">
                  전체 <ArrowRight size={12} />
                </button>
              </div>
              <div className="space-y-2">
                {mediaVideos.slice(0, 2).map((video) =>
              <div
                key={video.id}
                onClick={() => toast.info('미디어 플레이어 기능 준비 중입니다')}
                className="flex items-center gap-3 cursor-pointer hover:bg-teal-50 rounded-xl p-2 -mx-2 transition-colors">
                
                    <div className="relative w-20 h-12 rounded-lg overflow-hidden flex-shrink-0">
                      <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                        <Play size={14} className="text-white" fill="white" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground line-clamp-1">{video.title}</p>
                      <p className="text-xs text-muted-foreground">{video.views} 조회</p>
                    </div>
                  </div>
              )}
              </div>
            </div>

            {/* Goods Preview */}
            <div className="glass-card rounded-2xl p-4 soft-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <ShoppingBag size={16} className="text-amber-500" />
                  <h3 className="font-bold text-foreground">굿즈 샵</h3>
                </div>
                <button onClick={() => setActiveTab('goods')} className="text-xs text-amber-500 font-semibold flex items-center gap-1">
                  전체 <ArrowRight size={12} />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {goodsItems.filter((g) => g.artistId === 3).slice(0, 2).map((item) =>
              <div
                key={item.id}
                onClick={() => toast.info('굿즈 상세보기 기능 준비 중입니다')}
                className="rounded-xl overflow-hidden cursor-pointer hover-lift">
                
                    <img src={item.image} alt={item.name} className="w-full h-20 object-cover" />
                    <div className="p-2 bg-amber-50">
                      <p className="text-xs font-semibold text-foreground line-clamp-1">{item.name}</p>
                      <p className="text-xs text-amber-600 font-bold">{formatPrice(item.price)}</p>
                    </div>
                  </div>
              )}
              </div>
            </div>
          </div>
        }

        {/* Media Tab */}
        {activeTab === 'media' &&
        <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
                미디어 라이브러리
              </h2>
              <button
              onClick={() => toast.info('미디어 업로드 기능 준비 중입니다')}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-xl btn-primary-gradient shadow-sm">
              
                <Play size={14} />
                업로드
              </button>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mediaVideos.map((video) =>
            <div
              key={video.id}
              onClick={() => toast.info('미디어 플레이어 기능 준비 중입니다')}
              className="glass-card rounded-2xl overflow-hidden hover-lift cursor-pointer soft-shadow">
              
                  <div className="relative">
                    <img src={video.thumbnail} alt={video.title} className="w-full h-44 object-cover" />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center">
                        <Play size={20} className="text-rose-500 ml-0.5" fill="currentColor" />
                      </div>
                    </div>
                    <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded">
                      {video.duration}
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="font-semibold text-sm text-foreground">{video.title}</p>
                    <p className="text-xs text-muted-foreground">{video.views} 조회</p>
                  </div>
                </div>
            )}
            </div>
          </div>
        }

        {/* Letters Tab */}
        {activeTab === 'letters' &&
        <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
                레터 관리
              </h2>
              <button
              onClick={() => toast.info('레터 작성 기능 준비 중입니다')}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-xl btn-primary-gradient shadow-sm">
              
                + 아티스트 레터 작성
              </button>
            </div>
            <div className="grid lg:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-sm text-muted-foreground mb-3 uppercase tracking-wide">팬레터</h3>
                {posts.filter((p) => p.type === 'fanletter').map((post) =>
              <div key={post.id} className="glass-card rounded-2xl p-4 mb-3 soft-shadow">
                    <div className="flex items-start gap-3">
                      <img src={post.authorImage} alt="" className="w-9 h-9 rounded-full object-cover" />
                      <div>
                        <p className="font-semibold text-sm text-foreground">{post.title}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{post.content}</p>
                        <p className="text-xs text-muted-foreground mt-1">{post.author} · {post.createdAt}</p>
                      </div>
                    </div>
                  </div>
              )}
              </div>
              <div>
                <h3 className="font-semibold text-sm text-muted-foreground mb-3 uppercase tracking-wide">아티스트 레터</h3>
                {posts.filter((p) => p.type === 'artist-letter').map((post) =>
              <div key={post.id} className="glass-card rounded-2xl p-4 mb-3 soft-shadow border-l-4 border-violet-300">
                    <p className="font-semibold text-sm text-foreground">{post.title}</p>
                    <p className="text-xs text-muted-foreground line-clamp-3 mt-1">{post.content}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs text-muted-foreground">{post.createdAt}</span>
                      <span className="text-xs text-violet-600">❤ {post.likes.toLocaleString()}</span>
                      <span className="text-xs text-muted-foreground">댓글 {post.comments}</span>
                    </div>
                  </div>
              )}
              </div>
            </div>
          </div>
        }

        {/* Goods Tab */}
        {activeTab === 'goods' &&
        <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
                굿즈 관리
              </h2>
              <button
              onClick={() => toast.info('굿즈 등록 기능 준비 중입니다')}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-xl btn-primary-gradient shadow-sm">
              
                + 굿즈 등록
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {goodsItems.filter((g) => g.artistId === 3).map((item) =>
            <div key={item.id} className="glass-card rounded-2xl overflow-hidden soft-shadow hover-lift">
                  <img src={item.image} alt={item.name} className="w-full h-36 object-cover" />
                  <div className="p-3">
                    <p className="font-semibold text-sm text-foreground line-clamp-2 mb-1">{item.name}</p>
                    <p className="text-sm font-bold text-rose-600">{formatPrice(item.price)}</p>
                    <p className="text-xs text-muted-foreground">재고 {item.stock}개</p>
                  </div>
                </div>
            )}
            </div>
          </div>
        }
      </div>
    </Layout>);

}