import styled from "styled-components";
import ChatListItem from "./chatComponent/ChatListItem";
import ChatRoom from "./chatComponent/ChatRoom";
import NewChatButton from "./chatComponent/NewChatButton";
import { useChat } from '../../hooks/useChat';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from "../../context/AuthContext";
import { useNoti } from "../../context/NotiContext";

const ChatContainer = styled.div`
    display: flex;
    width: 100%;
    height: calc(100vh - 84px);
    margin: 0;
    padding: 0;
    overflow: hidden;
`;

const ChatList = styled.div`
    width: 40%;  
    border-right: 1px solid var(--light-gray);
    padding: 24px 23px 24px 24px;
    display: flex;
    flex-direction: column;
    height: 100%;
    position: relative;
    overflow: hidden;
`;

const ChatListScroll = styled.div`
    overflow-y: auto;
    flex-grow: 1;
`;

const NewChatButtonContainer = styled.span`
    position: absolute;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    bottom: 100px;
    right: 24px;
    z-index: 2;
    background: var(--primary-color);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    
    &:hover {
        opacity: 0.9;
    }
`;

export default function ChatPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { initialRoom, initialPartner } = location.state || {};
    const { user, loading } = useAuth();  
    const { roomId } = useParams();
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [chatRooms, setChatRooms] = useState([]);
    const [chatPartner, setChatPartner] = useState({
        email: '',
        name: '',
        profileImage: null
    });
    const { setUnreadChatCount } = useNoti();
    const mounted = useRef(true);

    const { messages, sendMessage, isConnected, loadChatHistory, disconnect } = useChat(
        selectedRoom?.id || roomId,
        user?.email || '',
        mounted
    );

    // 채팅방 목록과 읽지 않은 메시지 수를 가져오는 함수
    const fetchChatRoomsAndUnreadCount = useCallback(async () => {
        if (!user?.email) return;
        
        try {
            const [roomsResponse, unreadResponse] = await Promise.all([
                fetch(`/api/chat/rooms/user/${user.email}`),
                fetch(`/api/chat/rooms/unread/${user.email}`)
            ]);

            const [rooms, unreadCounts] = await Promise.all([
                roomsResponse.json(),
                unreadResponse.json()
            ]);

            // 전체 읽지 않은 메시지 수 계산
            const totalUnread = Object.values(unreadCounts).reduce((a, b) => a + b, 0);
            setUnreadChatCount(totalUnread);

            // 채팅방 목록 업데이트
            const roomsWithUnread = rooms.map(room => ({
                ...room,
                unreadCount: unreadCounts[room.id] || 0
            }));
            setChatRooms(roomsWithUnread);

        } catch (error) {
            console.error('Failed to fetch chat rooms and unread counts:', error);
        }
    }, [user?.email, setUnreadChatCount]);

    useEffect(() => {
        mounted.current = true;
        return () => {
            mounted.current = false;
            disconnect();
        };
    }, [disconnect]);

    useEffect(() => {
        if (initialRoom && initialPartner) {
            setSelectedRoom(initialRoom);
            setChatPartner(initialPartner);
        }
    }, [initialRoom, initialPartner]);

    useEffect(() => {
        if (!loading) {
            if (!user) {
                if (mounted.current) {
                    disconnect();
                    setSelectedRoom(null);
                    setChatRooms([]);
                    setChatPartner({
                        email: '',
                        name: '',
                        profileImage: null
                    });
                }
                navigate("/login", { replace: true });
            }
        }
    }, [user, loading, navigate, disconnect]);

    useEffect(() => {
        if (selectedRoom) {
            loadChatHistory();
        }
    }, [selectedRoom, loadChatHistory]);

    useEffect(() => {
        if (user?.email) {
            fetchChatRoomsAndUnreadCount();
            const interval = setInterval(fetchChatRoomsAndUnreadCount, 5000);
            return () => clearInterval(interval);
        }
    }, [user?.email, fetchChatRoomsAndUnreadCount]);

    const handleSelectRoom = useCallback((room, partner) => {
        if (!mounted.current || !user) return;
        
        fetch(`/api/chat/rooms/${room.id}/messages`)
            .then(response => response.json())
            .then(messages => {
                const lastMessage = messages[messages.length - 1];
                
                return fetch(`/api/chat/rooms/${room.id}/read-status`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        userEmail: user.email,
                        lastChatLogId: lastMessage?.id || null
                    })
                });
            })
            .then(() => {
                if (mounted.current) {
                    setChatRooms(prevRooms => 
                        prevRooms.map(r => 
                            r.id === room.id ? { ...r, unreadCount: 0 } : r
                        )
                    );
                    // 전체 읽지 않은 메시지 수 다시 계산
                    fetchChatRoomsAndUnreadCount();
                }
            })
            .catch(error => console.error('읽음 상태 업데이트 실패:', error));
    
        setSelectedRoom(null);
        setChatPartner({
            email: partner.email,
            name: partner.username,
            profileImage: partner.profileImageUrl || '/images/default/defaultProfileImage.png'
        });
    
        setTimeout(() => {
            if (mounted.current) {
                setSelectedRoom(room);
            }
        }, 0);
    }, [user, fetchChatRoomsAndUnreadCount]);

    const handleLeaveChat = useCallback(async (roomId) => {
        try {
            disconnect();
            
            const response = await fetch(`/api/chat/rooms/${roomId}/leave`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userEmail: user?.email })
            });
    
            if (!response.ok) {
                throw new Error('채팅방 나가기 실패');
            }
    
            if (mounted.current) {
                setChatRooms(prevRooms => prevRooms.filter(room => room.id !== roomId));
                setSelectedRoom(null);
                setChatPartner({
                    email: '',
                    name: '',
                    profileImage: null
                });
                // 채팅방 나가기 후 읽지 않은 메시지 수 업데이트
                fetchChatRoomsAndUnreadCount();
            }
    
            navigate('/chat', { replace: true });
    
        } catch (error) {
            console.error('채팅방 나가기 실패:', error);
        }
    }, [user?.email, navigate, disconnect, fetchChatRoomsAndUnreadCount]);

    const handleNewChat = useCallback((newChatRoom, selectedUsers) => {
        const isTeamChat = selectedUsers.length > 1;
        const chatRoomType = isTeamChat ? "TEAM" : "INDIVIDUAL";
        const updatedChatRoom = {
            ...newChatRoom,
            chatRoomType: chatRoomType
        };

        setSelectedRoom(newChatRoom);
        setChatRooms(prevChatRooms => [...prevChatRooms, updatedChatRoom]);

        if (newChatRoom.chatRoomType === "INDIVIDUAL") {
            const partner = newChatRoom.participants.find(
                p => p.email !== user?.email
            );

            if (partner) {
                setChatPartner({
                    email: partner.email,
                    name: partner.username,
                    profileImage: partner.profileImageUrl || '/images/default/defaultProfileImage.png'
                });
            }
        } else {
            const otherParticipants = newChatRoom.participants.filter(p => p.email !== user?.email);
            setChatPartner({
                email: null,
                name: otherParticipants.map(p => p.username).join(', '),
                participants: otherParticipants,
                isTeam: true
            });
        }
    }, [user?.email]);

    const handleChatRoomUpdate = useCallback((updatedRoom) => {
        setChatRooms(prevRooms => 
            prevRooms.map(room => 
                room.id === updatedRoom.id ? updatedRoom : room
            )
        );

        if (selectedRoom?.id === updatedRoom.id) {
            setSelectedRoom(updatedRoom);
        }
        
        // 채팅방 업데이트 시 읽지 않은 메시지 수 업데이트
        fetchChatRoomsAndUnreadCount();
    }, [selectedRoom?.id, fetchChatRoomsAndUnreadCount]);

    const handleSendMessage = useCallback((content) => {
        sendMessage(content);
    }, [sendMessage]);

    if (loading) {
        return <div>로딩중...</div>;
    }

    return (
        <ChatContainer>
            <ChatList>
                <ChatListScroll>
                    <ChatListItem 
                        chatRooms={chatRooms} 
                        onSelectRoom={handleSelectRoom} 
                        user={user}
                    /> 
                </ChatListScroll>
                <NewChatButtonContainer>
                    <NewChatButton 
                        currentUser={user} 
                        onChatCreated={handleNewChat}
                    /> 
                </NewChatButtonContainer>
            </ChatList>
    
            {selectedRoom ? (
                <ChatRoom
                    selectedRoom={selectedRoom}
                    chatPartner={chatPartner}
                    messages={messages}
                    user={user}
                    isConnected={isConnected}
                    onSendMessage={handleSendMessage}
                    onChatRoomUpdate={handleChatRoomUpdate}
                    onLeaveChat={handleLeaveChat}
                />
            ) : (
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    width: '100%' 
                }}>
                    채팅방을 선택하거나 새로운 채팅을 시작하세요
                </div>
            )}
        </ChatContainer>
    );
}