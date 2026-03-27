import { useState, useEffect } from 'react'; // useEffect 추가
import axios from 'axios'; // axios 추가
import Layout from '@/components/Layout';
import { Heart, Play, ShoppingBag, MessageCircle, Music, ArrowRight } from 'lucide-react';
import { goodsItems, formatPrice } from '@/lib/data';
import { toast } from 'sonner';

export default function ArtistFandom() {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // --- [데이터 상태 관리 추가] ---
  const [artistId, setArtistId] = useState(3); // 현재 페이지의 아티스트 ID (예시: 3)
  const [fanLetters, setFanLetters] = useState([]);
  const [artistLetters, setArtistLetters] = useState([]);
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- [API 데이터 불러오기] ---
  useEffect(() => {
    const fetchBoardData = async () => {
      try {
        setLoading(true);
        // 1. 팬레터 가져오기
        const fanRes = await axios.get(`/artist/${artistId}/fan-letters`);
        setFanLetters(fanRes.data);

        // 2. 아티스트 레터 가져오기
        const artistRes = await axios.get(`/artist/${artistId}/artist-letters`);
        setArtistLetters(artistRes.data);

        // 3. 공지사항 가져오기
        const noticeRes = await axios.get(`/artist/${artistId}/notices`);
        setNotices(noticeRes.data);
      } catch (error) {
        console.error("데이터 로드 실패:", error);
        toast.error("게시글을 불러오는 데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchBoardData();
  }, [artistId]);

  // --- [아티스트 레터 작성 핸들러] ---
  const handleWriteLetter = async () => {
    const title = prompt("레터 제목을 입력하세요:");
    const content = prompt("내용을 입력하세요:");
    
    if (!title || !content) return;

    try {
      await axios.post('/artist/artist-letter', {
        title,
        content,
        artistId: artistId // DTO 구조에 맞게 전달
      });
      toast.success("아티스트 레터가 등록되었습니다! ✨");
      // 등록 후 목록 새로고침
      const res = await axios.get(`/artist/${artistId}/artist-letters`);
      setArtistLetters(res.data);
    } catch (error) {
      toast.error("작성 권한이 없거나 오류가 발생했습니다.");
    }
  };

  return (
    <Layout role="artist">
      <div className="p-4 lg:p-6 space-y-6">
        {/* 헤더 및 탭 부분은 기존과 동일 (생략) */}

        {/* --- [Letters Tab 수정 부분] --- */}
        {activeTab === 'letters' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">레터 관리</h2>
              <button
                onClick={handleWriteLetter} // 작성 함수 연결
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-xl btn-primary-gradient shadow-sm"
              >
                + 아티스트 레터 작성
              </button>
            </div>

            {loading ? (
              <p className="text-center py-10">데이터를 불러오는 중...</p>
            ) : (
              <div className="grid lg:grid-cols-2 gap-4">
                {/* 팬레터 영역 (DB 데이터 사용) */}
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground mb-3 uppercase tracking-wide">팬레터</h3>
                  {fanLetters.length > 0 ? fanLetters.map((post) => (
                    <div key={post.boardId} className="glass-card rounded-2xl p-4 mb-3 soft-shadow">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-full bg-rose-100 flex items-center justify-center text-rose-500 font-bold">
                          {post.authorName[0]}
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-foreground">{post.title}</p>
                          <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{post.content}</p>
                          <p className="text-xs text-muted-foreground mt-1">{post.authorName} · {new Date(post.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                  )) : <p className="text-xs text-muted-foreground">아직 올라온 팬레터가 없습니다.</p>}
                </div>

                {/* 아티스트 레터 영역 (DB 데이터 사용) */}
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground mb-3 uppercase tracking-wide">아티스트 레터 (팔로워 전용)</h3>
                  {artistLetters.length > 0 ? artistLetters.map((post) => (
                    <div key={post.boardId} className="glass-card rounded-2xl p-4 mb-3 soft-shadow border-l-4 border-violet-300">
                      <p className="font-semibold text-sm text-foreground">{post.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-3 mt-1">{post.content}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs text-muted-foreground">{new Date(post.createdAt).toLocaleDateString()}</span>
                        <span className="text-xs text-violet-600">❤ {post.likeCount}</span>
                      </div>
                    </div>
                  )) : (
                    <div className="p-10 text-center bg-gray-50 rounded-2xl border-2 border-dashed">
                      <p className="text-sm text-muted-foreground">팔로워에게만 공개된 레터가 없거나<br/>권한이 없습니다.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* 대시보드, 미디어, 굿즈 탭도 위와 같은 방식으로 state 데이터를 연결하면 됩니다! */}
      </div>
    </Layout>
  );
}