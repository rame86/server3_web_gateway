import { useState, useEffect, useCallback } from 'react';
import { useRoute, useLocation } from 'wouter';
import Layout from '@/components/Layout';
// Send 아이콘을 import 목록에 명확히 추가했습니다.
import { Heart, MessageCircle, Eye, ArrowLeft, Share2, MoreHorizontal, User, AlertCircle, Download, Send } from 'lucide-react';
import { toast } from 'sonner';

// MSA Gateway 주소
const API_BASE_URL = 'http://localhost/msa/core/board';

export default function UserCommunityDetail() {
  const [match, params] = useRoute('/user/community/:id');
  const [, setLocation] = useLocation();
  
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]); 
  const [newComment, setNewComment] = useState(""); 
  const [loading, setLoading] = useState(true);

  // 1. 게시글 상세 데이터 로드
  const fetchPostDetail = useCallback(async () => {
    const boardId = params?.id;
    if (!boardId) return;
    try {
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
    }
  }, [params?.id, setLocation]);

  // 2. 댓글 목록 로드
  const fetchComments = useCallback(async () => {
    const boardId = params?.id;
    if (!boardId) return;
    try {
      const response = await fetch(`${API_BASE_URL}/${boardId}/comments`);
      if (response.ok) {
        const data = await response.json();
        setComments(data);
      }
    } catch (err) {
      console.error("댓글 로드 실패:", err);
    }
  }, [params?.id]);

  // 3. 댓글 작성 핸들러
  const handleAddComment = async () => {
    if (!newComment.trim()) return toast.error("댓글 내용을 입력해주세요.");
    
    try {
      const token = localStorage.getItem('TOKEN');
      if (!token) {
        toast.error("로그인이 필요합니다.");
        return setLocation('/login');
      }

      const response = await fetch(`${API_BASE_URL}/${params.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // 토큰 전송
        },
        body: JSON.stringify({ content: newComment })
      });

      if (response.ok) {
        toast.success("댓글이 등록되었습니다.");
        setNewComment(""); 
        fetchComments();   
        fetchPostDetail(); 
      }
    } catch (error) {
      toast.error("댓글 등록 중 오류가 발생했습니다.");
    }
  };
  
  // 4. 좋아요 토글 핸들러
  const handleToggleLike = async () => {
    try {
      const token = localStorage.getItem('TOKEN');
      if (!token) return toast.error("로그인이 필요합니다.");

      const response = await fetch(`${API_BASE_URL}/${params.id}/like`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const updatedLikeCount = await response.json();
        setPost(prev => ({ ...prev, likeCount: updatedLikeCount }));
      }
    } catch (error) {
      toast.error("좋아요 처리에 실패했습니다.");
    }
  };

  // 5. 게시글 신고 핸들러
  const handleReportBoard = async () => {
    const reason = window.prompt("게시글 신고 사유를 입력해주세요:");
    if (!reason || !reason.trim()) return;

    try {
      const token = localStorage.getItem('TOKEN');
      if (!token) return toast.error("로그인이 필요합니다.");

      const response = await fetch(`${API_BASE_URL}/${params.id}/report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reason })
      });

      if (response.ok) toast.success("게시글 신고가 접수되었습니다.");
      else if (response.status === 409) toast.error("이미 신고한 게시글입니다.");
    } catch (error) {
      toast.error("서버 통신 오류가 발생했습니다.");
    }
  };

  // 6. 댓글 신고 핸들러
  const handleReportComment = async (commentId) => {
    const reason = window.prompt("댓글 신고 사유를 입력해주세요:");
    if (!reason || !reason.trim()) return;

    try {
      const token = localStorage.getItem('TOKEN');
      if (!token) return toast.error("로그인이 필요합니다.");

      const response = await fetch(`${API_BASE_URL}/comments/${commentId}/report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reason })
      });

      if (response.ok) toast.success("댓글 신고가 접수되었습니다.");
      else if (response.status === 409) toast.error("이미 신고한 댓글입니다.");
    } catch (error) {
      toast.error("서버 통신 오류가 발생했습니다.");
    }
  };

  // 7. 파일 다운로드 핸들러
  const handleDownload = () => {
    if (!post.storedFilePath) return;
    toast.info("파일 다운로드를 시작합니다.");
    window.open(`http://localhost/msa/core/board/download?path=${encodeURIComponent(post.storedFilePath)}`);
  };

  const handleBack = () => setLocation('/user/community');

  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      await Promise.all([fetchPostDetail(), fetchComments()]);
      setLoading(false);
    };
    initData();
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

  if (!post) return null;

  const isArtist = post.artistPost === true || post.isArtistPost === true;

  return (
    <Layout role="user">
      <div className="max-w-4xl mx-auto p-4 lg:p-6 space-y-6">
        <button onClick={handleBack} className="flex items-center gap-2 text-sm text-gray-500 hover:text-rose-500 transition-all font-bold group">
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> 목록으로 돌아가기
        </button>

        <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-rose-50 relative">
          <div className="flex items-center justify-between mb-6">
            <span className="px-3 py-1 rounded-full bg-rose-50 text-rose-500 text-xs font-black border border-rose-100">
              {post.category || '전체'}
            </span>
            <div className="flex items-center gap-3 text-gray-300">
              <AlertCircle size={20} className="cursor-pointer hover:text-red-500 transition-colors" title="게시글 신고" onClick={handleReportBoard} />
              <Share2 size={18} className="cursor-pointer hover:text-rose-500 transition-colors" />
              <MoreHorizontal size={18} className="cursor-pointer hover:text-rose-500 transition-colors" />
            </div>
          </div>

          <h1 className="text-2xl md:text-3xl font-black text-gray-900 mb-6 leading-tight">{post.title}</h1>
          
          <div className="flex items-center gap-4 mb-10 pb-6 border-b border-rose-50">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-[10px] text-white shadow-sm ${isArtist ? 'bg-gradient-to-tr from-purple-600 to-indigo-400' : 'bg-rose-400'}`}>
              {isArtist ? '아티스트' : <User size={20} />}
            </div>
            <div>
              <p className="text-sm font-black text-gray-800">{post.authorName || `User_${post.memberId || '익명'}`}</p>
              <p className="text-xs text-gray-400 mt-1">{post.createdAt ? new Date(post.createdAt).toLocaleString() : '-'}</p>
            </div>
          </div>

          <div className="text-gray-700 leading-relaxed min-h-[300px] whitespace-pre-wrap text-[16px] md:text-lg font-medium mb-8">
            {post.content}
          </div>

          {post.originalFileName && (
            <div className="bg-gray-50 rounded-2xl p-4 flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <Download size={18} className="text-rose-500" />
                <span className="text-sm font-bold text-gray-600">{post.originalFileName}</span>
              </div>
              <button onClick={handleDownload} className="text-xs font-black text-rose-500 hover:underline">다운로드</button>
            </div>
          )}

          <div className="flex items-center gap-6 mt-12 pt-8 border-t border-rose-50 text-gray-400 font-bold text-xs">
            <div onClick={handleToggleLike} className="flex items-center gap-2 cursor-pointer hover:text-rose-500 transition-colors">
              <Heart size={18} className={post.likeCount > 0 ? "fill-rose-500 text-rose-500" : ""} /> {post.likeCount || 0}
            </div>
            <div className="flex items-center gap-2"><MessageCircle size={18} /> {post.commentCount || 0}</div>
            <div className="flex items-center gap-2"><Eye size={18} /> {(post.viewCount || 0).toLocaleString()}</div>
          </div>
        </div>

        {/* 댓글 섹션 */}
        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-rose-50">
          <h2 className="text-lg font-black mb-6">댓글 <span className="text-rose-500">{comments.length}</span></h2>
          
          <div className="relative mb-10 group">
            <textarea 
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="따뜻한 댓글로 응원해주세요!"
              className="w-full bg-gray-50 border-2 border-transparent focus:border-rose-100 rounded-2xl p-5 pr-16 text-sm focus:ring-0 resize-none h-28 transition-all placeholder:text-gray-300 font-medium"
            />
            <button 
              onClick={handleAddComment}
              className="absolute bottom-4 right-4 bg-rose-500 text-white p-2.5 rounded-xl hover:bg-rose-600 transition-all shadow-md active:scale-95"
            >
              <Send size={20} />
            </button>
          </div>

          <div className="space-y-4">
            {comments.length > 0 ? (
              comments.map((comment) => (
                <div key={comment.commentId} className="group p-5 bg-gray-50 rounded-2xl border border-transparent hover:border-rose-100 transition-all">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-rose-400">User_{comment.memberId}</span>
                        <span className="text-[10px] text-gray-300">{new Date(comment.createdAt).toLocaleString()}</span>
                      </div>
                      <p className="text-sm text-gray-700 leading-snug">{comment.content}</p>
                    </div>
                    <button onClick={() => handleReportComment(comment.commentId)} className="opacity-0 group-hover:opacity-100 p-2 text-gray-300 hover:text-red-500 transition-all"><AlertCircle size={16} /></button>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-20 text-center space-y-2">
                <MessageCircle size={40} className="mx-auto text-gray-100" />
                <p className="text-gray-300 font-bold">아직 작성된 댓글이 없습니다.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}