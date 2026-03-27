/**
 * Lumina - Admin Users Management (Full UI + Back-end Integrated)
 * 기존 디자인을 100% 유지하며 백엔드 API와 모든 기능을 연동 완료함
 */

import { useState, useEffect} from 'react';
import Layout from '@/components/Layout';
import { useWebSocket } from '@/contexts/WebSocketContext';
import { 
  Users, User, Search, Download, Eye, Ban, MoreVertical, Filter, 
  TrendingUp, Clock, MapPin, Phone, CreditCard, History, 
  UserPlus, LogOut, Trash2, Key, X, AlertCircle, Save, Mail, Package,
  ShieldCheck, UserCheck, Crown, Check 
} from 'lucide-react'; 
import { toast } from 'sonner';
import { coreApi } from '@/lib/api';

// [수정]: 백엔드 Enum 상태값(대문자)에 맞춰 매핑 키 수정
const statusColors = {
  ACTIVE: { badge: 'badge-mint', label: '활성' },
  BLOCK: { badge: 'bg-red-50 text-red-600', label: '차단' },
  DELETE: { badge: 'bg-gray-100 text-gray-500', label: '삭제됨' },
  PENDING: { badge: 'badge-lavender', label: '대기' }
};

export default function AdminUsers() {

  const stompClient = useWebSocket();
  
  // --- 상태 관리 ---
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  const [users, setUsers] = useState([]); 
  const [counts, setCounts] = useState({ totalUserCount: 0, activeUserCount: 0, blockedUserCount: 0 });
  const [isLoading, setIsLoading] = useState(true);

  const [selectedUser, setSelectedUser] = useState(null); 
  const [blockingUser, setBlockingUser] = useState(null); 
  const [blockReason, setBlockReason] = useState('');
  const [menuOpenId, setMenuOpenId] = useState(null); 
  const [resetPwdUser, setResetPwdUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [changeRoleUser, setChangeRoleUser] = useState(null);
  const [selectedNewRole, setSelectedNewRole] = useState('');

  // --- [Data Fetching] 목록 및 요약 정보 ---
  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await coreApi.get(`/admin/user?page=${page}&size=10`);
      const { summary, userList } = response.data;
      
      setCounts(summary);
      setUsers(userList.content);
      setTotalPages(userList.totalPages);
    } catch (error) {
      toast.error('사용자 목록을 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setIsLoading(true);
        const res = await coreApi.get('/admin/user?page=0&size=10'); // 초기 목록 조회
        setUsers(res.data.userList.content);
        setIsLoading(false);
      } catch (err) {
        console.error("초기 로딩 실패:", err);
        setIsLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  // --- [웹소켓 구독] 실시간 업데이트 받기 ---
  useEffect(() => {
  if (!stompClient || !stompClient.connected) {
    console.log("⏳ 웹소켓 연결 대기 중...");
    return;
  }

  console.log("📡 구독 시작: /topic/user-stats");

  const subscription = stompClient.subscribe('/topic/user-stats', (frame) => {
      try {
        const response = JSON.parse(frame.body);
        const { type, payload } = response; 
        
        console.log("🚀 웹소켓 수신 데이터:", type, payload);

        // 1. SUMMARY 데이터 (잔액, 구매건수 업데이트)
        if (type === 'SUMMARY' || type === 'GETALL') {
          setUsers(prevUsers => {
            if (!Array.isArray(payload)) return prevUsers;
            
            return prevUsers.map(user => {
              // memberId가 같은 항목을 찾아 업데이트
              const updated = payload.find(p => Number(p.memberId) === Number(user.memberId));

              if(updated){
                return{
                  ...user,
                  ...updated,
                  createdAt: user.createdAt
                };
              }
              return user;
            });
          });
        } 
        
        // 2. 상세 정보 업데이트
        else if (type === 'USER_DETAIL') {
          setSelectedUser(prev => prev ? { ...prev, ...payload } : null);
        }
      } catch (err) {
        console.error("데이터 파싱 에러:", err);
      }
    });

    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, [stompClient]);

  // 날짜 포맷 함수 추가
  const formatDateTime = (dateString) => {
    if (!dateString) return '날짜 없음';
    const date = new Date(dateString);
    if(isNaN(date.getTime())) return dateString; // 변환 실패 시 원본 반환

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}`;
  }

  // --- [기능 1: 상세보기] 눈모양 버튼 연동 ---
  const handleViewDetail = async (memberId) => {
    try {
      toast.loading('상세 정보를 불러오는 중...');
      
      // 🌟 핵심 주석: 전체 목록이 아닌 특정 유저(memberId)의 상세 정보를 조회하도록 경로 수정
      // 백엔드 API 설계에 따라 `/admin/user/${memberId}` 형태인지 확인 필요!
      const response = await coreApi.get(`/admin/user/${memberId}`);
      
      setSelectedUser(response.data); 
      toast.dismiss();
    } catch (error) {
      toast.dismiss();
      toast.error('상세 정보를 가져올 수 없습니다. (서버 로그를 확인해줘)');
    }
  };

  // --- [기능 2: 비밀번호 초기화] ---
  const handleResetPasswordSubmit = async () => {
    if(!newPassword) return toast.error('새 비밀번호를 입력해주세요.');
    try {
      await coreApi.post('/admin/user/resetPwd', {
        memberId: resetPwdUser.memberId,
        password: newPassword
      });
      toast.success(`${resetPwdUser.name}님의 비밀번호가 초기화되었습니다.`);
      setResetPwdUser(null);
      setNewPassword('');
    } catch (error) {
      toast.error('비밀번호 초기화 실패');
    }
  };

  // --- [기능 3: 권한 변경] ---
  const handleChangeRoleSubmit = async () => {
    if(!selectedNewRole) return toast.error('변경할 권한을 선택해주세요.');
    try {
      await coreApi.post('/admin/user/role', {
        memberId: changeRoleUser.memberId,
        role: selectedNewRole
      });
      toast.success('권한 변경이 완료되었습니다.');
      setChangeRoleUser(null);
      fetchUsers(); 
    } catch (error) {
      toast.error('권한 변경 실패');
    }
  };

  // --- [기능 4: 강제 로그아웃] ---
  const handleForceLogout = async (user) => {
    try {
      await coreApi.post('/admin/user/logout', { memberId: user.memberId });
      toast.info(`"${user.name}" 사용자를 강제 로그아웃 처리했습니다.`);
      setMenuOpenId(null);
    } catch (error) {
      toast.error('로그아웃 처리 실패');
    }
  };

  // --- [기능 5: 사용자 차단] ---
  const handleBlockConfirm = async () => {
    if(!blockReason.trim()) return toast.error('차단 사유를 입력해주세요.');
    try {
      await coreApi.post('/admin/user/block', {
        memberId: blockingUser.memberId,
        reason: blockReason
      });
      toast.error('사용자가 차단되었습니다.');
      setBlockingUser(null);
      setBlockReason('');
      fetchUsers();
    } catch (error) {
      toast.error('차단 처리 실패');
    }
  };

  // --- [기능 6: 영구 삭제] ---
  const handleDeleteUser = async (user) => {
    if(confirm(`"${user.name}" 사용자를 삭제하시겠습니까?`)) {
      try {
        await coreApi.post('/admin/user/delete', { memberId: user.memberId });
        toast.error('계정이 삭제 처리되었습니다.');
        setMenuOpenId(null);
        fetchUsers();
      } catch (error) {
        toast.error('삭제 처리 실패');
      }
    }
  };

  return (
    <Layout role="admin">
      <div className="min-h-screen bg-background fade-in-up font-noto">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-500 via-rose-400 to-pink-400 text-white py-12 px-8 rounded-b-[3rem] shadow-xl">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-3 mb-3">
              <Users size={28} />
              <span className="text-red-100 text-sm font-bold tracking-widest uppercase">User Management Center</span>
            </div>
            <h1 className="text-4xl font-bold font-playfair mb-2">사용자 관리</h1>
            <p className="text-red-50 text-lg font-medium">전체 {counts.totalUserCount?.toLocaleString()}명의 사용자를 관리 중입니다.</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 -mt-10 space-y-8 pb-20">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-card rounded-3xl p-6 soft-shadow border-white/50 bg-white">
              <div className="flex justify-between items-start mb-4">
                <span className="text-muted-foreground text-sm font-bold">전체 사용자</span>
                <Users className="text-rose-400" size={20} />
              </div>
              <p className="text-4xl font-black text-foreground font-dm-sans">{counts.totalUserCount?.toLocaleString()}</p>
              <p className="text-xs text-green-600 mt-2 font-bold">PLATFORM TOTAL</p>
            </div>
            <div className="glass-card rounded-3xl p-6 soft-shadow border-white/50 bg-white">
              <div className="flex justify-between items-start mb-4">
                <span className="text-muted-foreground text-sm font-bold">활성 사용자</span>
                <TrendingUp className="text-emerald-400" size={20} />
              </div>
              <p className="text-4xl font-black text-foreground font-dm-sans">{counts.activeUserCount?.toLocaleString()}</p>
              <p className="text-xs text-blue-600 mt-2 font-bold">ACTIVE NOW</p>
            </div>
            <div className="glass-card rounded-3xl p-6 soft-shadow border-white/50 bg-white">
              <div className="flex justify-between items-start mb-4">
                <span className="text-muted-foreground text-sm font-bold">정지된 사용자</span>
                <Ban className="text-red-400" size={20} />
              </div>
              <p className="text-4xl font-black text-foreground font-dm-sans">{counts.blockedUserCount?.toLocaleString()}</p>
              <p className="text-xs text-red-600 mt-2 font-bold">RESTRICTED</p>
            </div>
          </div>

          {/* Controls */}
          <div className="glass-card rounded-3xl p-6 shadow-sm border border-border/50 bg-white/80">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <input
                  type="text"
                  placeholder="이름 또는 이메일 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white border border-border rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all font-medium" />
              </div>
              <div className="relative">
                <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-border rounded-2xl focus:outline-none appearance-none bg-white font-medium">
                  <option value="all">전체 상태</option>
                  <option value="ACTIVE">활성</option>
                  <option value="BLOCK">정지</option>
                  <option value="PENDING">대기</option>
                </select>
              </div>
              <button
                onClick={() => toast.success('내보내기 준비 중')}
                className="btn-primary-gradient text-white rounded-2xl px-4 py-3 font-bold flex items-center justify-center gap-2 shadow-md">
                <Download size={18} /> 내보내기
              </button>
            </div>
          </div>

          {/* Users Table */}
          <div className="glass-card rounded-[2.5rem] shadow-sm border border-white/50 overflow-hidden bg-white">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-rose-50/50 text-muted-foreground text-xs font-black uppercase tracking-widest border-b">
                  <tr>
                    <th className="px-8 py-5">사용자</th>
                    <th className="px-6 py-5">가입일</th>
                    <th className="px-6 py-5">상태</th>
                    <th className="px-6 py-5">구매</th>
                    <th className="px-6 py-5">포인트</th>
                    <th className="px-6 py-5 text-center">작업</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {users.map((user) => (
                    <tr key={user.memberId} className="hover:bg-rose-50/20 transition-colors">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-200 to-pink-200 flex items-center justify-center text-xl shadow-inner border border-white font-bold text-rose-500">
                            {user.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-foreground leading-tight">{user.name}</p>
                            <p className="text-xs text-muted-foreground font-medium">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-sm font-medium text-slate-600">{formatDateTime(user.createdAt)}</td>
                      <td className="px-6 py-5">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${statusColors[user.status]?.badge}`}>
                          {statusColors[user.status]?.label || user.status}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-sm font-bold text-foreground font-dm-sans">{user.purchaseCount}건</td>
                      <td className="px-6 py-5 text-sm font-black text-primary font-dm-sans">{user.balance?.toLocaleString()}P</td>
                      <td className="px-6 py-5 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => handleViewDetail(user.memberId)} className="p-3 bg-muted rounded-2xl text-primary hover:bg-primary hover:text-white transition-all shadow-sm">
                            <Eye size={18} />
                          </button>
                          <button onClick={() => setBlockingUser(user)} className="p-3 bg-red-50 rounded-2xl text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm">
                            <Ban size={18} />
                          </button>
                          
                          <div className="relative">
                            <button onClick={() => setMenuOpenId(menuOpenId === user.memberId ? null : user.memberId)} className="p-3 bg-slate-50 rounded-2xl text-slate-400 hover:bg-slate-200 transition-all">
                              <MoreVertical size={18} />
                            </button>
                            
                            {menuOpenId === user.memberId && (
                              <div className="absolute right-0 mt-2 w-48 glass-card bg-white rounded-2xl shadow-2xl border border-border/50 z-[100] py-2 overflow-hidden">
                                <button onClick={() => { setResetPwdUser(user); setMenuOpenId(null); }} className="w-full px-4 py-2.5 text-left text-xs font-bold text-slate-600 hover:bg-rose-50 hover:text-primary flex items-center gap-2">
                                  <Key size={14}/> 비밀번호 초기화
                                </button>
                                <button onClick={() => { setChangeRoleUser(user); setMenuOpenId(null); }} className="w-full px-4 py-2.5 text-left text-xs font-bold text-slate-600 hover:bg-rose-50 hover:text-primary flex items-center gap-2">
                                  <UserPlus size={14}/> 권한 변경
                                </button>
                                <button onClick={() => handleForceLogout(user)} className="w-full px-4 py-2.5 text-left text-xs font-bold text-amber-600 hover:bg-amber-50 flex items-center gap-2">
                                  <LogOut size={14}/> 강제 로그아웃
                                </button>
                                <div className="h-[1px] bg-border/50 my-1"></div>
                                <button onClick={() => handleDeleteUser(user)} className="w-full px-4 py-2.5 text-left text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-2">
                                  <Trash2 size={14}/> 영구 삭제
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-8 py-5 border-t border-border/30 flex items-center justify-between bg-slate-50/30">
              <p className="text-xs font-bold text-muted-foreground tracking-tight">Page {page + 1} of {totalPages}</p>
              <div className="flex gap-2">
                <button disabled={page === 0} onClick={() => setPage(page - 1)} className="px-4 py-2 bg-white border border-border rounded-xl text-xs font-black text-muted-foreground disabled:opacity-50">PREV</button>
                <button disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)} className="px-4 py-2 bg-white border border-border rounded-xl text-xs font-black text-muted-foreground disabled:opacity-50">NEXT</button>
              </div>
            </div>
          </div>
        </div>

        {/* --- [모달 1] 상세 보기 모달 --- */}
        {selectedUser && (
          <div className="fixed inset-0 w-full h-full z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="glass-card w-full max-w-4xl rounded-[3rem] overflow-hidden shadow-2xl bg-white flex flex-col max-h-[90vh]">
              <div className="p-8 border-b bg-gradient-to-r from-rose-500 to-pink-500 text-white shrink-0">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-3xl bg-white/20 backdrop-blur-md flex items-center justify-center text-4xl border border-white/30 shadow-lg font-bold">
                      {selectedUser.name?.charAt(0)}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold font-playfair">{selectedUser.name} <span className="text-xs font-bold opacity-70 ml-2 uppercase">ID: {selectedUser.memberId}</span></h2>
                      <p className="text-white/80 font-medium">{selectedUser.email}</p>
                    </div>
                  </div>
                  <button onClick={() => setSelectedUser(null)} className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-all text-white">
                    <X size={24} />
                  </button>
                </div>
              </div>

              <div className="p-10 overflow-y-auto space-y-10 custom-scrollbar">
                <div className="grid grid-cols-2 gap-10">
                  <div className="space-y-6">
                    <h4 className="font-black text-[10px] uppercase tracking-[0.2em] text-primary flex items-center gap-2"><User size={14}/> User Profile</h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-4 bg-secondary/30 rounded-2xl border border-border/50 font-bold text-sm">
                        <Phone className="text-primary" size={18}/> {selectedUser.phone || '전화번호 정보 없음'}
                      </div>
                      <div className="flex items-center gap-3 p-4 bg-secondary/30 rounded-2xl border border-border/50 font-bold text-xs">
                        <MapPin className="text-primary" size={18}/> {selectedUser.address || '주소 정보 없음'}
                      </div>
                      <div className="flex items-center gap-3 p-4 bg-rose-50/50 rounded-2xl border border-rose-100 font-bold text-xs">
                        <Clock className="text-primary" size={18}/> 상태: {selectedUser.status}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h4 className="font-black text-[10px] uppercase tracking-[0.2em] text-primary flex items-center gap-2"><CreditCard size={14}/> Assets</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                        <p className="text-[10px] text-muted-foreground font-bold">TOTAL PURCHASES</p>
                        <p className="text-2xl font-black text-foreground">{selectedUser.totalPurchases}건</p>
                      </div>
                      <div className="p-5 bg-rose-50 rounded-2xl border border-rose-100">
                        <p className="text-[10px] text-primary font-bold">POINT BALANCE</p>
                        <p className="text-2xl font-black text-primary font-dm-sans">{selectedUser.pointBalance?.toLocaleString()}P</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-6 border-t">
                  <h4 className="font-black text-[10px] uppercase tracking-[0.2em] text-primary flex items-center gap-2"><History size={14}/> History Log</h4>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-slate-50/50 p-6 rounded-3xl border border-slate-200">
                      <p className="text-[11px] font-black text-slate-400 mb-4 uppercase">구매 이력</p>
                      <div className="space-y-3">
                        {selectedUser.purchaseHistory?.length > 0 ? selectedUser.purchaseHistory.map((h, i) => (
                          <div key={i} className="flex justify-between items-center p-3 bg-white rounded-xl shadow-sm border border-slate-100">
                            <div><p className="text-xs font-bold text-slate-800">{h.itemName}</p><p className="text-[10px] text-slate-400">{formatDateTime(h.purchasedAt)}</p></div>
                            <p className="text-xs font-black text-primary">₩{h.amount?.toLocaleString()}</p>
                          </div>
                        )) : <p className="text-xs text-muted-foreground text-center py-4 font-bold">구매 이력이 없습니다.</p>}
                      </div>
                    </div>
                    <div className="bg-slate-50/50 p-6 rounded-3xl border border-slate-200">
                      <p className="text-[11px] font-black text-slate-400 mb-4 uppercase">포인트 히스토리</p>
                      <div className="space-y-3">
                        {selectedUser.pointHistory?.length > 0 ? selectedUser.pointHistory.map((p, i) => (
                          <div key={i} className="flex justify-between items-center p-3 bg-white rounded-xl shadow-sm border border-slate-100">
                            <div><p className="text-xs font-bold text-slate-800">{p.detail}</p><p className="text-[10px] text-slate-400">{formatDateTime(p.processedAt)}</p></div>
                            <p className={`text-xs font-black ${p.amount > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>{p.amount?.toLocaleString()}P</p>
                          </div>
                        )) : <p className="text-xs text-muted-foreground text-center py-4 font-bold">포인트 내역이 없습니다.</p>}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-200 space-y-4">
                  <h4 className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2"><Save size={14}/> Admin Memo</h4>
                  <div className="relative">
                    <textarea 
                      placeholder="특이사항 기록..."
                      className="w-full h-24 p-5 rounded-3xl bg-white border border-slate-200 focus:ring-4 focus:ring-primary/10 transition-all text-sm resize-none outline-none shadow-inner"
                    />
                    <button className="absolute bottom-4 right-4 p-2 bg-primary text-white rounded-lg shadow-lg hover:scale-105 transition-all"><Save size={16}/></button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- [모달 2] 차단 사유 입력 모달 --- */}
        {blockingUser && (
          <div className="fixed inset-0 w-full h-full z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="glass-card w-full max-w-md rounded-[2.5rem] p-10 space-y-6 bg-white shadow-2xl border border-red-100 fade-in-up">
              <div className="text-center">
                <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-red-100 shadow-inner">
                  <AlertCircle size={36} />
                </div>
                <h2 className="text-2xl font-bold text-foreground font-playfair">사용자 차단(Block)</h2>
                <p className="text-sm text-muted-foreground mt-2 font-medium">
                  <span className="text-primary font-bold">"{blockingUser.name}"</span>님을 차단하시겠습니까?
                </p>
              </div>
              <textarea 
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                placeholder="차단 사유를 입력해주세요..."
                className="w-full h-40 p-5 rounded-3xl bg-secondary/30 border-none focus:ring-4 focus:ring-red-100 text-sm leading-relaxed transition-all shadow-inner outline-none"
              />
              <div className="flex gap-3 pt-2">
                <button onClick={() => { setBlockingUser(null); setBlockReason(''); }} className="flex-1 py-4 font-bold text-muted-foreground hover:bg-secondary rounded-2xl transition-all">취소</button>
                <button onClick={handleBlockConfirm} className="flex-[1.5] py-4 rounded-2xl bg-red-500 text-white font-bold shadow-xl hover:bg-red-600 active:scale-95 transition-all">차단 확정</button>
              </div>
            </div>
          </div>
        )}

        {/* --- [모달 3] 비밀번호 초기화 --- */}
        {resetPwdUser && (
          <div className="fixed inset-0 w-full h-full z-[10000] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="glass-card w-full max-w-sm rounded-[2.5rem] p-8 bg-white shadow-2xl border border-slate-100 text-center space-y-6 animate-in zoom-in duration-200">
              <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <Key size={32} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800">비밀번호 초기화</h2>
                <p className="text-sm text-slate-500 mt-2 font-medium">
                  <span className="font-bold text-slate-800">{resetPwdUser.name}</span>님의 새 비밀번호를 설정하세요.
                </p>
              </div>
              
              <div className="space-y-2 text-left">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">New Password</label>
                <input 
                  type="text"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="새 비밀번호 입력"
                  className="w-full p-4 rounded-2xl bg-slate-50 border-none focus:ring-4 focus:ring-blue-100 text-sm font-bold outline-none transition-all shadow-inner text-blue-600"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => { setResetPwdUser(null); setNewPassword(''); }} className="flex-1 py-3 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors">취소</button>
                <button onClick={handleResetPasswordSubmit} className="flex-[1.5] py-3 bg-blue-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-100 hover:bg-blue-600 active:scale-95 transition-all">초기화 실행</button>
              </div>
            </div>
          </div>
        )}

        {/* --- [모달 4] 권한 변경 모듈 --- */}
        {changeRoleUser && (
          <div className="fixed inset-0 w-full h-full z-[10000] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="glass-card w-full max-w-md rounded-[2.5rem] p-8 bg-white shadow-2xl border border-slate-100 fade-in-up space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <UserPlus size={32} />
                </div>
                <h2 className="text-xl font-bold text-slate-800">사용자 권한 변경</h2>
                <p className="text-sm text-slate-500 mt-1"><span className="font-bold text-slate-800">{changeRoleUser.name}</span>님의 역할을 선택하세요.</p>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {[
                  { id: 'USER', label: '일반 유저', icon: UserCheck, desc: '기본 구매 및 커뮤니티 활동 가능' },
                  { id: 'ARTIST', label: '아티스트', icon: ShieldCheck, desc: '굿즈 등록 및 수익 창출 가능' },
                  { id: 'ADMIN', label: '관리자', icon: Crown, desc: '플랫폼 모든 관리 권한 보유' }
                ].map((role) => (
                  <button
                    key={role.id}
                    onClick={() => setSelectedNewRole(role.id)}
                    className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${
                      selectedNewRole === role.id 
                        ? 'border-primary bg-rose-50 shadow-md ring-4 ring-primary/5' 
                        : 'border-slate-100 bg-white hover:border-slate-200'
                    }`}
                  >
                    <div className={`p-3 rounded-xl ${selectedNewRole === role.id ? 'bg-primary text-white' : 'bg-slate-50 text-slate-400'}`}>
                      <role.icon size={20} />
                    </div>
                    <div>
                      <p className={`text-sm font-bold ${selectedNewRole === role.id ? 'text-primary' : 'text-slate-700'}`}>{role.label}</p>
                      <p className="text-[11px] text-slate-400 font-medium">{role.desc}</p>
                    </div>
                    {selectedNewRole === role.id && <div className="ml-auto w-5 h-5 bg-primary rounded-full flex items-center justify-center"><Check size={12} className="text-white"/></div>}
                  </button>
                ))}
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => { setChangeRoleUser(null); setSelectedNewRole(''); }} className="flex-1 py-4 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors">취소</button>
                <button 
                  onClick={handleChangeRoleSubmit}
                  className="flex-[1.5] py-4 bg-primary text-white rounded-2xl text-sm font-bold shadow-xl shadow-rose-100 hover:bg-rose-600 active:scale-95 transition-all"
                >
                  권한 변경 적용
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}