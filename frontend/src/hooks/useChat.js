import { useEffect, useRef, useState, useCallback } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

export const useChat = (roomId, userEmail) => {
    const [messages, setMessages] = useState([]);
    const client = useRef(null);

    // 이전 메시지 로드 함수
    const loadChatHistory = useCallback(() => {
        if (!roomId) return;

        fetch(`/api/chat/rooms/${roomId}/messages`)
            .then(res => {
                if (!res.ok) throw new Error(`Status: ${res.status}`);
                return res.json();
            })
            .then(data => {
                console.log('채팅 이력 로드:', data);
                setMessages(data); // 메시지 상태 초기화
            })
            .catch(error => {
                console.error('채팅 이력 로딩 실패:', error);
            });
    }, [roomId]);

    const connect = useCallback(() => {
        if (!roomId || !userEmail) {
            console.log('roomId 또는 userEmail이 없음');
            return;
        }

        // 기존 연결 정리
        if (client.current?.connected) {
            client.current.deactivate();
        }

        const stompClient = new Client({
            webSocketFactory: () => new SockJS('/chat'),
            reconnectDelay: 2000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
            onConnect: () => {
                console.log(`채팅방 ${roomId} 연결 성공`);
                // 구독 설정
                stompClient.subscribe(`/sub/chat/rooms/${roomId}`, (message) => {
                    try {
                        const receivedMessage = JSON.parse(message.body);
                        console.log('수신된 메시지:', receivedMessage);
                        setMessages(prev => [...prev, receivedMessage]);
                    } catch (error) {
                        console.error('메시지 처리 중 오류:', error);
                    }
                });
                
                // 연결 성공 후 이전 메시지 로드
                loadChatHistory();
            },
            onStompError: (frame) => {
                console.error('STOMP 에러:', frame);
            }
        });

        stompClient.activate();
        client.current = stompClient;
    }, [roomId, userEmail, loadChatHistory]);


    // roomId가 변경될 때마다 연결 재설정 및 메시지 초기화
    useEffect(() => {
        setMessages([]); // 메시지 초기화
        if (roomId && userEmail) {
            connect();
        }

        return () => {
            if (client.current?.connected) {
                client.current.deactivate();
            }
        };
    }, [roomId, userEmail, connect]);

    // 메시지 전송 함수
    const sendMessage = useCallback((content) => {
        if (!client.current?.connected) {
            console.log('연결되지 않음, 재연결 시도');
            connect();
            return;
        }

        const message = {
            chatRoomId: roomId,
            senderEmail: userEmail,
            contents: content,
            sendTime: new Date().toISOString()
        };

        console.log('전송할 메시지:', message);

        client.current.publish({
            destination: `/pub/chat/rooms/${roomId}/send`,
            body: JSON.stringify(message)
        });
    }, [roomId, userEmail, connect]);

    console.log("useChat에서 반환하는 messages:", messages);

    return { messages, sendMessage, isConnected: !!client.current?.connected  };
}; 