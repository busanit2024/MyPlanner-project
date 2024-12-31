import { useEffect, useRef, useState, useCallback } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

export const useChat = (roomId, userEmail) => {
    const [messages, setMessages] = useState([]);
    const client = useRef(null);

    const connect = useCallback(() => {
        if (!roomId || !userEmail) {
            console.log('roomId 또는 userEmail이 없음');
            return;
        }

        if (client.current) {
            client.current.deactivate();
        }

        const stompClient = new Client({
            webSocketFactory: () => new SockJS('/chat'),
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
            onConnect: () => {
                console.log(`채팅방 ${roomId} 연결 성공`);
                // 구독 설정
                stompClient.subscribe(`/sub/chat/rooms/${roomId}`, (message) => {
                    const receivedMessage = JSON.parse(message.body);
                    console.log('수신된 메시지:', receivedMessage);
                    
                    const formattedMessage = {
                        id: receivedMessage.id,
                        contents: receivedMessage.contents,
                        senderEmail: receivedMessage.senderEmail,
                        senderName: receivedMessage.senderName,
                        senderProfile: receivedMessage.senderProfile,
                        sendTime: receivedMessage.sendTime
                    };
                    
                    setMessages(prev => [...prev, formattedMessage]);
                });
                
                // 이전 메시지 가져오기
                loadChatHistory();
            },
            onStompError: (frame) => {
                console.error('STOMP 에러:', frame);
            }
        });

        stompClient.activate();
        client.current = stompClient;
    }, [roomId, userEmail]);

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
                setMessages(data);
            })
            .catch(error => {
                console.error('채팅 이력 로딩 실패:', error);
            });
    }, [roomId]);

    // roomId나 userEmail이 변경될 때 연결 재설정
    useEffect(() => {
        if (roomId && userEmail) {
            connect();
        }

        return () => {
            if (client.current) {
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