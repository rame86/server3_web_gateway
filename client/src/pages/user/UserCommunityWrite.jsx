import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'wouter';
import Layout from '@/components/Layout';
import { ArrowLeft, Send, Paperclip, X, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

// API 게이트웨이 및 서비스별 기본 URL 설정
const API_GATEWAY = import.meta.env.VITE_API_GATEWAY_URL;
const API_BASE_URL = `${API_GATEWAY}/msa/core/board`;
const ARTIST_API_URL = `${API_GATEWAY}/msa/core/artist`; // 아티스트 정보용

export default function UserCommunityWrite() {
  const [, setLocation] = useLocation();
  const fileInputRef = useRef(null); 
  const [selectedFile, setSelectedFile] = useState(null); 
  const [loading, setLoading] = useState(false);
  const [followedArtists, setFollowedArtists] = useState([]); // 팔로우한 목록 저장

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '팬레터',
    artistId: '' // 사용자가 선택할 ID
  });

  // 1. 컴포넌트 마운트 시 팔로우한 아티스트 목록 초기 로드
  useEffect(() => {
  const fetchMyFandoms = async () => {
    try {
      const token = localStorage.getItem('accessToken') || localStorage.getItem('TOKEN');
      
      // [중요!] 주소를 반드시 `${API_BASE_URL}/my-fandoms`로 호출해야 합니다.
      // API_BASE_URL은 위에서 `${API_GATEWAY}/msa/core/board`로 정의되어 있어야 함
      const response = await fetch(`${API_BASE_URL}/my-fandoms`, {
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });
        
        if (response.ok) {
        const data = await response.json(); 
        console.log("받아온 팬덤 데이터:", data); // 데이터가 잘 오는지 콘솔로 확인!
        setFollowedArtists(data);
        
        // 데이터가 존재할 경우 첫 번째 아티스트를 기본 선택값으로 설정
        if (data && data.length > 0) {
          // 첫 번째 항목 자동 선택 (ID가 숫자형태면 문자열로 변환 권장)
          setFormData(prev => ({ ...prev, artistId: data[0].artistId.toString() }));
        }
      } else {
        // 404가 뜬다면 API_BASE_URL 변수가 잘못 설정되었을 가능성이 큽니다.
        console.error("에러 발생 상태코드:", response.status);
        if (response.status === 401) {
          toast.error("로그인이 필요합니다.");
          setLocation('/login');
        }
      }
    } catch (error) {
      console.error("팬덤 목록 로드 실패:", error);
      toast.error("가입된 팬덤 정보를 불러오지 못했습니다.");
    }
  };
  fetchMyFandoms();
}, [setLocation]);

  // 입력값 변경 핸들러 (제목, 내용, 카테고리, 아티스트 선택)
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 파일 선택 핸들러 : 용량 제한(10MB) 체크 포함
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

  // 선택된 파일 제거
  const removeFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  //최종 게시글 등록 함수 (Multipart/form-data 처리)
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 필수 입력값 검증
    if (!formData.artistId) {
      toast.error("대상 아티스트를 선택해주세요.");
      return;
    }
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error("제목과 내용을 모두 입력해주세요.");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken') || localStorage.getItem('TOKEN');
      const memberId = localStorage.getItem('memberId');
      
      const sendData = new FormData();

      // [핵심] JSON 데이터를 Blob으로 만들어 'request'라는 이름으로 추가 (Spring @RequestPart와 대응)
      const requestBlob = new Blob(
        [JSON.stringify({
          title: formData.title,
          content: formData.content,
          category: formData.category,
          artistId: Number(formData.artistId),
          memberId: memberId ? Number(memberId) : null
        })],
        { type: 'application/json' }
      );
      sendData.append('request', requestBlob);

      // 파일이 선택되었다면 'file'이라는 이름으로 추가
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
        // 등록 후 해당 아티스트 페이지로 이동
        setLocation(`/user/artists/${formData.artistId}`);
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
        {/* 뒤로 가기 버튼 */}
        <button
          onClick={() => setLocation('/user/community')}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-rose-500 transition-all font-bold group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> 돌아가기
        </button>

      {/* 작성 폼 컨테이너 */}
        <div className="bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-rose-50">
          <h1 className="text-2xl font-black text-gray-900 mb-8">새 게시글 작성</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 아티스트 선택 필드 추가 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-black text-gray-700 mb-2">대상 아티스트</label>
                <select
                  name="artistId"
                  value={formData.artistId}
                  onChange={handleInputChange}
                  className="w-full p-4 rounded-2xl border border-gray-100 bg-gray-50 font-bold focus:outline-none focus:ring-2 focus:ring-rose-400 transition-all text-sm"
                >
                  {followedArtists.length > 0 ? (
                    followedArtists.map(artist => (
                    <option key={artist.artistId} value={artist.artistId}>
                      {/* 서버에서 넘어오는 stageName 사용 */}
                      ✨ {artist.stageName}
                    </option>
                    ))
                  ) : (
                    <option value="">팔로우한 아티스트가 없습니다.</option>
                  )}
                </select>
              </div>
              {/* 카테고리 선택 셀렉트 박스 */}
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
            </div>
            {/* 제목 입력 */}
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
            {/* 본문 입력 */}
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
            {/* 파일 첨부 섹션 */}
            <div>
              <label className="block text-sm font-black text-gray-700 mb-2">파일 첨부</label>
              <div className="flex flex-col gap-3">
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
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
                      <span className="text-sm font-bold text-rose-700 truncate">{selectedFile.name}</span>
                    </div>
                    <button type="button" onClick={removeFile} className="p-1 hover:bg-rose-200 rounded-full transition-colors text-rose-500">
                      <X size={18} />
                    </button>
                  </div>
                )}
              </div>
            </div>
            {/* 제출 버튼 */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-rose-500 text-white py-4 rounded-2xl font-black shadow-lg shadow-rose-100 hover:bg-rose-600 active:scale-[0.98] transition-all disabled:bg-gray-300 flex items-center justify-center gap-2"
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