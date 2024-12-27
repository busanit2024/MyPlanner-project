import styled from "styled-components";
import InputChat from "./chatComponent/InputChat";

const ChatContainer = styled.div`
  display: flex;
  width: calc(100% + 48px);  // Layout의 좌우 패딩 보상
  height: calc(100% + 36px);  // Layout의 상단 패딩 보상
  margin: -36px -48px; 
  padding: 0;
`;

const ChatList = styled.div`
width: 30%;  
border-right: 1px solid #d9d9d9;
padding: 24px;
padding-right: 23px;
display: flex;
flex-direction: column;
height : 100%;
`;

const ChatRoom = styled.div`
width: 70%; 
display: flex;
flex-direction: column;
padding: 24px;
height : 100%;
`;

const ChatTitle = styled.div`
padding-bottom: 20px;
border-bottom: 1px solid #d9d9d9;
`;

const ChatMessages = styled.div`
flex: 1;
overflow-y: auto;
padding: 20px 0;
`;

const ChatInput = styled.div`
  padding-top: 20px;
  border-top: 1px solid #d9d9d9;
`;


export default function ChatPage() {
    return (
        <ChatContainer>
            <ChatList>
                <h2>채팅목록</h2>
            </ChatList>
            <ChatRoom>
                <ChatTitle>
                    <h3>채팅상대</h3>
                </ChatTitle>

                <ChatMessages>
                    <h4>채팅 내용</h4>
                </ChatMessages>

                <ChatInput>
                    <InputChat />
                </ChatInput>
            </ChatRoom>
        </ChatContainer>
    );
}