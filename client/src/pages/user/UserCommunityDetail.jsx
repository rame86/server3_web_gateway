import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRoute, useLocation } from 'wouter';
import Layout from '@/components/Layout';
import { ArrowLeft, Send, Heart, MessageCircle, Eye, AlertCircle, Trash2, Edit, Paperclip, Download } from 'lucide-react';
import { toast } from 'sonner';

const API_BASE_URL = 'http://localhost/msa/core/board';

export default function UserCommunityDetail() {
  const [, params] = useRoute('/user/community/:id');
  const [, setLocation] = useLocation();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);

  // UserLogin.jsx에서 개별 키로 저장하는 방식에 맞춰 데이터 로드
  const [loginInfo] = useState(() => {
    return {
      memberId: localStorage.getItem('memberId'),
      role: localStorage.getItem('role'),
      userName: localStorage.getItem('userName')
    };
  });

  // 공통 Fetch 함수 (토큰 주입 포함)
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

  // 게시글 및 댓글 상세 데이터 가져오기
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

  // 권한 체크
  const isOwner = useMemo(() => {
    if (!post || !loginInfo.memberId) return false;
    // BoardDTO는 memberId(Long) 필드를 사용함
    const myId = String(loginInfo.memberId);
    const writerId = String(post.memberId || "");
    const isAdmin = String(loginInfo.role || "").toUpperCase() === 'ADMIN';

    // 작성자 본인이거나 관리자 권한인 경우 true
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
                  <Edit size={16} />
                  <span className="text-sm">수정</span>
                </button>
                <button 
                  onClick={handleDelete} 
                  className="flex items-center gap-1.5 px-3 py-1.5 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all font-bold"
                >
                  <Trash2 size={16} />
                  <span className="text-sm">삭제</span>
                </button>
              </div>
            )}
            {!isOwner && (
              <button className="flex items-center gap-1.5 px-3 py-1.5 text-gray-400 hover:text-rose-500 font-bold">
                <AlertCircle size={18} />
                <span className="text-xs">신고</span>
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

          {/* 첨부파일 노출 영역 */}
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

        {/* 댓글 영역 */}
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
            {comments.map((c, index) => (
              <div key={c.commentId || `comment-${index}`} className="p-4 bg-gray-50 rounded-xl">
                <div className="flex justify-between items-center mb-1">
                  <p className="text-[11px] font-black text-rose-400">{c.authorName || `User_${c.memberId}`}</p>
                  <p className="text-[10px] text-gray-300 font-bold">{c.createdAt?.split('T')[0]}</p>
                </div>
                <p className="text-sm text-gray-700 font-medium">{c.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}