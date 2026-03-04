import { useState, useEffect } from 'react';
import { useRoute, useLocation } from 'wouter';
import Layout from '@/components/Layout';
import { ChevronLeft, User, Calendar, Heart, Eye } from 'lucide-react';
import { toast } from 'sonner';

export default function UserCommunityDetail() {
  // URL의 :id 값을 가져옵니다.
  const [, params] = useRoute('/user/community/:id'); 
  const [, setLocation] = useLocation();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      if (!params?.id) return;
      try {
        setLoading(true);
        const token = localStorage.getItem('TOKEN');
        // MSA 백엔드 상세 조회 API 호출
        const response = await fetch(`http://localhost/msa/core/board/${params.id}`, {
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) throw new Error("게시글을 불러올 수 없습니다.");

        const data = await response.json();
        setPost(data);
      } catch (error) {
        toast.error(error.message);
        setLocation('/user/community');
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [params?.id, setLocation]);

  if (loading) return <Layout role="user"><div className="p-20 text-center">로딩 중...</div></Layout>;
  if (!post) return null;

  return (
    <Layout role="user">
      <div className="max-w-4xl mx-auto p-6">
        <button onClick={() => setLocation('/user/community')} className="flex items-center gap-1 text-rose-400 mb-6 font-medium">
          <ChevronLeft size={18} /> 목록으로 돌아가기
        </button>

        <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-rose-50">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">{post.title}</h1>
          <div className="flex items-center gap-3 mb-8 pb-6 border-b border-rose-50">
             <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-500"><User size={20}/></div>
             <div>
               <div className="font-bold text-sm">{post.authorName || `User_${post.memberId}`}</div>
               <div className="text-xs text-gray-400">{post.createdAt ? new Date(post.createdAt).toLocaleString() : '-'}</div>
             </div>
          </div>
          <div className="text-gray-700 leading-relaxed min-h-[300px] whitespace-pre-wrap text-lg">
            {post.content}
          </div>
          <div className="mt-10 pt-6 border-t border-rose-50 flex gap-4 text-gray-400 text-sm">
            <span className="flex items-center gap-1"><Heart size={16}/> {post.likeCount || 0}</span>
            <span className="flex items-center gap-1"><Eye size={16}/> {post.viewCount || 0}</span>
          </div>
        </div>
      </div>
    </Layout>
  );
}