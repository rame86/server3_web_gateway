/**
 * Lumina - Admin Artists Management
 * Soft Bloom Design: Artist approval, history, and detail management
 * [UPDATE]: Added Suspension Reason Modal functionality
 */

import { useState } from 'react';
import Layout from '@/components/Layout';
import { 
  Search, CheckCircle, Users, User, Eye, Check, X, Clock, Music, 
  History, Mail, Phone, Calendar, TrendingUp, Wallet, FileText, 
  AlertTriangle, Save, ShieldAlert, ExternalLink, Package 
} from 'lucide-react';
import { toast } from 'sonner';

// [1] 데이터: 이력 관리 및 상세 정보 (기존 데이터 유지)
const pendingArtists = [
  { id: 101, name: '김민준', nickname: 'MJ', group: 'ECHO', genre: '발라드', appliedDate: '2026-02-18', status: 'pending', avatar: '🎤', email: 'mj@echo.com', phone: '010-1234-5678' },
  { id: 102, name: '박서연', nickname: 'SY', group: 'AURORA', genre: 'K-POP', appliedDate: '2026-02-17', status: 'pending', avatar: '🎵', email: 'sy@aurora.com', phone: '010-2345-6789' },
  { id: 103, name: '최지훈', nickname: 'JH', group: 'PRISM', genre: 'R&B', appliedDate: '2026-02-16', status: 'pending', avatar: '🎸', email: 'jh@prism.com', phone: '010-3456-7890' }
];

const approvedArtists = [
  { 
    id: 1, name: '김지수', nickname: 'JISOO', group: 'NOVA', genre: 'K-POP', followers: 520000, 
    status: 'active', avatar: '⭐', processedDate: '2026-01-20', admin: '관리자A',
    email: 'jisoo@nova.com', phone: '010-5555-1111', regDate: '2026-01-15',
    stats: { followerTrend: '+12%', revenue: 12500000, balance: 4200000, posts: 124 },
    memo: '우수 활동 아티스트'
  },
  { 
    id: 2, name: '박준호', nickname: 'JUN', group: 'NOVA', genre: 'K-POP', followers: 390000, 
    status: 'active', avatar: '✨', processedDate: '2026-01-22', admin: '관리자B',
    email: 'jun@nova.com', phone: '010-5555-2222', regDate: '2026-01-18',
    stats: { followerTrend: '+5%', revenue: 8900000, balance: 1500000, posts: 86 },
    memo: ''
  }
];

const rejectionHistory = [
  { id: 501, name: '이태용', group: 'SOLO', genre: 'Hip-hop', rejectedDate: '2026-02-10', reason: '서류 미비 및 본인 확인 불가', count: 2 },
  { id: 502, name: '정지안', group: 'LUNA', genre: 'K-POP', rejectedDate: '2026-02-05', reason: '중복 신청 (악성 유저 의심)', count: 5 }
];

const statusColors = {
  active: { badge: 'badge-mint' },
  pending: { badge: 'badge-lavender' },
  suspended: { badge: 'bg-red-50 text-red-600' }
};

