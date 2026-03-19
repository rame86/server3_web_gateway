import { useState, useRef } from 'react';
import { useLocation } from 'wouter';
import Layout from '@/components/Layout';
import { ArrowLeft, Send, Paperclip, X } from 'lucide-react';
import { toast } from 'sonner'

const API_BASE_URL = 'http://localhost/msa/core/board';

export default function UserCommunityWrite() {
  const [, setLocation] = useLocation();
  const fileInputRef = useRef(null); 
  const [selectedFile, setSelectedFile] = useState(null); 
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

  // 파일 선택 핸들러
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { 
        toast.error("파일 크기는 10MB를 초과할 수 없습니다.");
        return;
      }
      setSelectedFile(file);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // input value 초기화
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error("제목과 내용을 모두 입력해주세요.");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken') || localStorage.getItem('TOKEN');
      
      const sendData = new FormData();

      // 백엔드의 @RequestPart("request") 구조에 맞춤
      const requestBlob = new Blob(
        [JSON.stringify({
          ...formData,
          memberId: localStorage.getItem('memberId')
        })],
        { type: 'application/json' }
      );
      sendData.append('request', requestBlob);

      if (selectedFile) {
        sendData.append('file', selectedFile);
      }

      const response = await fetch(`${API_BASE_URL}/write`, {
        method: 'POST',
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: sendData 
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

            {/* 파일 첨부 섹션 추가 */}
            <div>
              <label className="block text-sm font-black text-gray-700 mb-2">파일 첨부</label>
              <div className="flex flex-col gap-3">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                />
                
                {!selectedFile ? (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center justify-center gap-2 w-full md:w-max px-6 py-3 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400 hover:text-rose-400 hover:border-rose-200 transition-all font-bold text-sm"
                  >
                    <Paperclip size={18} /> 파일 선택하기 (최대 10MB)
                  </button>
                ) : (
                  <div className="flex items-center justify-between p-4 bg-rose-50 rounded-2xl border border-rose-100">
                    <div className="flex items-center gap-3 truncate">
                      <Paperclip size={18} className="text-rose-500 shrink-0" />
                      <span className="text-sm font-bold text-rose-700 truncate">
                        {selectedFile.name}
                      </span>
                      <span className="text-xs text-rose-300 font-medium shrink-0">
                        ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={removeFile}
                      className="p-1 hover:bg-rose-200 rounded-full transition-colors text-rose-500"
                    >
                      <X size={18} />
                    </button>
                  </div>
                )}
              </div>
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