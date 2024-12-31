import { useEffect, useRef, useState, useCallback } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

export const useChat = (roomId, userEmail) => {
    const [messages, setMessages] = useState([]);
    const client = useRef(null);

    const connect = useCallback(() => {
        if (client.current) {
            client.current.deactivate();
        }

        const stompClient = new Client({
            webSocketFactory: () => new SockJS('http://localhost:8080/chat'),
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
            onConnect: () => {
                console.log("웹소켓 연결 성공");
                stompClient.subscribe(`/sub/chat/rooms/${roomId}`, (message) => {
                    console.log('메시지 수신:', message);
                    const newMessage = JSON.parse(message.body);
                    setMessages(prev => [...prev, newMessage]);
                });
            },
            onStompError: (frame) => {
                console.error('STOMP 에러:', frame);
            }
        });

        stompClient.activate();
        client.current = stompClient;
    }, [roomId]);

    useEffect(() => {
        if (roomId) {
            // 채팅방 데이터 가져오기
            fetch(`/api/chat/rooms/${roomId}`)
            .then(res => {
                if (!res.ok) throw new Error(`Status: ${res.status}`);
                return res.json();
            })
            .then(roomData => {
                console.log('채팅방 데이터:', roomData);
                const partnerEmail = roomData.participants.find(
                    participant => participant.email !== userEmail
                )?.email;
            })
            .catch(error => {
                console.error('채팅방 정보 로딩 실패:', error);
            });

            // 대화내역 가져오기    
            fetch(`/api/chat/rooms/${roomId}/messages`)
            .then(res => {
                if (!res.ok) throw new Error(`Status: ${res.status}`);
                return res.json();
            })
            .then(data => {
                setMessages(data);
            })
            .catch(error => {
                console.error('채팅 이력 로딩 실패:', error);
            });
        }
    }, [roomId, userEmail]);  

    const sendMessage = useCallback((content) => {
        if (!client.current?.connected) {
            console.log('연결되지 않음, 재연결 시도');  
            connect();
            return;
        }
    
        const message = {
            senderEmail: userEmail,
            contents: content,
            chatRoomId: roomId  
        };
    
        console.log('메시지 전송 시도:', message);  
    
        client.current.publish({
            destination: `/chat/rooms/${roomId}/send`,
            body: JSON.stringify(message)
        });
    }, [roomId, userEmail, connect]);

    return { messages, sendMessage };
}; 