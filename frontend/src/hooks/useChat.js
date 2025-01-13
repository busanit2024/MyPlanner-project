import { useEffect, useRef, useState, useCallback } from 'react';
import { Stomp } from '@stomp/stompjs';

export const useChat = (roomId, userEmail, mounted) => {
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
                const messageArray = Array.isArray(data) ? data : [data];
                setMessages(messageArray);
            })
            .catch(error => {
                console.error('채팅 이력 로딩 실패:', error);
            });
    }, [roomId]);

    const disconnect = useCallback(() => {
        if (client.current?.connected) {
            client.current.disconnect();
            client.current = null;
        }
    }, []);

    const connect = useCallback(() => {
        if (!roomId || !userEmail || !mounted.current) return;
        
        const socket = new WebSocket('ws://localhost:8080/chat');
        client.current = Stomp.over(socket);
        
        client.current.connect({}, () => {
            if (!mounted.current) {
                disconnect();
                return;
            }

            client.current.subscribe(`/sub/chat/rooms/${roomId}`, (message) => {
                if (!mounted.current) return;

                const newMessage = JSON.parse(message.body);
                setMessages(prevMessages => {
                    const isDuplicate = prevMessages.some(msg => 
                        msg.sendTime === newMessage.sendTime && 
                        msg.senderEmail === newMessage.senderEmail && 
                        msg.contents === newMessage.contents
                    );
                    if (isDuplicate) return prevMessages;
                    return [...prevMessages, newMessage];
                });
            });
        });
    }, [roomId, userEmail, disconnect]);

    // roomId가 변경될 때마다 연결 재설정 및 메시지 초기화
    useEffect(() => {
        setMessages([]); // 메시지 초기화
        if (roomId && userEmail) {
            connect();
            loadChatHistory();
        }

        return () => {
            if (client.current?.connected) {
                client.current.disconnect();
                client.current = null;
            }  
        };
    }, [roomId, userEmail, connect, loadChatHistory]);

    // 메시지 전송 함수
    const sendMessage = useCallback((content) => {
        if (!client.current?.connected || !mounted.current) {
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
        client.current.send(`/pub/chat/rooms/${roomId}/send`, {}, JSON.stringify(message));
    }, [roomId, userEmail, connect]);

    return { 
        messages, 
        sendMessage, 
        isConnected: !!client.current?.connected, 
        loadChatHistory, 
        disconnect 
    };
};