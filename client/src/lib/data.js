/* Lumina - Shared Mock Data & Types */







































































export const artists = [
{
  id: 1,
  name: '김지수',
  group: 'NOVA',
  fandom: 'STARLIGHT',
  image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&h=200&fit=crop',
  coverImage: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=300&fit=crop',
  description: '감성적인 보컬과 퍼포먼스로 팬들의 마음을 사로잡는 아티스트',
  followers: 521000,
  upcomingEvents: 2,
  verified: true,
  tags: ['보컬', 'K-POP', '댄스']
},
{
  id: 2,
  name: '박준호',
  group: 'NOVA',
  fandom: 'STARLIGHT',
  image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
  coverImage: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&h=300&fit=crop',
  description: '강렬한 랩과 카리스마로 무대를 장악하는 퍼포머',
  followers: 389000,
  upcomingEvents: 2,
  verified: true,
  tags: ['랩', '퍼포먼스', 'K-POP']
},
{
  id: 3,
  name: '이하은',
  group: 'BLOSSOM',
  fandom: 'PETAL',
  image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop',
  coverImage: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=300&fit=crop',
  description: '청량한 목소리와 따뜻한 감성으로 팬들과 소통하는 아티스트',
  followers: 421000,
  upcomingEvents: 1,
  verified: true,
  tags: ['보컬', '발라드', '청량']
},
{
  id: 4,
  name: '최민서',
  group: 'BLOSSOM',
  fandom: 'PETAL',
  image: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=200&h=200&fit=crop',
  coverImage: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=300&fit=crop',
  description: '섬세한 감성과 뛰어난 댄스 실력을 겸비한 올라운더',
  followers: 298000,
  upcomingEvents: 1,
  verified: true,
  tags: ['댄스', '보컬', '올라운더']
},
{
  id: 5,
  name: '정하늘',
  group: 'PRISM',
  fandom: 'RAINBOW',
  image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&h=200&fit=crop',
  coverImage: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&h=300&fit=crop',
  description: '다채로운 음악 스펙트럼으로 팬들에게 새로운 경험을 선사',
  followers: 187000,
  upcomingEvents: 0,
  verified: false,
  tags: ['작곡', '보컬', '인디']
},
{
  id: 6,
  name: '윤서아',
  group: 'AURORA',
  fandom: 'DAWN',
  image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop',
  coverImage: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=300&fit=crop',
  description: '새벽빛처럼 맑고 투명한 목소리로 감동을 전하는 신인 아티스트',
  followers: 94000,
  upcomingEvents: 1,
  verified: false,
  tags: ['신인', '보컬', '청순']
}];


export const events = [
{
  id: 1,
  title: 'NOVA 단독 팬미팅 "STAR NIGHT 2026"',
  artistId: 1,
  artistName: 'NOVA',
  type: 'fanmeeting',
  date: '2026-03-15',
  time: '18:00',
  venue: 'KSPO DOME',
  capacity: 5000,
  remaining: 87,
  price: 88000,
  image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&h=300&fit=crop'
},
{
  id: 2,
  title: '이하은 팬사인회 "봄날의 편지"',
  artistId: 3,
  artistName: '이하은',
  type: 'fansign',
  date: '2026-03-22',
  time: '14:00',
  venue: '홍대 YES24 라이브홀',
  capacity: 200,
  remaining: 23,
  price: 55000,
  image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&h=300&fit=crop'
},
{
  id: 3,
  title: 'BLOSSOM 팬파티 "BLOOM PARTY"',
  artistId: 3,
  artistName: 'BLOSSOM',
  type: 'fanparty',
  date: '2026-04-05',
  time: '19:00',
  venue: '강남 이벤트홀',
  capacity: 300,
  remaining: 56,
  price: 45000,
  image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=300&fit=crop'
},
{
  id: 4,
  title: 'NOVA 팬사인회 (서울)',
  artistId: 1,
  artistName: 'NOVA',
  type: 'fansign',
  date: '2026-04-12',
  time: '15:00',
  venue: '코엑스 아티움',
  capacity: 150,
  remaining: 12,
  price: 65000,
  image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&h=300&fit=crop'
}];


