import { useState } from 'react';
import { useLocation } from 'wouter'; // react-router-dom을 지우고 wouter로 변경
import Layout from '@/components/Layout';
import { ArrowLeft, Send } from 'lucide-react';
import { toast } from 'sonner';

export default function UserCommunityWrite() {
  const [, setLocation] = useLocation(); // wouter 이동 훅
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '팬레터'
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // App.jsx에서 'accessToken'으로 저장하고 있으니 키값을 맞춥니다.
      const token = localStorage.getItem('accessToken'); 
      
      const response = await fetch('http://localhost/msa/core/board', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast.success("게시글이 성공적으로 등록되었습니다!");
        setLocation('/user/community'); // 목록으로 이동
      } else {
        toast.error("등록에 실패했습니다.");
      }
    } catch (error) {
      toast.error("서버와 연결할 수 없습니다.");
    }
  };

  return (
    <Layout role="user">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <button 
          onClick={() => window.history.back()} 
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-rose-500 transition-all font-bold"
        >
          <ArrowLeft size={18} /> 돌아가기
        </button>

        <div className="bg-white rounded-3xl p-8 shadow-sm border border-rose-50">
          <h1 className="text-2xl font-black text-gray-900 mb-8">새 게시글 작성</h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-black text-gray-700 mb-2">카테고리</label>
              <select 
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full p-4 rounded-2xl border border-gray-100 bg-gray-50 font-bold focus:outline-none focus:ring-2 focus:ring-rose-500"
              >
                <option value="팬레터">팬레터</option>
                <option value="자유게시판">자유게시판</option>
                
              </select>
            </div>
            <div>
              <label className="block text-sm font-black text-gray-700 mb-2">제목</label>
              <input 
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full p-4 rounded-2xl border border-gray-100 font-bold focus:ring-2 focus:ring-rose-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-black text-gray-700 mb-2">내용</label>
              <textarea 
                name="content"
                rows="10"
                value={formData.content}
                onChange={handleInputChange}
                className="w-full p-4 rounded-2xl border border-gray-100 focus:ring-2 focus:ring-rose-500 resize-none"
                required
              />
            </div>
            <div className="flex gap-4 pt-4">
              <button type="submit" className="flex-1 bg-rose-500 text-white py-4 rounded-2xl font-black shadow-lg">
                등록하기
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}