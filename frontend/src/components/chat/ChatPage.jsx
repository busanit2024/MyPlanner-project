import styled from "styled-components";
import InputChat from "./chatComponent/InputChat";
import ChatTitle from "./chatComponent/ChatTitle";
import ChatListItem from "./chatComponent/ChatListItem";
import defaultProfile from "../../images/defaultProfile.png";
import ChatMessage from './chatComponent/ChatMessage';
import NewChatButton from "./chatComponent/NewChatButton";

const ChatContainer = styled.div`
  display: flex;
  width: calc(100% + 48px);
  height: calc(100vh - 84px);
  margin: -36px -48px; 
  padding: 0;
  overflow: hidden;
`;

const ChatList = styled.div`
  width: 40%;  
  border-right: 1px solid #d9d9d9;
  padding: 24px;
  padding-right: 23px;
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
    background-color: #d9d9d9;
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
  padding: 10px 0 24px 24px;
  height: 100%;
  overflow: hidden;
`;

const ChatTitleWrapper = styled.div`
  position: relative;
  z-index: 1;
  background: white;
  margin: 0 -24px;
  margin-right: 0;
  padding: 0px 0 10px 24px;
  border-bottom: 1px solid #d9d9d9;
  width: 100%;
`;

const ChatMessagesScroll = styled.div`
  flex: 1;
  overflow-y: auto;
  min-height: 0;
  padding-right: 0;
  margin-right: 0;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: #d9d9d9;
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
  margin: 0 -24px;
  margin-right: 0;
  padding: 12px 0 20px 24px;
  border-top: 1px solid #d9d9d9;
  width: 100%;
`;



export default function ChatPage() {
    const profileImage = defaultProfile;
    const userName = "닉네임";
    const userEmail = "test@test.com";

    // 테스트용 메시지 
    const messages = [
        {
            id: 1,
            message: "안녕하세요!",
            time: "오후 6:40",
            isMine: false
        },
        {
            id: 2,
            message: "네 안녕하세요~",
            time: "오후 6:49",
            isMine: true
        },
        {
            id: 3,
            message: "오늘 일정 확인하셨나요?",
            time: "오후 6:49",
            isMine: false
        }
    ];

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
                        profileImage={profileImage} 
                        userName={userName} 
                        userEmail={userEmail}
                    />
                </ChatTitleWrapper>
                <ChatMessagesScroll>
                    <ChatMessages>
                        {messages.map(msg => (
                            <ChatMessage
                                key={msg.id}
                                message={msg.message}
                                time={msg.time}
                                isMine={msg.isMine}
                            />
                        ))}
                    </ChatMessages>
                </ChatMessagesScroll>
                <ChatInput>
                    <InputChat />
                </ChatInput>
            </ChatRoom>
        </ChatContainer>
    );
}