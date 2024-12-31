import styled from "styled-components";
import InputChat from "./chatComponent/InputChat";
import ChatTitle from "./chatComponent/ChatTitle";
import ChatListItem from "./chatComponent/ChatListItem";
import ChatMessage from './chatComponent/ChatMessage';
import NewChatButton from "./chatComponent/NewChatButton";
import { useChat } from '../../hooks/useChat';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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

const ChatRoom = styled.div`
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    height: 100%;
`;

const ChatTitleWrapper = styled.div`
    padding: 24px;
    border-bottom: 1px solid var(--light-gray);
    display: flex;
    align-items: center;
    gap: 12px;
`;

const ChatMessagesScroll = styled.div`
    flex-grow: 1;
    overflow-y: auto;
    padding: 0 24px;
`;

const ChatMessages = styled.div`
    display: flex;
    flex-direction: column;
`;

const ChatInput = styled.div`
    padding: 24px;
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
    const { user, loading } = useAuth();  
    const { roomId } = useParams();
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [chatPartner, setChatPartner] = useState({
        email: '',
        name: '',
        profileImage: null
    });


    // 현재 사용자 정보 가져오기
    useEffect(() => {
        if (!loading && !user) {
            navigate("/login");
        }
        console.log("현재 로그인한 사용자:", user);
    }, [user, loading]);

    const handleNewChat = (newChatRoom) => {
        console.log("새로운 채팅방 데이터:", newChatRoom);
        setSelectedRoom(newChatRoom);

        if (newChatRoom.chatRoomType === "INDIVIDUAL") {
            // 현재 로그인한 사용자와 다른 참여자 찾기
            const partner = newChatRoom.participants.find(
                p => p.email !== user.email  // useAuth에서 가져온 user 정보 사용
            );

            console.log("찾은 상대방:", partner);

            if (partner) {
                setChatPartner({
                    email: partner.email,
                    name: partner.username,
                    profileImage: partner.profileImageUrl || '/images/default/defaultProfileImage.png'
                });
            }
        }
    };

    const { messages, sendMessage, isConnected } = useChat(
        selectedRoom?.id || roomId,
        user?.email  
    );

    const handleSendMessage = (content) => {
        sendMessage(content);
    };

    return (
        <ChatContainer>
            <ChatList>
                <ChatListScroll>
                    <ChatListItem /> 
                </ChatListScroll>
                <NewChatButtonContainer>
                    <NewChatButton 
                        currentUser={user} 
                        onChatCreated={handleNewChat}
                    /> 
                </NewChatButtonContainer>
            </ChatList>
    
            {selectedRoom ? (
                <ChatRoom>
                    <ChatTitleWrapper>
                        <img src="/images/icon/ArrowLeft.svg" alt="뒤로 가기" />
                        <ChatTitle 
                            profileImage={chatPartner.profileImage}
                            userName={
                                selectedRoom.chatRoomType === "INDIVIDUAL" 
                                    ? chatPartner.name 
                                    : `그룹 채팅 (${selectedRoom.participants.length}명)`
                            }
                            userEmail={chatPartner.email}
                            isGroup={selectedRoom.chatRoomType !== "INDIVIDUAL"}
                            participantCount={
                                selectedRoom.chatRoomType !== "INDIVIDUAL" 
                                    ? selectedRoom.participants.length 
                                    : null
                            }
                        />
                    </ChatTitleWrapper>
                    <ChatMessagesScroll>
                        <ChatMessages>
                            {messages && messages.map(msg => (
                                <ChatMessage
                                    key={msg.id}
                                    message={msg.contents}
                                    time={msg.sendTime}
                                    isMine={msg.senderEmail === user?.email}
                                    senderName={msg.senderEmail === user?.email ? null : chatPartner.name}
                                    senderProfile={msg.senderEmail === user?.email ? null : chatPartner.profileImage}
                                />
                            ))}
                        </ChatMessages>
                    </ChatMessagesScroll>
                    <ChatInput>
                        <InputChat onSendMessage={handleSendMessage} />
                    </ChatInput>
                </ChatRoom>
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