export default function AdminArtists() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('pending');
  
  // 모달 상태 관리
  const [detailArtist, setDetailArtist] = useState(null); // 상세보기
  const [rejectArtist, setRejectArtist] = useState(null); // 거절 팝업
  const [rejectReason, setRejectReason] = useState('');
  
  // [추가] 권한 정지 전용 상태
  const [suspensionArtist, setSuspensionArtist] = useState(null); 
  const [suspensionReason, setSuspensionReason] = useState('');

  const filteredPending = pendingArtists.filter(a => a.name.includes(searchQuery) || a.group.includes(searchQuery));
  const filteredApproved = approvedArtists.filter(a => a.name.includes(searchQuery) || a.group.includes(searchQuery));
  const filteredHistory = rejectionHistory.filter(a => a.name.includes(searchQuery));

  const handleApprove = (id) => {
    toast.success('아티스트 승인 완료!');
  };

  const handleRejectSubmit = () => {
    if(!rejectReason.trim()) return toast.error('거절 사유를 입력해주세요.');
    toast.error(`거절 처리되었습니다: ${rejectReason}`);
    setRejectArtist(null);
    setRejectReason('');
  };

  // [추가] 권한 정지 제출 로직
  const handleSuspensionSubmit = () => {
    if(!suspensionReason.trim()) return toast.error('정지 사유를 반드시 입력해야 합니다.');
    toast.warning(`"${suspensionArtist.name}" 아티스트의 권한이 정지되었습니다.`);
    setSuspensionArtist(null);
    setSuspensionReason('');
    // 정지 처리 후 상세보기 모달도 닫아주는 것이 자연스러움
    if(detailArtist) setDetailArtist(null); 
  };

  return (
    <Layout role="admin">
      <div className="min-h-screen bg-background fade-in-up">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary via-rose-400 to-lavender text-white py-12 px-8 rounded-b-[3rem] shadow-xl">
          <div className="max-w-7xl mx-auto flex justify-between items-end">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <Music size={24} className="animate-pulse" />
                <span className="text-white/80 text-sm font-bold tracking-widest uppercase">Artist Control Tower</span>
              </div>
              <h1 className="text-4xl font-bold font-playfair">아티스트 통합 관리</h1>
              <p className="text-white/90 mt-2 font-medium">플랫폼 파트너 승인 및 활동 데이터 모니터링</p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 -mt-10 space-y-8 pb-20">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-card rounded-3xl p-6 soft-shadow border-white/50">
              <div className="flex justify-between items-start mb-4">
                <span className="text-muted-foreground text-sm font-bold">승인 대기</span>
                <Clock className="text-primary" size={20} />
              </div>
              <p className="text-4xl font-black text-foreground font-dm-sans">{pendingArtists.length}</p>
              <div className="mt-2 text-xs font-bold text-rose-400 bg-rose-50 inline-block px-2 py-1 rounded-lg">신규 신청 발생</div>
            </div>
            <div className="glass-card rounded-3xl p-6 soft-shadow border-white/50">
              <div className="flex justify-between items-start mb-4">
                <span className="text-muted-foreground text-sm font-bold">활성 아티스트</span>
                <CheckCircle className="text-emerald-400" size={20} />
              </div>
              <p className="text-4xl font-black text-foreground font-dm-sans">{approvedArtists.length}</p>
              <div className="mt-2 text-xs font-bold text-emerald-500 bg-emerald-50 inline-block px-2 py-1 rounded-lg">정상 운영 중</div>
            </div>
            <div className="glass-card rounded-3xl p-6 soft-shadow border-white/50">
              <div className="flex justify-between items-start mb-4">
                <span className="text-muted-foreground text-sm font-bold">누적 거절 이력</span>
                <AlertTriangle className="text-amber-400" size={20} />
              </div>
              <p className="text-4xl font-black text-foreground font-dm-sans">{rejectionHistory.length}</p>
              <div className="mt-2 text-xs font-bold text-amber-500 bg-amber-50 inline-block px-2 py-1 rounded-lg">재신청 관리 필요</div>
            </div>
          </div>

          {/* Navigation & Search */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex gap-2 bg-secondary/50 p-1.5 rounded-2xl border border-border/50">
              {[
                { key: 'pending', label: `승인 대기`, icon: Clock },
                { key: 'approved', label: '승인 목록', icon: CheckCircle },
                { key: 'history', label: '거절 이력', icon: History }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                    activeTab === tab.key ? 'bg-white text-primary shadow-md' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <tab.icon size={16} />
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <input
                type="text"
                placeholder="아티스트, 그룹 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white border border-border rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all font-medium"
              />
            </div>
          </div>

          {/* Tab Content */}
          <div className="glass-card rounded-[2.5rem] overflow-hidden soft-shadow border-white/50">
            {activeTab === 'pending' && (
              <div className="p-8 space-y-4">
                {filteredPending.map(artist => (
                  <div key={artist.id} className="flex items-center justify-between p-6 bg-white rounded-[2rem] border border-border/50 hover:border-primary/30 transition-all hover-lift">
                    <div className="flex items-center gap-5">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-rose-100 to-lavender flex items-center justify-center text-2xl shadow-inner border-2 border-white">
                        {artist.avatar}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                          {artist.name} <span className="text-xs text-primary font-black px-2 py-0.5 bg-rose-50 rounded-md">NEW</span>
                        </h3>
                        <p className="text-sm text-muted-foreground font-medium">{artist.group} · {artist.genre} · {artist.email}</p>
                        <p className="text-[11px] text-amber-500 font-bold mt-1 flex items-center gap-1"><Clock size={12}/> {artist.appliedDate} 신청</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <button 
                        onClick={() => setDetailArtist(artist)} 
                        className="p-3 bg-slate-100 hover:bg-primary hover:text-white rounded-2xl text-primary transition-all shadow-sm"
                      >
                        <Eye size={20} />
                      </button>
                      <button onClick={() => setRejectArtist(artist)} className="px-5 py-2.5 rounded-2xl bg-red-50 text-red-500 font-bold text-sm border border-red-100 transition-colors">거절</button>
                      <button onClick={() => handleApprove(artist.id)} className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-rose-400 to-primary text-white font-bold text-sm shadow-lg active:scale-95 transition-all">승인하기</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'approved' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-secondary/30 text-muted-foreground text-xs font-black uppercase tracking-widest border-b">
                    <tr>
                      <th className="px-8 py-5 font-bold">아티스트(그룹)</th>
                      <th className="px-6 py-5">이름(닉네임)</th>
                      <th className="px-6 py-5">카테고리</th>
                      <th className="px-6 py-5">처리일</th>
                      <th className="px-6 py-5">담당 관리자</th>
                      <th className="px-6 py-5 text-center">작업</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {filteredApproved.map(artist => (
                      <tr key={artist.id} className="hover:bg-rose-50/20 transition-colors">
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-3">
                            <span className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center border border-border">{artist.avatar}</span>
                            <span className="font-bold text-foreground">{artist.group}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <p className="font-bold text-foreground">{artist.name}</p>
                          <p className="text-xs text-muted-foreground">{artist.nickname}</p>
                        </td>
                        <td className="px-6 py-5"><span className="badge-lavender px-3 py-1 rounded-full text-xs font-bold">{artist.genre}</span></td>
                        <td className="px-6 py-5 text-sm font-medium text-muted-foreground">{artist.processedDate}</td>
                        <td className="px-6 py-5 text-sm font-bold text-foreground">{artist.admin}</td>
                        <td className="px-6 py-5 text-center">
                          <button onClick={() => setDetailArtist(artist)} className="p-3 bg-muted rounded-2xl text-primary hover:bg-primary hover:text-white transition-all shadow-sm">
                            <Eye size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'history' && (
              <div className="p-8 space-y-4">
                {filteredHistory.map(item => (
                  <div key={item.id} className="flex items-center justify-between p-6 bg-slate-50/50 rounded-[2rem] border border-slate-200/50">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 rounded-full bg-slate-200 flex items-center justify-center text-xl grayscale shadow-inner">👤</div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-700">{item.name} <span className="text-xs text-slate-400">({item.group})</span></h3>
                        <p className="text-sm text-red-500 font-bold mt-1 flex items-center gap-1"><ShieldAlert size={14}/> 거절사유: {item.reason}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-500">{item.rejectedDate} 처리</p>
                      <p className="text-xs font-black text-rose-400 mt-1 uppercase">누적 신청 {item.count}회</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* --- Modals (Fixed center) --- */}

        {/* [1] 상세 정보 모달 */}
        {detailArtist && (
          <div className="fixed inset-0 w-full h-full z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
            <div className="glass-card w-full max-w-4xl rounded-[3.1rem] overflow-hidden shadow-2xl bg-white flex flex-col max-h-[90vh]">
              {/* Header */}
              <div className="p-8 border-b bg-gradient-to-r from-primary to-rose-400 text-white shrink-0">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-6">
                    <div className="w-24 h-24 rounded-3xl bg-white/20 backdrop-blur-md flex items-center justify-center text-4xl border border-white/30">
                      {detailArtist.avatar}
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold font-playfair">{detailArtist.name}</h2>
                      <p className="text-white/80 font-medium">@{detailArtist.nickname || 'N/A'} · {detailArtist.group} · {detailArtist.genre}</p>
                      <div className="mt-2 flex gap-2">
                        <span className="px-3 py-1 bg-white/20 rounded-full text-[10px] font-black border border-white/20 uppercase tracking-widest shadow-sm">
                          {detailArtist.status === 'pending' ? '승인 대기 중' : '활동 아티스트'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => setDetailArtist(null)} className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-all text-white">
                    <X size={24} />
                  </button>
                </div>
              </div>

              {/* Scrollable Content */}
              <div className="p-10 overflow-y-auto space-y-10 custom-scrollbar">
                <div className="grid grid-cols-2 gap-10">
                  <div className="space-y-6">
                    <h4 className="font-black text-[10px] uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                      <User size={14}/> Basic Profile
                    </h4>
                    <div className="grid gap-3">
                      <div className="flex items-center gap-3 p-4 bg-secondary/30 rounded-2xl border border-border/50">
                        <Mail className="text-primary" size={18}/>
                        <div>
                          <p className="text-[10px] text-muted-foreground font-bold uppercase">Email</p>
                          <p className="font-bold text-foreground">{detailArtist.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-4 bg-secondary/30 rounded-2xl border border-border/50">
                        <Phone className="text-primary" size={18}/>
                        <div>
                          <p className="text-[10px] text-muted-foreground font-bold uppercase">Contact</p>
                          <p className="font-bold text-foreground">{detailArtist.phone}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-4 bg-secondary/30 rounded-2xl border border-border/50">
                        <Calendar className="text-primary" size={18}/>
                        <div>
                          <p className="text-[10px] text-muted-foreground font-bold uppercase">Registration Date</p>
                          <p className="font-bold text-foreground">{detailArtist.regDate}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h4 className="font-black text-[10px] uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                      <TrendingUp size={14}/> Activity Stats
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <p className="text-[10px] text-muted-foreground font-bold">FOLLOWERS</p>
                        {/* followers가 없으면 0으로 처리 */}
                        <p className="text-xl font-black text-foreground">{(detailArtist.followers / 1000 || 0).toFixed(0)}K</p>
                        {/* stats가 없어도 뻗지 않게 ?. 처리 */}
                        <p className="text-[10px] text-emerald-500 font-bold mt-1">▲ {detailArtist.stats?.followerTrend || '0%'}</p>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <p className="text-[10px] text-muted-foreground font-bold">POSTS</p>
                        <p className="text-xl font-black text-foreground">{detailArtist.stats?.posts}</p>
                        <p className="text-[10px] text-slate-400 font-bold mt-1">Total active</p>
                      </div>
                      <div className="col-span-2 p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex justify-between items-center">
                        <div>
                          <p className="text-[10px] text-emerald-600 font-bold uppercase">Revenue</p>
                          <p className="text-2xl font-black text-emerald-700">₩{detailArtist.stats?.revenue.toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-tighter">Withdrawable</p>
                          <p className="text-lg font-bold text-foreground">₩{detailArtist.stats?.balance.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content Quick Links */}
                <div className="space-y-4 pt-6 border-t">
                   <h4 className="font-black text-[10px] uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                      <ExternalLink size={14}/> Content Quick Links
                    </h4>
                    <div className="flex gap-3">
                      <button className="flex-1 p-5 rounded-[2rem] bg-white border border-border hover:border-primary transition-all flex flex-col items-center gap-2 shadow-sm group text-sm font-bold">
                        <Package className="text-primary group-hover:scale-110 transition-transform" size={24}/>
                        굿즈 목록
                      </button>
                      <button className="flex-1 p-5 rounded-[2rem] bg-white border border-border hover:border-primary transition-all flex flex-col items-center gap-2 shadow-sm group text-sm font-bold">
                        <Calendar className="text-primary group-hover:scale-110 transition-transform" size={24}/>
                        예정 이벤트
                      </button>
                      <button className="flex-1 p-5 rounded-[2rem] bg-white border border-border hover:border-primary transition-all flex flex-col items-center gap-2 shadow-sm group text-sm font-bold">
                        <FileText className="text-primary group-hover:scale-110 transition-transform" size={24}/>
                        게시물 관리
                      </button>
                    </div>
                </div>

                {/* Admin Exclusive 섹션 */}
                <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-200 space-y-6">
                  <div className="flex justify-between items-center">
                    <h4 className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                      <ShieldAlert size={14}/> Admin Only Management
                    </h4>
                    {/* [수정] 권한 일시 정지 클릭 시 사유 입력 모달을 띄우도록 수정 */}
                    <button 
                      onClick={() => setSuspensionArtist(detailArtist)}
                      className="px-5 py-2.5 bg-white border border-red-200 text-red-500 rounded-xl text-[10px] font-black hover:bg-red-50 transition-all flex items-center gap-2 shadow-sm uppercase tracking-tighter"
                    >
                      <ShieldAlert size={14}/> 권한 일시 정지
                    </button>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Admin Memo</label>
                    <div className="relative">
                      <textarea 
                        defaultValue={detailArtist.memo}
                        placeholder="관리자 전용 비고란입니다."
                        className="w-full h-24 p-5 rounded-3xl bg-white border border-slate-200 focus:ring-4 focus:ring-primary/10 transition-all text-sm resize-none"
                      />
                      <button className="absolute bottom-4 right-4 p-2 bg-slate-100 text-slate-500 rounded-lg hover:bg-primary hover:text-white transition-all">
                        <Save size={16}/>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* [2] 신청 거절 모달 (기존 기능 유지) */}
        {rejectArtist && (
          <div className="fixed inset-0 w-full h-full z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="glass-card w-full max-w-md rounded-[2.5rem] p-10 space-y-6 bg-white shadow-2xl border border-red-100 fade-in-up">
              <div className="text-center">
                <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-red-100">
                  <AlertTriangle size={36} />
                </div>
                <h2 className="text-2xl font-bold text-foreground font-playfair">신청 거절 사유</h2>
                <p className="text-sm text-muted-foreground mt-2 font-medium">
                  <span className="text-primary font-bold">"{rejectArtist.name}"</span> 아티스트 신청 거절 사유를 입력하세요.
                </p>
              </div>
              <textarea 
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="구체적인 거절 사유를 입력하세요..."
                className="w-full h-40 p-5 rounded-3xl bg-secondary/30 border-none focus:ring-4 focus:ring-red-100 text-sm leading-relaxed outline-none"
              />
              <div className="flex gap-3 pt-2">
                <button onClick={() => { setRejectArtist(null); setRejectReason(''); }} className="flex-1 py-4 font-bold text-muted-foreground hover:bg-secondary transition-all">취소</button>
                <button onClick={handleRejectSubmit} className="flex-[1.5] py-4 rounded-2xl bg-red-500 text-white font-bold shadow-xl hover:bg-red-600 active:scale-95 transition-all">거절 확정</button>
              </div>
            </div>
          </div>
        )}

        {/* [3] 권한 일시 정지 사유 모달 [신규 추가] */}
        {suspensionArtist && (
          <div className="fixed inset-0 w-full h-full z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
            <div className="glass-card w-full max-w-md rounded-[2.5rem] p-10 space-y-6 bg-white shadow-2xl border border-red-200 fade-in-up">
              <div className="text-center">
                <div className="w-20 h-20 bg-red-600 text-white rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-lg shadow-red-200 animate-pulse">
                  <ShieldAlert size={40} />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 font-playfair">권한 정지 사유</h2>
                <p className="text-sm text-muted-foreground mt-2 font-medium leading-relaxed">
                  <span className="text-red-500 font-bold">"{suspensionArtist.name}"</span> 아티스트의 권한을 정지하시겠습니까?<br/>사유는 아티스트 측에도 통보됩니다.
                </p>
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">Suspension Reason</label>
                <textarea 
                  value={suspensionReason}
                  onChange={(e) => setSuspensionReason(e.target.value)}
                  placeholder="예: 운영 정책 위반, 증빙 서류 허위 기재 등..."
                  className="w-full h-40 p-5 rounded-3xl bg-slate-50 border-none focus:ring-4 focus:ring-red-100 text-sm leading-relaxed transition-all shadow-inner outline-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  onClick={() => { setSuspensionArtist(null); setSuspensionReason(''); }} 
                  className="flex-1 py-4 font-bold text-slate-400 hover:text-slate-600 transition-colors"
                >
                  취소
                </button>
                <button 
                  onClick={handleSuspensionSubmit} 
                  className="flex-[1.5] py-4 rounded-2xl bg-red-600 text-white font-bold shadow-xl hover:bg-red-700 active:scale-95 transition-all uppercase tracking-tighter"
                >
                  정지 확정
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}