import { useState, useEffect, useCallback } from 'react';
import { useRoute, useLocation } from 'wouter';
import Layout from '@/components/Layout';
import { Heart, MessageCircle, Eye, ArrowLeft, AlertCircle, Send, Trash2, Edit } from 'lucide-react';
import { toast } from 'sonner';

const API_BASE_URL = 'http://localhost/msa/core/board';

export default function UserCommunityDetail() {
  const [, params] = useRoute('/user/community/:id');
  const [, setLocation] = useLocation();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);

  // 공통 API 호출 함수
  const apiFetch = async (url, method = 'GET', body = null) => {
    const token = localStorage.getItem('accessToken');
    return fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', ...(token && { 'Authorization': `Bearer ${token}` }) },
      ...(body && { body: JSON.stringify(body) })
    });
  };

  const fetchData = useCallback(async () => {
    if (!params?.id) return;
    try {
      const [pRes, cRes] = await Promise.all([
        apiFetch(`${API_BASE_URL}/${params.id}`),
        apiFetch(`${API_BASE_URL}/${params.id}/comments`)
      ]);
      setPost(await pRes.json());
      setComments(await cRes.json() || []);
    } catch {
      toast.error("데이터 로드 실패");
      setLocation('/user/community');
    } finally { setLoading(false); }
  }, [params?.id, setLocation]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const canManage = post && (String(post.memberId) === String(localStorage.getItem('memberId')) || localStorage.getItem('role') === 'ADMIN');

  const handleDelete = async () => {
    if (window.confirm("정말 삭제하시겠습니까?") && (await apiFetch(`${API_BASE_URL}/${params.id}`, 'DELETE')).ok) {
      toast.success("삭제 완료");
      setLocation('/user/community');
    }
  };

  const handleReport = async (type, id) => {
    const reason = window.prompt("신고 사유를 입력하세요:");
    if (!reason) return;
    const url = type === 'post' ? `${API_BASE_URL}/${id}/report` : `${API_BASE_URL}/comments/${id}/report`;
    if ((await apiFetch(url, 'POST', { reason })).ok) toast.success("신고 완료");
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    if ((await apiFetch(`${API_BASE_URL}/${params.id}/comments`, 'POST', { content: newComment })).ok) {
      setNewComment(""); fetchData();
    }
  };

  if (loading || !post) return <Layout role="user"><div className="p-20 text-center text-rose-500 font-bold">로딩 중...</div></Layout>;

  return (
    <Layout role="user">
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        <div className="flex justify-between items-center">
          <button onClick={() => setLocation('/user/community')} className="flex items-center gap-1 text-sm text-gray-400 font-bold"><ArrowLeft size={16}/> 목록</button>
          {canManage && (
            <div className="flex gap-4">
              <button onClick={() => setLocation(`/user/community/update/${params.id}`)} className="text-gray-400 hover:text-blue-500 flex items-center gap-1 text-sm font-bold"><Edit size={16}/> 수정</button>
              <button onClick={handleDelete} className="text-gray-400 hover:text-red-500 flex items-center gap-1 text-sm font-bold"><Trash2 size={16}/> 삭제</button>
            </div>
          )}
        </div>

        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-rose-50">
          <div className="flex justify-between items-start mb-4">
            <span className="px-3 py-1 rounded-full bg-rose-50 text-rose-500 text-xs font-black">{post.category}</span>
            <button onClick={() => handleReport('post', params.id)} className="text-gray-200 hover:text-red-500"><AlertCircle size={20}/></button>
          </div>
          <h1 className="text-2xl font-black mb-6">{post.title}</h1>
          <div className="text-gray-700 leading-relaxed min-h-[250px] mb-8 whitespace-pre-wrap font-medium">{post.content}</div>
          <div className="flex gap-6 pt-6 border-t border-rose-50 text-gray-400 text-xs font-bold">
            <button onClick={async () => (await apiFetch(`${API_BASE_URL}/${params.id}/like`, 'POST')).ok && fetchData()} className="flex items-center gap-1 hover:text-rose-500"><Heart size={18} fill={post.likeCount > 0 ? "#f43f5e" : "none"}/> {post.likeCount}</button>
            <span><MessageCircle size={18} className="inline mr-1"/> {comments.length}</span>
            <span><Eye size={18} className="inline mr-1"/> {post.viewCount}</span>
          </div>
        </div>

        <div className="bg-white rounded-[1.5rem] p-6 shadow-sm border border-rose-50">
          <div className="relative mb-6">
            <textarea value={newComment} onChange={(e) => setNewComment(e.target.value)} className="w-full bg-gray-50 rounded-xl p-4 pr-12 h-24 resize-none border-none text-sm" placeholder="댓글을 입력하세요." />
            <button onClick={handleAddComment} className="absolute bottom-3 right-3 bg-rose-500 text-white p-2 rounded-lg"><Send size={18}/></button>
          </div>
          <div className="space-y-3">
            {comments.map(c => (
              <div key={c.commentId} className="group p-4 bg-gray-50 rounded-xl flex justify-between items-start">
                <div>
                  <p className="text-[10px] font-black text-rose-400 mb-1">User_{c.memberId}</p>
                  <p className="text-sm text-gray-700">{c.content}</p>
                </div>
                <button onClick={() => handleReport('comment', c.commentId)} className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500"><AlertCircle size={14}/></button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}