import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { AlertCircle, Eye, Trash2, Search, Flag, X, Clock, User, RefreshCw, Layers3 } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

export default function AdminCommunity() {
  const [activeTab, setActiveTab] = useState('posts'); // 상위 탭: posts, reports
  const [reportSubTab, setReportSubTab ] = useState('boards');
  const [searchQuery, setSearchQuery] = useState('');

  const [reportList, setReportList] = useState([]);
  const [postList, setPostList] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPosts();
    fetchReports();
  }, []);
  
  useEffect(() => {
    if (activeTab === 'posts') fetchPosts();
    else fetchReports();
  }, [activeTab]);

  // 신고 목록
  const fetchReports = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const response = await axios.get('/msa/core/board/admin/reports/boards', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setReportList(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      toast.error("신고 목록을 가져오지 못했습니다.");
    } finally { setLoading(false); }
  };

  // 게시글 목록 (컨트롤러의 /list API 활용)
  const fetchPosts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      // 컨트롤러의 @GetMapping("/list") 경로에 맞춤
      const response = await axios.get('/msa/core/board/list', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setPostList(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("게시글 로드 에러:", error);
      toast.error("게시글 목록을 불러오지 못했습니다.");
    } finally { setLoading(false); }
  };

  // 상세보기 (컨트롤러의 @GetMapping("/{id}") 활용)
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

  // 삭제 (컨트롤러의 @DeleteMapping("/{id}") 활용)
  const handleDeletePost = async (e, id) => {
    if (e) e.stopPropagation();
    if (!window.confirm("이 게시글을 삭제하시겠습니까?")) return;

    try {
      const token = localStorage.getItem('accessToken');
      await axios.delete(`/msa/core/board/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      toast.success('삭제되었습니다.');
      fetchPosts();
      setSelectedPost(null);
    } catch (error) {
      toast.error("삭제 처리에 실패했습니다.");
    }
  };

  // 신고 승인 (성공했던 주소 유지)
  const handleApprove = async (e, reportId, boardId) => {
    if (e) e.stopPropagation();
    try {
      const token = localStorage.getItem('accessToken');
      await axios.put(`/msa/core/admin/board/report/${reportId}/approve`, 
        { boardId }, 
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      toast.success('승인되었습니다.');
      fetchReports();
    } catch (error) {
      toast.error("처리 중 오류 발생");
    }
  };

  // 검색 필터 (BoardDTO 필드명인 authorName 사용)
  const filteredPosts = postList.filter((p) =>
    p.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.authorName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Layout role="admin">
      <div className="p-4 lg:p-6 space-y-6">
        <h1 className="text-2xl font-bold">게시판 관리</h1>

        {/* 탭 메뉴 */}
        <div className="flex gap-2 bg-amber-50 p-1 rounded-2xl">
          <button onClick={() => setActiveTab('posts')} className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === 'posts' ? 'bg-white text-amber-600 shadow-sm' : 'text-muted-foreground'}`}>
            <Layers3 size={16} className="inline mr-2" /> 게시글 관리
          </button>
          <button onClick={() => setActiveTab('reports')} className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === 'reports' ? 'bg-white text-amber-600 shadow-sm' : 'text-muted-foreground'}`}>
            <Flag size={16} className="inline mr-2" /> 신고 처리 ({reportList.length})
          </button>
        </div>

        {/* 게시글 관리 목록 */}
        {activeTab === 'posts' && (
          <div className="space-y-4">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input type="text" placeholder="검색..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-9 pr-4 py-2.5 bg-white border border-amber-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-300" />
            </div>
            
            <div className="glass-card rounded-2xl overflow-hidden soft-shadow bg-white">
              {loading ? <div className="text-center py-20">로딩 중...</div> : (
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-amber-100 bg-amber-50/30">
                      <th className="p-4 text-xs font-semibold text-muted-foreground uppercase">게시글</th>
                      <th className="p-4 text-xs font-semibold text-muted-foreground uppercase text-right">관리</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPosts.map((post) => (
                      <tr key={post.boardId} className="border-b border-amber-50 hover:bg-amber-50/30 transition-colors">
                        <td className="p-4">
                          <p className="font-semibold text-sm line-clamp-1">{post.title}</p>
                          <p className="text-[10px] text-muted-foreground mt-1 flex gap-2">
                            <span className="flex items-center gap-0.5"><User size={10}/> {post.authorName}</span>
                            <span className="flex items-center gap-0.5"><Clock size={10}/> {post.createdAt}</span>
                          </p>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-1">
                            <button onClick={() => fetchPostDetail(post.boardId)} className="p-2 hover:bg-amber-50 rounded-lg"><Eye size={14}/></button>
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
        )}

        {/* 신고 처리 목록 (기존 유지) */}
        {activeTab === 'reports' && (
          <div className="space-y-4">
            {reportList.map((report) => (
              <div key={report.reportId} className="glass-card rounded-2xl p-4 bg-white border border-amber-50 shadow-sm">
                <div className="flex justify-between mb-2">
                   <p className="font-bold text-sm">{report.postTitle || `게시글 #${report.boardId}`}</p>
                   <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold">PENDING</span>
                </div>
                <p className="text-xs text-amber-700 bg-amber-50 p-2 rounded-lg mb-3 flex items-center gap-2">
                  <AlertCircle size={12}/> 사유: {report.reason}
                </p>
                <div className="flex gap-2">
                  <button onClick={() => fetchPostDetail(report.boardId)} className="flex-1 py-2 text-xs bg-gray-50 rounded-xl font-bold">내용 확인</button>
                  <button onClick={(e) => handleApprove(e, report.reportId, report.boardId)} className="flex-1 py-2 text-xs bg-red-500 text-white rounded-xl font-bold">승인(숨김)</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 상세보기 모달 */}
      {selectedPost && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4 backdrop-blur-sm" onClick={() => setSelectedPost(null)}>
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b bg-amber-50 flex justify-between items-center">
              <h3 className="font-bold">상세 내용</h3>
              <button onClick={() => setSelectedPost(null)}><X size={20}/></button>
            </div>
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              <h4 className="text-xl font-bold">{selectedPost.title}</h4>
              <p className="text-sm text-gray-500 border-b pb-2">작성자: {selectedPost.authorName} | {selectedPost.createdAt}</p>
              <div className="text-gray-700 whitespace-pre-wrap py-2">{selectedPost.content}</div>
            </div>
            <div className="p-6 bg-gray-50 flex gap-2">
              <button onClick={() => setSelectedPost(null)} className="flex-1 py-3 bg-white border rounded-2xl font-bold text-gray-500">닫기</button>
              <button onClick={(e) => handleDeletePost(e, selectedPost.boardId)} className="flex-1 py-3 bg-red-500 text-white rounded-2xl font-bold">영구 삭제</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}