import styled from 'styled-components';
import React from 'react';
import { useState } from 'react';
import ScheduleChat from '../../../ui/ScheduleChat';
import ImageViewModal from '../../../ui/ImageViewModal';

const MessageContainer = styled.div`
  display: flex;
  flex-direction: ${props => props.isMine ? 'row-reverse' : 'row'};
  align-items: ${props => props.isScheduleOrImage ? 'flex-end' : 'center'};  // 일정/이미지일 때는 상단 정렬
  margin: ${props => props.isNewSender ? '5px 0' : '2px 0'};
  gap: 8px;
`;

const ProfileImage = styled.img`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: ${props => props.isMine ? 'none' : 'block'};  // 내 메시지는 프로필 숨김
  flex-shrink: 0;
`;

const MessageContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: ${props => props.isMine ? 'flex-end' : 'flex-start'};
  max-width: 70%;
  align-self: flex-start;
`;

const MessageRow = styled.div`
  display : flex;
  flex-direction: ${props => props.isMine ? 'row' : 'row-reverse'};
  align-items : flex-end;
  gap : 8px;
`;

const SenderName = styled.span`
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
  display: ${props => props.isMine ? 'none' : 'block'};  // 내 메시지는 이름 숨김
`;

const MessageBubble = styled.div`
  ${props => !props.isImage && `
    background-color: ${props.isMine ? 'var(--primary-color)' : 'var(--chat-gray)'};
    color: ${props.isMine ? 'white' : 'black'};
    padding: 8px 12px;
    border-radius: 12px;
    box-sizing: border-box;
    display: inline-block;
    max-width: 70%;
    min-width: min-content;
    width: fit-content;
    white-space: ${props.message?.length > 30 ? 'pre-wrap' : 'nowrap'};
    word-break: ${props.message?.length > 30 ? 'break-word' : 'keep-all'};
    overflow-wrap: ${props.message?.length > 30 ? 'break-word' : 'normal'};
    text-align: left;
  `}

  ${props => props.isImage && `
    padding: 0;
    background: none;
    max-width: 100%; 
    
    .image-grid {
      display: grid;
      grid-template-columns: ${props.imageCount > 1 ? 'repeat(2, 1fr)' : '1fr'};
      gap: 2px;
      width: 100%;
    }

    img {
      ${props.imageCount === 1 
        ? `
          width: 200px; /* 단일 이미지: 가로 고정 */
          height: auto; /* 세로는 비율에 맞춤 */
        ` 
        : `
          width: 100px; /* 다중 이미지: 가로 고정 */
          height: 100px; /* 세로 고정 */
        `}
      border-radius: 8px;
      object-fit: ${props.imageCount === 1 ? 'contain' : 'cover'}; /* 단일/다중에 따라 fit 방식 다름 */
    }
  `}
`;

const TimeStamp = styled.span`
  font-size: 12px;
  color: var(--gray);
  ${props => !props.show && `display : none; `}
`;

const ImageContainer = styled.div`
  img {
    cursor: pointer;
    transition: opacity 0.2s;
    
    &:hover {
      opacity: 0.9;
    }
  }
`;

const ChatMessage = ({ message, displayMessage,time, isMine, senderName, senderProfile , showTime, isNewSender}) => {
  const [selectedImage, setSelectedImage] = useState(null);
  
  // 메시지가 이미지 URL인지 확인
  const isImageMessage = (msg) => {
    if (!msg) return false;
    try {
      const urls = JSON.parse(msg);
      return Array.isArray(urls) && urls.every(url => 
        url.includes('firebasestorage.googleapis.com') || 
        url.match(/\.(jpeg|jpg|gif|png)$/i)
      );
    } catch {
      return msg.includes('firebasestorage.googleapis.com') || 
             msg.match(/\.(jpeg|jpg|gif|png)$/i) != null;
    }
  };

  const getImageUrls = (msg) => {
    try {
      return JSON.parse(msg);
    } catch {
      return [msg];
    }
  };

  // 메시지가 일정인지 확인하는 함수
  const isScheduleMessage = (msg) => {
    try {
        const parsed = JSON.parse(msg);
        return parsed.type === 'SCHEDULE';
    } catch {
        return false;
    }
  };

  // 일정 데이터 파싱
  const getScheduleData = (msg) => {
      try {
          const parsed = JSON.parse(msg);
          return parsed.type === 'SCHEDULE' ? parsed.data : null;
      } catch {
          return null;
      }
  };

  const handleImageClick = (url) => {
    setSelectedImage(url);
  };

  // 일정이나 이미지 메시지인지 확인
  const isScheduleOrImage = isScheduleMessage(message) || isImageMessage(message);

  return (
    <>
    <MessageContainer isMine={isMine} isNewSender={showTime} isScheduleOrImage={isScheduleOrImage}> 
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
          <MessageRow isMine={isMine}>
              <TimeStamp show={showTime}>
                  {new Date(time).toLocaleTimeString('ko-KR', {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true
                  })}
              </TimeStamp>
              {isScheduleMessage(message) ? (
                  <ScheduleChat schedule={getScheduleData(message)} />
              ) : (
                  <MessageBubble 
                      isMine={isMine} 
                      message={message}
                      isImage={isImageMessage(message)}
                      imageCount={isImageMessage(message) ? getImageUrls(message).length : 0}
                  >
                      {isImageMessage(message) ? (
                        <ImageContainer className="image-grid">
                            {getImageUrls(message).map((url, index) => (
                                <img 
                                    key={index} 
                                    src={url} 
                                    alt="첨부 이미지"
                                    onClick={() => handleImageClick(url)}
                                />
                            ))}
                        </ImageContainer>
                      ) : (
                          message
                      )}
                  </MessageBubble>
              )}
          </MessageRow>
      </MessageContent>
    </MessageContainer>
    {selectedImage && (
        <ImageViewModal 
            imageUrl={selectedImage} 
            onClose={() => setSelectedImage(null)} 
        />
    )}
    </>
  );
};

export default ChatMessage;
