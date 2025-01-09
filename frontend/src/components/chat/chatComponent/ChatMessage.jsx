import styled from 'styled-components';
import React, { useCallback } from 'react';

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
  
  /* 16자 기준으로 줄바꿈 처리 */
  white-space: ${props => props.message?.length > 30 ? 'pre-wrap' : 'nowrap'};
  word-break: ${props => props.message?.length > 30 ? 'break-word' : 'keep-all'};
  overflow-wrap: ${props => props.message?.length > 30 ? 'break-word' : 'normal'};
  
  text-align: left;
`;

const MessageInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: ${props => props.isMine ? 'flex-end' : 'flex-start'};
`;

const MessageRow = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 4px;
  flex-direction: ${props => props.isMine ? 'row-reverse' : 'row'}; // row로 변경
`;

const UnreadCount = styled.span`
  font-size: 12px;
  color: var(--gray);
  margin-bottom: 2px;
  min-width: 13px; // 숫자 너비 고정
  text-align: center;
`;

const TimeStamp = styled.span`
  font-size: 12px;
  color: var(--gray);
  margin-top: 4px;
`;

const ChatMessage = ({ message, time, isMine, senderName, senderProfile,  messageId, readStatuses, selectedRoom }) => {
  const getUnreadCount = useCallback((currentMessageId) => {
    if (!readStatuses || Object.keys(readStatuses).length === 0) {
        return selectedRoom.participants.length - 1 || 0 ;
    }

    // readStatuses를 [count, logId] 형태의 배열로 변환하고 정렬
    const sortedEntries = Object.entries(readStatuses)
        .sort(([count1], [count2]) => Number(count1) - Number(count2));

    // 현재 메시지의 logId와 비교하여 읽지 않은 수 계산
    for (let i = 0; i < sortedEntries.length; i++) {
        const [count, logId] = sortedEntries[i];
        if (currentMessageId <= logId) {
            // 첫 번째 항목이면 모두가 읽은 것
            return i === 0 ? 0 : Number(sortedEntries[i - 1][0]);
        }
    }

    // 현재 메시지가 가장 최신이면 마지막 카운트 반환
    if (sortedEntries.length > 0) {
        return Number(sortedEntries[sortedEntries.length - 1][0]);
    }

    return 0;
  }, [readStatuses, selectedRoom]);

  // 현재 메시지의 읽지 않은 수 계산
  const unreadCount = getUnreadCount(messageId);

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
        <MessageInfo isMine={isMine}>
          <MessageRow isMine={isMine}>
            <MessageBubble isMine={isMine} message={message}>
              {message}
            </MessageBubble>
            {isMine && unreadCount > 0 && (
              <UnreadCount>{unreadCount}</UnreadCount>
            )}
          </MessageRow>
          <TimeStamp>
            {new Date(time).toLocaleTimeString('ko-KR', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
            })}
          </TimeStamp>
        </MessageInfo>
      </MessageContent>
    </MessageContainer>
  );
};

export default ChatMessage;
