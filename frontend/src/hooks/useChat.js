import { useEffect, useRef, useState } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export function useChat(roomId, userEmail) {
    const [messages, setMessages] = useState([]);
    const [isConnected, setIsConnected] = useState(false);
    const clientRef = useRef(null);

    // 채팅 이력 가져오기
    useEffect(() => {
        if (roomId) {
            fetch(`/api/chat/rooms/${roomId}/messages`)
                .then(res => res.json())
                .then(data => {
                    setMessages(data);
                })
                .catch(error => {
                    console.error('채팅 이력 로딩 실패:', error);
                });
        }
    }, [roomId]);

    useEffect(() => {
        if (!roomId || !userEmail) return;

        const client = new Client({
            webSocketFactory: () => new SockJS('http://localhost:8080/chat'),
            onConnect: () => {
                console.log('WebSocket 연결 성공');
                setIsConnected(true);
                client.subscribe(`/sub/chat/rooms/${roomId}`, message => {
                    console.log('새 메시지 수신:', message);
                    const newMessage = JSON.parse(message.body);
                    setMessages(prev => [...prev, newMessage]);
                });
            },
            onStompError: (frame) => {
                console.error('STOMP 에러:', frame);
            },
            onWebSocketError: (event) => {
                console.error('WebSocket 에러:', event);
            },
            debug: function (str) {
                console.log('STOMP: ' + str);
            },
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000
        });

        clientRef.current = client;
        client.activate();

        return () => {
            client.deactivate();
        };
    }, [roomId, userEmail]);

    const sendMessage = (content) => {
        if (clientRef.current?.connected) {
            console.log('메시지 전송 시도:', {
                destination: `/pub/chat/rooms/${roomId}/send`,
                body: {
                    senderEmail: userEmail,
                    contents: content,
                    sendTime: new Date()
                }
            });

            clientRef.current.publish({
                destination: `/pub/chat/rooms/${roomId}/send`,
                body: JSON.stringify({
                    senderEmail: userEmail,
                    contents: content,
                    sendTime: new Date()
                })
            });
        } else {
            console.error('웹소켓 연결이 되어있지 않습니다.');
        }
    };

    return {
        messages,
        sendMessage,
        isConnected
    };
} 