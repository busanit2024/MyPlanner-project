import { useEffect, useRef, useState, useCallback } from 'react';
import { Stomp } from '@stomp/stompjs';
import { useNoti } from '../context/NotiContext';

export const useChat = (roomId, userEmail, mounted, onChatRoomUpdate) => {
    const [messages, setMessages] = useState([]);
    const client = useRef(null);
    const { setUnreadChatCount } = useNoti();

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

    //웹소켓 연결
    const connect = useCallback(() => {
        if (!userEmail || !mounted.current) return; // 채팅방 선택 전에도 알림 받기 위해 roomId 제거
        
        const socket = new WebSocket('ws://localhost:8080/chat');
        client.current = Stomp.over(socket);
        
        client.current.connect({}, () => {
            if (!mounted.current) {
                disconnect();
                return;
            }

            // 채팅방 메시지 구독 ( roomId 여기 추가)
            if(roomId) {
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
            }

            // 읽지 않은 메시지 수 구독
            client.current.subscribe(`/sub/chat/unread/${userEmail}`, 
                (payload) => {
                    if(!mounted.current) return;

                    try {
                        const unreadCounts = JSON.parse(payload.body);
                        const totalUnread = Object.values(unreadCounts)
                            .reduce((a,b) => a + b, 0);
                        setUnreadChatCount(totalUnread);

                        // 채팅방 목록 업데이트
                        if(onChatRoomUpdate) {
                            onChatRoomUpdate(unreadCounts);
                        }
                    } catch (error) {
                        console.error('읽지 않은 메시지 수 처리 실패', error);
                    }
                }
            );
        });
    }, [roomId, userEmail, disconnect, onChatRoomUpdate]);

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