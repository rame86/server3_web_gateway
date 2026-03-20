/**
 * Lumina - Admin Artists Management
 * 백엔드 API 연동 버전
 * 
 * [연동된 API]
 * - GET  /admin/artist/approvalList      → 승인 대기 목록 (ArtistResultDTO)
 * - GET  /admin/artist/activeList        → 활성 아티스트 목록 (ArtistResponseDTO)
 * - GET  /admin/artist/{approvalId}/{artistId} → 아티스트 상세 (ArtistResponseDTO)
 * - POST /admin/artist/confirm           → 아티스트 승인 (body: ArtistResultDTO)
 * - POST /admin/artist/reject            → 아티스트 거절 (body: ArtistResultDTO + rejectionReason)
 *
 * [백엔드 추가 구현 필요]
 * - GET  /admin/artist/rejectionList     → 거절 이력 목록 (현재 없음, 임시 빈 배열 처리)
 * - POST /admin/artist/suspend           → 권한 정지 API (현재 없음, UI는 구현됨)
 * - ArtistResponseDTO에 email, phone, nickname, adminName 필드 추가 필요
 */

import { useState, useEffect, useCallback } from 'react';
import Layout from '@/components/Layout';
import {
  Search, CheckCircle, Users, User, Eye, Check, X, Clock, Music,
  History, Mail, Phone, Calendar, TrendingUp, Wallet, FileText,
  AlertTriangle, Save, ShieldAlert, ExternalLink, Package
} from 'lucide-react';
import { toast } from 'sonner';

// ─────────────────────────────────────────────
// API 유틸
// ─────────────────────────────────────────────
// Vite 환경변수: 개발 시 .env.development, 배포 시 .env.production 자동 적용
// .env.development → VITE_API_GATEWAY_URL=http://localhost
// .env.production  → VITE_API_GATEWAY_URL=https://your-gateway.com
// ─────────────────────────────────────────────
// API 유틸 (토큰 제거 버전)
// ─────────────────────────────────────────────
const API_BASE = import.meta.env.VITE_API_GATEWAY_URL ?? '';

async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: 'include', // 세션 쿠키 방식 사용 시 유지
    headers: {
      'Content-Type': 'application/json',
      // 🌟 루아가 '검증'을 시작할 수 있게 '재료'를 넘겨주는 유일한 통로!
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(text || `HTTP ${res.status}`);
  }
  
  // 204 No Content 등 body 없는 경우 처리
  const contentType = res.headers.get('content-type') || '';
  return contentType.includes('application/json') ? res.json() : res.text();
}

// ─────────────────────────────────────────────
// DTO → UI 변환 헬퍼
// ─────────────────────────────────────────────

/**
 * ArtistResultDTO (PENDING) → 컴포넌트 내부 포맷
 * subCategory 예시: "ECHO · 발라드" 또는 "ECHO·발라드"
 */
// 백엔드에서 문자열 "null"로 내려오는 경우 처리
const clean = (v) => (!v || v === 'null' || v === 'undefined') ? null : v;

function mapPending(dto) {
  const artistName = clean(dto.artistName);
  const subRaw = clean(dto.subCategory) || '';
  const parts = subRaw.split(/\s*·\s*/);
  return {
    _raw: dto,
    id: dto.approvalId,
    approvalId: dto.approvalId,
    name: artistName || '-',
    nickname: artistName || '-',
    group: clean(parts[0]) || '-',
    genre: clean(parts[1]) || '-',
    appliedDate: dto.createdAt ? dto.createdAt.slice(0, 10) : '-',
    status: 'pending',
    avatar: '🎤',
    imageUrl: dto.imageUrl,
    description: dto.description,
    email: '-',                         // DTO에 없음 → 백엔드 추가 필요
    phone: '-',                         // DTO에 없음 → 백엔드 추가 필요
    regDate: dto.createdAt ? dto.createdAt.slice(0, 10) : '-',
    stats: null,
    memo: '',
  };
}

/**
 * ArtistResponseDTO (CONFIRMED) → 컴포넌트 내부 포맷
 */
