import React, { useRef, useEffect, useState } from 'react';
import styled from 'styled-components';
import ChatTitle from './ChatTitle';
import ChatMessage from './ChatMessage';
import InputChat from './InputChat';

const ChatRoomContainer = styled.div`
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    height: 100%;
`;

const ChatTitleWrapper = styled.div`
    padding: 24px;
    border-bottom: 1px solid var(--light-gray);
    display: flex;
    align-items: center;
    gap: 12px;
`;

const ChatMessagesScroll = styled.div`
    flex: 1;
    overflow-y: auto;
    padding: 0 24px;
`;

const ChatMessages = styled.div`
    display: flex;
    flex-direction: column;
`;

const ChatInput = styled.div`
    padding: 24px;
    border-top: 1px solid var(--light-gray);
`;

const ChatDate = styled.div`
    text-align: center;
    font-weight:600;
    font-size:14px;
    color: var(--black);
    width: 100%;
    margin: 20px 0;
    display: flex;
    justify-content: center;
`;


const ChatRoom = ({ selectedRoom, chatPartner, messages, user, isConnected,onSendMessage }) => {
    const groupedMessages = messages?.reduce((groups, msg) => {
        const date = new Date(msg.sendTime).toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        if (!groups[date]) {
            groups[date] = [];
        }
        groups[date].push(msg);
        return groups;
    }, {});

    return (
        <ChatRoomContainer>
            <ChatTitleWrapper>
                <img src="/images/icon/ArrowLeft.svg" alt="뒤로 가기" />
                <ChatTitle 
                    profileImage={chatPartner.profileImage}
                    userName={
                        selectedRoom.chatRoomType === "INDIVIDUAL" 
                            ? chatPartner.name 
                            : `그룹 채팅 (${selectedRoom.participants.length}명)`
                    }
                    userEmail={chatPartner.email}
                    isGroup={selectedRoom.chatRoomType !== "INDIVIDUAL"}
                    participantCount={
                        selectedRoom.chatRoomType !== "INDIVIDUAL" 
                            ? selectedRoom.participants.length 
                            : null
                    }
                />
                <div style={{
                    color: 'gray',
                    fontSize: '14px',
                    minHeight: '20px',
                    display: 'flex',
                    alignItems: 'center'
                }}>
                    {!isConnected && '연결 중...'}
                </div>
            </ChatTitleWrapper>
            <ChatMessagesScroll>
                <ChatMessages>
                    {groupedMessages && Object.entries(groupedMessages).map(([date, msgs]) => (
                        <React.Fragment key={date}>
                            <ChatDate>{date}</ChatDate>
                            {msgs.map(msg => (
                                <ChatMessage
                                    key={msg.id}
                                    message={msg.contents}
                                    time={msg.sendTime}
                                    isMine={msg.senderEmail === user?.email}
                                    senderName={msg.senderEmail === user?.email ? user.username : chatPartner.name}
                                    senderProfile={msg.senderEmail === user?.email ? user.profileImageUrl : chatPartner.profileImage}
                                />
                            ))}
                        </React.Fragment>
                    ))}
                </ChatMessages>
            </ChatMessagesScroll>
            <ChatInput>
                <InputChat onSendMessage={onSendMessage} />
            </ChatInput>
        </ChatRoomContainer>
    );
};

export default ChatRoom;
