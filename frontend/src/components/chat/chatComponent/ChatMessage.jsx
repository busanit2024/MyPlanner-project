import styled from 'styled-components';

const MessageContainer = styled.div`
  display: flex;
  flex-direction: ${props => props.isMine ? 'row-reverse' : 'row'};
  align-items: flex-start;
  margin: 16px 0;
  gap: 8px;
`;

const ProfileImage = styled.img`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: ${props => props.isMine ? 'none' : 'block'};  // 내 메시지는 프로필 숨김
`;

const MessageContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: ${props => props.isMine ? 'flex-end' : 'flex-start'};
`;

const SenderName = styled.span`
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
  display: ${props => props.isMine ? 'none' : 'block'};  // 내 메시지는 이름 숨김
`;

const MessageBubble = styled.div`
  background-color: ${props => props.isMine ? 'var(--primary-color)' : 'var(--chat-gray)'};
  color: ${props => props.isMine ? 'white' : 'black'};
  padding: 8px 12px;
  border-radius: 12px;
  max-width: 70%;
  word-break: keep-all;
  white-space: ${props => props.message?.length > 16 ? 'nowrap' : 'normal'}; // 메세지 길이 16자 이상일 시 줄바꿈
`;

const TimeStamp = styled.span`
  font-size: 10px;
  color: #999;
  margin-top: 4px;
`;

const ChatMessage = ({ message, time, isMine, senderName, senderProfile }) => {
  return (
    <MessageContainer isMine={isMine}>
      <ProfileImage 
        src={senderProfile || '/images/default/defaultProfileImage.png'} 
        alt="프로필" 
        isMine={isMine}
        onError={(e) => {
          e.target.src = '/images/default/defaultProfileImage.png';
        }}
      />
      <MessageContent isMine={isMine}>
        <SenderName isMine={isMine}>{senderName}</SenderName>
        <MessageBubble isMine={isMine}>{message}</MessageBubble>
        <TimeStamp>
          {new Date(time).toLocaleTimeString('ko-KR', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          })}
        </TimeStamp>
      </MessageContent>
    </MessageContainer>
  );
};

export default ChatMessage;
