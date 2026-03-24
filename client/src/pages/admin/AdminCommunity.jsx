import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { AlertCircle, Eye, Trash2, Search, Flag, X, Clock, User, Layers3, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

export default function AdminCommunity() {
  const [activeTab, setActiveTab] = useState('posts'); 
  const [reportSubTab, setReportSubTab] = useState('boards'); 
  const [searchQuery, setSearchQuery] = useState('');
  
  const [reportList, setReportList] = useState([]);
  const [postList, setPostList] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null); 
  const [loading, setLoading] = useState(false);

  // 개별 카운트 상태
  const [totalReportCount, setTotalReportCount] = useState(0);
  const [commentCount, setcommentCount] = useState(0);
  const [boardCount, setBoardCount] = useState(0);

  // [주소 수정] /board 위치를 컨트롤러 구조에 맞게 조정했습니다.
  const ADMIN_API_BASE = "/msa/core/admin/board"; 
  const BOARD_API_BASE = "/msa/core/board";
  const BOARD_ADMIN_API_BASE = "/msa/core/board/admin";
  

  useEffect(() => {
    fetchPosts();
    fetchReports();
  }, []);
  
  useEffect(() => {
    if (activeTab === 'reports') {
      fetchReports();
    }
  }, [reportSubTab, activeTab]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(`${BOARD_API_BASE}/list`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setPostList(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("게시글 로드 실패:", error);
    } finally { setLoading(false); }
  };

  // 2. 신고 목록 로드 (URL 경로 중복 해결)
  const fetchReports = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const headers = { 'Authorization': `Bearer ${token}` };

      // 사진에서 확인된 404 에러의 원인인 /board 중복을 제거한 요청입니다.
      const [boardRes, commentRes] = await Promise.all([
        axios.get(`${ADMIN_API_BASE}/reports`, { headers }), // -> /msa/core/admin/board/reports
        axios.get(`${ADMIN_API_BASE}/reports/comments`, { headers }) // -> /msa/core/admin/board/reports/comments
      ]);

      const boards = Array.isArray(boardRes.data) ? boardRes.data : [];
      const comments = Array.isArray(commentRes.data) ? commentRes.data : [];

      // 카운트 업데이트
      setBoardCount(boards.length);
      setcommentCount(comments.length);
      setTotalReportCount(boards.length + comments.length);
      
      setReportList(reportSubTab === 'boards' ? boards : comments);

    } catch (error) {
      console.error("신고 목록 로드 실패:", error);
      // 에러가 나더라도 리스트를 비워줌으로써 '데이터 없음' 메시지가 뜨게 합니다.
      setReportList([]); 
    } finally { setLoading(false); }
  };

  const handleShowDetail = async (item, type) => {
    if (item.content) {
      setSelectedItem({ ...item, type });
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      // DB 이미지 확인 결과 필드명이 report_id, board_id 등으로 되어 있으므로 카멜케이스 대응
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
        </div>

        {activeTab === 'reports' && (
          <div className="flex gap-6 border-b border-slate-100 mb-4 px-2">
            <button onClick={() => setReportSubTab('boards')} className={`pb-3 text-sm font-black transition-all ${reportSubTab === 'boards' ? 'text-rose-500 border-b-2 border-rose-500' : 'text-slate-400'}`}>게시글 신고 ({boardCount})</button>
            <button onClick={() => setReportSubTab('comments')} className={`pb-3 text-sm font-black transition-all ${reportSubTab === 'comments' ? 'text-rose-500 border-b-2 border-rose-500' : 'text-slate-400'}`}>댓글 신고 ({commentCount})</button>
          </div>
        )}

        {/* 리스트 영역 */}
        {activeTab === 'posts' ? (
          <div className="space-y-4">
            <div className="relative">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" placeholder="제목 또는 작성자 검색..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm outline-none shadow-sm focus:border-rose-300 transition-all" />
            </div>
            <div className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-slate-100">
              {loading ? <div className="text-center py-20 text-slate-400 font-bold animate-pulse">데이터 로딩 중...</div> : (
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
                            <button onClick={() => handleShowDetail(post, 'board')} className="p-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-white transition-all"><Eye size={15}/></button>
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
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {loading ? <div className="col-span-full text-center py-20 text-slate-400 font-bold animate-pulse uppercase tracking-widest">Loading Reports...</div> : (
              reportList.length === 0 ? <div className="col-span-full text-center py-20 text-slate-400 font-bold bg-slate-50 rounded-[2rem] border border-dashed border-slate-200">현재 대기 중인 신고 건이 없습니다.</div> :
              reportList.map((report) => (
                <div key={report.reportId} className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-rose-50 rounded-xl text-rose-500 group-hover:scale-110 transition-transform">
                        {reportSubTab === 'comments' ? <MessageSquare size={16}/> : <Layers3 size={16}/>}
                      </div>
                      <p className="font-black text-slate-800 text-sm line-clamp-1">{report.postTitle || (reportSubTab === 'comments' ? '신고된 댓글' : '신고된 게시글')}</p>
                    </div>
                    <span className="text-[9px] bg-amber-100 text-amber-700 px-2.5 py-1 rounded-lg font-black uppercase tracking-tighter">PENDING</span>
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
      </div>

      {/* 상세보기 모달 */}
      {selectedItem && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-[9999] p-4 backdrop-blur-md" onClick={() => setSelectedItem(null)}>
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center text-slate-800">
              <span className="text-[10px] font-black text-rose-500 bg-rose-50 px-3 py-1 rounded-full uppercase tracking-widest">Content Review</span>
              <button onClick={() => setSelectedItem(null)} className="p-2 hover:bg-white rounded-full text-slate-400 transition-colors"><X size={20}/></button>
            </div>
            <div className="p-8 space-y-4 max-h-[50vh] overflow-y-auto">
              {selectedItem.title && <h4 className="text-xl font-black text-slate-900 leading-tight tracking-tight">{selectedItem.title}</h4>}
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-bold border-b border-slate-50 pb-4">
                <span className="flex items-center gap-1.5"><User size={14} className="text-rose-400"/> {selectedItem.authorName || '작성자 정보 없음'}</span>
                <span className="flex items-center gap-1.5"><Clock size={14}/> {selectedItem.createdAt?.replace('T', ' ')}</span>
              </div>
              <div className="text-slate-700 whitespace-pre-wrap py-4 leading-relaxed text-sm font-medium">
                {selectedItem.content || "내용이 없습니다."}
              </div>
            </div>
            <div className="p-6 bg-slate-50/50 flex gap-3 border-t border-slate-100">
              <button onClick={() => setSelectedItem(null)} className="flex-1 py-4 bg-white border border-slate-200 rounded-2xl font-black text-slate-500 hover:bg-slate-100 transition-all">닫기</button>
              <button onClick={(e) => handleDeleteItem(e, selectedItem.boardId || selectedItem.commentId, selectedItem.type)} className="flex-1 py-4 bg-rose-500 text-white rounded-2xl font-black hover:bg-rose-600 transition-all shadow-lg">영구 삭제</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}