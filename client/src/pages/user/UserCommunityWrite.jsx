import { useState } from 'react';
import { useLocation } from 'wouter';
import Layout from '@/components/Layout';
import { ArrowLeft, Send } from 'lucide-react';
import { toast } from 'sonner';

export default function UserCommunityWrite() {
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(false);
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

    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error("제목과 내용을 모두 입력해주세요.");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');

      // 1. FormData 객체 생성
      const sendData = new FormData();

      // 2. 게시글 데이터(JSON)를 Blob으로 만들어 추가
      // 백엔드의 @RequestPart("request")와 이름을 맞춰야 합니다.
      const requestBlob = new Blob(
        [JSON.stringify({
          ...formData,
          memberId: localStorage.getItem('memberId')
        })],
        { type: 'application/json' }
      );
      sendData.append('request', requestBlob);

      // 3. 파일이 있다면 추가 (선택 사항)
      // if (selectedFile) { sendData.append('file', selectedFile); }

      const response = await fetch('http://localhost/msa/core/board/write', {
        method: 'POST',
        headers: {
          // 주의: Content-Type을 직접 설정하지 마세요! 
          // FormData를 사용하면 브라우저가 자동으로 boundary를 포함한 multipart/form-data를 설정합니다.
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: sendData // JSON.stringify 대신 FormData를 보냄
      });

      if (response.ok) {
        toast.success("게시글이 성공적으로 등록되었습니다!");
        setLocation('/user/community');
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "등록에 실패했습니다.");
      }
    } catch (error) {
      console.error("Submit Error:", error);
      toast.error("서버와 연결할 수 없습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout role="user">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <button
          onClick={() => setLocation('/user/community')}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-rose-500 transition-all font-bold group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> 돌아가기
        </button>

        <div className="bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-rose-50">
          <h1 className="text-2xl font-black text-gray-900 mb-8">새 게시글 작성</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-black text-gray-700 mb-2">카테고리</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full p-4 rounded-2xl border border-gray-100 bg-gray-50 font-bold focus:outline-none focus:ring-2 focus:ring-rose-400 transition-all text-sm"
              >
                <option value="팬레터">💌 팬레터</option>
                <option value="자유게시판">💬 자유게시판</option>
                <option value="팬덤게시판">🌟 팬덤게시판</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-black text-gray-700 mb-2">제목</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="제목을 입력하세요"
                className="w-full p-4 rounded-2xl border border-gray-100 font-bold focus:outline-none focus:ring-2 focus:ring-rose-400 transition-all text-sm"
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
                placeholder="나만의 소중한 이야기를 들려주세요."
                className="w-full p-4 rounded-2xl border border-gray-100 focus:outline-none focus:ring-2 focus:ring-rose-400 transition-all resize-none text-sm leading-relaxed"
                required
              />
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-rose-500 text-white py-4 rounded-2xl font-black shadow-lg shadow-rose-100 hover:bg-rose-600 active:scale-[0.98] transition-all disabled:bg-gray-300 disabled:shadow-none flex items-center justify-center gap-2"
              >
                {loading ? "등록 중..." : <><Send size={18} /> 게시글 등록하기</>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}