import styled from "styled-components";
import InputChat from "./chatComponent/InputChat";
import ChatTitle from "./chatComponent/ChatTitle";
import defaultProfile from "../../images/defaultProfile.png";

const ChatContainer = styled.div`
  display: flex;
  width: calc(100% + 48px);  // Layout의 좌우 패딩 보상
  height: calc(100% + 36px);  // Layout의 상단 패딩 보상
  margin: -36px -48px; 
  padding: 0;
`;

const ChatList = styled.div`
width: 40%;  
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
    const profileImage = defaultProfile;
    const userName = "닉네임";
    const userEmail = "test@test.com";

    return (
        <ChatContainer>
            <ChatList>
                <ChatListItem />
            </ChatList>
            <ChatRoom>
                <ChatTitle 
                    profileImage={profileImage} 
                    userName={userName} 
                    userEmail={userEmail}
                    style={{
                        paddingBottom: '20px',
                        borderBottom: '1px solid #d9d9d9',
                        width: 'calc(100% + 48px)',
                        margin: '0 -24px',
                        paddingLeft: '24px',
                        paddingRight: '24px'
                    }}
                />
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