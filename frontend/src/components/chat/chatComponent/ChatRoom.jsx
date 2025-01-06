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

const NewMessageAlert = styled.div`
        position: fixed;
        bottom: 100px;
        left: 50%;
        transform: translateX(-50%);
        background-color: var(--primary-color);
        color: white;
        padding: 10px 20px;
        border-radius: 20px;
        cursor: pointer;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        z-index: 1000;
        display: flex;
        align-items: center;
        gap: 8px;
        
        &:hover {
            opacity: 0.9;
        }
    `;


const ChatRoom = ({ selectedRoom, chatPartner, messages, user, isConnected,onSendMessage }) => {
    const scrollRef = useRef(null);
    const [shouldScrollToBottom, setShouldScrollToBottom] = useState(true);
    const [showNewMessageAlert, setShowNewMessageAlert] = useState(false);
    const [userScrolled, setUserScrolled] = useState(false);
    const lastMessageRef = useRef(null);

    // 스크롤 위치 감지
    const handleScroll = () => {
        if(scrollRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
            const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
            
            // 사용자가 스크롤 중임을 표시
            setUserScrolled(true);
            
            setShouldScrollToBottom(isNearBottom);
            if(isNearBottom) {
                setShowNewMessageAlert(false);
                setUserScrolled(false);  // 하단에 도달하면 사용자 스크롤 상태 초기화
            }
        }
    };

    // 새 메시지 감지 및 스크롤 처리
    useEffect(() => {
        if (scrollRef.current && messages?.length > 0) {
            const lastMessage = messages[messages.length - 1];
            const isMyMessage = lastMessage.senderEmail === user?.email;

            // 다음 조건에서만 자동 스크롤
            if ((isMyMessage && !userScrolled) || // 내 메시지이고 사용자가 스크롤하지 않았거나
                (!userScrolled && shouldScrollToBottom)) { // 사용자가 스크롤하지 않았고 이전에 하단에 있었을 때
                scrollToBottom();
            } else if (!isMyMessage && !shouldScrollToBottom) {
                // 내 메시지가 아니고 스크롤이 위에 있을 때 알림 표시
                setShowNewMessageAlert(true);
            }
        }
    }, [messages, user?.email, shouldScrollToBottom, userScrolled]);

    // 채팅방이 변경될 때마다 스크롤 초기화
    useEffect(() => {
        setUserScrolled(false);
        setShouldScrollToBottom(true);
        scrollToBottom();
    }, [selectedRoom.id]);

    // 스크롤 하단으로 이동
    const scrollToBottom = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
            setShowNewMessageAlert(false);
            setShouldScrollToBottom(true);
            setUserScrolled(false);
        }
    };


    // 새 메시지 알림 클릭했을 때
    useEffect(() => {
        const scrollContainer = scrollRef.current;
        if (scrollContainer) {
            scrollContainer.addEventListener('scroll', handleScroll);
        }
        return () => {
            if (scrollContainer) {
                scrollContainer.removeEventListener('scroll', handleScroll);
            }
        };
    }, []);

     // 새 메시지 감지 및 스크롤 처리
     useEffect(() => {
        if (scrollRef.current && messages?.length > 0) {
            const lastMessage = messages[messages.length - 1];
            const isMyMessage = lastMessage.senderEmail === user?.email;

            if (isMyMessage || shouldScrollToBottom) {
                scrollToBottom();
            } else {
                // 내 메시지가 아니고 스크롤이 위에 있을 때 알림 표시
                setShowNewMessageAlert(true);
            }
        }
    }, [messages, user?.email, shouldScrollToBottom]);
    
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
            <ChatMessagesScroll ref={scrollRef}>
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
            {showNewMessageAlert && (
                <NewMessageAlert onClick={scrollToBottom}>
                    <img 
                        src="/images/icon/ArrowDown.svg" 
                        alt="아래로" 
                    />
                    새로운 메시지가 있습니다
                </NewMessageAlert>
            )}
            <ChatInput>
                <InputChat onSendMessage={onSendMessage} />
            </ChatInput>
        </ChatRoomContainer>
    );
};

export default ChatRoom;
