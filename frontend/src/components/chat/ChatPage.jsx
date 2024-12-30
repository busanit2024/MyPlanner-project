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
  margin: -36px 0;
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
  flex: 1;
  overflow-y: auto;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background-color:var(--light-gray);
    border-radius: 3px;
  }
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

const ChatRoom = styled.div`
  width: 70%; 
  display: flex;
  flex-direction: column;
  padding: 10px 0 24px 12px;
  height: 100%;
  overflow: hidden;
`;

const ChatTitleWrapper = styled.div`
  position: relative;
  z-index: 1;
  background: white;
  margin: 0 -12px;
  margin-right: 0;
  padding: 0px 12px 10px 12px;
  border-bottom: 1px solid var(--light-gray);
  width: 100%;
`;

const ChatMessagesScroll = styled.div`
  flex: 1;
  overflow-y: auto;
  min-height: 0;
  padding-right: 12px;
  margin-right: 0;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: var(--light-gray);
    border-radius: 3px;
  }
`;

const ChatMessages = styled.div`
  display: flex;
  flex-direction: column;
`;

const ChatInput = styled.div`
  position: relative;
  z-index: 1;
  background: white;
  margin: 0 -12px;
  padding: 12px 12px 20px 12px;
  border-top: 1px solid var(--light-gray);
  width: 100%;
`;



export default function ChatPage() {
    const { roomId } = useParams();
    const [currentUser, setCurrentUser] = useState({
        id: '',
        email: '',
        name: '',
        profileImage: null
    });

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            fetch('/api/user/find', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            .then(res => res.json())
            .then(data => {
                setCurrentUser({
                    id: data.id,
                    email: data.email,
                    name: data.name,
                    profileImage: data.profileImage || '/images/default/defaultProfileImage.png'
                });
            })
            .catch(error => {
                console.error('사용자 정보 로딩 실패:', error);
                setCurrentUser(prev => ({
                    ...prev,
                    profileImage: '/images/default/defaultProfileImage.png'
                }));
            });
        }
    }, []);

    const { messages, sendMessage, isConnected } = useChat(
        roomId, 
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