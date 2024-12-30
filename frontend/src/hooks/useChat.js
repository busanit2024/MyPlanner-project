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
                setIsConnected(true);
                client.subscribe(`/sub/chat/rooms/${roomId}`, message => {
                    const newMessage = JSON.parse(message.body);
                    setMessages(prev => [...prev, newMessage]);
                });
            },
            onStompError: (frame) => {
                console.error('STOMP 에러:', frame);
            }
        });

        clientRef.current = client;
        client.activate();

        return () => {
            client.deactivate();
        };
    }, [roomId, userEmail]);

    const sendMessage = (content) => {
        if (clientRef.current?.connected) {
            clientRef.current.publish({
                destination: `/pub/chat/rooms/${roomId}/send`,
                body: JSON.stringify({
                    senderEmail: userEmail,  
                    contents: content,
                    sendTime: new Date()
                })
            });
        }
    };

    return {
        messages,
        sendMessage,
        isConnected
    };
} 