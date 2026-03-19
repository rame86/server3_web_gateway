import { useState, useEffect } from 'react';
import { useRoute, useLocation } from 'wouter';
import Layout from '@/components/Layout';
import { toast } from 'sonner';
import { ArrowLeft, Save, FileUp, X, Paperclip } from 'lucide-react';

// 환경 변수에서 게이트웨이 URL을 가져옵니다.
const API_GATEWAY = import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost';
const API_BASE_URL = `${API_GATEWAY}/msa/core/board`;

export default function UserCommunityUpdate() {
  const [match, params] = useRoute('/user/community/update/:id');
  const [, setLocation] = useLocation();
  
  // 게시글 데이터 상태
  const [form, setForm] = useState(null);
  // 파일 관련 상태
  const [existingFile, setExistingFile] = useState(null); // 서버에서 온 기존 파일명
  const [newFile, setNewFile] = useState(null);           // 새로 선택한 파일 객체
  const [isFileDeleted, setIsFileDeleted] = useState(false); // 기존 파일 삭제 여부

  const boardId = params?.id;

  // 1. 기존 게시글 및 파일 정보 불러오기
  useEffect(() => {
    if (!boardId) return;
    const fetchPostData = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/${boardId}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
        });
        if (!res.ok) throw new Error("데이터 로드 실패");
        const data = await res.json();
        setForm(data); // 제목, 내용 등 본문 데이터 채우기
        
        if (data.originalFileName) {
          setExistingFile(data.originalFileName);
        }
      } catch (error) {
        toast.error("게시글 내용을 불러올 수 없습니다.");
        setLocation('/user/community');
      }
    };
    fetchPostData();
  }, [boardId, setLocation]);

  // 2. 파일 선택 (교체) 핸들러
  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setNewFile(selected);
      setExistingFile(null);    // 새 파일이 들어오면 기존 파일 표시는 제거
      setIsFileDeleted(true);   // 기존 파일은 교체(삭제 후 신규등록) 대상이 됨
    }
  };

  // 3. 파일 완전 삭제 핸들러 (X 버튼 클릭 시)
  const handleRemoveFile = () => {
    setNewFile(null);
    setExistingFile(null);
    setIsFileDeleted(true); // 백엔드에 파일 삭제 신호를 보내기 위함
  };

  // 4. 수정 완료 요청
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!boardId || !form) return;

    const formData = new FormData();
    
    // 파일 삭제 여부 백엔드 DTO 필드명인 'fileDeleted'와 이름을 맞춤
    const updateRequest = {
      ...form,
      fileDeleted: isFileDeleted
    };

    const requestBlob = new Blob([JSON.stringify(updateRequest)], { type: 'application/json' });
    formData.append('request', requestBlob);

    // 새로 선택한 파일이 있다면 첨부
    if (newFile) {
      formData.append('file', newFile);
    }

    const res = await fetch(`${API_BASE_URL}/${boardId}`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` },
      body: formData
    });

    if (res.ok) {
      toast.success("게시글이 성공적으로 수정되었습니다.");
      setLocation(`/user/community/${boardId}`);
    } else {
      toast.error("수정 권한이 없거나 서버 오류가 발생했습니다.");
    }
  };

  if (!form) return <Layout role="user"><div className="p-20 text-center text-rose-500 font-black">데이터 로딩 중...</div></Layout>;

  return (
    <Layout role="user">
      <div className="max-w-2xl mx-auto p-6">
        <button onClick={() => window.history.back()} className="flex items-center gap-2 text-gray-400 font-bold mb-6 hover:text-rose-400 transition-colors">
          <ArrowLeft size={18}/> 취소
        </button>
        
        <form onSubmit={handleUpdate} className="bg-white p-8 rounded-[2rem] shadow-sm border border-rose-50 space-y-4">
          <h2 className="text-xl font-black text-rose-500 mb-4">게시글 수정</h2>
          
          <input 
            className="w-full p-4 bg-gray-50 rounded-xl border-none font-bold outline-none focus:ring-2 focus:ring-rose-100"
            value={form.title || ''} 
            onChange={e => setForm({...form, title: e.target.value})}
            placeholder="제목" required
          />
          
          <textarea 
            className="w-full p-4 bg-gray-50 rounded-xl border-none h-64 resize-none outline-none focus:ring-2 focus:ring-rose-100"
            value={form.content || ''}
            onChange={e => setForm({...form, content: e.target.value})}
            placeholder="내용" required
          />

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-400 ml-1">첨부 파일 관리</label>
            
            {existingFile || newFile ? (
              /* 파일이 있는 경우: 파일명과 삭제 버튼 표시 */
              <div className="flex items-center justify-between p-4 bg-rose-50 rounded-xl border border-rose-100">
                <div className="flex items-center gap-2 overflow-hidden">
                  <Paperclip size={18} className="text-rose-500 flex-shrink-0" />
                  <span className="font-bold text-rose-600 truncate">
                    {newFile ? newFile.name : existingFile}
                  </span>
                </div>
                <button 
                  type="button" 
                  onClick={handleRemoveFile}
                  className="p-1 hover:bg-rose-200 rounded-full text-rose-500 transition-colors"
                  title="파일 삭제"
                >
                  <X size={20}/>
                </button>
              </div>
            ) : (
              /* 파일이 없는 경우: 파일 추가 버튼 표시 */
              <div className="relative">
                <input type="file" id="file-upload" className="hidden" onChange={handleFileChange} />
                <label htmlFor="file-upload" className="flex items-center justify-center gap-2 w-full p-4 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors text-gray-400 font-bold">
                  <FileUp size={20}/> 클릭하여 파일 추가
                </label>
              </div>
            )}
          </div>

          <button type="submit" className="w-full bg-rose-500 text-white py-4 rounded-xl font-black flex items-center justify-center gap-2 mt-4 hover:bg-rose-600 transition-all shadow-lg shadow-rose-100">
            <Save size={20}/> 수정 완료
          </button>
        </form>
      </div>
    </Layout>
  );
}