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

  // 1. 로그인 유저 정보 가져오기
  const loginUser = useMemo(() => {
    try {
      const userData = localStorage.getItem('user');
      return userData ? JSON.parse(userData) : null;
    } catch (e) { return null; }
  }, []);

  // 2. apiFetch 함수
  const apiFetch = async (url, method = 'GET', body = null) => {
    const token = localStorage.getItem('accessToken') || localStorage.getItem('TOKEN');
    return fetch(url, {
      method,
      headers: { 
        'Content-Type': 'application/json', 
        ...(token && { 'Authorization': `Bearer ${token}` }) 
      },
      ...(body && { body: JSON.stringify(body) })
    });
  };

  const fetchData = useCallback(async () => {
    if (!params?.id) return;
    try {
      setLoading(true);
      const [pRes, cRes] = await Promise.all([
        apiFetch(`${API_BASE_URL}/${params.id}`),
        apiFetch(`${API_BASE_URL}/${params.id}/comments`)
      ]);
      
      if (!pRes.ok) throw new Error();
      
      const postData = await pRes.json();
      const commentData = await cRes.json();
      
      setPost(postData);
      setComments(Array.isArray(commentData) ? commentData : []);
    } catch (err) {
      toast.error("데이터 로드 실패");
      setLocation('/user/community');
    } finally { 
      setLoading(false); 
    }
  }, [params?.id, setLocation]);

  useEffect(() => { 
    fetchData(); 
  }, [fetchData]);

  const handleDelete = async () => {
    if (window.confirm("정말 삭제하시겠습니까?")) {
      const res = await apiFetch(`${API_BASE_URL}/${params.id}`, 'DELETE');
      if (res.ok) {
        toast.success("삭제되었습니다.");
        setLocation('/user/community');
      }
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    const res = await apiFetch(`${API_BASE_URL}/${params.id}/comments`, 'POST', { content: newComment });
    if (res.ok) {
      setNewComment(""); 
      fetchData();
    }
  };

  // --- 핵심 수정: 렌더링 시점에 직접 권한 체크 ---
  const myId = Number(loginUser?.memberId || loginUser?.id || 0);
  const writerId = Number(post?.memberId || post?.member_id || 0);
  const isOwner = (myId !== 0 && myId === writerId) || loginUser?.role === 'ADMIN';
  // -------------------------------------------

  if (loading || !post) {
    return <Layout role="user"><div className="p-20 text-center text-rose-500 font-bold">불러오는 중...</div></Layout>;
  }

  return (
    <Layout role="user">
      <div className="max-w-3xl mx-auto p-4 space-y-6">
        <div className="flex justify-between items-center">
          <button onClick={() => setLocation('/user/community')} className="flex items-center gap-1 text-sm text-gray-400 font-bold hover:text-rose-500 transition-colors">
            <ArrowLeft size={16}/> 목록으로 돌아가기
          </button>
          
          {/* isOwner 판단 후 즉시 출력 */}
          {isOwner && (
            <div className="flex gap-2">
              <button 
                onClick={() => setLocation(`/user/community/update/${post.boardId || post.board_id}`)} 
                className="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
              >
                <Edit size={20} />
              </button>
              <button 
                onClick={handleDelete} 
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
              >
                <Trash2 size={20} />
              </button>
            </div>
          )}
        </div>

        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-rose-50">
          <div className="flex justify-between items-start mb-4">
            <span className="px-3 py-1 rounded-full bg-rose-50 text-rose-500 text-xs font-black">
              {post.category || '일반'}
            </span>
          </div>
          
          <h1 className="text-2xl font-black mb-6 text-gray-900">{post.title}</h1>
          <div className="prose max-w-none text-gray-700 leading-relaxed mb-8 min-h-[150px] whitespace-pre-wrap">
            {post.content}
          </div>

          {(post.storedFilePath || post.stored_file_path) && (
            <div className="mb-8 p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3 text-sm font-bold text-gray-600">
                <Paperclip size={16} className="text-rose-500" />
                <span className="truncate max-w-[200px]">{post.originalFileName || post.original_file_name || '첨부파일'}</span>
              </div>
              <button 
                onClick={() => {
                  const path = post.storedFilePath || post.stored_file_path;
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
            <button onClick={async () => (await apiFetch(`${API_BASE_URL}/${params.id}/like`, 'POST')).ok && fetchData()} className="flex items-center gap-1 hover:text-rose-500 transition-colors">
              <Heart size={18} fill={Number(post.likeCount || post.like_count) > 0 ? "#f43f5e" : "none"} className={Number(post.likeCount || post.like_count) > 0 ? "text-rose-500" : ""}/> {post.likeCount || post.like_count || 0}
            </button>
            <span className="flex items-center gap-1"><MessageCircle size={18}/> {comments.length}</span>
            <span className="flex items-center gap-1"><Eye size={18}/> {post.viewCount || post.view_count || 0}</span>
          </div>
        </div>

        <div className="bg-white rounded-[1.5rem] p-6 shadow-sm border border-rose-50">
          <div className="relative mb-6">
            <textarea 
              value={newComment} 
              onChange={(e) => setNewComment(e.target.value)} 
              className="w-full bg-gray-50 rounded-xl p-4 pr-12 h-24 resize-none border-none text-sm focus:ring-2 focus:ring-rose-100 transition-all" 
              placeholder="따뜻한 댓글을 남겨주세요." 
            />
            <button onClick={handleAddComment} className="absolute bottom-3 right-3 bg-rose-500 text-white p-2 rounded-lg hover:bg-rose-600 transition-colors">
              <Send size={18}/>
            </button>
          </div>
          
          <div className="space-y-3">
            {comments.map((c, index) => (
              <div key={c.commentId || c.comment_id || `comment-${index}`} className="p-4 bg-gray-50 rounded-xl">
                <p className="text-[10px] font-black text-rose-400 mb-1">User_{c.memberId || c.member_id}</p>
                <p className="text-sm text-gray-700">{c.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}