export const goodsItems = [
{
  id: 1,
  name: 'NOVA 공식 포토카드 세트 Vol.3',
  artistId: 1,
  artistName: 'NOVA',
  price: 28000,
  originalPrice: 35000,
  image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop',
  category: 'official',
  stock: 150,
  rating: 4.8,
  reviews: 124,
  badge: '20% OFF'
},
{
  id: 2,
  name: 'BLOSSOM 공식 응원봉 2세대',
  artistId: 3,
  artistName: 'BLOSSOM',
  price: 45000,
  image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop',
  category: 'official',
  stock: 80,
  rating: 4.9,
  reviews: 89,
  badge: '한정판'
},
{
  id: 3,
  name: '이하은 팬메이드 아크릴 스탠드',
  artistId: 3,
  artistName: '이하은',
  price: 15000,
  image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=400&fit=crop',
  category: 'unofficial',
  stock: 45,
  rating: 4.7,
  reviews: 56
},
{
  id: 4,
  name: 'NOVA 팬메이드 키링 세트',
  artistId: 1,
  artistName: 'NOVA',
  price: 12000,
  image: 'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=400&h=400&fit=crop',
  category: 'unofficial',
  stock: 30,
  rating: 4.6,
  reviews: 67
},
{
  id: 5,
  name: '김지수 공식 포토북 "Starlight"',
  artistId: 1,
  artistName: '김지수',
  price: 55000,
  image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=400&fit=crop',
  category: 'official',
  stock: 200,
  rating: 5.0,
  reviews: 203,
  badge: '신상품'
},
{
  id: 6,
  name: '이하은 중고 사인 포스터',
  artistId: 3,
  artistName: '이하은',
  price: 35000,
  originalPrice: 55000,
  image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=400&fit=crop',
  category: 'used',
  stock: 1,
  rating: 4.5,
  reviews: 12,
  badge: '중고'
},
{
  id: 7,
  name: 'BLOSSOM 공식 후드티 (화이트)',
  artistId: 3,
  artistName: 'BLOSSOM',
  price: 79000,
  image: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=400&h=400&fit=crop',
  category: 'official',
  stock: 120,
  rating: 4.8,
  reviews: 45
},
{
  id: 8,
  name: 'NOVA 팬메이드 포토카드 홀더',
  artistId: 1,
  artistName: 'NOVA',
  price: 8000,
  image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop',
  category: 'unofficial',
  stock: 60,
  rating: 4.4,
  reviews: 33
}];


export const posts = [
{
  id: 1,
  type: 'fanletter',
  title: '지수 언니, 항상 응원해요 💕',
  content: '오늘도 무대에서 빛나는 모습 너무 예뻤어요. 언제나 건강하게 활동해주세요!',
  author: '별빛팬',
  authorImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop',
  artistId: 1,
  artistName: '김지수',
  createdAt: '2026-02-18',
  likes: 234,
  comments: 18,
  views: 1240
},
{
  id: 2,
  type: 'artist-letter',
  title: '팬 여러분께 드리는 편지 🌸',
  content: '안녕하세요! 이하은이에요. 요즘 새 앨범 준비로 바쁘게 지내고 있어요. 여러분의 응원이 큰 힘이 됩니다. 곧 좋은 소식으로 찾아올게요!',
  author: '이하은',
  authorImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
  artistId: 3,
  artistName: '이하은',
  createdAt: '2026-02-17',
  likes: 8420,
  comments: 342,
  views: 52000
},
{
  id: 3,
  type: 'notice',
  title: '[공지] 3월 팬미팅 예매 안내',
  content: '3월 15일 NOVA 팬미팅 예매가 2월 25일 오후 2시에 시작됩니다. 예매 방법 및 주의사항을 확인해주세요.',
  author: 'Lumina 운영팀',
  authorImage: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop',
  createdAt: '2026-02-16',
  likes: 156,
  comments: 45,
  views: 8900
},
{
  id: 4,
  type: 'fandom',
  title: 'STARLIGHT 팬클럽 정모 모집!',
  content: '3월 첫째 주 주말에 서울에서 팬클럽 정모를 진행합니다. 참여 희망하시는 분들은 댓글 달아주세요!',
  author: '달빛소녀',
  authorImage: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=100&h=100&fit=crop',
  artistId: 1,
  artistName: 'NOVA',
  createdAt: '2026-02-15',
  likes: 89,
  comments: 67,
  views: 2340
},
{
  id: 5,
  type: 'free',
  title: '오늘 팬사인회 다녀왔어요 후기 🥰',
  content: '이하은 팬사인회 다녀왔는데 너무 행복했어요! 직접 만나보니 더 예쁘고 친절하더라고요...',
  author: '꽃잎팬',
  authorImage: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=100&h=100&fit=crop',
  artistId: 3,
  artistName: '이하은',
  createdAt: '2026-02-14',
  likes: 312,
  comments: 89,
  views: 5670
}];


export const bookings = [
{
  id: 1,
  eventTitle: 'NOVA 단독 팬미팅 "STAR NIGHT 2026"',
  artistName: 'NOVA',
  date: '2026-03-15',
  venue: 'KSPO DOME',
  seats: 2,
  totalPrice: 176000,
  status: 'confirmed'
},
{
  id: 2,
  eventTitle: '이하은 팬사인회 "봄날의 편지"',
  artistName: '이하은',
  date: '2026-03-22',
  venue: '홍대 YES24 라이브홀',
  seats: 1,
  totalPrice: 55000,
  status: 'pending'
},
{
  id: 3,
  eventTitle: 'BLOSSOM 팬파티 (취소)',
  artistName: 'BLOSSOM',
  date: '2026-02-10',
  venue: '강남 이벤트홀',
  seats: 1,
  totalPrice: 45000,
  status: 'cancelled'
}];


export const eventTypeLabel = {
  fanmeeting: '팬미팅',
  fansign: '팬사인회',
  fanparty: '팬파티',
  concert: '콘서트'
};

export const eventTypeBadgeClass = {
  fanmeeting: 'badge-rose',
  fansign: 'badge-lavender',
  fanparty: 'badge-mint',
  concert: 'bg-amber-100 text-amber-700'
};

export function formatNumber(n) {
  if (n >= 10000) return `${(n / 10000).toFixed(0)}만`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}천`;
  return n.toString();
}

export function formatPrice(n) {
  if (n === null || n === undefined || isNaN(n)) return '0원';
  return `${Number(n).toLocaleString()}원`;
}