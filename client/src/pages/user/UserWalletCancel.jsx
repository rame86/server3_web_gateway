import { useEffect, useState } from 'react';

export default function UserWalletCancel() {
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    // 1. 부모 창에 취소 메시지 전송
    if (window.opener) {
      window.opener.postMessage('PAYMENT_FAILED', '*');
    }
    localStorage.setItem('PAYMENT_STATUS_MSG', `PAYMENT_FAILED_${Date.now()}`);

    // 2. 3초 타이머
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          window.close(); // 타이머 종료 시 무조건 창 닫기
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f9fafb', fontFamily: 'sans-serif' }}>
      <div style={{ textAlign: 'center', padding: '40px', background: 'white', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', marginBottom: '16px' }}>결제가 취소되었습니다.</h2>
        <p style={{ fontSize: '16px', color: '#4b5563', marginBottom: '24px' }}>
          <strong style={{ color: '#ef4444', fontSize: '20px' }}>{countdown}</strong>초 뒤에 페이지가 닫힙니다.
        </p>
        <button 
          onClick={() => window.close()}
          style={{ padding: '12px 24px', backgroundColor: '#e5e7eb', color: '#374151', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
          페이지 닫기
        </button>
      </div>
    </div>
  );
}