function mapApproved(dto) {
  return {
    _raw: dto,
    id: dto.artistId,
    approvalId: dto.approvalId,
    artistId: dto.artistId,
    name: dto.artistName || '-',
    nickname: dto.artistName || '-',    // DTO에 nickname 없음
    group: dto.category || '-',         // category를 group 대신 활용
    genre: dto.category || '-',
    followers: dto.followerCount || 0,
    status: dto.status === 'CONFIRMED' ? 'active' : (dto.status || 'active').toLowerCase(),
    avatar: '⭐',
    imageUrl: dto.imageUrl,
    description: dto.description,
    processedDate: dto.processedAt ? dto.processedAt.slice(0, 10) : '-',
    admin: dto.adminId ? `관리자 #${dto.adminId}` : '-', // adminId만 있음, 이름 없음
    email: '-',                         // DTO에 없음 → 백엔드 추가 필요
    phone: '-',                         // DTO에 없음 → 백엔드 추가 필요
    regDate: dto.createdAt ? dto.createdAt.slice(0, 10) : '-',
    stats: {
      followerTrend: '+0%',             // DTO에 없음
      revenue: Number(dto.totalBalance || 0),
      balance: Number(dto.withdrawableBalance || 0),
      posts: 0,                         // DTO에 없음
    },
    memo: '',
  };
}

/**
 * ArtistResponseDTO (FAILED / 거절) → 거절 이력 포맷
 * ※ 현재 /admin/artist/rejectionList API 없음 → 백엔드 구현 후 연동
 */
