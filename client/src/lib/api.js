import axios from 'axios';

// Get Gateway URL from env if available; fallback to relative path context strings
const GATEWAY_URL = import.meta.env.VITE_API_GATEWAY_URL || '';

const createApiInstance = (baseURL) => {
    const api = axios.create({ baseURL });
    
    // Auto-inject JWT token into requests
    // 두 가지 키 모두 확인: OAuth는 'accessToken', 이메일 로그인은 'token'으로 저장
    api.interceptors.request.use((config) => {
        const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        const memberId = localStorage.getItem('memberId');
        if (memberId) {
            config.headers['x-user-id'] = memberId;
        }
        
        return config;
    });

    return api;
};

export const coreApi = createApiInstance(`${GATEWAY_URL}/msa/core`);
export const payApi = createApiInstance(`${GATEWAY_URL}/msa/pay`);
export const shopApi = createApiInstance(`${GATEWAY_URL}/msa/shop`);
export const resApi = createApiInstance(`${GATEWAY_URL}/msa/res`);
export const adminApi = createApiInstance(`${GATEWAY_URL}/msa/core`);

export const getGatewayUrl = () => GATEWAY_URL;
