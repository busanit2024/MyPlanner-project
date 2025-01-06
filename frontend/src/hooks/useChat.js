import { useEffect, useRef, useState, useCallback } from 'react';
import { Stomp } from '@stomp/stompjs';

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
                const messageArray = Array.isArray(data) ? data : [data];
                setMessages(messageArray);
            })
            .catch(error => {
                console.error('채팅 이력 로딩 실패:', error);
            });
    }, [roomId]);

    const connect = useCallback(() => {
        if (!roomId || !userEmail) {
            return;
        }
        
        const socket = new WebSocket('ws://localhost:8080/chat');
        client.current = Stomp.over(socket);
        client.current.connect({}, () => {
            console.log('Connected');
            // 메시지 수신
            client.current.subscribe(`/sub/chat/rooms/${roomId}`, (message) => {
            //누군가 발송했던 메시지를 리스트에 추가
            const newMessage = JSON.parse(message.body);
            setMessages((prevMessage) => [...prevMessage, newMessage]);
            });
        });
          
    }, [roomId, userEmail]);


    // roomId가 변경될 때마다 연결 재설정 및 메시지 초기화
    useEffect(() => {
        setMessages([]); // 메시지 초기화
        if (roomId && userEmail) {
            connect();
        }

        return () => {
            if (client.current?.connected) {
                client.current = { connected: false };
            }  
        };
    }, [roomId, userEmail ]);

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

        // client.current.publish({
        //     destination: `/pub/chat/rooms/${roomId}/send`,
        //     body: JSON.stringify(message)
        // });
        client.current.send(`/pub/chat/rooms/${roomId}/send`, {}, JSON.stringify(message));
    }, [roomId, userEmail, connect]);

    return { messages, sendMessage, isConnected: !!client.current?.connected, loadChatHistory  };
}; 