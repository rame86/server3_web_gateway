/*
 * FanVerse - User Community Page
 * Soft Bloom Design: Posts, fan letters, artist letters, notices
 */

import { useState } from 'react';
import Layout from '@/components/Layout';
import { BookOpen, Heart, MessageCircle, Eye, PenLine, Search, TrendingUp, Bell } from 'lucide-react';
import { posts } from '@/lib/data';
import { toast } from 'sonner';

const boardTabs = [
{ key: 'all', label: '전체' },
{ key: 'fanletter', label: '팬레터' },
{ key: 'artist-letter', label: '아티스트 레터' },
{ key: 'notice', label: '공지사항' },
{ key: 'fandom', label: '팬덤게시판' },
{ key: 'free', label: '자유게시판' }];


const typeConfig = {
  fanletter: { label: '팬레터', badgeClass: 'badge-rose' },
  'artist-letter': { label: '아티스트 레터', badgeClass: 'badge-lavender' },
  notice: { label: '공지', badgeClass: 'bg-amber-100 text-amber-700' },
  fandom: { label: '팬덤', badgeClass: 'badge-mint' },
  free: { label: '자유', badgeClass: 'bg-gray-100 text-gray-600' }
};

function PostCard({ post }) {
  const [liked, setLiked] = useState(false);
  const config = typeConfig[post.type];

  return (
    <div
      className="glass-card rounded-2xl p-4 soft-shadow hover:bg-rose-50/30 transition-colors cursor-pointer"
      onClick={() => toast.info('게시글 상세보기 기능 준비 중입니다')}>
      
      <div className="flex items-start gap-3">
        <img
          src={post.authorImage}
          alt={post.author}
          className="w-10 h-10 rounded-full object-cover flex-shrink-0 ring-2 ring-white shadow-sm" />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${config.badgeClass}`}>
              {config.label}
            </span>
            {post.artistName &&
            <span className="text-xs text-rose-500 font-medium">{post.artistName}</span>
            }
          </div>
          <h3 className="font-semibold text-sm text-foreground mb-1 line-clamp-1">{post.title}</h3>
          <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{post.content}</p>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">{post.author}</span>
            <span className="text-xs text-muted-foreground">{post.createdAt}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-rose-100">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setLiked(!liked);
            toast.success(liked ? '좋아요를 취소했습니다' : '좋아요!');
          }}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-rose-500 transition-colors">
          
          <Heart size={13} className={liked ? 'text-rose-500' : ''} fill={liked ? 'currentColor' : 'none'} />
          {post.likes + (liked ? 1 : 0)}
        </button>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <MessageCircle size={13} />
          {post.comments}
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Eye size={13} />
          {post.views.toLocaleString()}
        </div>
      </div>
    </div>);

}

export default function UserCommunity() {
  const [activeBoard, setActiveBoard] = useState('all');

  const filteredPosts = activeBoard === 'all' ?
  posts :
  posts.filter((p) => p.type === activeBoard);

  return (
    <Layout role="user">
      <div className="p-4 lg:p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
              종합 커뮤니티
            </h1>
            <p className="text-sm text-muted-foreground">팬레터, 아티스트 레터, 공지사항, 게시판</p>
          </div>
          <button
            onClick={() => toast.info('글쓰기 기능 준비 중입니다')}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-xl btn-primary-gradient shadow-sm">
            
            <PenLine size={14} />
            글쓰기
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="게시글 검색..."
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-rose-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" />
          
        </div>

        {/* Board Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {boardTabs.map((tab) =>
          <button
            key={tab.key}
            onClick={() => setActiveBoard(tab.key)}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            activeBoard === tab.key ?
            'bg-rose-500 text-white shadow-sm' :
            'bg-white border border-rose-100 text-muted-foreground hover:bg-rose-50'}`
            }>
            
              {tab.label}
            </button>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Posts */}
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={16} className="text-rose-500" />
              <span className="text-sm font-semibold text-foreground">인기 게시글</span>
            </div>
            {filteredPosts.map((post) =>
            <PostCard key={post.id} post={post} />
            )}
            {filteredPosts.length === 0 &&
            <div className="text-center py-12">
                <BookOpen size={40} className="text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">게시글이 없습니다</p>
              </div>
            }
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Notice */}
            <div className="glass-card rounded-2xl p-4 soft-shadow">
              <div className="flex items-center gap-2 mb-3">
                <Bell size={16} className="text-amber-500" />
                <h3 className="font-semibold text-sm text-foreground">공지사항</h3>
              </div>
              <div className="space-y-2">
                {[
                '3월 팬미팅 예매 안내',
                '포인트 충전 이벤트',
                '새로운 아티스트 입점 안내',
                '서비스 점검 공지'].
                map((notice, i) =>
                <div
                  key={i}
                  onClick={() => toast.info('공지사항 기능 준비 중입니다')}
                  className="flex items-start gap-2 cursor-pointer hover:bg-amber-50 rounded-lg p-1.5 -mx-1.5 transition-colors">
                  
                    <div className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-1.5 flex-shrink-0" />
                    <p className="text-xs text-foreground">{notice}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Hot Posts */}
            <div className="glass-card rounded-2xl p-4 soft-shadow">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp size={16} className="text-rose-500" />
                <h3 className="font-semibold text-sm text-foreground">실시간 인기</h3>
              </div>
              <div className="space-y-2">
                {posts.map((post, i) =>
                <div
                  key={post.id}
                  onClick={() => toast.info('게시글 기능 준비 중입니다')}
                  className="flex items-start gap-2 cursor-pointer hover:bg-rose-50 rounded-lg p-1.5 -mx-1.5 transition-colors">
                  
                    <span className={`text-xs font-bold w-4 flex-shrink-0 ${i < 3 ? 'text-rose-500' : 'text-muted-foreground'}`}>
                      {i + 1}
                    </span>
                    <p className="text-xs text-foreground line-clamp-1">{post.title}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Write Fan Letter */}
            <div
              className="rounded-2xl p-4 cursor-pointer hover-lift"
              style={{ background: 'linear-gradient(135deg, oklch(0.92 0.06 10), oklch(0.92 0.06 290))' }}
              onClick={() => toast.info('팬레터 쓰기 기능 준비 중입니다')}>
              
              <div className="flex items-center gap-2 mb-2">
                <Heart size={16} className="text-rose-500" fill="currentColor" />
                <h3 className="font-semibold text-sm text-foreground">팬레터 쓰기</h3>
              </div>
              <p className="text-xs text-muted-foreground mb-3">좋아하는 아티스트에게 마음을 전해보세요</p>
              <button className="w-full py-2 text-xs font-semibold text-white rounded-xl btn-primary-gradient">
                팬레터 작성하기
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>);

}