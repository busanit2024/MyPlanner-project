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

    const { roomId } = useParams();  // URL에서 roomId 가져오기

    useEffect(() => {
        const token = sessionStorage.getItem('userToken');
        if (token) {
            // 1. 현재 사용자 정보 가져오기
            fetch('/api/user/find', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            .then(res => res.json())
            .then(data => {
                setCurrentUser({
                    email: data.email,
                    name: data.name,
                    profileImage: data.profileImage || '/images/default/defaultProfileImage.png'
                });

                // 2. 채팅방 정보 가져오기
                return fetch(`/api/chat/rooms/${roomId}`);
            })
            .then(res => res.json())
            .then(roomData => {
                // 3. 채팅방 참여자 중 현재 사용자가 아닌 상대방 찾기
                const partnerEmail = roomData.participants.find(
                    email => email !== currentUser.email
                );

                // 4. 상대방 정보 가져오기
                return fetch(`/api/user/profile/${partnerEmail}`);
            })
            .then(res => res.json())
            .then(partnerData => {
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

    const { messages, sendMessage, isConnected } = useChat(
        roomId,  // URL에서 가져온 roomId 사용
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
                    <NewChatButton />
                </NewChatButtonContainer>
            </ChatList>

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
        </ChatContainer>
    );
}
