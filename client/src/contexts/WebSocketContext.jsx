import React, { createContext, useContext, useEffect, useState } from 'react';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';

const WebSocketContext = createContext(null);

export const useWebSocket = () => useContext(WebSocketContext);

export const WebSocketProvider = ({ children }) => {
  const [stompClient, setStompClient] = useState(null);

  useEffect(() => {
    const socket = new SockJS(`${import.meta.env.VITE_API_GATEWAY_URL}/msa/core/ws-admin`);
    const client = Stomp.over(socket);
    client.debug = (str) => console.log(str);
    client.connect({}, () => {
      console.log('✅ [전역] 웹소켓 연결 성공');
      setStompClient(client);
    }, (err) => {
      console.error('❌ 웹소켓 연결 실패', err);
    });
    
    return () => { 
      if (client && client.connected) {
        client.disconnect(); 
      }
    };
  }, []);

  return (
    <WebSocketContext.Provider value={stompClient}>
      {children}
    </WebSocketContext.Provider>
  );
};
