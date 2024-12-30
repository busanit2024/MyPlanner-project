import styled from "styled-components";
import InputChat from "./chatComponent/InputChat";
import ChatTitle from "./chatComponent/ChatTitle";
import ChatListItem from "./chatComponent/ChatListItem";
import ChatMessage from './chatComponent/ChatMessage';
import NewChatButton from "./chatComponent/NewChatButton";
import { useChat } from '../../hooks/useChat';
import { useState, useEffect } from 'react';

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

    useEffect(() => {
        // 토큰 키 이름 확인
        console.log('모든 로컬스토리지 키:', Object.keys(localStorage));
        
        const token = sessionStorage.getItem('userToken');
        console.log('저장된 토큰:', token);
        
        if (token) {
            fetch('/api/user/find', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            .then(res => {
                console.log('응답 상태:', res.status);  // 응답 상태 코드 로그
                return res.json();
            })
            .then(data => {
                console.log('사용자 정보:', data);  // 응답 데이터 로그
                setCurrentUser({
                    email: data.email,
                    name: data.name,
                    profileImage: data.profileImage || '/images/default/defaultProfileImage.png'
                });
            })
            .catch(error => {
                console.error('API 호출 에러:', error);  // 자세한 에러 로그
                setCurrentUser(prev => ({
                    ...prev,
                    profileImage: '/images/default/defaultProfileImage.png'
                }));
            });
        } else {
            console.log('토큰이 없습니다');
        }
    }, []);

    const { messages, sendMessage, isConnected } = useChat(
        "test-room-1",  // 테스트용 채팅방 ID
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
                        profileImage={currentUser.profileImage}
                        userName={currentUser.name}
                        userEmail={currentUser.email}
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
