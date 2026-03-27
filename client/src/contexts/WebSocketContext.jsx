import React, { createContext, useContext, useEffect, useState } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { toast } from "sonner";

const WebSocketContext = createContext(null);

export const useWebSocket = () => useContext(WebSocketContext);

export const WebSocketProvider = ({ children }) => {
  const [stompClient, setStompClient] = useState(null);

  useEffect(() => {
    // 1. Client 객체 생성
    const client = new Client({
      // SockJS를 사용할 때는 brokerURL 대신 webSocketFactory를 사용합니다.
      webSocketFactory: () => new SockJS(`${import.meta.env.VITE_API_GATEWAY_URL}/msa/core/ws`),
      
      // 연결 설정
      connectHeaders: {
        // 여기에 인증 토큰을 넣으면 백엔드(Nginx/Spring)에서 바로 확인할 수 있어요!
        // Authorization: `Bearer ${accessToken}`, 
      },

      debug: (str) => console.log(str),

      // 연결 성공 시 실행
      onConnect: () => {
        console.log('✅ [전역] 최신 STOMP 클라이언트 연결 성공');
        setStompClient(client);

        client.subscribe('/topic/admin/notifications', (frame) => {
          try {
            const data = JSON.parse(frame.body);
            
            // 실시간 토스트 알림 띄우기! ㅡㅡ🔔
            toast.success(data.message || '새로운 알림이 도착했습니다!', {
              duration: 5000,
              position: 'top-right',
              icon: '🔔',
            });
          } catch (err) {
            console.error('알림 데이터 파싱 에러:', err);
          }
        });
      },

      // 연결 실패/중단 시 실행
      onStompError: (frame) => {
        console.error('❌ STOMP 프로토콜 에러:', frame.headers['message']);
      },
      
      onWebSocketClose: () => {
        console.warn('⚠️ 웹소켓 연결 종료');
      }
    });

    // 2. 활성화
    client.activate();

    // 3. 클린업 함수 (언마운트 시 연결 해제)
    return () => {
      if (client.active) {
        client.deactivate();
      }
    };
  }, []);

  return (
    <WebSocketContext.Provider value={stompClient}>
      {children}
    </WebSocketContext.Provider>
  );
};