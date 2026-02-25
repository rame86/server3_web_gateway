import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import Layout from '@/components/Layout';
import { Mail, User, Phone, MapPin, Calendar, CheckCircle2, AlertCircle, Lock, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

export default function UserSignup() {
    const [locationPath, setLocation] = useLocation();

    // URL에서 파라미터 읽기 (ex: ?email=...&provider=...&nickname=...)
    const [queryParams, setQueryParams] = useState({
        email: '',
        nickname: '',
        provider: '',
        providerId: ''
    });

    const [formData, setFormData] = useState({
        email: '',
        name: '',
        phone: '',
        address: '',
        age: '',
        password: '',
        authCode: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSendingCode, setIsSendingCode] = useState(false);

    useEffect(() => {
        // 윈도우 location.search 사용 (wouter의 useRoute 등으로도 가능하지만 가장 직관적인 브라우저 API 사용)
        const searchParams = new URLSearchParams(window.location.search);
        const email = searchParams.get('email') || '';
        const nickname = searchParams.get('nickname') || '';
        const provider = searchParams.get('provider') || '';
        const providerId = searchParams.get('providerId') || '';

        setQueryParams({ email, nickname, provider, providerId });
        setFormData(prev => ({ ...prev, name: nickname, email: email })); // 초기 이름, 이메일 세팅
    }, [locationPath]); // URL이 바뀔 때 파싱

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSendVerification = async () => {
        if (!formData.email) {
            toast.error('인증번호를 받을 이메일을 먼저 입력해주세요.');
            return;
        }
        setIsSendingCode(true);
        toast.loading('인증번호를 발송 중입니다...');
        try {
            await axios.post(`http://localhost:8080/api/core/member/SendVerification?email=${formData.email}`);
            toast.dismiss();
            toast.success('이메일로 인증번호가 발송되었습니다. 5분 내에 입력해주세요.');
        } catch (error) {
            toast.dismiss();
            toast.error('인증번호 발송에 실패했습니다. 이메일 주소를 확인해주세요.');
        } finally {
            setIsSendingCode(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.phone || !formData.age || !formData.email) {
            toast.error('필수 정보를 모두 입력해주세요.');
            return;
        }

        // 소셜 연동이 아닐 경우 비밀번호와 인증번호가 필수
        if (!queryParams.provider && (!formData.password || !formData.authCode)) {
            toast.error('이메일 인증번호와 비밀번호를 입력해주세요.');
            return;
        }

        setIsSubmitting(true);
        toast.loading('회원가입 처리 중입니다...');

        try {
            // Spring Boot Core Service (Server 1) 회원가입 API 연동 (Gateway 34.64.85.123 경유)
            const payload = {
                ...formData,
                provider: queryParams.provider || null,
                providerId: queryParams.providerId || null
            };
            await axios.post('http://localhost:8080/api/core/member/signup', payload);

            toast.dismiss();
            toast.success('회원가입이 완료되었습니다! 환영합니다.');
            setLocation('/user'); // 성공 시 대시보드 리다이렉트

        } catch (error) {
            toast.dismiss();
            toast.error('회원가입 중 오류가 발생했습니다.');
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
                    추가 정보 입력
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Lumina 서비스 이용을 위해 몇 가지 정보를 더 알려주세요.
                </p>

                {queryParams.provider && (
                    <div className="mt-4 max-w-sm mx-auto flex items-center justify-center gap-2 px-4 py-2 bg-rose-50 text-rose-600 rounded-full text-sm font-medium">
                        <CheckCircle2 size={16} />
                        {queryParams.provider.toUpperCase()} 소셜 계정 인증 완료
                    </div>
                )}
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow-xl sm:rounded-3xl sm:px-10 border border-gray-100">
                    <form className="space-y-6" onSubmit={handleSubmit}>

                        {/* 이메일 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">이메일 계정 <span className="text-red-500">*</span></label>
                            <div className="mt-1 flex gap-2">
                                <div className="relative flex-grow rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="email"
                                        name="email"
                                        // readOnly={!!queryParams.provider}
                                        value={formData.email}
                                        onChange={handleChange}
                                        className={`pl-10 block w-full border border-gray-300 rounded-xl py-3 focus:ring-rose-500 focus:border-rose-500 sm:text-sm transition-colors ${queryParams.provider ? 'bg-gray-50 text-gray-500' : ''}`}
                                        placeholder="이메일 주소"
                                    />
                                </div>
                                    <button
                                        type="button"
                                        onClick={handleSendVerification}
                                        disabled={isSendingCode}
                                        className="whitespace-nowrap px-4 py-3 bg-rose-50 text-rose-600 border border-rose-200 rounded-xl font-semibold hover:bg-rose-100 transition-colors disabled:opacity-50"
                                    >
                                        인증요청
                                    </button>
                            </div>
                        </div>

                        {/* 인증번호 입력 (소셜 아닐 때만 노출) */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">인증번호 <span className="text-red-500">*</span></label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <ShieldCheck className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        name="authCode"
                                        value={formData.authCode}
                                        onChange={handleChange}
                                        className="pl-10 block w-full border border-gray-300 rounded-xl py-3 focus:ring-rose-500 focus:border-rose-500 sm:text-sm transition-colors"
                                        placeholder="이메일로 온 6자리 인증번호"
                                    />
                                </div>
                            </div>

                        {/* 비밀번호 (소셜 아닐 때만 노출) */}
                        {!queryParams.provider && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700">비밀번호 <span className="text-red-500">*</span></label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="pl-10 block w-full border border-gray-300 rounded-xl py-3 focus:ring-rose-500 focus:border-rose-500 sm:text-sm transition-colors"
                                        placeholder="비밀번호를 입력해주세요"
                                    />
                                </div>
                            </div>
                        )}

                        {/* 이름/닉네임 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">이름 (또는 닉네임) <span className="text-red-500">*</span></label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="pl-10 block w-full border border-gray-300 rounded-xl py-3 focus:ring-rose-500 focus:border-rose-500 sm:text-sm transition-colors"
                                    placeholder="홍길동"
                                />
                            </div>
                        </div>

                        {/* 연락처 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">연락처 <span className="text-red-500">*</span></label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Phone className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    required
                                    className="pl-10 block w-full border border-gray-300 rounded-xl py-3 focus:ring-rose-500 focus:border-rose-500 sm:text-sm transition-colors"
                                    placeholder="010-0000-0000"
                                />
                            </div>
                        </div>

                        {/* 연령/생년월일 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">나이 (연령대) <span className="text-red-500">*</span></label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Calendar className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    name="age"
                                    value={formData.age}
                                    onChange={handleChange}
                                    required
                                    className="pl-10 block w-full border border-gray-300 rounded-xl py-3 focus:ring-rose-500 focus:border-rose-500 sm:text-sm transition-colors"
                                    placeholder="예: 20대, 25 등"
                                />
                            </div>
                        </div>

                        {/* 주소 (선택) */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">배송지 주소 <span className="text-gray-400 text-xs font-normal">(선택)</span></label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <MapPin className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    className="pl-10 block w-full border border-gray-300 rounded-xl py-3 focus:ring-rose-500 focus:border-rose-500 sm:text-sm transition-colors"
                                    placeholder="거주지 주소를 입력해주세요"
                                />
                            </div>
                        </div>

                        <div className="bg-blue-50/50 p-4 rounded-xl flex gap-3 text-sm text-blue-700 border border-blue-100">
                            <AlertCircle size={20} className="flex-shrink-0" />
                            <p>입력하신 정보는 굿즈 배송 및 예매자 본인 확인 용도로만 안전하게 활용됩니다.</p>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-2xl shadow-sm text-sm font-bold text-white btn-primary-gradient focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all hover:shadow-lg"
                            >
                                {isSubmitting ? '처리 중...' : '가입 완료하기'}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6 text-center">
                        <button
                            type="button"
                            disabled={isSubmitting}
                            onClick={() => setLocation('/login')}
                            className="text-sm font-medium text-gray-500 hover:text-rose-500 transition-colors"
                        >
                            취소하고 로그인으로 돌아가기
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
