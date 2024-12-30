import React from 'react';
import styled from 'styled-components';

const MessageContainer = styled.div`
  display: flex;
  flex-direction: ${props => props.$isMine ? 'row-reverse' : 'row'};
  align-items: flex-end;
  margin: 16px 0;
  gap: 8px;
`;

const MessageBubble = styled.div`
  background-color: ${props => props.isMine ? 'var(--light-primary)' : 'var(--chat-gray)'};
  padding: 10px 16px;
  border-radius: 16px;
  border-bottom-right-radius: ${props => props.isMine ? '4px' : '16px'};
  border-bottom-left-radius: ${props => !props.isMine ? '4px' : '16px'};
  max-width: 60%;
  word-wrap: break-word;
`;

const TimeStamp = styled.span`
  font-size: 12px;
  color: #999;
  margin-bottom: 4px;
`;

const ProfileImage = styled.img`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  display: ${props => props.isMine ? 'none' : 'block'};
`;

const ChatMessage = ({ message, time, isMine }) => {
  return (
    <MessageContainer $isMine={isMine}>
      <ProfileImage 
        src="images/default/defaultProfileImage.png" 
        alt="프로필" 
        isMine={isMine}
      />
      <MessageBubble isMine={isMine}>
        {message}
      </MessageBubble>
      <TimeStamp>{time}</TimeStamp>
    </MessageContainer>
  );
};

export default ChatMessage; 