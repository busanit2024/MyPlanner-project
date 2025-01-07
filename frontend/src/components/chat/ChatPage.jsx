import styled from "styled-components";
import ChatListItem from "./chatComponent/ChatListItem";
import ChatRoom from "./chatComponent/ChatRoom";
import NewChatButton from "./chatComponent/NewChatButton";
import { useChat } from '../../hooks/useChat';
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from "../../context/AuthContext";

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

    const { messages, sendMessage, isConnected, loadChatHistory } = useChat(
        selectedRoom?.id || roomId,
        user?.email  
    );

    useEffect(() => {
        if (initialRoom && initialPartner) {
          // 초기 채팅방과 상대방 정보가 있으면 바로 채팅방 열기
          setSelectedRoom(initialRoom);
          setChatPartner(initialPartner);
        }
      }, []);

    // 현재 사용자 정보 가져오기
    useEffect(() => {
        if (!loading && !user) {
            navigate("/login");
        }
    }, [user, loading]);

    const handleNewChat = (newChatRoom, selectedUsers) => {
        //인원수에 따른 채팅방 타입 결정
        const isTeamChat = selectedUsers.length > 1;
        const chatRoomType = isTeamChat ? "TEAM" : "INDIVIDUAL";

        //채팅방 정보 설정
        const updatedChatRoom = {
            ...newChatRoom,
            chatRoomType: chatRoomType
        };

        setSelectedRoom(newChatRoom);
        setChatRooms(prevChatRooms => [...prevChatRooms, updatedChatRoom]);

        if (newChatRoom.chatRoomType === "INDIVIDUAL") {
            // 현재 로그인한 사용자와 다른 참여자 찾기
            const partner = newChatRoom.participants.find(
                p => p.email !== user.email  
            );

            if (partner) {
                setChatPartner({
                    email: partner.email,
                    name: partner.username,
                    profileImage: partner.profileImageUrl || '/images/default/defaultProfileImage.png'
                });               
            }
        } else {
            const otherParticipants = newChatRoom.participants.filter(p => p.email !== user.email);
            setChatPartner({
                email: null,
                name: otherParticipants.map(p => p.username).join(', '), 
                participants: otherParticipants,
                isTeam: true
            });
        }
    };

    const handleSendMessage = (content) => {
        sendMessage(content);
    };

    const handleSelectRoom = (room, partner) => {
        // 기존 선택된 방을 초기화하고 새로운 방 설정
        setSelectedRoom(null);  // 추가: 먼저 선택 초기화
        setChatPartner({
            email: partner.email,
            name: partner.username,
            profileImage: partner.profileImageUrl || '/images/default/defaultProfileImage.png'
        });
        
        // 약간의 지연 후 새로운 방 설정
        setTimeout(() => {
            setSelectedRoom(room);
        }, 0);
    };

    const handleLeaveChat = () => {
        // 선택된 채팅방 초기화
        setSelectedRoom(null);

        // 채팅방 목록 새로고침
        if (user?.email) {
            fetch(`/api/chat/rooms/user/${user.email}`)
            .then(res => res.json())
            .then(rooms => {
                setChatRooms(rooms);
            })
            .catch(error => {
                console.error('채팅방 목록 로드 실패:', error);
            });
        }
    };
    
    // useChat 훅 의존성에 selectedRoom 추가
    useEffect(() => {
        if (selectedRoom) {
            const fetchMessages = async () => {
                try {
                    loadChatHistory();
                } catch (error) {
                    console.error('메시지 로드 실패:', error);
                }
            };
            fetchMessages();
        }
    }, [selectedRoom]);

    return (
        <ChatContainer>
            <ChatList>
                <ChatListScroll>
                    <ChatListItem chatRooms={chatRooms} onSelectRoom={handleSelectRoom}/> 
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
