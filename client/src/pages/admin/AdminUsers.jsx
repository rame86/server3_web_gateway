/**
 * Lumina - Admin Users Management
 * Soft Bloom Design: User management with enhanced detail & admin authority
 * [FIX]: Added missing 'User' import to resolve ReferenceError
 */

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { 
  Users, User, Search, Download, Eye, Ban, MoreVertical, Filter, 
  TrendingUp, Clock, MapPin, Phone, CreditCard, History, 
  UserPlus, LogOut, Trash2, Key, X, AlertCircle, Save, Mail, Package 
} from 'lucide-react'; // 👈 User 아이콘 추가 완료!
import { toast } from 'sonner';

// [1] 확장된 사용자 데이터 (상세 정보 및 히스토리 포함)
const mockUsers = [
  { 
    id: 1, name: '별빛팬', email: 'starlight@example.com', joinDate: '2025-12-01', status: 'active', 
    purchases: 8, points: 45200, avatar: '⭐',
    phone: '010-1111-2222', address: '서울특별시 강남구 테헤란로 123',
    lastLoginIp: '192.168.0.15', lastLoginTime: '2026-03-18 10:25:03',
    memo: '굿즈 대량 구매자, 특별 관리 요망',
    purchaseHistory: [
      { id: 'ORD-001', item: 'NOVA 응원봉', date: '2026-03-01', amount: 45000 },
      { id: 'ORD-002', item: '포토카드 세트', date: '2026-02-15', amount: 15000 }
    ],
    pointHistory: [
      { date: '2026-03-01', type: '사용', amount: -500, detail: '응원봉 구매 할인' },
      { date: '2026-02-28', type: '충전', amount: 10000, detail: '직접 충전' }
    ]
  },
  { 
    id: 2, name: '달빛소녀', email: 'moonlight@example.com', joinDate: '2025-11-15', status: 'active', 
    purchases: 15, points: 120000, avatar: '🌙',
    phone: '010-3333-4444', address: '부산광역시 해운대구 우동 456',
    lastLoginIp: '211.234.55.10', lastLoginTime: '2026-03-17 22:10:45',
    memo: '',
    purchaseHistory: [], pointHistory: []
  },
  { 
    id: 3, name: '하늘별', email: 'skystar@example.com', joinDate: '2026-01-10', status: 'suspended', 
    purchases: 2, points: 5000, avatar: '☁️',
    phone: '010-9999-8888', address: '인천광역시 남동구 구월동 789',
    lastLoginIp: '125.130.11.2', lastLoginTime: '2026-02-20 14:05:12',
    memo: '비매너 채팅으로 인한 일시 정지'
  }
];

const statusColors = {
  active: { badge: 'badge-mint', label: '활성' },
  suspended: { badge: 'bg-red-50 text-red-600', label: '정지' },
  pending: { badge: 'badge-lavender', label: '대기' }
};

