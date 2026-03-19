import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRoute, useLocation } from 'wouter';
import Layout from '@/components/Layout';
import { ArrowLeft, Send, Heart, MessageCircle, Eye, AlertCircle, Trash2, Edit, Paperclip, Download, X, Check } from 'lucide-react';
import { toast } from 'sonner';

// 환경 변수에서 게이트웨이 URL을 가져옵니다. (기본값 설정)
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
  
  // 로그인 정보 로드
  const [loginInfo] = useState(() => {
    return {
      memberId: localStorage.getItem('memberId'),
      role: localStorage.getItem('role'),
      userName: localStorage.getItem('userName')
    };
  });

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

  useEffect(() => {fetchData();}, [fetchData]);

  // 게시글 작성자 권한 체크
  const isOwner = useMemo(() => {
    if (!post || !loginInfo.memberId) return false;
    const myId = String(loginInfo.memberId);
    const writerId = String(post.memberId || "");
    const isAdmin = String(loginInfo.role || "").toUpperCase() === 'ADMIN';
    return (myId !== "" && myId === writerId) || isAdmin;
  }, [loginInfo, post]);

  // 게시글 삭제
  const handleDelete = async () => {
    if (window.confirm("정말 삭제하시겠습니까?")) {
      const res = await apiFetch(`${API_BASE_URL}/${params.id}`, 'DELETE');
      if (res.ok) {
        toast.success("삭제되었습니다.");
        setLocation('/user/community');
      }
    }
  };

  // 댓글 등록
  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    const res = await apiFetch(`${API_BASE_URL}/${params.id}/comments`, 'POST', { content: newComment });
    if (res.ok) {
      setNewComment(""); 
      fetchData();
    }
  };

  // 댓글 삭제 (오타 수정: ${API_BASE_URL})
  const handleDeleteComment = async (commentId) => {
    if(!window.confirm("댓글을 삭제하시겠습니까?")) return;
    try {
      const res = await apiFetch(`${API_BASE_URL}/comments/${commentId}`, 'DELETE');
      if (res.ok){
        toast.success("댓글이 삭제되었습니다.");
        fetchData();
      } else {
        toast.error("삭제 권한이 없거나 오류 발생");
      }
    } catch (err) {
      toast.error("서버 통신 오류");
    }
  };

  // 댓글 수정
  const handleUpdateComment = async (commentId) => {
    if(!editContent.trim()) return;
    try {
      const res = await apiFetch(`${API_BASE_URL}/comments/${commentId}`, 'PUT', { content: editContent });
      if(res.ok){
        toast.success("댓글이 수정되었습니다.");
        setEditingCommentId(null);
        setEditContent("");
        fetchData();
      } else {
        toast.error("수정 권한이 없습니다.");
      }
    } catch(err) {
      toast.error("수정 실패");
    }
  };

  // 게시글 신고
  const handleReport = async () => {
    const reason = window.prompt("신고 사유를 입력해주세요 (최소 2자 이상)");
    if (!reason || reason.trim().length < 2) {
      if (reason) toast.error("사유를 좀 더 상세히 입력해주세요.");
      return;
    }
    try {
      const res = await apiFetch(`${API_BASE_URL}/${params.id}/report`, 'POST', { reason });
      if (res.ok) {
        toast.success("신고가 정상적으로 접수되었습니다.");
      } else {
        const errorMsg = await res.text();
        toast.error(errorMsg === "ALREADY_REPORTED" ? "이미 신고한 게시글입니다." : "신고 실패");
      }
    } catch (err) {
      toast.error("서버와 통신 중 오류가 발생했습니다.");
    }
  };

  if (loading || !post) {
    return <Layout role="user"><div className="p-20 text-center text-rose-500 font-bold">불러오는 중...</div></Layout>;
  }

  return (
    <Layout role="user">
      <div className="max-w-3xl mx-auto p-4 space-y-6">
        <div className="flex justify-between items-center">
          <button onClick={() => setLocation('/user/community')} className="flex items-center gap-1.5 text-sm text-gray-400 font-bold hover:text-rose-500 transition-colors">
            <ArrowLeft size={16}/> 목록으로 돌아가기
          </button>
          
          <div className="flex gap-2">
            {isOwner && (
              <div className="flex gap-1.5">
                <button 
                  onClick={() => setLocation(`/user/community/update/${post.boardId}`)} 
                  className="flex items-center gap-1.5 px-3 py-1.5 text-gray-500 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all font-bold"
                >
                  <Edit size={16} /> <span className="text-sm">수정</span>
                </button>
                <button 
                  onClick={handleDelete} 
                  className="flex items-center gap-1.5 px-3 py-1.5 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all font-bold"
                >
                  <Trash2 size={16} /> <span className="text-sm">삭제</span>
                </button>
              </div>
            )}
            {!isOwner && (
              <button onClick={handleReport} className="flex items-center gap-1.5 px-3 py-1.5 text-gray-400 hover:text-rose-500 font-bold">
                <AlertCircle size={18} /> <span className="text-xs">신고</span>
              </button>
            )}
          </div>
        </div>

        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-rose-50">
          <div className="flex justify-between items-start mb-6">
            <span className="px-3 py-1 rounded-full bg-rose-50 text-rose-500 text-xs font-black">
              {post.category || '일반'}
            </span>
            <div className="text-right">
              <p className="text-sm font-black text-gray-900">{post.authorName || '익명 사용자'}</p>
              <p className="text-[10px] text-gray-400 font-bold">{post.createdAt?.split('T')[0]}</p>
            </div>
          </div>
          
          <h1 className="text-2xl font-black mb-6 text-gray-900 leading-tight">{post.title}</h1>
          <div className="prose max-w-none text-gray-700 leading-relaxed mb-10 min-h-[150px] whitespace-pre-wrap font-medium">
            {post.content}
          </div>

          {post.storedFilePath && (
            <div className="mb-8 p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3 text-sm font-bold text-gray-600">
                <Paperclip size={16} className="text-rose-500" />
                <span className="truncate max-w-[200px]">{post.originalFileName || '첨부파일'}</span>
              </div>
              <button 
                onClick={() => {
                  const path = post.storedFilePath;
                  const fileId = path.split(/[\\/]/).pop();
                  window.location.href = `${API_BASE_URL}/files/download/${fileId}`;
                }}
                className="text-xs font-black text-rose-500 hover:bg-rose-50 px-3 py-2 rounded-xl transition-all"
              >
                <Download size={14} className="mr-1 inline" /> 다운로드
              </button>
            </div>
          )}

          <div className="flex gap-6 pt-6 border-t border-rose-50 text-gray-400 text-xs font-bold">
            <button onClick={async () => (await apiFetch(`${API_BASE_URL}/${params.id}/like`, 'POST')).ok && fetchData()} className="flex items-center gap-1.5 hover:text-rose-500 transition-colors">
              <Heart size={18} fill={post.likeCount > 0 ? "#f43f5e" : "none"} className={post.likeCount > 0 ? "text-rose-500" : ""}/> 
              <span>좋아요 {post.likeCount || 0}</span>
            </button>
            <span className="flex items-center gap-1.5"><MessageCircle size={18}/> 댓글 {comments.length}</span>
            <span className="flex items-center gap-1.5"><Eye size={18}/> 조회수 {post.viewCount || 0}</span>
          </div>
        </div>

        <div className="bg-white rounded-[1.5rem] p-6 shadow-sm border border-rose-50">
          <div className="relative mb-6">
            <textarea 
              value={newComment} 
              onChange={(e) => setNewComment(e.target.value)} 
              className="w-full bg-gray-50 rounded-xl p-4 pr-12 h-24 resize-none border-none text-sm focus:ring-2 focus:ring-rose-100 transition-all font-medium" 
              placeholder="따뜻한 댓글을 남겨주세요." 
            />
            <button onClick={handleAddComment} className="absolute bottom-3 right-3 bg-rose-500 text-white p-2 rounded-lg hover:bg-rose-600 transition-colors">
              <Send size={18}/>
            </button>
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
                      {isCommentOwner && !isEditing && (
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => { setEditingCommentId(c.commentId); setEditContent(c.content); }}
                            className="p-1 text-gray-400 hover:text-rose-500 transition-colors"
                          >
                            <Edit size={14} />
                          </button>
                          <button 
                            onClick={() => handleDeleteComment(c.commentId)}
                            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {isEditing ? (
                    <div className="space-y-2">
                      <textarea 
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full p-3 text-sm bg-white border border-rose-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-100"
                      />
                      <div className="flex justify-end gap-2">
                        <button onClick={() => setEditingCommentId(null)} className="flex items-center gap-1 px-2 py-1 text-[10px] text-gray-400 font-bold hover:bg-gray-100 rounded-md">
                          <X size={12}/> 취소
                        </button>
                        <button onClick={() => handleUpdateComment(c.commentId)} className="flex items-center gap-1 px-2 py-1 text-[10px] text-rose-500 font-black hover:bg-rose-50 rounded-md">
                          <Check size={12}/> 수정완료
                        </button>
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