import { useState, useEffect } from 'react';
import { useRoute, useLocation } from 'wouter';
import Layout from '@/components/Layout';
import { toast } from 'sonner';
import { ArrowLeft, Save } from 'lucide-react';

const API_BASE_URL = 'http://localhost/msa/core/board';

export default function UserCommunityUpdate() {
  const [match, params] = useRoute('/user/community/update/:id');
  const [, setLocation] = useLocation();
  const [form, setForm] = useState({ title: '', content: '', category: '자유' });
  const [loading, setLoading] = useState(true);

  const boardId = params?.id;

  useEffect(() => {
    if (!match || !boardId) return;

    fetch(`${API_BASE_URL}/${boardId}`)
      .then(res => res.json())
      .then(data => {
        setForm({ title: data.title, content: data.content, category: data.category || '자유' });
        setLoading(false);
      })
      .catch(() => {
        toast.error("데이터 로드 실패");
        setLocation('/user/community');
      });
  }, [match, boardId, setLocation]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!boardId) return;

    // 415 에러 해결을 위한 FormData 구성
    const formData = new FormData();
    const requestBlob = new Blob([JSON.stringify(form)], { type: 'application/json' });
    
    // 백엔드 @RequestPart("request") 이름과 일치시켜야 함
    formData.append('request', requestBlob);

    const res = await fetch(`${API_BASE_URL}/${boardId}`, {
      method: 'PUT',
      headers: { 
        // FormData 사용 시 Content-Type 헤더를 직접 설정하지 않음 (브라우저 자동 설정)
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}` 
      },
      body: formData
    });

    if (res.ok) {
      toast.success("수정되었습니다.");
      setLocation(`/user/community/${boardId}`);
    } else {
      // 403 Forbidden 등이 발생할 경우 권한 문제 알림
      toast.error("수정 권한이 없거나 오류가 발생했습니다.");
    }
  };

  if (!match || !boardId) return null;
  if (loading) return <Layout role="user"><div className="p-20 text-center text-rose-500 font-bold">불러오는 중...</div></Layout>;

  return (
    <Layout role="user">
      <div className="max-w-2xl mx-auto p-6">
        <button onClick={() => window.history.back()} className="flex items-center gap-2 text-gray-400 font-bold mb-6">
          <ArrowLeft size={18}/> 취소
        </button>
        
        <form onSubmit={handleUpdate} className="bg-white p-8 rounded-[2rem] shadow-sm border border-rose-50 space-y-4">
          <h2 className="text-xl font-black text-rose-500 mb-4">게시글 수정</h2>
          <input 
            className="w-full p-4 bg-gray-50 rounded-xl border-none font-bold"
            value={form.title}
            onChange={e => setForm({...form, title: e.target.value})}
            placeholder="제목" required
          />
          <textarea 
            className="w-full p-4 bg-gray-50 rounded-xl border-none h-64 resize-none"
            value={form.content}
            onChange={e => setForm({...form, content: e.target.value})}
            placeholder="내용" required
          />
          <button type="submit" className="w-full bg-rose-500 text-white py-4 rounded-xl font-black flex items-center justify-center gap-2">
            <Save size={20}/> 수정 완료
          </button>
        </form>
      </div>
    </Layout>
  );
}