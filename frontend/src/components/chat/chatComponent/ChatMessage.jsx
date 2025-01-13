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
  box-sizing: border-box;
  display: inline-block;
  max-width: 70%;
  min-width: min-content;
  width: fit-content;
  
  /* 이미지일 경우 패딩 제거 */
  ${props => props.isImage && `
    padding: 0;
    overflow: hidden;
    
    img {
      max-width: 200px;
      max-height: 200px;
      object-fit: contain;
    }
  `}
  
  /* 텍스트 메시지일 경우에만 적용 */
  ${props => !props.isImage && `
    white-space: ${props.message?.length > 30 ? 'pre-wrap' : 'nowrap'};
    word-break: ${props.message?.length > 30 ? 'break-word' : 'keep-all'};
    overflow-wrap: ${props.message?.length > 30 ? 'break-word' : 'normal'};
    text-align: left;
  `}
`;


const TimeStamp = styled.span`
  font-size: 10px;
  color: #999;
  margin-top: 4px;
`;

const ChatMessage = ({ message, time, isMine, senderName, senderProfile }) => {
  // 메시지가 이미지 URL인지 확인하는 함수
  const isImageMessage = (msg) => {
    return msg?.includes('firebasestorage.googleapis.com') || 
           msg?.match(/\.(jpeg|jpg|gif|png)$/i) != null;
  };

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
        <MessageBubble isMine={isMine} message={message} isImage={isImageMessage(message)}>
          {isImageMessage(message) ? (
            <img 
              src={message} 
              alt="첨부 이미지"
              onError={(e) => {
                console.error('이미지 로드 실패:', message);
                e.target.style.display = 'none';
              }} 
            />
          ) : (
            message
          )}
        </MessageBubble>
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
