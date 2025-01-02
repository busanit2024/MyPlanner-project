import React from 'react';
import styled from 'styled-components';
import { useAuth } from '../../../context/AuthContext';

const Container = styled.div`
  display: flex;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid #eee;
`;

const ProfileImage = styled.img`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 10px;
`;

const ChatInfo = styled.div`
  flex: 1;
`;

const ChatHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
`;

const Name = styled.span`
  font-weight: bold;
  font-size: 14px;
`;

const Date = styled.span`
  font-size: 12px;
  color: gray;
`;

const Message = styled.div`
  font-size: 14px;
  color: #333;
`;

const formatDate = (timestamp) => {
  if (!timestamp) return '';
  
  const date = new Date(timestamp);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).replace(/\. /g, '-').replace('.', '');
};

const ChatListItem = ({ chatRoom }) => {
  const { user } = useAuth();

  if (!chatRoom) {
    return null;
  }
  
  const getOtherUserInfo = () => {
    const otherUser = chatRoom.participants.find(
      participant => participant.email !== user.email
    );
    return otherUser || {};
  };

  const otherUser = getOtherUserInfo();

  return (
    <Container>
      <ProfileImage
        src={otherUser.profileImage || "/images/default/defaultProfileImage.png"}
        alt="프로필 이미지"
      />
      <ChatInfo>
        <ChatHeader>
          <Name>{otherUser.nickname || "알 수 없음"}</Name>
          <Date>
            {chatRoom.lastMessage && formatDate(chatRoom.lastMessage.sendTime)}
          </Date>
        </ChatHeader>
        <Message>
          {chatRoom.lastMessage && chatRoom.lastMessage.contents}
        </Message>
      </ChatInfo>
    </Container>
  );
};

export default ChatListItem;