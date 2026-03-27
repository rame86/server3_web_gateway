import { useState, useEffect, useRef } from 'react';
import Layout from '@/components/Layout';
import { AlertCircle, Eye, Trash2, Search, Flag, X, Clock, User, Layers3, MessageSquare, Megaphone, Send, Paperclip, Globe, Star } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

export default function AdminCommunity() {
  // --- 상태 관리 ---
  const [activeTab, setActiveTab] = useState('posts'); 
  const [reportSubTab, setReportSubTab] = useState('boards'); 
  const [searchQuery, setSearchQuery] = useState('');
  
  const [reportList, setReportList] = useState([]);
  const [postList, setPostList] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null); 
  const [loading, setLoading] = useState(false);

  // 카운트 상태
  const [totalReportCount, setTotalReportCount] = useState(0);
  const [commentCount, setcommentCount] = useState(0);
  const [boardCount, setBoardCount] = useState(0);

  // 공지사항 작성 관련 상태
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [allArtists, setAllArtists] = useState([]);
  const [noticeType, setNoticeType] = useState('ALL'); 
  const [noticeData, setNoticeData] = useState({
    title: '',
    content: '',
    category: '공지사항',
    artistId: '0' 
  });
  
  // --- API 경로 설정 (백엔드 ArtistController 구조에 맞춤) ---
  const ADMIN_API_BASE = "/msa/core/admin/board"; 
  const BOARD_API_BASE = "/msa/core/board";
  const BOARD_ADMIN_API_BASE = "/msa/core/board/admin";
  const ARTIST_API_BASE = "/msa/core/artist"; // 백엔드 @RequestMapping("/artist")
  
  useEffect(() => {
    fetchPosts();
    fetchReports();
    fetchAllArtists(); // 컴포넌트 마운트 시 실행
  }, []);

  useEffect(() => {
    if (activeTab === 'reports') {
      fetchReports();
    }
  }, [reportSubTab, activeTab]);

  // 1. 전체 게시글 목록 로드
  const fetchPosts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(`${BOARD_API_BASE}/list`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setPostList(Array.isArray(response.data) ? response.data : []);
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  // 2. 신고 목록 로드
  const fetchReports = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const headers = { 'Authorization': `Bearer ${token}` };
      const [boardRes, commentRes] = await Promise.all([
        axios.get(`${ADMIN_API_BASE}/reports`, { headers }),
        axios.get(`${ADMIN_API_BASE}/reports/comments`, { headers })
      ]);
      const boards = Array.isArray(boardRes.data) ? boardRes.data : [];
      const comments = Array.isArray(commentRes.data) ? commentRes.data : [];
      
      setBoardCount(boards.length);
      setcommentCount(comments.length);
      setTotalReportCount(boards.length + comments.length);
      setReportList(reportSubTab === 'boards' ? boards : comments);
    } catch (error) {
      console.error("신고 목록 로드 실패:", error);
      setReportList([]); 
    } finally { setLoading(false); }
  };
  
  // 3. [중요] 아티스트 목록 로드 (백엔드 /artist/list 경로로 수정)
  const fetchAllArtists = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      // 백엔드 컨트롤러의 @GetMapping("/list") 경로를 사용해야 함
      const response = await axios.get(`${ARTIST_API_BASE}/list`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      console.log("-----> [ARTIST LIST RESPONSE]", response.data);
      
      // ArtistResponse 리스트가 바로 오는지 확인 후 세팅
      const artistData = Array.isArray(response.data) ? response.data : [];
      setAllArtists(artistData);
    } catch (error) { 
      console.error("아티스트 목록 로드 실패:", error.response || error);
      toast.error("아티스트 목록을 불러오지 못했습니다.");
    }
  };
  
  const handleShowDetail = async (item, type) => {
    if (item.content) {
      setSelectedItem({ ...item, type });
      return;
    }
    try {
      const token = localStorage.getItem('accessToken');
      const id = type === 'board' ? (item.boardId || item.id) : (item.commentId || item.id);
      const url = type === 'board' ? `${BOARD_API_BASE}/${id}` : `${BOARD_API_BASE}/comment/${id}`;
      
      const response = await axios.get(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setSelectedItem({ ...response.data, type });
    } catch (error) {
      toast.error("상세 내용을 불러올 수 없습니다.");
    }
  };

  const handleApprove = async (e, reportId, targetId) => {
    if (e) e.stopPropagation();
    if (!window.confirm("신고를 승인하시겠습니까?")) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const url = reportSubTab === 'boards'
        ? `${ADMIN_API_BASE}/report/${reportId}/approve`
        : `${ADMIN_API_BASE}/report/comment/${reportId}/approve`;

      await axios.put(url, { boardId: targetId }, {
        headers: { 'Authorization': `Bearer ${token}` } 
      });

      toast.success('승인 처리가 완료되었습니다.');
      fetchReports(); 
    } catch (error) {
      toast.error("처리 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (e, id, type) => {
    if (e) e.stopPropagation();
    if (!window.confirm("정말로 영구 삭제하시겠습니까?")) return;
    try {
      const token = localStorage.getItem('accessToken');
      const url = type === 'board' 
        ? `${BOARD_ADMIN_API_BASE}/boards/${id}` 
        : `${BOARD_ADMIN_API_BASE}/comments/${id}`;

      await axios.delete(url, { headers: { 'Authorization': `Bearer ${token}` } });
      toast.success('영구 삭제되었습니다.');
      setSelectedItem(null);
      activeTab === 'posts' ? fetchPosts() : fetchReports();
    } catch (error) {
      toast.error("삭제 실패");
    }
  };

  const handleNoticeSubmit = async (e) => {
    e.preventDefault();
    if (!noticeData.title.trim() || !noticeData.content.trim()) {
      toast.error("제목과 내용을 입력해주세요.");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const formData = new FormData();
      
      const finalArtistId = noticeType === 'ALL' ? 0 : Number(noticeData.artistId);

      const requestBlob = new Blob(
        [JSON.stringify({
          title: noticeData.title,
          content: noticeData.content,
          category: noticeData.category,
          artistId: finalArtistId,
        })],
        { type: 'application/json' }
      );
      
      formData.append('request', requestBlob);
      if (selectedFile) formData.append('file', selectedFile);

      await axios.post(`${BOARD_API_BASE}/write`, formData, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      toast.success('공지사항이 등록되었습니다.');
      
      setNoticeData({ title: '', content: '', category: '공지사항', artistId: '0' });
      setSelectedFile(null);
      setActiveTab('posts');
      fetchPosts();
    } catch (error) { 
      toast.error("공지사항 등록 실패"); 
    } finally { setLoading(false); }
  };

  const filteredPosts = postList.filter((p) =>
    p.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.authorName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Layout role="admin">
      <div className="p-4 lg:p-6 space-y-6 text-slate-800">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">커뮤니티 관리 센터</h1>

        {/* 탭 메뉴 */}
        <div className="flex gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
          <button onClick={() => setActiveTab('posts')} className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'posts' ? 'bg-white text-rose-500 shadow-md' : 'text-slate-500'}`}>
            <Layers3 size={16} className="inline mr-2" /> 전체 게시글
          </button>
          <button onClick={() => setActiveTab('reports')} className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'reports' ? 'bg-white text-rose-500 shadow-md' : 'text-slate-500'}`}>
            <Flag size={16} className="inline mr-2" /> 신고 관리 ({totalReportCount})
          </button>
          <button onClick={() => setActiveTab('write')} className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'write' ? 'bg-white text-rose-500 shadow-md' : 'text-slate-500'}`}>
            <Megaphone size={16} className="inline mr-2" /> 공지사항 작성
          </button>
        </div>
        
        {activeTab === 'reports' && (
          <div className="flex gap-6 border-b border-slate-100 mb-4 px-2">
            <button onClick={() => setReportSubTab('boards')} className={`pb-3 text-sm font-black transition-all ${reportSubTab === 'boards' ? 'text-rose-500 border-b-2 border-rose-500' : 'text-slate-400'}`}>게시글 신고 ({boardCount})</button>
            <button onClick={() => setReportSubTab('comments')} className={`pb-3 text-sm font-black transition-all ${reportSubTab === 'comments' ? 'text-rose-500 border-b-2 border-rose-500' : 'text-slate-400'}`}>댓글 신고 ({commentCount})</button>
          </div>
        )}

        {/* --- 1. 게시글 리스트 --- */}
        {activeTab === 'posts' && (
          <div className="space-y-4">
            <div className="relative">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" placeholder="제목 검색..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm outline-none shadow-sm focus:border-rose-300" />
            </div>
            <div className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-slate-100">
              {loading ? <div className="text-center py-20 text-slate-400 font-bold animate-pulse">로딩 중...</div> : (
                <table className="w-full text-left">
                  <thead className="bg-slate-50/50">
                    <tr className="border-b border-slate-100 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      <th className="p-5">콘텐츠 정보</th>
                      <th className="p-5 text-right">작업</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPosts.length === 0 ? <tr><td colSpan="2" className="p-20 text-center text-slate-400 font-bold">게시글이 없습니다.</td></tr> :
                    filteredPosts.map((post) => (
                      <tr key={post.boardId} className="border-b border-slate-50 hover:bg-rose-50/30 transition-colors">
                        <td className="p-5">
                          <p className="font-bold text-slate-800 text-sm mb-1">{post.title}</p>
                          <div className="flex gap-3 text-[10px] text-slate-400 font-bold">
                            <span className="flex items-center gap-1"><User size={12}/> {post.authorName}</span>
                            <span className="flex items-center gap-1"><Clock size={12}/> {post.createdAt?.split('T')[0]}</span>
                          </div>
                        </td>
                        <td className="p-5 text-right">
                          <div className="flex justify-end gap-2">
                            <button onClick={() => handleShowDetail(post, 'board')} className="p-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-white"><Eye size={15}/></button>
                            <button onClick={(e) => handleDeleteItem(e, post.boardId, 'board')} className="p-2.5 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all"><Trash2 size={15}/></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* --- 2. 신고 관리 --- */}
        {activeTab === 'reports' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {loading ? <div className="col-span-full text-center py-20 text-slate-400 font-bold animate-pulse">로딩 중...</div> : (
              reportList.length === 0 ? <div className="col-span-full text-center py-20 text-slate-400 font-bold bg-slate-50 rounded-[2rem] border border-dashed border-slate-200">현재 신고 건이 없습니다.</div> :
              reportList.map((report) => (
                <div key={report.reportId} className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-rose-50 rounded-xl text-rose-500 group-hover:scale-110 transition-transform">
                        {reportSubTab === 'comments' ? <MessageSquare size={16}/> : <Layers3 size={16}/>}
                      </div>
                      <p className="font-black text-slate-800 text-sm line-clamp-1">{report.postTitle || (reportSubTab === 'comments' ? '신고된 댓글' : '신고된 게시글')}</p>
                    </div>
                    <span className="text-[9px] bg-amber-100 text-amber-700 px-2.5 py-1 rounded-lg font-black uppercase">PENDING</span>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl mb-5 border border-slate-100">
                    <p className="text-[10px] text-slate-400 font-black mb-1.5 flex items-center gap-1 uppercase tracking-wider"><AlertCircle size={12}/> Reason</p>
                    <p className="text-xs text-slate-700 font-bold leading-relaxed">{report.reason}</p>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => handleShowDetail(report, reportSubTab === 'boards' ? 'board' : 'comment')} className="flex-1 py-3.5 text-xs bg-white border border-slate-200 text-slate-600 rounded-2xl font-black hover:bg-slate-50 transition-all shadow-sm">상세 확인</button>
                    <button onClick={(e) => handleApprove(e, report.reportId, reportSubTab === 'boards' ? report.boardId : report.commentId)} className="flex-1 py-3.5 text-xs bg-rose-500 text-white rounded-2xl font-black hover:bg-rose-600 transition-all shadow-md">신고 승인</button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* --- 3. 공지사항 작성 --- */}
        {activeTab === 'write' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
              <h2 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3">
                <div className="p-2.5 bg-rose-500 rounded-xl text-white"><Megaphone size={18}/></div>
                공지사항 등록
              </h2>
              <form onSubmit={handleNoticeSubmit} className="space-y-6">
                <div className="flex gap-3 p-1.5 bg-slate-50 rounded-2xl border border-slate-100">
                  <button type="button" onClick={() => setNoticeType('ALL')} className={`flex-1 py-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${noticeType === 'ALL' ? 'bg-white text-rose-500 shadow-sm' : 'text-slate-400'}`}>
                    <Globe size={14}/> 전체 공지
                  </button>
                  <button type="button" onClick={() => setNoticeType('ARTIST')} className={`flex-1 py-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${noticeType === 'ARTIST' ? 'bg-white text-rose-500 shadow-sm' : 'text-slate-400'}`}>
                    <Star size={14}/> 아티스트별 공지
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <select 
                    disabled={noticeType === 'ALL'} 
                    value={noticeData.artistId} 
                    onChange={(e) => setNoticeData(p => ({...p, artistId: e.target.value}))} 
                    className="w-full p-3.5 rounded-xl border border-slate-100 font-bold text-xs bg-slate-50"
                  >
                    <option value="0">아티스트 선택</option>
                    {/* [수정] 백엔드 DTO 필드명에 맞춰 key와 name 처리 */}
                    {allArtists.map(a => (
                      <option key={a.id} value={a.id}>{a.stageName || a.name}</option>
                    ))}
                  </select>
                  <select value={noticeData.category} onChange={(e) => setNoticeData(p => ({...p, category: e.target.value}))} className="w-full p-3.5 rounded-xl border border-slate-100 font-bold text-xs bg-slate-50">
                    <option value="공지사항">공지사항</option>
                    <option value="이벤트">이벤트</option>
                  </select>
                </div>

                <input type="text" value={noticeData.title} onChange={(e) => setNoticeData(p => ({...p, title: e.target.value}))} placeholder="제목" className="w-full p-3.5 rounded-xl border border-slate-100 font-bold text-xs bg-slate-50 outline-none" required />
                <textarea rows="6" value={noticeData.content} onChange={(e) => setNoticeData(p => ({...p, content: e.target.value}))} placeholder="내용" className="w-full p-4 rounded-xl border border-slate-100 text-xs bg-slate-50 outline-none resize-none" required />
                
                <div className="flex gap-2">
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="flex-1 py-3.5 border-2 border-dashed border-slate-100 rounded-xl text-slate-400 font-bold text-xs flex items-center justify-center gap-2">
                    <Paperclip size={16} /> {selectedFile ? selectedFile.name : "이미지 첨부"}
                  </button>
                  <input type="file" ref={fileInputRef} onChange={(e) => setSelectedFile(e.target.files[0])} className="hidden" />
                </div>

                <button type="submit" disabled={loading} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-sm hover:bg-rose-600 transition-all flex items-center justify-center gap-2 disabled:bg-slate-200">
                  <Send size={16}/> {loading ? "전송 중..." : "공지사항 등록"}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* 상세보기 모달 */}
      {selectedItem && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-[9999] p-4 backdrop-blur-md" onClick={() => setSelectedItem(null)}>
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center text-slate-800">
              <span className="text-[10px] font-black text-rose-500 bg-rose-50 px-3 py-1 rounded-full uppercase tracking-widest">Content Review</span>
              <button onClick={() => setSelectedItem(null)} className="p-2 hover:bg-white rounded-full text-slate-400"><X size={20}/></button>
            </div>
            <div className="p-8 space-y-4 max-h-[50vh] overflow-y-auto text-slate-700">
              <h4 className="text-xl font-black text-slate-900 leading-tight">{selectedItem.title}</h4>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{selectedItem.content || "내용이 없습니다."}</p>
            </div>
            <div className="p-6 bg-slate-50/50 flex gap-3">
              <button onClick={() => setSelectedItem(null)} className="flex-1 py-4 bg-white border border-slate-200 rounded-2xl font-black text-slate-500">닫기</button>
              <button onClick={(e) => handleDeleteItem(e, selectedItem.boardId || selectedItem.id, selectedItem.type)} className="flex-1 py-4 bg-rose-500 text-white rounded-2xl font-black hover:bg-rose-600 transition-all">영구 삭제</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}