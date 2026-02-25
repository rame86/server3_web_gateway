import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation } from "wouter";
import { BookOpen, Heart, MessageCircle, Eye, PenLine, Search, TrendingUp, Bell } from 'lucide-react';
import { toast } from 'sonner';

// 탭 구성 (사용자님 코드 참조)
const boardTabs = [
    { key: '전체', label: '전체' },
    { key: '팬레터', label: '팬레터' },
    { key: '아티스트 레터', label: '아티스트 레터' },
    { key: '공지사항', label: '공지사항' },
    { key: '팬덤게시판', label: '팬덤게시판' },
    { key: '자유게시판', label: '자유게시판' }
];

// 카테고리별 디자인 설정
const typeConfig = {
    '팬레터': { label: '팬레터', badgeClass: 'bg-rose-100 text-rose-600' },
    '아티스트 레터': { label: '아티스트 레터', badgeClass: 'bg-purple-100 text-purple-600' },
    '공지사항': { label: '공지', badgeClass: 'bg-amber-100 text-amber-700' },
    '팬덤게시판': { label: '팬덤', badgeClass: 'bg-emerald-100 text-emerald-700' },
    '자유게시판': { label: '자유', badgeClass: 'bg-gray-100 text-gray-600' }
};

const UserTestBoard = () => {
    const [posts, setPosts] = useState([]); // 서버 데이터
    const [activeBoard, setActiveBoard] = useState('전체'); // 현재 탭
    const [search, setSearch] = useState(''); // 검색어
    const [, setLocation] = useLocation();

    // 1. 백엔드에서 데이터 가져오기 (디자인 탭과 연동)
    const fetchPosts = async () => {
        try {
            const response = await axios.get(`http://localhost:8080/api/core/api/board/posts`, {
                params: { category: activeBoard === '전체' ? '' : activeBoard }
            });
            setPosts(response.data);
        } catch (error) {
            console.error("데이터 로딩 실패:", error);
            setPosts([]);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, [activeBoard]); // 탭 클릭 시마다 실행

    // 2. 검색 필터링
    const handleSearch = (e) => {
        if (e.key === 'Enter') {
            const filtered = posts.filter(post =>
                post.title.includes(search) || (post.content && post.content.includes(search))
            );
            setPosts(filtered);
            toast.success(`'${search}' 검색 결과입니다.`);
        }
    };

    return (
        <div className="p-4 lg:p-6 space-y-6 bg-slate-50 min-h-screen">
            {/* 상단 헤더 */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">종합 커뮤니티</h1>
                    <p className="text-sm text-slate-500">팬과 아티스트가 소통하는 공간입니다.</p>
                </div>
                <button
                    onClick={() => setLocation('/user/write')}
                   className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 shadow-md hover:from-blue-600 hover:to-blue-700 transition-all"
                >
                    <PenLine size={14} />
                    글쓰기
                </button>
            </div>

            {/* 검색바 */}
            <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                    type="text"
                    placeholder="게시글 검색 (엔터를 눌러주세요)"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={handleSearch}
                    className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
                />
            </div>

            {/* 탭 버튼 그룹 (참조하신 디자인 적용) */}
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                {boardTabs.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveBoard(tab.key)}
                        className={`flex-shrink-0 px-5 py-2 rounded-xl text-sm font-semibold transition-all ${
                            activeBoard === tab.key ?
                            'bg-rose-500 text-white shadow-lg scale-105' :
                            'bg-white border border-slate-200 text-slate-500 hover:bg-rose-50'}`
                        }
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* 메인 콘텐츠 영역 */}
            <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <TrendingUp size={16} className="text-rose-500" />
                        <span className="text-sm font-semibold text-slate-700">{activeBoard} 게시글</span>
                    </div>

                    {posts.length > 0 ? (
                        posts.map((post) => (
                            <div 
                                key={post.boardId} 
                                className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:border-rose-200 transition-all cursor-pointer"
                                onClick={() => toast.info('상세보기는 준비 중입니다.')}
                            >
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-500 font-bold">
                                        {post.authorName?.[0]}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${typeConfig[post.category]?.badgeClass || 'bg-gray-100'}`}>
                                                {post.category}
                                            </span>
                                            <span className="text-xs font-medium text-slate-600">{post.authorName}</span>
                                        </div>
                                        <h3 className="font-bold text-slate-800 mb-1">{post.title}</h3>
                                        <p className="text-sm text-slate-500 line-clamp-2">{post.content}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 mt-4 pt-3 border-t border-slate-50 text-slate-400">
                                    <div className="flex items-center gap-1 text-xs"><Heart size={14} /> {post.likeCount || 0}</div>
                                    <div className="flex items-center gap-1 text-xs"><MessageCircle size={14} /> {post.commentCount || 0}</div>
                                    <div className="flex items-center gap-1 text-xs"><Eye size={14} /> {post.viewCount || 0}</div>
                                    <span className="ml-auto text-[10px]">{post.createdAt}</span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
                            <BookOpen size={40} className="mx-auto text-slate-200 mb-3" />
                            <p className="text-slate-400 text-sm">해당 카테고리에 글이 없습니다.</p>
                        </div>
                    )}
                </div>

                {/* 사이드바 (디자인 유지) */}
                <div className="space-y-4">
                    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                        <div className="flex items-center gap-2 mb-4">
                            <Bell size={16} className="text-amber-500" />
                            <h3 className="font-bold text-slate-800">공지사항</h3>
                        </div>
                        <ul className="space-y-3">
                            {['시스템 점검 안내', '신규 아티스트 업데이트', '이벤트 당첨자 발표'].map((n, i) => (
                                <li key={i} className="text-xs text-slate-600 hover:text-rose-500 cursor-pointer flex items-center gap-2">
                                    <div className="w-1 h-1 bg-amber-400 rounded-full" /> {n}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserTestBoard;