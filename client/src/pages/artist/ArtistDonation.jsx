import { useState, useEffect } from 'react';
import { 
  Heart, Users, Award, MessageCircle, 
  Calendar, ArrowUpRight, TrendingUp, Sparkles,
  ChevronDown 
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import Layout from '@/components/Layout';
import { payApi } from '@/lib/api'; 
import { toast } from 'sonner';

export default function ArtistDonation() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const formatCurrency = (value) => 
    new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(value || 0);

  useEffect(() => {
    const fetchDonationData = async () => {
      try {
        setLoading(true);
        const myId = localStorage.getItem('memberId') || localStorage.getItem('userId');
        
        if (!myId) {
          toast.error("로그인 정보가 없습니다.");
          return;
        }

        const res = await payApi.get('/artist/donations', {
          headers: { 'x-user-id': myId }
        });
        setData(res.data);
      } catch (err) {
        console.error("후원 데이터 로딩 에러:", err);
        toast.error("후원 내역을 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };
    fetchDonationData();
  }, []);

  if (loading) return <Layout role="artist"><div className="p-10 text-center text-rose-500 font-bold animate-pulse">팬들의 사랑을 불러오는 중... 💖</div></Layout>;
  
  if (!data || !data.messages || data.messages.length === 0) {
    return (
      <Layout role="artist">
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 animate-in fade-in zoom-in duration-500">
          <div className="relative">
            <div className="absolute inset-0 bg-rose-200 blur-3xl opacity-30 rounded-full animate-pulse" />
            <div className="relative w-32 h-32 bg-white rounded-[2.5rem] shadow-xl shadow-rose-100 border border-rose-50 flex items-center justify-center">
              <Heart size={48} className="text-rose-300" strokeWidth={1.5} />
              <Sparkles size={24} className="absolute -top-2 -right-2 text-amber-400 animate-bounce" />
            </div>
          </div>
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-slate-800" style={{ fontFamily: "'Playfair Display', serif" }}>첫 번째 소중한 마음을 기다리고 있어요</h2>
            <p className="text-slate-400 text-sm font-medium max-w-xs mx-auto">팬들의 따뜻한 후원이 이곳에 쌓일 예정입니다.</p>
          </div>
          <button onClick={() => window.location.reload()} className="px-6 py-3 bg-white border border-rose-100 text-rose-500 text-xs font-black rounded-2xl shadow-sm hover:bg-rose-50 transition-all">내역 새로고침</button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout role="artist">
      <div className="p-4 lg:p-8 space-y-8 max-w-7xl mx-auto animate-in fade-in duration-500">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2" style={{ fontFamily: "'Playfair Display', serif" }}>
            <Heart className="text-rose-500 fill-rose-500" /> 팬 후원 내역
          </h1>
          <p className="text-sm text-slate-500 font-medium">팬들이 보내주신 소중한 마음과 메시지입니다.</p>
        </div>

        {/* 요약 카드 섹션 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <DonationCard title="이번달 후원금" value={formatCurrency(data.thisMonthAmount)} icon={<TrendingUp size={20} className="text-rose-500" />} color="bg-rose-50/50" />
          <DonationCard title="총 누적 후원" value={formatCurrency(data.totalAmount)} icon={<Award size={20} className="text-amber-500" />} color="bg-amber-50/50" />
          <DonationCard title="후원 팬 수" value={`${data.donorCount?.toLocaleString()} 명`} icon={<Users size={20} className="text-indigo-500" />} color="bg-indigo-50/50" />
          <DonationCard title="최고 후원금" value={formatCurrency(data.maxSingleDonation)} subtitle="단일 후원 기준" icon={<Sparkles size={20} className="text-purple-500" />} color="bg-purple-50/50" />
        </div>

        {/* 중간 섹션: 차트(1) & 랭킹(2) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 최근 후원 추이 (1/3) */}
          <div className="lg:col-span-1 bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2 text-sm"><Calendar size={16} className="text-rose-500" /> 최근 후원 추이</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.dailyTrend}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                  <Tooltip cursor={{fill: '#fff1f2'}} contentStyle={{borderRadius: '12px', border: 'none'}} />
                  <Bar dataKey="amount" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top 서포터즈 랭킹 (2/3) */}
          <div className="lg:col-span-2 bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col relative group">
            <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2 text-sm"><Sparkles size={16} className="text-amber-500" /> Top 서포터즈 랭킹</h3>
            <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar pr-4" style={{ maxHeight: '300px' }}>
              {data.topDonors?.map((donor, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-white hover:bg-rose-50/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <span className={`w-8 h-8 flex items-center justify-center rounded-full text-xs font-black ${idx === 0 ? 'bg-amber-400 text-white ring-4 ring-amber-100' : idx === 1 ? 'bg-slate-300 text-white' : idx === 2 ? 'bg-orange-300 text-white' : 'bg-slate-100 text-slate-400'}`}>{idx + 1}</span>
                    <span className="text-sm font-bold text-slate-700">{donor.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black text-rose-500">{formatCurrency(donor.total)}</p>
                    <p className="text-[10px] text-slate-400 font-medium">누적 후원액</p>
                  </div>
                </div>
              ))}
            </div>
            {/* 랭킹 하단 안내 화살표 */}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
              <ChevronDown size={20} className="text-rose-300 animate-bounce" />
            </div>
          </div>
        </div>

        {/* 하단 섹션: 팬 메시지 (전체 너비) */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden relative group">
          <div className="p-6 border-b border-slate-50">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <MessageCircle size={18} className="text-rose-500" /> 팬들의 응원 한마디
            </h3>
          </div>
          
          {/* 메시지 리스트 스크롤 영역 */}
          <div className="divide-y divide-slate-50 h-[500px] overflow-y-auto custom-scrollbar">
            {data.messages?.map((msg, idx) => (
              <div key={idx} className="p-6 hover:bg-rose-50/30 transition-colors flex gap-4">
                <div className="w-12 h-12 rounded-2xl bg-rose-100 flex-shrink-0 flex items-center justify-center text-rose-500">
                  <Heart size={20} fill="currentColor" />
                </div>
                <div className="space-y-1 w-full">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800 text-sm">{msg.userName}</span>
                      <span className="text-[10px] text-slate-400 font-medium">{msg.createdAt}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 text-[10px] font-black">
                      {formatCurrency(msg.amount)} 후원
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed mt-1">{msg.content || "응원합니다!"}</p>
                </div>
              </div>
            ))}
          </div>

          {/* 메시지 하단 페이드 & 화살표 가이드 */}
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white via-white/90 to-transparent pointer-events-none flex items-end justify-center pb-4">
            <div className="flex flex-col items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span className="text-[10px] text-rose-300 font-bold tracking-tighter">SCROLL FOR MORE</span>
              <ChevronDown size={18} className="text-rose-400 animate-bounce" />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

function DonationCard({ title, value, subtitle, icon, color }) {
  return (
    <div className={`p-6 rounded-[2.5rem] border border-white shadow-sm transition-all hover:scale-[1.02] ${color}`}>
      <div className="flex justify-between items-start mb-6">
        <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-50">{icon}</div>
        <div className="p-1 bg-white/50 rounded-full"><ArrowUpRight size={14} className="text-slate-400" /></div>
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{title}</p>
        <p className="text-2xl font-black text-slate-800 tracking-tight">{value}</p>
        {subtitle && <p className="text-[10px] font-bold text-rose-400 mt-1.5">{subtitle}</p>}
      </div>
    </div>
  );
}