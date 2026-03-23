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
  const [selectedItem, setSelectedItem] = useState(null); // 모달 데이터
  const [loading, setLoading] = useState(false);

    useEffect(() => {
    fetchPosts();
    fetchReports();
  }, []);
  
  useEffect(() => {
    if (activeTab === 'posts') fetchPosts();
    else fetchReports();
  }, [activeTab, reportSubTab]);

  // 1. 게시글 목록 로드
  const fetchPosts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const response = await axios.get('/msa/core/board/list', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setPostList(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      toast.error("게시글 로드 실패");
    } finally { setLoading(false); }
  };

  // 2. 신고 목록 로드
  const fetchReports = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const endpoint = reportSubTab === 'boards' ? 'reports/boards' : 'reports/comments';
      const response = await axios.get(`/msa/core/board/admin/${endpoint}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setReportList(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      toast.error("신고 목록 로드 실패");
    } finally { setLoading(false); }
  };

  // 3. 상세보기 (통합)
  const handleShowDetail = async (item, type) => {
    // 이미 신고 리스트에 내용(content)이 있다면 바로 보여주고, 없으면 상세 API 호출
    if (item.content) {
      setSelectedItem({ ...item, type });
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      const id = type === 'board' ? item.boardId : item.commentId;
      const url = type === 'board' ? `/msa/core/board/${id}` : `/msa/core/board/comment/${id}`;
      
      const response = await axios.get(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setSelectedItem({ ...response.data, type });
    } catch (error) {
      toast.error("상세 내용을 불러올 수 없습니다.");
    }
  };

  // 4. 신고 승인 (숨김 처리)
  const handleApprove = async (e, reportId, targetId) => {
    if (e) e.stopPropagation();
    if (!window.confirm("신고를 승인하고 숨김 처리하시겠습니까?")) return;

    try {
      const token = localStorage.getItem('accessToken');
      const url = reportSubTab === 'boards'
        ? `/msa/core/admin/board/report/${reportId}/approve`
        : `/msa/core/admin/board/report/comment/${reportId}/approve`;

      const data = reportSubTab === 'boards' ? { boardId: targetId } : { commentId: targetId };

      await axios.put(url, data, { headers: { 'Authorization': `Bearer ${token}` } });
      toast.success('처리가 완료되었습니다.');
      fetchReports();
    } catch (error) {
      toast.error("처리 중 오류 발생");
    }
  };

  // 5. 영구 삭제
  const handleDeleteItem = async (e, id, type) => {
    if (e) e.stopPropagation();
    if (!window.confirm("정말로 영구 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) return;

    try {
      const token = localStorage.getItem('accessToken');
      const url = type === 'board' ? `/msa/core/board/${id}` : `/msa/core/board/comment/${id}`;
      
      await axios.delete(url, { headers: { 'Authorization': `Bearer ${token}` } });
      toast.success('삭제되었습니다.');
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
      {/* 전체 텍스트 색상을 Slate-800으로 변경하여 눈을 편안하게 수정 */}
      <div className="p-4 lg:p-6 space-y-6 text-slate-800">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">커뮤니티 관리 센터</h1>

        {/* 메인 탭 */}
        <div className="flex gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
          <button onClick={() => setActiveTab('posts')} className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'posts' ? 'bg-white text-rose-500 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}>
            <Layers3 size={16} className="inline mr-2" /> 전체 게시글
          </button>
          <button onClick={() => setActiveTab('reports')} className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'reports' ? 'bg-white text-rose-500 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}>
            <Flag size={16} className="inline mr-2" /> 신고 관리 ({reportList.length})
          </button>
        </div>

        {activeTab === 'reports' && (
          <div className="flex gap-6 border-b border-slate-100 mb-4 px-2">
            <button onClick={() => setReportSubTab('boards')} className={`pb-3 text-sm font-black transition-all ${reportSubTab === 'boards' ? 'text-rose-500 border-b-2 border-rose-500' : 'text-slate-400'}`}>게시글 신고</button>
            <button onClick={() => setReportSubTab('comments')} className={`pb-3 text-sm font-black transition-all ${reportSubTab === 'comments' ? 'text-rose-500 border-b-2 border-rose-500' : 'text-slate-400'}`}>댓글 신고</button>
          </div>
        )}

        {activeTab === 'posts' ? (
          <div className="space-y-4">
            <div className="relative">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" placeholder="제목 또는 작성자 검색..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-rose-100 outline-none shadow-sm transition-all" />
            </div>
            
            <div className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-slate-100">
              {loading ? <div className="text-center py-20 text-slate-400 font-bold font-mono uppercase tracking-widest">Loading...</div> : (
                <table className="w-full text-left">
                  <thead className="bg-slate-50/50">
                    <tr className="border-b border-slate-100">
                      <th className="p-5 text-xs font-black text-slate-500 uppercase tracking-widest">콘텐츠</th>
                      <th className="p-5 text-xs font-black text-slate-500 uppercase tracking-widest text-right">관리</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPosts.map((post) => (
                      <tr key={post.boardId} className="border-b border-slate-50 hover:bg-rose-50/30 transition-colors">
                        <td className="p-5">
                          <p className="font-bold text-slate-800 text-sm mb-1 line-clamp-1">{post.title}</p>
                          <p className="text-[10px] text-slate-400 font-bold flex gap-3 uppercase">
                            <span className="flex items-center gap-1"><User size={12}/> {post.authorName}</span>
                            <span className="flex items-center gap-1"><Clock size={12}/> {post.createdAt?.split('T')[0]}</span>
                          </p>
                        </td>
                        <td className="p-5 text-right">
                          <div className="flex justify-end gap-2">
                            <button onClick={() => handleShowDetail(post, 'board')} className="p-2.5 bg-slate-100 hover:bg-white text-slate-600 rounded-xl shadow-sm border border-slate-100 transition-all"><Eye size={15}/></button>
                            <button onClick={(e) => handleDeleteItem(e, post.boardId, 'board')} className="p-2.5 bg-rose-50 hover:bg-rose-500 hover:text-white text-rose-500 rounded-xl transition-all"><Trash2 size={15}/></button>
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
            {loading ? <div className="col-span-full text-center py-20 text-slate-400 font-bold uppercase tracking-widest">Loading Reports...</div> : (
              reportList.length === 0 ? <div className="col-span-full text-center py-20 text-slate-400 font-bold bg-slate-50 rounded-[2rem] border border-dashed border-slate-200">현재 대기 중인 신고 건이 없습니다.</div> :
              reportList.map((report) => (
                <div key={report.reportId} className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-rose-50 rounded-xl text-rose-500">
                        {reportSubTab === 'comments' ? <MessageSquare size={16}/> : <Layers3 size={16}/>}
                      </div>
                      <p className="font-black text-slate-800 text-sm line-clamp-1">{report.postTitle || (reportSubTab === 'comments' ? '신고된 댓글' : '신고된 게시글')}</p>
                    </div>
                    <span className="text-[9px] bg-amber-100 text-amber-700 px-2.5 py-1 rounded-lg font-black tracking-tighter">PENDING</span>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl mb-5 border border-slate-100">
                    <p className="text-[10px] text-slate-400 font-black mb-1.5 flex items-center gap-1 uppercase tracking-wider"><AlertCircle size={12}/> Reason</p>
                    <p className="text-xs text-slate-700 font-bold leading-relaxed">{report.reason}</p>
                  </div>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => handleShowDetail(report, reportSubTab === 'boards' ? 'board' : 'comment')} 
                      className="flex-1 py-3.5 text-xs bg-white border border-slate-200 text-slate-600 rounded-2xl font-black hover:bg-slate-50 transition-all shadow-sm"
                    >
                      상세 확인
                    </button>
                    <button 
                      onClick={(e) => handleApprove(e, report.reportId, reportSubTab === 'boards' ? report.boardId : report.commentId)} 
                      className="flex-1 py-3.5 text-xs bg-rose-500 text-white rounded-2xl font-black shadow-lg shadow-rose-100 hover:bg-rose-600 transition-all"
                    >
                      신고 승인
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* [통합] 상세보기 모달 */}
      {selectedItem && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-[9999] p-4 backdrop-blur-md" onClick={() => setSelectedItem(null)}>
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
              <span className="text-[10px] font-black text-rose-500 bg-rose-50 px-3 py-1 rounded-full uppercase tracking-widest">
                {selectedItem.type === 'comment' ? 'Comment Detail' : 'Post Detail'}
              </span>
              <button onClick={() => setSelectedItem(null)} className="p-2 hover:bg-white rounded-full text-slate-400 transition-colors"><X size={20}/></button>
            </div>
            <div className="p-8 space-y-4 max-h-[50vh] overflow-y-auto custom-scrollbar">
              {selectedItem.title && <h4 className="text-xl font-black text-slate-900 leading-tight tracking-tight">{selectedItem.title}</h4>}
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-bold border-b border-slate-50 pb-4">
                <span className="flex items-center gap-1.5"><User size={14} className="text-rose-400"/> {selectedItem.authorName || 'Anonymous'}</span>
                <span className="flex items-center gap-1.5"><Clock size={14}/> {selectedItem.createdAt?.replace('T', ' ')}</span>
              </div>
              <div className="text-slate-700 whitespace-pre-wrap py-4 leading-relaxed text-sm font-medium">
                {selectedItem.content}
              </div>
            </div>
            <div className="p-6 bg-slate-50/50 flex gap-3 border-t border-slate-100">
              <button onClick={() => setSelectedItem(null)} className="flex-1 py-4 bg-white border border-slate-200 rounded-2xl font-black text-slate-500 hover:bg-slate-100 transition-all">닫기</button>
              <button 
                onClick={(e) => handleDeleteItem(e, selectedItem.boardId || selectedItem.commentId, selectedItem.type)} 
                className="flex-1 py-4 bg-rose-500 text-white rounded-2xl font-black hover:bg-rose-600 shadow-xl shadow-rose-100 transition-all"
              >
                영구 삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}