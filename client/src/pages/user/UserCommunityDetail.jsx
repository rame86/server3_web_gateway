import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRoute, useLocation } from 'wouter';
import Layout from '@/components/Layout';
import { ArrowLeft, Send, Heart, MessageCircle, Eye, AlertCircle, Trash2, Edit, Paperclip, Download, X, Check, ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

// 환경 변수 설정
const API_GATEWAY = import.meta.env.VITE_API_GATEWAY_URL;
const API_BASE_URL = `${API_GATEWAY}/msa/core/board`;

export default function UserCommunityDetail() {
  const [, params] = useRoute('/user/community/:id');
  const [, setLocation] = useLocation();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);

  // 수정 관련 상태
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editContent, setEditContent] = useState("");
  
  // 로그인 정보
  const [loginInfo] = useState(() => ({
    memberId: localStorage.getItem('memberId'),
    role: localStorage.getItem('role'),
    userName: localStorage.getItem('userName')
  }));

  // 공통 Fetch 함수
  const apiFetch = useCallback(async (url, method = 'GET', body = null) => {
    const token = localStorage.getItem('accessToken') || localStorage.getItem('TOKEN');
    const options = {
      method,
      headers: { 
        'Content-Type': 'application/json', 
        ...(token && { 'Authorization': `Bearer ${token}` }) 
      }
    };
    if (body) options.body = JSON.stringify(body);
    return fetch(url, options);
  }, []);

  // 데이터 로드
  const fetchData = useCallback(async () => {
    if (!params?.id) return;
    try {
      setLoading(true);
      const [pRes, cRes] = await Promise.all([
        apiFetch(`${API_BASE_URL}/${params.id}`),
        apiFetch(`${API_BASE_URL}/${params.id}/comments`)
      ]);
      
      if (!pRes.ok) throw new Error("게시글을 찾을 수 없습니다.");
      const postData = await pRes.json();
      const commentData = await cRes.json();
      
      setPost(postData);
      setComments(Array.isArray(commentData) ? commentData : []);
    } catch (err) {
      toast.error(err.message || "데이터 로드 실패");
      setLocation('/user/community');
    } finally { 
      setLoading(false); 
    }
  }, [params?.id, setLocation, apiFetch]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // 이미지 여부 확인 함수
  const isImageFile = useMemo(() => {
    if (!post?.storedFilePath) return false;
    const ext = post.storedFilePath.split('.').pop().toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext);
  }, [post?.storedFilePath]);

  // 이미지 URL 생성
  const imageUrl = useMemo(() => {
    if (!post?.storedFilePath) return "";
    // 파일 다운로드 API와 동일한 경로 혹은 이미지 제공용 정적 경로 사용
    return `${API_BASE_URL}/files/download/${post.storedFilePath.split('/').pop()}`;
  }, [post?.storedFilePath]);

  // 권한 체크
  const isPostOwner = useMemo(() => {
    if (!post || !loginInfo.memberId) return false;
    return String(loginInfo.memberId) === String(post.memberId) || loginInfo.role === 'ADMIN';
  }, [loginInfo, post]);

  // --- [액션 함수들] ---
  const handleDelete = async () => {
    if (window.confirm("정말 삭제하시겠습니까?")) {
      const res = await apiFetch(`${API_BASE_URL}/${params.id}`, 'DELETE');
      if (res.ok) { toast.success("삭제되었습니다."); setLocation('/user/community'); }
    }
  };

  // --- [최적화된 파일 다운로드 액션] ---
  const handleDownload = useCallback(async () => {
    if (!post?.storedFilePath) return;
    try {
      const token = localStorage.getItem('accessToken') || localStorage.getItem('TOKEN');
      const response = await fetch(imageUrl, {
        method: 'GET',
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });
      if (!response.ok) throw new Error("파일 다운로드 권한이 없거나 파일을 찾을 수 없습니다.");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      // 서버에서 전달받은 원본 파일명으로 설정
      link.download = post.originalFileName || "download_file";
      document.body.appendChild(link);
      link.click();
      // 클린업: 링크 제거 및 메모리 해제
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      toast.error(err.message || "다운로드 중 오류가 발생했습니다.");
    }
  }, [imageUrl, post?.originalFileName, post?.storedFilePath]);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    const res = await apiFetch(`${API_BASE_URL}/${params.id}/comments`, 'POST', { content: newComment });
    if (res.ok) { setNewComment(""); fetchData(); }
  };

  const handleDeleteComment = async (commentId) => {
    if(!window.confirm("댓글을 삭제하시겠습니까?")) return;
    const res = await apiFetch(`${API_BASE_URL}/comments/${commentId}`, 'DELETE');
    if (res.ok) { toast.success("삭제되었습니다."); fetchData(); }
  };

  const handleUpdateComment = async (commentId) => {
    if(!editContent.trim()) return;
    const res = await apiFetch(`${API_BASE_URL}/comments/${commentId}`, 'PUT', { content: editContent });
    if(res.ok) { setEditingCommentId(null); fetchData(); }
  };

  const handleReport = async () => {
    const reason = window.prompt("게시글 신고 사유를 입력해주세요.");
    if (!reason || reason.trim().length < 2) return;
    try {
      const res = await apiFetch(`${API_BASE_URL}/admin/report/board`, 'POST', { 
        boardId: params.id, 
        reason: reason
      });
      if (res.ok) { toast.success("게시글 신고가 접수되었습니다."); }
    } catch (err) { toast.error("신고 처리 중 오류가 발생했습니다."); }
  };

  const handleCommentReport = async (commentId) => {
    const reason = window.prompt("댓글 신고 사유를 입력해주세요.");
    if (!reason || reason.trim().length < 2) return;
    try {
      const res = await apiFetch(`${API_BASE_URL}/admin/report/comment`, 'POST', { 
        commentId: commentId, 
        reason: reason 
      });
      if (res.ok) { toast.success("댓글 신고가 접수되었습니다."); }
    } catch (err) { toast.error("신고 처리 중 오류가 발생했습니다."); }
  };

  if (loading) return <Layout role="user"><div className="p-20 text-center text-rose-500 font-bold">불러오는 중...</div></Layout>;
  if (!post) return <Layout role="user"><div className="p-20 text-center text-gray-400 font-bold">게시글을 찾을 수 없습니다.</div></Layout>;

  return (
    <Layout role="user">
      <div className="max-w-3xl mx-auto p-4 space-y-6">
        {/* 상단 버튼바 */}
        <div className="flex justify-between items-center">
          <button onClick={() => setLocation('/user/community')} className="flex items-center gap-1.5 text-sm text-gray-400 font-bold hover:text-rose-500 transition-colors">
            <ArrowLeft size={16}/> 목록으로 돌아가기
          </button>
          <div className="flex gap-2">
            {isPostOwner && (
              <div className="flex gap-1.5">
                <button onClick={() => setLocation(`/user/community/update/${post.boardId}`)} className="flex items-center gap-1.5 px-3 py-1.5 text-gray-500 hover:text-rose-500 font-bold"><Edit size={16} /> 수정</button>
                <button onClick={handleDelete} className="flex items-center gap-1.5 px-3 py-1.5 text-gray-500 hover:text-red-500 font-bold"><Trash2 size={16} /> 삭제</button>
              </div>
            )}
            {!isPostOwner && (
              <button onClick={handleReport} className="flex items-center gap-1.5 px-3 py-1.5 text-gray-400 hover:text-rose-500 font-bold"><AlertCircle size={18} /> 신고</button>
            )}
          </div>
        </div>

        {/* 게시글 본문 영역 */}
        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-rose-50">
          <div className="flex justify-between items-start mb-6">
            <span className="px-3 py-1 rounded-full bg-rose-50 text-rose-500 text-xs font-black">{post.category || '일반'}</span>
            <div className="text-right">
              <p className="text-sm font-black text-gray-900">{post.authorName || '익명'}</p>
              <p className="text-[10px] text-gray-400 font-bold">{post.createdAt?.split('T')[0]}</p>
            </div>
          </div>
          <h1 className="text-2xl font-black mb-6 text-gray-900">{post.title}</h1>

          {/* 이미지 미리보기 섹션 추가 */}
          {isImageFile && (
            <div className="mb-6 rounded-2xl overflow-hidden border border-gray-100 bg-gray-50">
              <img 
                src={imageUrl} 
                alt="미리보기" 
                className="max-w-full h-auto mx-auto object-contain max-h-[500px]"
                onError={(e) => { e.target.style.display = 'none'; }} 
              />
            </div>
          )}

          <div className="prose max-w-none text-gray-700 mb-10 min-h-[150px] whitespace-pre-wrap font-medium">{post.content}</div>

          {/* 첨부파일 다운로드 바 */}
          {post.storedFilePath && (
            <div className="mb-8 p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3 text-sm font-bold text-gray-600">
                {isImageFile ? <ImageIcon size={16} className="text-rose-500" /> : <Paperclip size={16} className="text-rose-500" />}
                <span className="truncate max-w-[200px]">{post.originalFileName}</span>
              </div>
              <button 
                onClick={handleDownload} 
                className="text-xs font-black text-rose-500 hover:bg-rose-50 px-3 py-2 rounded-xl transition-colors"
              >
                <Download size={14} className="mr-1 inline" /> 다운로드
              </button>
            </div>
          )}

          {/* 하단 정보 */}
          <div className="flex gap-6 pt-6 border-t border-rose-50 text-gray-400 text-xs font-bold">
            <button onClick={async () => (await apiFetch(`${API_BASE_URL}/${params.id}/like`, 'POST')).ok && fetchData()} className="flex items-center gap-1.5 hover:text-rose-500 transition-colors">
              <Heart size={18} fill={(post.likeCount || 0) > 0 ? "#f43f5e" : "none"} className={(post.likeCount || 0) > 0 ? "text-rose-500" : ""}/> 
              <span>좋아요 {post.likeCount || 0}</span>
            </button>
            <span className="flex items-center gap-1.5"><MessageCircle size={18}/> 댓글 {comments.length}</span>
            <span className="flex items-center gap-1.5"><Eye size={18}/> 조회수 {post.viewCount || 0}</span>
          </div>
        </div>

        {/* 댓글 섹션 */}
        <div className="bg-white rounded-[1.5rem] p-6 shadow-sm border border-rose-50">
          <div className="relative mb-6">
            <textarea value={newComment} onChange={(e) => setNewComment(e.target.value)} className="w-full bg-gray-50 rounded-xl p-4 pr-12 h-24 resize-none border-none text-sm font-medium" placeholder="따뜻한 댓글을 남겨주세요." />
            <button onClick={handleAddComment} className="absolute bottom-3 right-3 bg-rose-500 text-white p-2 rounded-lg hover:bg-rose-600"><Send size={18}/></button>
          </div>
          
          <div className="space-y-4">
            {comments.map((c, index) => {
              const isCommentOwner = String(c.memberId) === String(loginInfo.memberId);
              const isEditing = editingCommentId === c.commentId;

              return (
                <div key={c.commentId || `comment-${index}`} className="p-4 bg-gray-50 rounded-xl group transition-all">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <p className="text-[11px] font-black text-rose-400">{c.authorName || `User_${c.memberId}`}</p>
                      {isCommentOwner && <span className="text-[9px] bg-rose-100 text-rose-500 px-1.5 py-0.5 rounded-md font-bold">내 댓글</span>}
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-[10px] text-gray-300 font-bold">{c.createdAt?.split('T')[0]}</p>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {isCommentOwner ? (
                          <>
                            <button onClick={() => { setEditingCommentId(c.commentId); setEditContent(c.content); }} className="p-1 text-gray-400 hover:text-rose-500 transition-colors"><Edit size={14} /></button>
                            <button onClick={() => handleDeleteComment(c.commentId)} className="p-1 text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                          </>
                        ) : (
                          <button onClick={() => handleCommentReport(c.commentId)} className="p-1 text-gray-400 hover:text-rose-500 transition-colors" title="댓글 신고"><AlertCircle size={14} /></button>
                        )}
                      </div>
                    </div>
                  </div>
                  {isEditing ? (
                    <div className="space-y-2">
                      <textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} className="w-full p-3 text-sm bg-white border border-rose-200 rounded-lg focus:ring-2 focus:ring-rose-100 outline-none" />
                      <div className="flex justify-end gap-2">
                        <button onClick={() => setEditingCommentId(null)} className="text-[10px] text-gray-400 font-bold">취소</button>
                        <button onClick={() => handleUpdateComment(c.commentId)} className="text-[10px] text-rose-500 font-black">수정완료</button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-700 font-medium whitespace-pre-wrap">{c.content}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Layout>
  );
}