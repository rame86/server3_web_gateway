import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { AlertCircle, Eye, Trash2, Search, Flag, X, Clock, User, Layers3, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

export default function AdminCommunity() {
  const [activeTab, setActiveTab] = useState('posts'); // 상위 탭: posts, reports
  const [reportSubTab, setReportSubTab] = useState('boards'); // 신고 하위 탭: boards, comments
  const [searchQuery, setSearchQuery] = useState('');
  
  const [reportList, setReportList] = useState([]);
  const [postList, setPostList] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [loading, setLoading] = useState(false);

  // 탭이 바뀔 때마다 데이터를 갱신합니다.
   useEffect(() => {
    fetchPosts();
    fetchReports();
  }, []);
  
  useEffect(() => {
    if (activeTab === 'posts') fetchPosts();
    else fetchReports();
  }, [activeTab, reportSubTab]);

  // 1. 게시글 목록 가져오기
  const fetchPosts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const response = await axios.get('/msa/core/board/list', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setPostList(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      toast.error("게시글 목록을 불러오지 못했습니다.");
    } finally { setLoading(false); }
  };

  // 2. 신고 목록 가져오기 (게시글/댓글 분기)
  const fetchReports = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      // subTab에 따라 주소 변경
      const endpoint = reportSubTab === 'boards' ? 'reports/boards' : 'reports/comments';
      const response = await axios.get(`/msa/core/board/admin/${endpoint}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setReportList(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      toast.error("신고 목록을 가져오지 못했습니다.");
    } finally { setLoading(false); }
  };

  // 3. 게시글 상세보기
  const fetchPostDetail = async (id) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(`/msa/core/board/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setSelectedPost(response.data);
    } catch (error) {
      toast.error("상세 내용을 불러올 수 없습니다.");
    }
  };

  // 4. 신고 승인 (숨김 처리)
  const handleApprove = async (e, reportId, targetId) => {
    if (e) e.stopPropagation();
    if (!window.confirm("신고를 승인하고 해당 항목을 숨김 처리하시겠습니까?")) return;

    try {
      const token = localStorage.getItem('accessToken');
      const url = reportSubTab === 'boards'
        ? `/msa/core/admin/board/report/${reportId}/approve`
        : `/msa/core/admin/board/report/comment/${reportId}/approve`;

      // 게시글은 boardId, 댓글은 commentId로 데이터 구성
      const data = reportSubTab === 'boards' ? { boardId: targetId } : { commentId: targetId };

      await axios.put(url, data, { 
        headers: { 'Authorization': `Bearer ${token}` } 
      });
      
      toast.success('승인 및 숨김 처리가 완료되었습니다.');
      fetchReports();
    } catch (error) {
      toast.error("처리 중 오류 발생");
    }
  };

  // 5. 영구 삭제
  const handleDeletePost = async (e, id) => {
    if (e) e.stopPropagation();
    if (!window.confirm("이 게시글을 영구적으로 삭제하시겠습니까?")) return;

    try {
      const token = localStorage.getItem('accessToken');
      await axios.delete(`/msa/core/board/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      toast.success('삭제되었습니다.');
      if (activeTab === 'posts') fetchPosts();
      else fetchReports();
      setSelectedPost(null);
    } catch (error) {
      toast.error("삭제 처리에 실패했습니다.");
    }
  };

  const filteredPosts = postList.filter((p) =>
    p.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.authorName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Layout role="admin">
      <div className="p-4 lg:p-6 space-y-6 text-amber-900">
        <h1 className="text-2xl font-bold">게시판 관리</h1>

        {/* 메인 탭 */}
        <div className="flex gap-2 bg-amber-50 p-1 rounded-2xl border border-amber-100">
          <button onClick={() => setActiveTab('posts')} className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === 'posts' ? 'bg-white text-amber-600 shadow-sm' : 'text-muted-foreground'}`}>
            <Layers3 size={16} className="inline mr-2" /> 게시글 관리
          </button>
          <button onClick={() => setActiveTab('reports')} className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === 'reports' ? 'bg-white text-amber-600 shadow-sm' : 'text-muted-foreground'}`}>
            <Flag size={16} className="inline mr-2" /> 신고 처리 ({reportList.length})
          </button>
        </div>

        {/* 신고 하위 탭 (신고 탭일 때만 노출) */}
        {activeTab === 'reports' && (
          <div className="flex gap-4 border-b border-amber-100 mb-4 px-2">
            <button onClick={() => setReportSubTab('boards')} className={`pb-2 text-sm font-bold transition-all ${reportSubTab === 'boards' ? 'text-amber-600 border-b-2 border-amber-600' : 'text-gray-400'}`}>
              게시글 신고
            </button>
            <button onClick={() => setReportSubTab('comments')} className={`pb-2 text-sm font-bold transition-all ${reportSubTab === 'comments' ? 'text-amber-600 border-b-2 border-amber-600' : 'text-gray-400'}`}>
              댓글 신고
            </button>
          </div>
        )}

        {/* 목록 섹션 */}
        {activeTab === 'posts' ? (
          <div className="space-y-4">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input type="text" placeholder="제목 또는 작성자 검색..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-9 pr-4 py-2.5 bg-white border border-amber-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 shadow-sm" />
            </div>
            
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-amber-50">
              {loading ? <div className="text-center py-20 text-gray-400">데이터 로딩 중...</div> : (
                <table className="w-full text-left">
                  <thead className="bg-amber-50/50">
                    <tr className="border-b border-amber-100">
                      <th className="p-4 text-xs font-semibold text-amber-800 uppercase font-bold">내용</th>
                      <th className="p-4 text-xs font-semibold text-amber-800 uppercase text-right font-bold">관리</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPosts.map((post) => (
                      <tr key={post.boardId} className="border-b border-amber-50 hover:bg-amber-50/20 transition-colors">
                        <td className="p-4">
                          <p className="font-semibold text-sm line-clamp-1">{post.title}</p>
                          <p className="text-[10px] text-muted-foreground mt-1 flex gap-2">
                            <span className="flex items-center gap-0.5"><User size={10}/> {post.authorName}</span>
                            <span className="flex items-center gap-0.5"><Clock size={10}/> {post.createdAt}</span>
                          </p>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-1">
                            <button onClick={() => fetchPostDetail(post.boardId)} className="p-2 hover:bg-amber-50 text-amber-600 rounded-lg"><Eye size={14}/></button>
                            <button onClick={(e) => handleDeletePost(e, post.boardId)} className="p-2 hover:bg-red-50 text-red-500 rounded-lg"><Trash2 size={14}/></button>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {loading ? <div className="col-span-full text-center py-20 text-gray-400">신고 내역 로드 중...</div> : (
              reportList.length === 0 ? <div className="col-span-full text-center py-20 text-gray-400">대기 중인 신고가 없습니다.</div> :
              reportList.map((report) => (
                <div key={report.reportId} className="bg-white rounded-2xl p-5 border border-amber-100 shadow-sm hover:shadow-md transition-all">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      {reportSubTab === 'comments' ? <MessageSquare size={14} className="text-amber-500"/> : <Layers3 size={14} className="text-amber-500"/>}
                      <p className="font-bold text-sm">{report.postTitle || `대상 ID: ${report.boardId || report.commentId}`}</p>
                    </div>
                    <span className="text-[10px] bg-red-100 text-red-600 px-2.5 py-1 rounded-full font-extrabold shadow-sm">PENDING</span>
                  </div>
                  <p className="text-xs text-amber-700 bg-amber-50/50 p-3 rounded-xl mb-4 flex items-center gap-2 border border-amber-100">
                    <AlertCircle size={14} className="text-amber-600"/> 사유: {report.reason}
                  </p>
                  <div className="flex gap-2">
                    {reportSubTab === 'boards' && (
                      <button onClick={() => fetchPostDetail(report.boardId)} className="flex-1 py-2.5 text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl font-bold transition-colors">내용 확인</button>
                    )}
                    <button onClick={(e) => handleApprove(e, report.reportId, reportSubTab === 'boards' ? report.boardId : report.commentId)} className="flex-1 py-2.5 text-xs bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold shadow-sm transition-colors">승인(숨김)</button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* 상세보기 모달 */}
      {selectedPost && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999] p-4 backdrop-blur-sm" onClick={() => setSelectedPost(null)}>
          <div className="bg-white rounded-[2rem] w-full max-w-lg overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-amber-100 bg-amber-50/50 flex justify-between items-center">
              <h3 className="font-bold text-amber-900 flex items-center gap-2"><Eye size={18}/> 상세 내용</h3>
              <button onClick={() => setSelectedPost(null)} className="p-2 hover:bg-white rounded-full transition-colors"><X size={20}/></button>
            </div>
            <div className="p-8 space-y-4 max-h-[60vh] overflow-y-auto">
              <h4 className="text-xl font-bold text-amber-900 leading-tight">{selectedPost.title}</h4>
              <div className="flex items-center justify-between text-[11px] text-gray-400 border-b border-gray-50 pb-4">
                <span className="flex items-center gap-1"><User size={12}/> {selectedPost.authorName}</span>
                <span className="flex items-center gap-1"><Clock size={12}/> {selectedPost.createdAt}</span>
              </div>
              <div className="text-gray-700 whitespace-pre-wrap py-4 leading-relaxed text-sm">{selectedPost.content}</div>
            </div>
            <div className="p-6 bg-amber-50/30 flex gap-3">
              <button onClick={() => setSelectedPost(null)} className="flex-1 py-3.5 bg-white border border-amber-200 rounded-2xl font-bold text-gray-500 hover:bg-gray-50 transition-colors">닫기</button>
              <button onClick={(e) => handleDeletePost(e, selectedPost.boardId)} className="flex-1 py-3.5 bg-red-500 text-white rounded-2xl font-bold hover:bg-red-600 shadow-md transition-colors">영구 삭제</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}