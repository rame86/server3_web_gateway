import { useState, useEffect, useCallback } from 'react';
import { useRoute, useLocation } from 'wouter';
import Layout from '@/components/Layout';
import { Heart, MessageCircle, Eye, ArrowLeft, Share2, MoreHorizontal, User, AlertCircle, Download, Send } from 'lucide-react';
import { toast } from 'sonner';

const API_BASE_URL = 'http://localhost/msa/core/board';

export default function UserCommunityDetail() {
  const [match, params] = useRoute('/user/community/:id');
  const [, setLocation] = useLocation();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]); 
  const [newComment, setNewComment] = useState(""); 
  const [loading, setLoading] = useState(true);

  // 1. 데이터 로드 (게시글 & 댓글)
  const fetchData = useCallback(async () => {
    const boardId = params?.id;
    if (!boardId) return;
    try {
      const token = localStorage.getItem('accessToken'); // 키 이름을 'accessToken'으로 통일
      const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      };

      // 게시글과 댓글을 한 번에 가져옴
      const [postRes, commentRes] = await Promise.all([
        fetch(`${API_BASE_URL}/${boardId}`, { method: 'GET', headers }),
        fetch(`${API_BASE_URL}/${boardId}/comments`)
      ]);

      if (!postRes.ok) throw new Error("게시글 로드 실패");
      
      const postData = await postRes.json();
      const commentData = await commentRes.json();
      
      setPost(postData);
      setComments(commentData || []);
    } catch (err) {
      console.error("데이터 로드 에러:", err);
      toast.error("게시글을 불러올 수 없습니다.");
      setLocation('/user/community');
    } finally {
      setLoading(false);
    }
  }, [params?.id, setLocation]);

  // 2. 초기 실행 (중복된 initData 등을 제거하고 fetchData만 사용)
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 3. 댓글 작성 핸들러
  const handleAddComment = async () => {
    if (!newComment.trim()) return toast.error("댓글 내용을 입력해주세요.");
    
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        toast.error("로그인이 필요합니다.");
        setLocation('/login');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/${params.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: newComment })
      });

      if (response.ok) {
        toast.success("댓글이 등록되었습니다.");
        setNewComment(""); 
        fetchData(); // 성공 후 데이터 갱신
      } else {
        toast.error("댓글 등록에 실패했습니다.");
      }
    } catch (error) {
      toast.error("통신 중 오류가 발생했습니다.");
    }
  };
  // 권한 체크 변수 (본인 또는 관리자)
  const canManage = post && (String(post.memberId) === String(localStorage.getItem('memberId')) || localStorage.getItem('role') === 'ADMIN');

   // 삭제 핸들러 (백엔드 BoardController @DeleteMapping("/{id}") 연결)
 const handleDelete = async () => {
    if (!window.confirm("정말 이 게시글을 삭제하시겠습니까?")) return;
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`${API_BASE_URL}/${params.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success("삭제되었습니다.");
        setLocation('/user/community');
      } else {
        toast.error("삭제 권한이 없습니다.");
      }
    } catch (err) {
      toast.error("서버와 통신 중 오류가 발생했습니다.");
    }
  };
  
  // 좋아요 토글 핸들러
  const handleToggleLike = async () => {
    try {
      const token = localStorage.getItem('accessToken');
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
    if (!reason?.trim()) return;

    try {
      const token = localStorage.getItem('accessToken');
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
      toast.error("통신 오류가 발생했습니다.");
    }
  };

  // 6. 댓글 신고 핸들러
  const handleReportComment = async (commentId) => {
    const reason = window.prompt("댓글 신고 사유를 입력해주세요:");
    if (!reason?.trim()) return;

    try {
      const token = localStorage.getItem('accessToken');
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
      toast.error("통신 오류가 발생했습니다.");
    }
  };

  // 7. 파일 다운로드 핸들러
  const handleDownload = () => {
    if (!post.storedFilePath) return;
    window.open(`http://localhost/msa/core/board/download?path=${encodeURIComponent(post.storedFilePath)}`);
  };

  if (loading) return <Layout role="user"><div className="py-20 text-center text-rose-500 font-bold animate-pulse">로딩 중...</div></Layout>;
  if (!post) return null;

  const isArtist = post.artistPost === true || post.isArtistPost === true;

  return (
    <Layout role="user">
      <div className="max-w-4xl mx-auto p-4 lg:p-6 space-y-6">
        <button onClick={() => setLocation('/user/community')} className="flex items-center gap-2 text-sm text-gray-500 hover:text-rose-500 transition-all font-bold">
          <ArrowLeft size={18} /> 목록으로 돌아가기
        </button>

        <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-rose-50 relative">
          <div className="flex items-center justify-between mb-6">
            <span className="px-3 py-1 rounded-full bg-rose-50 text-rose-500 text-xs font-black border border-rose-100">{post.category || '전체'}</span>
            <div className="flex items-center gap-3 text-gray-300">
              <AlertCircle size={20} className="cursor-pointer hover:text-red-500 transition-colors" onClick={handleReportBoard} />
              <Share2 size={18} className="cursor-pointer hover:text-rose-500 transition-colors" />
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

          <div className="text-gray-700 leading-relaxed min-h-[300px] whitespace-pre-wrap text-lg font-medium mb-8">{post.content}</div>

          {post.originalFileName && (
            <div className="bg-gray-50 rounded-2xl p-4 flex items-center justify-between mb-8">
              <div className="flex items-center gap-3"><Download size={18} className="text-rose-500" /><span className="text-sm font-bold text-gray-600">{post.originalFileName}</span></div>
              <button onClick={handleDownload} className="text-xs font-black text-rose-500 hover:underline">다운로드</button>
            </div>
          )}

          <div className="flex items-center gap-6 pt-8 border-t border-rose-50 text-gray-400 font-bold text-xs">
            <div onClick={handleToggleLike} className="flex items-center gap-2 cursor-pointer hover:text-rose-500 transition-colors">
              <Heart size={18} className={post.likeCount > 0 ? "fill-rose-500 text-rose-500" : ""} /> {post.likeCount || 0}
            </div>
            <div className="flex items-center gap-2"><MessageCircle size={18} /> {post.commentCount || 0}</div>
            <div className="flex items-center gap-2"><Eye size={18} /> {(post.viewCount || 0).toLocaleString()}</div>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-rose-50">
          <h2 className="text-lg font-black mb-6">댓글 <span className="text-rose-500">{comments.length}</span></h2>
          <div className="relative mb-10 group">
            <textarea value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="따뜻한 댓글로 응원해주세요!" className="w-full bg-gray-50 rounded-2xl p-5 pr-16 text-sm h-28 resize-none border-none focus:ring-1 focus:ring-rose-200" />
            <button onClick={handleAddComment} className="absolute bottom-4 right-4 bg-rose-500 text-white p-2.5 rounded-xl hover:bg-rose-600 shadow-md transition-all"><Send size={20} /></button>
          </div>
          <div className="space-y-4">
            {comments.map((comment, index) => (
              <div key={comment.commentId || index} className="group p-5 bg-gray-50 rounded-2xl border border-transparent hover:border-rose-100 transition-all flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2"><span className="text-xs font-black text-rose-400">User_{comment.memberId}</span><span className="text-[10px] text-gray-300">{new Date(comment.createdAt).toLocaleString()}</span></div>
                  <p className="text-sm text-gray-700 leading-snug">{comment.content}</p>
                </div>
                <button onClick={() => handleReportComment(comment.commentId)} className="opacity-0 group-hover:opacity-100 p-2 text-gray-300 hover:text-red-500"><AlertCircle size={16} /></button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}