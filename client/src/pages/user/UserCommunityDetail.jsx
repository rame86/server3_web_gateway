import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Heart, MessageCircle, Eye, ArrowLeft, Share2, MoreHorizontal } from 'lucide-react';
import { toast } from 'sonner';

// MSA Gateway 주소 (포트 3000 혼선 방지를 위해 절대 경로 사용)
const API_BASE_URL = 'http://localhost/msa/core/board';
const TOKEN_KEY = 'TOKEN';

export default function UserCommunityDetail() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem(TOKEN_KEY);

  const fetchPostDetail = useCallback(async () => {
    if (!id || id.includes('%')) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });

      if (!response.ok) {
        throw new Error(`상태: ${response.status}`);
      }

      const data = await response.json();
      setPost(data);
    } catch (err) {
      console.error("상세보기 로드 실패:", err);
      toast.error("게시글을 불러올 수 없습니다.");
    } finally {
      setLoading(false);
    }
  }, [id, token]);

  useEffect(() => {
    fetchPostDetail();
  }, [fetchPostDetail]);

  const handleBack = () => {
    window.location.href = '/user/community';
  };

  if (loading) return <Layout role="user"><div className="p-10 text-center font-black">로딩 중...</div></Layout>;
  
  if (!post) {
    return (
      <Layout role="user">
        <div className="max-w-4xl mx-auto p-10 text-center">
          <p className="text-gray-400 font-bold mb-4">게시글이 존재하지 않거나 매퍼 로직 오류입니다.</p>
          <button onClick={handleBack} className="text-rose-500 font-black text-sm underline">목록으로</button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout role="user">
      <div className="max-w-4xl mx-auto p-4 lg:p-6 space-y-6">
        <button onClick={handleBack} className="flex items-center gap-2 text-sm text-gray-500 hover:text-rose-500 transition-all font-bold">
          <ArrowLeft size={18} /> 뒤로가기
        </button>

        <div className="bg-white rounded-3xl p-8 shadow-sm border border-rose-50">
          <div className="flex items-center justify-between mb-6">
            <span className="px-3 py-1 rounded-full bg-rose-50 text-rose-500 text-xs font-black border border-rose-100">
              {post.category || '전체'}
            </span>
            <div className="flex items-center gap-3 text-gray-300">
              <Share2 size={18} className="cursor-pointer hover:text-rose-500" />
              <MoreHorizontal size={18} className="cursor-pointer hover:text-rose-500" />
            </div>
          </div>

          <h1 className="text-2xl font-black text-gray-900 mb-6 leading-tight">{post.title}</h1>
          
          <div className="flex items-center gap-4 mb-10 pb-6 border-b border-gray-50">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-[10px] text-white ${post.isArtistPost ? 'bg-gradient-to-tr from-purple-600 to-indigo-400' : 'bg-rose-400'}`}>
              {post.isArtistPost ? '아티스트' : 'USER'}
            </div>
            <div>
              {/* MSA 특성상 이름을 조인 못하므로 memberId를 표시하거나 수동 매핑 필요 */}
              <p className="text-sm font-black text-gray-800">{post.authorName || `User_${post.memberId}`}</p>
              <p className="text-xs text-gray-400 mt-1">{post.createdAt ? new Date(post.createdAt).toLocaleString() : '-'}</p>
            </div>
          </div>

          <div className="text-gray-700 leading-relaxed min-h-[300px] whitespace-pre-wrap text-[15px] font-medium">
            {post.content}
          </div>

          <div className="flex items-center gap-8 mt-12 pt-8 border-t border-gray-50 text-gray-400">
            <div className="flex items-center gap-2 text-xs font-bold"><Heart size={18} /> {post.likeCount || 0}</div>
            <div className="flex items-center gap-2 text-xs font-bold"><MessageCircle size={18} /> {post.commentCount || 0}</div>
            <div className="flex items-center gap-2 text-xs font-bold"><Eye size={18} /> {post.viewCount || 0}</div>
          </div>
        </div>
      </div>
    </Layout>
  );
}