function mapRejection(dto) {
  return {
    id: dto.approvalId,
    name: dto.artistName || '-',
    group: dto.category || '-',
    genre: dto.category || '-',
    rejectedDate: dto.processedAt ? dto.processedAt.slice(0, 10) : '-',
    reason: dto.rejectionReason || '-',
    count: 1,
  };
}

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────
export default function AdminArtists() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('pending');

  // 데이터 상태
  const [pendingArtists, setPendingArtists] = useState([]);
  const [approvedArtists, setApprovedArtists] = useState([]);
  const [rejectionHistory, setRejectionHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  // 모달 상태
  const [detailArtist, setDetailArtist] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [rejectArtist, setRejectArtist] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [suspensionArtist, setSuspensionArtist] = useState(null);
  const [suspensionReason, setSuspensionReason] = useState('');

  // ── 데이터 조회 ──────────────────────────────

  const fetchPending = useCallback(async () => {
    try {
      const data = await apiFetch('/msa/core/admin/artist/approvalList');
      setPendingArtists((data || []).map(mapPending));
    } catch (err) {
      toast.error(`승인 대기 목록 조회 실패: ${err.message}`);
    }
  }, []);

  const fetchApproved = useCallback(async () => {
    try {
      const data = await apiFetch('/msa/core/admin/artist/activeList');
      setApprovedArtists((data || []).map(mapApproved));
    } catch (err) {
      toast.error(`활성 아티스트 조회 실패: ${err.message}`);
    }
  }, []);

  /**
   * ⚠️ 거절 이력 API 미구현
   * 백엔드에 GET /admin/artist/rejectionList 추가 후 아래 주석 해제
   * 현재는 빈 배열로 처리합니다.
   */
  const fetchRejectionHistory = useCallback(async () => {
    // TODO: 백엔드 API 구현 후 연동
    // try {
    //   const data = await apiFetch('/admin/artist/rejectionList');
    //   setRejectionHistory((data || []).map(mapRejection));
    // } catch (err) {
    //   toast.error(`거절 이력 조회 실패: ${err.message}`);
    // }
    setRejectionHistory([]); // 임시 빈 배열
  }, []);

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      await Promise.all([fetchPending(), fetchApproved(), fetchRejectionHistory()]);
      setLoading(false);
    };
    loadAll();
  }, [fetchPending, fetchApproved, fetchRejectionHistory]);

  // ── 상세 조회 ──────────────────────────────

  const handleOpenDetail = async (artist) => {
    // pending은 list 데이터로 바로 표시
    if (artist.status === 'pending' || !artist.artistId) {
      setDetailArtist(artist);
      return;
    }
    // approved는 상세 API 호출
    setDetailLoading(true);
    setDetailArtist(artist); // 로딩 중 기본 데이터 먼저 표시
    try {
      const detail = await apiFetch(`/msa/core/admin/artist/${artist.approvalId}/${artist.artistId}`);
      setDetailArtist(mapApproved(detail));
    } catch (err) {
      toast.error(`상세 조회 실패: ${err.message}`);
    } finally {
      setDetailLoading(false);
    }
  };

  // ── 승인 처리 ──────────────────────────────

  const handleApprove = async (artist) => {
    try {
      await apiFetch('/msa/core/admin/artist/confirm', {
        method: 'POST',
        body: JSON.stringify({
          approvalId: artist.approvalId,
          artistName: artist.name,
          subCategory: `${artist.group} · ${artist.genre}`,
          description: artist.description,
          imageUrl: artist.imageUrl,
          createdAt: artist.appliedDate,
          status: 'CONFIRMED',
        }),
      });
      toast.success(`"${artist.name}" 아티스트 승인 완료!`);
      await fetchPending();
      await fetchApproved();
    } catch (err) {
      toast.error(`승인 실패: ${err.message}`);
    }
  };

  // ── 거절 처리 ──────────────────────────────

  const handleRejectSubmit = async () => {
    if (!rejectReason.trim()) return toast.error('거절 사유를 입력해주세요.');
    try {
      await apiFetch('/msa/core/admin/artist/reject', {
        method: 'POST',
        body: JSON.stringify({
          approvalId: rejectArtist.approvalId,
          artistName: rejectArtist.name,
          subCategory: `${rejectArtist.group} · ${rejectArtist.genre}`,
          description: rejectArtist.description,
          imageUrl: rejectArtist.imageUrl,
          createdAt: rejectArtist.appliedDate,
          status: 'FAILED',
          rejectionReason: rejectReason,
        }),
      });
      toast.error(`"${rejectArtist.name}" 거절 처리 완료`);
      setRejectArtist(null);
      setRejectReason('');
      await fetchPending();
      await fetchRejectionHistory();
    } catch (err) {
      toast.error(`거절 처리 실패: ${err.message}`);
    }
  };

  // ── 권한 정지 ──────────────────────────────

  /**
   * ⚠️ 권한 정지 API 미구현
   * 백엔드에 POST /admin/artist/suspend 추가 후 아래 주석 해제
   */
  const handleSuspensionSubmit = async () => {
    if (!suspensionReason.trim()) return toast.error('정지 사유를 반드시 입력해야 합니다.');
    try {
      // TODO: 백엔드 API 구현 후 연동
      // await apiFetch('/admin/artist/suspend', {
      //   method: 'POST',
      //   body: JSON.stringify({
      //     artistId: suspensionArtist.artistId,
      //     approvalId: suspensionArtist.approvalId,
      //     suspensionReason: suspensionReason,
      //   }),
      // });
      toast.warning(`"${suspensionArtist.name}" 권한 정지 처리 (백엔드 API 구현 후 실제 반영됩니다)`);
      setSuspensionArtist(null);
      setSuspensionReason('');
      if (detailArtist) setDetailArtist(null);
      await fetchApproved();
    } catch (err) {
      toast.error(`정지 처리 실패: ${err.message}`);
    }
  };

  // ── 필터링 ──────────────────────────────

  const filteredPending = pendingArtists.filter(
    (a) => a.name.includes(searchQuery) || a.group.includes(searchQuery)
  );
  const filteredApproved = approvedArtists.filter(
    (a) => a.name.includes(searchQuery) || a.group.includes(searchQuery)
  );
  const filteredHistory = rejectionHistory.filter(
    (a) => a.name.includes(searchQuery) || a.group.includes(searchQuery)
  );

  // ── 렌더 ──────────────────────────────────

  return (
    <Layout role="admin">
      <div className="min-h-screen bg-background fade-in-up">

        {/* Header */}
        <div className="bg-gradient-to-r from-primary via-rose-400 to-lavender text-white py-12 px-8 rounded-b-[3rem] shadow-xl">
          <div className="max-w-7xl mx-auto flex justify-between items-end">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <Music size={24} className="animate-pulse" />
                <span className="text-white/80 text-sm font-bold tracking-widest uppercase">
                  Artist Control Tower
                </span>
              </div>
              <h1 className="text-4xl font-bold font-playfair">아티스트 통합 관리</h1>
              <p className="text-white/90 mt-2 font-medium">
                플랫폼 파트너 승인 및 활동 데이터 모니터링
              </p>
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
              <p className="text-4xl font-black text-foreground font-dm-sans">
                {loading ? '…' : pendingArtists.length}
              </p>
              <div className="mt-2 text-xs font-bold text-rose-400 bg-rose-50 inline-block px-2 py-1 rounded-lg">
                신규 신청 발생
              </div>
            </div>
            <div className="glass-card rounded-3xl p-6 soft-shadow border-white/50">
              <div className="flex justify-between items-start mb-4">
                <span className="text-muted-foreground text-sm font-bold">활성 아티스트</span>
                <CheckCircle className="text-emerald-400" size={20} />
              </div>
              <p className="text-4xl font-black text-foreground font-dm-sans">
                {loading ? '…' : approvedArtists.length}
              </p>
              <div className="mt-2 text-xs font-bold text-emerald-500 bg-emerald-50 inline-block px-2 py-1 rounded-lg">
                정상 운영 중
              </div>
            </div>
            <div className="glass-card rounded-3xl p-6 soft-shadow border-white/50">
              <div className="flex justify-between items-start mb-4">
                <span className="text-muted-foreground text-sm font-bold">누적 거절 이력</span>
                <AlertTriangle className="text-amber-400" size={20} />
              </div>
              <p className="text-4xl font-black text-foreground font-dm-sans">
                {loading ? '…' : rejectionHistory.length}
              </p>
              <div className="mt-2 text-xs font-bold text-amber-500 bg-amber-50 inline-block px-2 py-1 rounded-lg">
                재신청 관리 필요
              </div>
            </div>
          </div>

          {/* Navigation & Search */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex gap-2 bg-secondary/50 p-1.5 rounded-2xl border border-border/50">
              {[
                { key: 'pending', label: '승인 대기', icon: Clock },
                { key: 'approved', label: '승인 목록', icon: CheckCircle },
                { key: 'history', label: '거절 이력', icon: History },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                    activeTab === tab.key
                      ? 'bg-white text-primary shadow-md'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <tab.icon size={16} />
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="relative w-full md:w-96">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                size={18}
              />
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

            {/* ── 승인 대기 탭 ── */}
            {activeTab === 'pending' && (
              <div className="p-8 space-y-4">
                {loading && (
                  <p className="text-center text-muted-foreground py-12 font-medium animate-pulse">
                    불러오는 중…
                  </p>
                )}
                {!loading && filteredPending.length === 0 && (
                  <p className="text-center text-muted-foreground py-12 font-medium">
                    승인 대기 중인 아티스트가 없습니다.
                  </p>
                )}
                {filteredPending.map((artist) => (
                  <div
                    key={artist.id}
                    className="flex items-center justify-between p-6 bg-white rounded-[2rem] border border-border/50 hover:border-primary/30 transition-all hover-lift"
                  >
                    <div className="flex items-center gap-5">
                      {/* 프로필 이미지 or 이모지 */}
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-rose-100 to-lavender flex items-center justify-center text-2xl shadow-inner border-2 border-white overflow-hidden">
                        {artist.imageUrl ? (
                          <img src={artist.imageUrl} alt={artist.name} className="w-full h-full object-cover" />
                        ) : (
                          artist.avatar
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                          {artist.name}
                          <span className="text-xs text-primary font-black px-2 py-0.5 bg-rose-50 rounded-md">
                            NEW
                          </span>
                        </h3>
                        <p className="text-sm text-muted-foreground font-medium">
                          {artist.group} · {artist.genre}
                        </p>
                        <p className="text-[11px] text-amber-500 font-bold mt-1 flex items-center gap-1">
                          <Clock size={12} /> {artist.appliedDate} 신청
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <button
                        onClick={() => handleOpenDetail(artist)}
                        className="p-3 bg-slate-100 hover:bg-primary hover:text-white rounded-2xl text-primary transition-all shadow-sm"
                      >
                        <Eye size={20} />
                      </button>
                      <button
                        onClick={() => setRejectArtist(artist)}
                        className="px-5 py-2.5 rounded-2xl bg-red-50 text-red-500 font-bold text-sm border border-red-100 transition-colors"
                      >
                        거절
                      </button>
                      <button
                        onClick={() => handleApprove(artist)}
                        className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-rose-400 to-primary text-white font-bold text-sm shadow-lg active:scale-95 transition-all"
                      >
                        승인하기
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ── 승인 목록 탭 ── */}
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
                    {loading && (
                      <tr>
                        <td colSpan={6} className="text-center py-12 text-muted-foreground animate-pulse">
                          불러오는 중…
                        </td>
                      </tr>
                    )}
                    {!loading && filteredApproved.length === 0 && (
                      <tr>
                        <td colSpan={6} className="text-center py-12 text-muted-foreground">
                          활성 아티스트가 없습니다.
                        </td>
                      </tr>
                    )}
                    {filteredApproved.map((artist) => (
                      <tr key={artist.id} className="hover:bg-rose-50/20 transition-colors">
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-3">
                            <span className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center border border-border overflow-hidden">
                              {artist.imageUrl ? (
                                <img src={artist.imageUrl} alt={artist.name} className="w-full h-full object-cover" />
                              ) : (
                                artist.avatar
                              )}
                            </span>
                            <span className="font-bold text-foreground">{artist.group}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <p className="font-bold text-foreground">{artist.name}</p>
                          <p className="text-xs text-muted-foreground">{artist.nickname}</p>
                        </td>
                        <td className="px-6 py-5">
                          <span className="badge-lavender px-3 py-1 rounded-full text-xs font-bold">
                            {artist.genre}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-sm font-medium text-muted-foreground">
                          {artist.processedDate}
                        </td>
                        <td className="px-6 py-5 text-sm font-bold text-foreground">{artist.admin}</td>
                        <td className="px-6 py-5 text-center">
                          <button
                            onClick={() => handleOpenDetail(artist)}
                            className="p-3 bg-muted rounded-2xl text-primary hover:bg-primary hover:text-white transition-all shadow-sm"
                          >
                            <Eye size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* ── 거절 이력 탭 ── */}
            {activeTab === 'history' && (
              <div className="p-8 space-y-4">
                {/* 백엔드 API 미구현 안내 */}
                <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl mb-6">
                  <AlertTriangle className="text-amber-500 shrink-0" size={18} />
                  <p className="text-sm font-bold text-amber-700">
                    거절 이력 조회는 백엔드 API 구현이 필요합니다.{' '}
                    <code className="bg-amber-100 px-1 rounded text-xs">
                      GET /admin/artist/rejectionList
                    </code>{' '}
                    엔드포인트 추가 후 자동 연동됩니다.
                  </p>
                </div>
                {filteredHistory.length === 0 && (
                  <p className="text-center text-muted-foreground py-12 font-medium">
                    거절 이력이 없습니다.
                  </p>
                )}
                {filteredHistory.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-6 bg-slate-50/50 rounded-[2rem] border border-slate-200/50"
                  >
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 rounded-full bg-slate-200 flex items-center justify-center text-xl grayscale shadow-inner">
                        👤
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-700">
                          {item.name}{' '}
                          <span className="text-xs text-slate-400">({item.group})</span>
                        </h3>
                        <p className="text-sm text-red-500 font-bold mt-1 flex items-center gap-1">
                          <ShieldAlert size={14} /> 거절사유: {item.reason}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-500">{item.rejectedDate} 처리</p>
                      <p className="text-xs font-black text-rose-400 mt-1 uppercase">
                        누적 신청 {item.count}회
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ────────────── Modals ────────────── */}

        {/* [1] 상세 정보 모달 */}
        {detailArtist && (
          <div className="fixed inset-0 w-full h-full z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
            <div className="glass-card w-full max-w-4xl rounded-[3.1rem] overflow-hidden shadow-2xl bg-white flex flex-col max-h-[90vh]">
              {/* Modal Header */}
              <div className="p-8 border-b bg-gradient-to-r from-primary to-rose-400 text-white shrink-0">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-6">
                    <div className="w-24 h-24 rounded-3xl bg-white/20 backdrop-blur-md flex items-center justify-center text-4xl border border-white/30 overflow-hidden">
                      {detailArtist.imageUrl ? (
                        <img
                          src={detailArtist.imageUrl}
                          alt={detailArtist.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        detailArtist.avatar
                      )}
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold font-playfair">
                        {detailLoading ? '로딩 중…' : detailArtist.name}
                      </h2>
                      <p className="text-white/80 font-medium">
                        @{detailArtist.nickname} · {detailArtist.group} · {detailArtist.genre}
                      </p>
                      <div className="mt-2 flex gap-2">
                        <span className="px-3 py-1 bg-white/20 rounded-full text-[10px] font-black border border-white/20 uppercase tracking-widest shadow-sm">
                          {detailArtist.status === 'pending' ? '승인 대기 중' : '활동 아티스트'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setDetailArtist(null)}
                    className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-all text-white"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>

              {/* Modal Scrollable Content */}
              <div className="p-10 overflow-y-auto space-y-10 custom-scrollbar">
                <div className="grid grid-cols-2 gap-10">
                  {/* Basic Profile */}
                  <div className="space-y-6">
                    <h4 className="font-black text-[10px] uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                      <User size={14} /> Basic Profile
                    </h4>
                    <div className="grid gap-3">
                      <div className="flex items-center gap-3 p-4 bg-secondary/30 rounded-2xl border border-border/50">
                        <Mail className="text-primary" size={18} />
                        <div>
                          <p className="text-[10px] text-muted-foreground font-bold uppercase">Email</p>
                          <p className="font-bold text-foreground">
                            {detailArtist.email !== '-'
                              ? detailArtist.email
                              : <span className="text-muted-foreground text-sm">백엔드 DTO 추가 필요</span>}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-4 bg-secondary/30 rounded-2xl border border-border/50">
                        <Phone className="text-primary" size={18} />
                        <div>
                          <p className="text-[10px] text-muted-foreground font-bold uppercase">Contact</p>
                          <p className="font-bold text-foreground">
                            {detailArtist.phone !== '-'
                              ? detailArtist.phone
                              : <span className="text-muted-foreground text-sm">백엔드 DTO 추가 필요</span>}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-4 bg-secondary/30 rounded-2xl border border-border/50">
                        <Calendar className="text-primary" size={18} />
                        <div>
                          <p className="text-[10px] text-muted-foreground font-bold uppercase">
                            Registration Date
                          </p>
                          <p className="font-bold text-foreground">{detailArtist.regDate}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Activity Stats */}
                  <div className="space-y-6">
                    <h4 className="font-black text-[10px] uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                      <TrendingUp size={14} /> Activity Stats
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <p className="text-[10px] text-muted-foreground font-bold">FOLLOWERS</p>
                        <p className="text-xl font-black text-foreground">
                          {((detailArtist.followers || 0) / 1000).toFixed(0)}K
                        </p>
                        <p className="text-[10px] text-emerald-500 font-bold mt-1">
                          ▲ {detailArtist.stats?.followerTrend || '0%'}
                        </p>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <p className="text-[10px] text-muted-foreground font-bold">POSTS</p>
                        <p className="text-xl font-black text-foreground">
                          {detailArtist.stats?.posts ?? '-'}
                        </p>
                        <p className="text-[10px] text-slate-400 font-bold mt-1">Total active</p>
                      </div>
                      <div className="col-span-2 p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex justify-between items-center">
                        <div>
                          <p className="text-[10px] text-emerald-600 font-bold uppercase">Revenue</p>
                          <p className="text-2xl font-black text-emerald-700">
                            ₩{(detailArtist.stats?.revenue || 0).toLocaleString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-tighter">
                            Withdrawable
                          </p>
                          <p className="text-lg font-bold text-foreground">
                            ₩{(detailArtist.stats?.balance || 0).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content Quick Links */}
                <div className="space-y-4 pt-6 border-t">
                  <h4 className="font-black text-[10px] uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                    <ExternalLink size={14} /> Content Quick Links
                  </h4>
                  <div className="flex gap-3">
                    <button className="flex-1 p-5 rounded-[2rem] bg-white border border-border hover:border-primary transition-all flex flex-col items-center gap-2 shadow-sm group text-sm font-bold">
                      <Package className="text-primary group-hover:scale-110 transition-transform" size={24} />
                      굿즈 목록
                    </button>
                    <button className="flex-1 p-5 rounded-[2rem] bg-white border border-border hover:border-primary transition-all flex flex-col items-center gap-2 shadow-sm group text-sm font-bold">
                      <Calendar className="text-primary group-hover:scale-110 transition-transform" size={24} />
                      예정 이벤트
                    </button>
                    <button className="flex-1 p-5 rounded-[2rem] bg-white border border-border hover:border-primary transition-all flex flex-col items-center gap-2 shadow-sm group text-sm font-bold">
                      <FileText className="text-primary group-hover:scale-110 transition-transform" size={24} />
                      게시물 관리
                    </button>
                  </div>
                </div>

                {/* Admin Exclusive */}
                <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-200 space-y-6">
                  <div className="flex justify-between items-center">
                    <h4 className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                      <ShieldAlert size={14} /> Admin Only Management
                    </h4>
                    <button
                      onClick={() => setSuspensionArtist(detailArtist)}
                      className="px-5 py-2.5 bg-white border border-red-200 text-red-500 rounded-xl text-[10px] font-black hover:bg-red-50 transition-all flex items-center gap-2 shadow-sm uppercase tracking-tighter"
                    >
                      <ShieldAlert size={14} /> 권한 일시 정지
                    </button>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">
                      Admin Memo
                    </label>
                    <div className="relative">
                      <textarea
                        defaultValue={detailArtist.memo}
                        placeholder="관리자 전용 비고란입니다."
                        className="w-full h-24 p-5 rounded-3xl bg-white border border-slate-200 focus:ring-4 focus:ring-primary/10 transition-all text-sm resize-none"
                      />
                      <button className="absolute bottom-4 right-4 p-2 bg-slate-100 text-slate-500 rounded-lg hover:bg-primary hover:text-white transition-all">
                        <Save size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* [2] 신청 거절 모달 */}
        {rejectArtist && (
          <div className="fixed inset-0 w-full h-full z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="glass-card w-full max-w-md rounded-[2.5rem] p-10 space-y-6 bg-white shadow-2xl border border-red-100 fade-in-up">
              <div className="text-center">
                <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-red-100">
                  <AlertTriangle size={36} />
                </div>
                <h2 className="text-2xl font-bold text-foreground font-playfair">신청 거절 사유</h2>
                <p className="text-sm text-muted-foreground mt-2 font-medium">
                  <span className="text-primary font-bold">"{rejectArtist.name}"</span> 아티스트 신청
                  거절 사유를 입력하세요.
                </p>
              </div>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="구체적인 거절 사유를 입력하세요..."
                className="w-full h-40 p-5 rounded-3xl bg-secondary/30 border-none focus:ring-4 focus:ring-red-100 text-sm leading-relaxed outline-none"
              />
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => { setRejectArtist(null); setRejectReason(''); }}
                  className="flex-1 py-4 font-bold text-muted-foreground hover:bg-secondary transition-all"
                >
                  취소
                </button>
                <button
                  onClick={handleRejectSubmit}
                  className="flex-[1.5] py-4 rounded-2xl bg-red-500 text-white font-bold shadow-xl hover:bg-red-600 active:scale-95 transition-all"
                >
                  거절 확정
                </button>
              </div>
            </div>
          </div>
        )}

        {/* [3] 권한 일시 정지 모달 */}
        {suspensionArtist && (
          <div className="fixed inset-0 w-full h-full z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
            <div className="glass-card w-full max-w-md rounded-[2.5rem] p-10 space-y-6 bg-white shadow-2xl border border-red-200 fade-in-up">
              <div className="text-center">
                <div className="w-20 h-20 bg-red-600 text-white rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-lg shadow-red-200 animate-pulse">
                  <ShieldAlert size={40} />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 font-playfair">권한 정지 사유</h2>
                <p className="text-sm text-muted-foreground mt-2 font-medium leading-relaxed">
                  <span className="text-red-500 font-bold">"{suspensionArtist.name}"</span>{' '}
                  아티스트의 권한을 정지하시겠습니까?
                  <br />
                  사유는 아티스트 측에도 통보됩니다.
                </p>
                {/* 백엔드 미구현 안내 */}
                <p className="text-[10px] text-amber-600 font-bold mt-2 bg-amber-50 rounded-xl px-3 py-2">
                  ⚠ POST /admin/artist/suspend API 구현 후 실제 반영됩니다.
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">
                  Suspension Reason
                </label>
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
