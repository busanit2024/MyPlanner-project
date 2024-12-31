import styled from "styled-components";
import InputChat from "./chatComponent/InputChat";
import ChatTitle from "./chatComponent/ChatTitle";
import ChatListItem from "./chatComponent/ChatListItem";
import ChatMessage from './chatComponent/ChatMessage';
import NewChatButton from "./chatComponent/NewChatButton";
import { useChat } from '../../hooks/useChat';
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

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
    const [currentUser, setCurrentUser] = useState({
        email: '',
        name: '',
        profileImage: null
    });
    
    const [chatPartner, setChatPartner] = useState({
        email: '',
        name: '',
        profileImage: null
    });

    const { roomId } = useParams();
    const [selectedRoom, setSelectedRoom] = useState(null);

    const handleNewChat = (newChatRoom) => {
        setSelectedRoom(newChatRoom);
        const partner = newChatRoom.participants.find(
            p => p.email !== currentUser.email
        );
        
        fetch(`/api/user/find/${partner.email}`)
            .then(res => res.json())
            .then(userData => {
                setChatPartner({
                    email: userData.email,
                    name: userData.name,
                    profileImage: userData.profileImage || '/images/default/defaultProfileImage.png'
                });
            });
    };

    useEffect(() => {
        const token = sessionStorage.getItem('userToken');
        if (token) {
            fetch('/api/user/find', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            .then(res => {
                if (!res.ok) throw new Error(`Status: ${res.status}`);
                return res.json();
            })
            .then(data => {
                setCurrentUser({
                    email: data.email,
                    name: data.name,
                    profileImage: data.profileImage || '/images/default/defaultProfileImage.png'
                });

                if (roomId) {
                    return fetch(`/api/chat/rooms/${roomId}`);
                }
            })
            .then(res => {
                if (!res) return; // roomId가 없는 경우
                if (!res.ok) throw new Error(`채팅방 정보 로드 실패: ${res.status}`);
                return res.json();
            })
            .then(roomData => {
                if (!roomData) return; // roomId가 없는 경우
                setSelectedRoom(roomData);
                
                const partnerEmail = roomData.participants.find(
                    participant => participant.email !== currentUser.email
                );

                return fetch(`/api/user/find/${partnerEmail.email}`);
            })
            .then(res => {
                if (!res) return; // 이전 단계에서 return된 경우
                if (!res.ok) throw new Error(`상대방 정보 로드 실패: ${res.status}`);
                return res.json();
            })
            .then(partnerData => {
                if (!partnerData) return; // 이전 단계에서 return된 경우
                setChatPartner({
                    email: partnerData.email,
                    name: partnerData.name,
                    profileImage: partnerData.profileImage || '/images/default/defaultProfileImage.png'
                });
            })
            .catch(error => {
                console.error('데이터 로딩 실패:', error);
            });
        }
    }, [roomId, currentUser.email]);

    const { messages, sendMessage } = useChat(
        selectedRoom?.id || roomId,
        currentUser.email
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
                    <NewChatButton currentUser={currentUser} onChatCreated={handleNewChat}/> 
                </NewChatButtonContainer>
            </ChatList>

            {selectedRoom ? (
                <ChatRoom>
                    <ChatTitleWrapper>
                        <ChatTitle 
                            profileImage={chatPartner.profileImage}
                            userName={chatPartner.name}
                            userEmail={chatPartner.email}
                        />
                    </ChatTitleWrapper>
                    <ChatMessagesScroll>
                        <ChatMessages>
                            {messages.map(msg => (
                                <ChatMessage
                                    key={msg.id}
                                    message={msg.contents}
                                    time={msg.sendTime}
                                    isMine={msg.senderEmail === currentUser.email}
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
