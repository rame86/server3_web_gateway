import { useState } from 'react';
import { useLocation } from 'wouter';
import { Mail, MessageCircle, Heart, Lock, LogIn } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

export default function UserLogin() {
    const [, setLocation] = useLocation();

    const [formData, setFormData] = useState({ email: '', password: '' });
    const [isLoading, setIsLoading] = useState(false);

    // 컴포넌트 내부에 추가할 상태값들
    const [isEmailVerified, setIsEmailVerified] = useState(false); // 인증 완료 여부
    const [authCode, setAuthCode] = useState(''); // 입력한 인증번호

    // 1. 인증번호 발송 함수
    const sendVerificationCode = async () => {
        if (!formData.email) {
            toast.error("이메일을 먼저 입력해주세요.");
            return;
        }
        try {
            // Nginx 게이트웨이를 통해 백엔드의 SendVerification 엔드포인트 호출
            const response = await axios.post(`http://localhost/api/core/member/SendVerification?email=${formData.email}`);
            toast.success(response.data.message || "인증번호가 발송되었습니다.");
        } catch (error) {
            toast.error("메일 발송에 실패했습니다.");
        }
    };

    const handleSocialLogin = (provider) => {
        // MSA Gateway(Server 3)를 경유하여 Core Service(Server 1)로 인증 요청
        // Spring Security 기본 OAuth2 경로 적용
        window.location.href = `http://localhost:8080/api/core/api/${provider}/login`;
    };

    const handleLocalLogin = async (e) => {
        e.preventDefault();
        if (!formData.email || !formData.password) {
            toast.error('이메일과 비밀번호를 입력해주세요.');
            return;
        }

        setIsLoading(true);
        try {
            // Spring Security Custom JSON Auth Filter 또는 Form Login 엔드포인트 호출
            const response = await axios.post('http://34.64.85.123/login', {
                email: formData.email,
                username: formData.email, // Spring Security 기본을 위해 username도 같이 전송
                password: formData.password
            });

            if (response.data && response.data.token) {
                localStorage.setItem('token', response.data.token);
            }
            toast.success('로그인 성공!');
            setLocation('/user');
        } catch (error) {
            toast.error('로그인에 실패했습니다. 아이디와 비밀번호를 확인해주세요.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50/50">
            <div className="glass-card w-full max-w-md p-8 rounded-3xl soft-shadow animate-in slide-in-from-bottom-4 duration-700">

                {/* Logo Area */}
                <div className="text-center space-y-2 mb-8 mt-4">
                    <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4 rotate-3 drop-shadow-sm">
                        <Heart size={32} fill="currentColor" />
                    </div>
                    <h1 className="text-3xl font-bold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
                        Lumina
                    </h1>
                    <p className="text-muted-foreground text-sm font-medium">당신의 최애와 가장 가까워지는 공간</p>
                </div>

                {/* Local Email Login Form */}
                <form onSubmit={handleLocalLogin} className="space-y-4 mb-6">
                    <div>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Mail size={18} className="text-gray-400" />
                            </div>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="pl-10 block w-full bg-gray-50 border border-gray-200 rounded-xl py-3 focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm transition-colors"
                                placeholder="이메일 계정"
                            />
                        </div>
                    </div>
                    <div>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock size={18} className="text-gray-400" />
                            </div>
                            <input
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="pl-10 block w-full bg-gray-50 border border-gray-200 rounded-xl py-3 focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm transition-colors"
                                placeholder="비밀번호"
                            />
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex items-center justify-center gap-2 py-3.5 bg-rose-500 text-white rounded-xl font-bold hover:bg-rose-600 transition-colors disabled:opacity-70"
                    >
                        {isLoading ? '로그인 중...' : <><LogIn size={18} /> 로그인</>}
                    </button>

                    <div className="flex justify-between items-center text-xs text-gray-500 px-1 mt-2">
                        <button type="button" className="hover:text-rose-500 transition-colors">비밀번호 찾기</button>
                        <button type="button" onClick={() => setLocation('/signup')} className="hover:text-rose-500 transition-colors font-semibold">회원가입</button>
                    </div>
                </form>

                <div className="relative flex items-center py-2 mb-4">
                    <div className="flex-grow border-t border-gray-200 text-gray-400"></div>
                    <span className="flex-shrink-0 mx-4 text-gray-400 text-xs text-muted-foreground uppercase">또는 소셜 계정으로 계속하기</span>
                    <div className="flex-grow border-t border-gray-200"></div>
                </div>

                {/* Login Buttons */}
                <div className="space-y-4">
                    {/* Google Login */}
                    <button
                        onClick={() => handleSocialLogin('google')}
                        className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 text-gray-700 px-4 py-3.5 rounded-2xl font-bold hover:bg-gray-50 transition-colors shadow-sm"
                    >
                        <Mail size={20} className="text-red-500" />
                        Google 계정으로 계속하기
                    </button>

                    {/* Kakao Login (Yellow) */}
                    <button
                        onClick={() => handleSocialLogin('kakao')}
                        className="w-full flex items-center justify-center gap-3 bg-[#FEE500] text-[#000000] px-4 py-3.5 rounded-2xl font-bold hover:bg-[#FEE500]/90 transition-colors shadow-sm"
                    >
                        <MessageCircle size={20} className="fill-current" />
                        카카오 계정으로 계속하기
                    </button>

                    {/* Naver Login (Green) */}
                    <button
                        onClick={() => handleSocialLogin('naver')}
                        className="w-full flex items-center justify-center gap-3 bg-[#03C75A] text-white px-4 py-3.5 rounded-2xl font-bold hover:bg-[#03C75A]/90 transition-colors shadow-sm"
                    >
                        <span className="font-black text-lg w-5 h-5 flex items-center justify-center mt-[-2px]">N</span>
                        네이버 계정으로 계속하기
                    </button>
                </div>

                {/* Footer info */}
                <div className="mt-8 text-center text-xs text-muted-foreground">
                    계속하기를 누르시면 Lumina의{' '}
                    <button className="underline hover:text-rose-500">이용약관</button> 및{' '}
                    <button className="underline hover:text-rose-500">개인정보처리방침</button>에 동의하게 됩니다.
                </div>

                {/* Back to Home */}
                <div className="mt-6 text-center">
                    <button
                        onClick={() => setLocation('/')}
                        className="text-sm font-semibold text-rose-500 hover:text-rose-600 transition-colors"
                    >
                        홈으로 돌아가기
                    </button>
                </div>
            </div>
        </div>
    );
}