export default function AdminUsers() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  
  // 서버 카운트 상태
  const [counts, setCounts] = useState({ total: 584291, active: 571842, suspended: 12449 });

  // 모달 및 드롭다운 상태
  const [selectedUser, setSelectedUser] = useState(null); // 상세보기
  const [blockingUser, setBlockingUser] = useState(null); // 차단 설정
  const [blockReason, setBlockReason] = useState('');
  const [menuOpenId, setMenuOpenId] = useState(null); // 드롭다운 메뉴

  const filteredUsers = mockUsers.filter((user) => {
    const matchesSearch = user.name.includes(searchTerm) || user.email.includes(searchTerm);
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // --- 관리자 액션 핸들러 ---
  const handleResetPassword = (name) => {
    toast.success(`"${name}" 님의 비밀번호가 임시 비밀번호로 초기화되었습니다.`);
    setMenuOpenId(null);
  };

  const handleChangeRole = (name, role) => {
    toast.success(`"${name}" 님의 권한이 ${role}(으)로 변경되었습니다.`);
    setMenuOpenId(null);
  };

  const handleForceLogout = (name) => {
    toast.info(`"${name}" 사용자를 강제 로그아웃 처리했습니다.`);
    setMenuOpenId(null);
  };

  const handleDeleteUser = (name) => {
    if(confirm(`"${name}" 사용자를 영구 삭제하시겠습니까?`)) {
      toast.error('사용자 계정이 삭제되었습니다.');
      setMenuOpenId(null);
    }
  };

  const handleBlockConfirm = () => {
    if(!blockReason.trim()) return toast.error('차단 사유를 입력해주세요.');
    toast.error(`"${blockingUser.name}" 차단 완료. 사유: ${blockReason}`);
    setBlockingUser(null);
    setBlockReason('');
  };

  return (
    <Layout role="admin">
      <div className="min-h-screen bg-background fade-in-up">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-500 via-rose-400 to-pink-400 text-white py-12 px-8 rounded-b-[3rem] shadow-xl">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-3 mb-3">
              <Users size={28} />
              <span className="text-red-100 text-sm font-bold tracking-widest uppercase">User Management Center</span>
            </div>
            <h1 className="text-4xl font-bold font-playfair mb-2">사용자 관리</h1>
            <p className="text-red-50 text-lg">전체 {counts.total.toLocaleString()}명의 사용자를 관리 중입니다.</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 -mt-10 space-y-8 pb-20">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-card rounded-3xl p-6 soft-shadow border-white/50">
              <div className="flex justify-between items-start mb-4">
                <span className="text-muted-foreground text-sm font-bold">전체 사용자</span>
                <Users className="text-rose-400" size={20} />
              </div>
              <p className="text-4xl font-black text-foreground font-dm-sans">{counts.total.toLocaleString()}</p>
              <p className="text-xs text-green-600 mt-2 font-bold">↑ 12.3% 증가</p>
            </div>
            <div className="glass-card rounded-3xl p-6 soft-shadow border-white/50">
              <div className="flex justify-between items-start mb-4">
                <span className="text-muted-foreground text-sm font-bold">활성 사용자</span>
                <TrendingUp className="text-emerald-400" size={20} />
              </div>
              <p className="text-4xl font-black text-foreground font-dm-sans">{counts.active.toLocaleString()}</p>
              <p className="text-xs text-blue-600 mt-2 font-bold">97.9% 활성율</p>
            </div>
            <div className="glass-card rounded-3xl p-6 soft-shadow border-white/50">
              <div className="flex justify-between items-start mb-4">
                <span className="text-muted-foreground text-sm font-bold">정지된 사용자</span>
                <Ban className="text-red-400" size={20} />
              </div>
              <p className="text-4xl font-black text-foreground font-dm-sans">{counts.suspended.toLocaleString()}</p>
              <p className="text-xs text-red-600 mt-2 font-bold">2.1% 정지율</p>
            </div>
          </div>

          {/* Controls */}
          <div className="glass-card rounded-3xl p-6 shadow-sm border border-border/50">
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
                  <option value="active">활성</option>
                  <option value="suspended">정지</option>
                  <option value="pending">대기</option>
                </select>
              </div>
              <button
                onClick={() => toast.success('내보내기 완료')}
                className="btn-primary-gradient text-white rounded-2xl px-4 py-3 font-bold flex items-center justify-center gap-2 shadow-md">
                <Download size={18} /> 내보내기
              </button>
            </div>
          </div>

          {/* Users Table */}
          <div className="glass-card rounded-[2.5rem] shadow-sm border border-white/50 overflow-hidden">
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
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-rose-50/20 transition-colors">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-200 to-pink-200 flex items-center justify-center text-xl shadow-inner border border-white">
                            {user.avatar}
                          </div>
                          <div>
                            <p className="font-bold text-foreground leading-tight">{user.name}</p>
                            <p className="text-xs text-muted-foreground font-medium">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-sm font-medium text-slate-600">{user.joinDate}</td>
                      <td className="px-6 py-5">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${statusColors[user.status].badge}`}>
                          {statusColors[user.status].label}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-sm font-bold text-foreground font-dm-sans">{user.purchases}건</td>
                      <td className="px-6 py-5 text-sm font-black text-primary font-dm-sans">{user.points.toLocaleString()}P</td>
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => setSelectedUser(user)} className="p-3 bg-muted rounded-2xl text-primary hover:bg-primary hover:text-white transition-all shadow-sm">
                            <Eye size={18} />
                          </button>
                          <button onClick={() => setBlockingUser(user)} className="p-3 bg-red-50 rounded-2xl text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm">
                            <Ban size={18} />
                          </button>
                          
                          <div className="relative">
                            <button onClick={() => setMenuOpenId(menuOpenId === user.id ? null : user.id)} className="p-3 bg-slate-50 rounded-2xl text-slate-400 hover:bg-slate-200 transition-all">
                              <MoreVertical size={18} />
                            </button>
                            
                            {menuOpenId === user.id && (
                              <div className="absolute right-0 mt-2 w-48 glass-card bg-white rounded-2xl shadow-2xl border border-border/50 z-[100] py-2">
                                <button onClick={() => handleResetPassword(user.name)} className="w-full px-4 py-2 text-left text-xs font-bold text-slate-600 hover:bg-rose-50 hover:text-primary flex items-center gap-2">
                                  <Key size={14}/> 비밀번호 초기화
                                </button>
                                <button onClick={() => handleChangeRole(user.name, '관리자')} className="w-full px-4 py-2 text-left text-xs font-bold text-slate-600 hover:bg-rose-50 hover:text-primary flex items-center gap-2">
                                  <UserPlus size={14}/> 권한 변경
                                </button>
                                <button onClick={() => handleForceLogout(user.name)} className="w-full px-4 py-2 text-left text-xs font-bold text-amber-600 hover:bg-amber-50 flex items-center gap-2">
                                  <LogOut size={14}/> 강제 로그아웃
                                </button>
                                <div className="h-[1px] bg-border/50 my-1"></div>
                                <button onClick={() => handleDeleteUser(user.name)} className="w-full px-4 py-2 text-left text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-2">
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
              <p className="text-xs font-bold text-muted-foreground tracking-tight">총 {filteredUsers.length}명의 사용자 표시 중</p>
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-white border border-border rounded-xl text-xs font-black text-muted-foreground">PREV</button>
                <button className="px-4 py-2 btn-primary-gradient text-white rounded-xl text-xs font-black">1</button>
                <button className="px-4 py-2 bg-white border border-border rounded-xl text-xs font-black text-muted-foreground">NEXT</button>
              </div>
            </div>
          </div>
        </div>

        {/* --- Modals --- */}

        {/* [1] 상세 보기 모달 */}
        {selectedUser && (
          <div className="fixed inset-0 w-full h-full z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="glass-card w-full max-w-4xl rounded-[3rem] overflow-hidden shadow-2xl bg-white flex flex-col max-h-[90vh]">
              <div className="p-8 border-b bg-gradient-to-r from-rose-500 to-pink-500 text-white shrink-0">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-3xl bg-white/20 backdrop-blur-md flex items-center justify-center text-4xl border border-white/30">
                      {selectedUser.avatar}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold font-playfair">{selectedUser.name} <span className="text-xs font-bold opacity-70 ml-2">ID: {selectedUser.id}</span></h2>
                      <p className="text-white/80 font-medium">{selectedUser.email}</p>
                    </div>
                  </div>
                  <button onClick={() => setSelectedUser(null)} className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-all">
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
                        <Phone className="text-primary" size={18}/> {selectedUser.phone}
                      </div>
                      <div className="flex items-center gap-3 p-4 bg-secondary/30 rounded-2xl border border-border/50 font-bold text-xs">
                        <MapPin className="text-primary" size={18}/> {selectedUser.address}
                      </div>
                      <div className="flex items-center gap-3 p-4 bg-rose-50/50 rounded-2xl border border-rose-100">
                        <Clock className="text-primary" size={18}/>
                        <div>
                          <p className="text-[9px] text-primary font-bold tracking-widest">RECENT LOGIN</p>
                          <p className="font-bold text-xs text-slate-600">{selectedUser.lastLoginTime} ({selectedUser.lastLoginIp})</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h4 className="font-black text-[10px] uppercase tracking-[0.2em] text-primary flex items-center gap-2"><CreditCard size={14}/> Assets</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                        <p className="text-[10px] text-muted-foreground font-bold">TOTAL PURCHASES</p>
                        <p className="text-2xl font-black text-foreground">{selectedUser.purchases}건</p>
                      </div>
                      <div className="p-5 bg-rose-50 rounded-2xl border border-rose-100">
                        <p className="text-[10px] text-primary font-bold">POINT BALANCE</p>
                        <p className="text-2xl font-black text-primary font-dm-sans">{selectedUser.points.toLocaleString()}P</p>
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
                        {selectedUser.purchaseHistory?.map((h, i) => (
                          <div key={i} className="flex justify-between items-center p-3 bg-white rounded-xl shadow-sm border border-slate-100">
                            <div><p className="text-xs font-bold text-slate-800">{h.item}</p><p className="text-[10px] text-slate-400">{h.date}</p></div>
                            <p className="text-xs font-black text-primary">₩{h.amount.toLocaleString()}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="bg-slate-50/50 p-6 rounded-3xl border border-slate-200">
                      <p className="text-[11px] font-black text-slate-400 mb-4 uppercase">포인트 히스토리</p>
                      <div className="space-y-3">
                        {selectedUser.pointHistory?.map((p, i) => (
                          <div key={i} className="flex justify-between items-center p-3 bg-white rounded-xl shadow-sm border border-slate-100">
                            <div><p className="text-xs font-bold text-slate-800">{p.detail}</p><p className="text-[10px] text-slate-400">{p.date}</p></div>
                            <p className={`text-xs font-black ${p.amount > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>{p.amount.toLocaleString()}P</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-200 space-y-4">
                  <h4 className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2"><Save size={14}/> Admin Memo</h4>
                  <div className="relative">
                    <textarea 
                      defaultValue={selectedUser.memo}
                      placeholder="특이사항 기록..."
                      className="w-full h-24 p-5 rounded-3xl bg-white border border-slate-200 focus:ring-4 focus:ring-primary/10 transition-all text-sm resize-none"
                    />
                    <button className="absolute bottom-4 right-4 p-2 bg-primary text-white rounded-lg shadow-lg hover:scale-105 transition-all"><Save size={16}/></button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* [2] 차단 사유 입력 모달 */}
        {blockingUser && (
          <div className="fixed inset-0 w-full h-full z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="glass-card w-full max-w-md rounded-[2.5rem] p-10 space-y-6 bg-white shadow-2xl border border-red-100 fade-in-up">
              <div className="text-center">
                <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-red-100 shadow-inner">
                  <AlertCircle size={36} />
                </div>
                <h2 className="text-2xl font-bold text-foreground font-playfair">사용자 차단(Block)</h2>
                <p className="text-sm text-muted-foreground mt-2 font-medium leading-relaxed">
                  <span className="text-primary font-bold">"{blockingUser.name}"</span> 사용자를 차단하시겠습니까? 사유를 적어주세요.
                </p>
              </div>
              <textarea 
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                placeholder="욕설 및 비매너 행위 등..."
                className="w-full h-40 p-5 rounded-3xl bg-secondary/30 border-none focus:ring-4 focus:ring-red-100 text-sm leading-relaxed transition-all shadow-inner outline-none"
              />
              <div className="flex gap-3 pt-2">
                <button onClick={() => { setBlockingUser(null); setBlockReason(''); }} className="flex-1 py-4 font-bold text-muted-foreground hover:bg-secondary transition-all">취소</button>
                <button onClick={handleBlockConfirm} className="flex-[1.5] py-4 rounded-2xl bg-red-500 text-white font-bold shadow-xl hover:bg-red-600 active:scale-95 transition-all">차단 확정</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}