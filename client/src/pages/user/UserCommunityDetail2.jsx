import { useState, useEffect, useCallback } from 'react';
import { useRoute, useLocation } from 'wouter';
import Layout from '@/components/Layout';
import { Heart, MessageCircle, Eye, ArrowLeft, Share2, MoreHorizontal, User, AlertCircle, Download } from 'lucide-react';
import { toast } from 'sonner';

// MSA Gateway 주소
const API_BASE_URL = 'http://localhost/msa/core/board';

export default function UserCommunityDetail() {
  // wouter의 useRoute를 사용하여 URL 파라미터 :id를 추출합니다.
  const [match, params] = useRoute('/user/community/:id');
  const [, setLocation] = useLocation();
  
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]); // 댓글 목록 상태
  const [loading, setLoading] = useState(true);

  // 게시글 및 댓글 데이터 로드
  const fetchPostDetail = useCallback(async () => {
    const boardId = params?.id;
    if (!boardId) return;
    try {
      setLoading(true);
      const token = localStorage.getItem('TOKEN');
      const response = await fetch(`${API_BASE_URL}/${boardId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });

      if (!response.ok) throw new Error(`상태: ${response.status}`);
      const data = await response.json();
      setPost(data);
    } catch (err) {
      console.error("상세보기 로드 실패:", err);
      toast.error("게시글을 불러올 수 없습니다.");
      setLocation('/user/community');
    } finally {
      setLoading(false);
    }
  }, [params?.id, setLocation]);

  // 댓글 신고 합수
    const handleReportComment = async (commentId) => {
    const reason = window.prompt("신고 사유를 입력해주세요:");
    if (!reason || !reason.trim()) return;
      try {
      const token = localStorage.getItem('TOKEN');
      if (!token) {
        toast.error("로그인이 필요한 서비스입니다.");
        return;
      }
      const response = await fetch(`${API_BASE_URL}/comments/${commentId}/report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reason })
      });

      if (response.ok) {
        toast.success("댓글 신고가 접수되었습니다.");
      } else if (response.status === 409) {
        toast.error("이미 신고한 댓글입니다.");
      } else {
        toast.error("신고 처리에 실패했습니다.");
      }
    } catch (error) {
      toast.error("서버 통신 오류가 발생했습니다.");
    }
  };
   
  // 목록으로 돌아가기
  const handleBack = () => {
    setLocation('/user/community');
  };

  useEffect(() => {
    fetchPostDetail();
    fetchComments();
  }, [fetchPostDetail, fetchComments]);
  
  if (loading) {
    return (
      <Layout role="user">
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
          <div className="w-8 h-8 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin"></div>
          <p className="text-rose-400 font-bold">게시글을 불러오는 중...</p>
        </div>
      </Layout>
    );
  }
  
  if (!post) {
    return (
      <Layout role="user">
        <div className="max-w-4xl mx-auto p-10 text-center">
          <p className="text-gray-400 font-bold mb-4">게시글이 존재하지 않거나 삭제되었습니다.</p>
          <button onClick={handleBack} className="text-rose-500 font-black text-sm underline">목록으로 돌아가기</button>
        </div>
      </Layout>
    );
  }

  const isArtist = post.artistPost === true || post.isArtistPost === true;

  return (
    <Layout role="user">
      <div className="max-w-4xl mx-auto p-4 lg:p-6 space-y-6">
        {/* 상단 네비게이션 */}
        <button 
          onClick={handleBack} 
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-rose-500 transition-all font-bold group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> 목록으로 돌아가기
        </button>

        {/* 게시글 본문 카드 */}
        <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-rose-50">
          <div className="flex items-center justify-between mb-6">
            <span className="px-3 py-1 rounded-full bg-rose-50 text-rose-500 text-xs font-black border border-rose-100">
              {post.category || '전체'}
            </span>
            <div className="flex items-center gap-3 text-gray-300">
              <Share2 size={18} className="cursor-pointer hover:text-rose-500 transition-colors" />
              <MoreHorizontal size={18} className="cursor-pointer hover:text-rose-500 transition-colors" />
            </div>
          </div>

          <h1 className="text-2xl md:text-3xl font-black text-gray-900 mb-6 leading-tight">
            {post.title}
          </h1>
          
          <div className="flex items-center gap-4 mb-10 pb-6 border-b border-rose-50">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-[10px] text-white shadow-sm ${isArtist ? 'bg-gradient-to-tr from-purple-600 to-indigo-400' : 'bg-rose-400'}`}>
              {isArtist ? '아티스트' : <User size={20} />}
            </div>
            <div>
              <p className="text-sm font-black text-gray-800">
                {post.authorName || `User_${post.memberId || '익명'}`}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {post.createdAt ? new Date(post.createdAt).toLocaleString() : '-'}
              </p>
            </div>
          </div>

          <div className="text-gray-700 leading-relaxed min-h-[300px] whitespace-pre-wrap text-[16px] md:text-lg font-medium">
            {post.content}
          </div>

          {/* 하단 통계 정보 */}
          <div className="flex items-center gap-6 mt-12 pt-8 border-t border-rose-50 text-gray-400">
            <div className="flex items-center gap-2 text-xs font-bold hover:text-rose-500 cursor-pointer transition-colors">
              <Heart size={18} /> {post.likeCount || 0}
            </div>
            <div className="flex items-center gap-2 text-xs font-bold">
              <MessageCircle size={18} /> {post.commentCount || 0}
            </div>
            <div className="flex items-center gap-2 text-xs font-bold">
              <Eye size={18} /> {(post.viewCount || 0).toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}