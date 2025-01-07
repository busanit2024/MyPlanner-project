import React, { useRef, useEffect, useState } from 'react';
import styled from 'styled-components';
import ChatTitle from './ChatTitle';
import ChatMessage from './ChatMessage';
import InputChat from './InputChat';
import TeamChatProfileImage from './TeamChatProfileImage';

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
    overflow-x: hidden;
    overflow-y: auto;
    max-width: 100%; 
    padding: 0 24px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
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


const ChatRoom = ({ selectedRoom, chatPartner, messages, user, isConnected, onSendMessage }) => {
    const scrollRef = useRef(null);
    const [showNewMessageAlert, setShowNewMessageAlert] = useState(false);
    const [isUserNearBottom, setIsUserNearBottom] = useState(true);
    const lastMessageWasMine = useRef(false);
    const isTeamChat = selectedRoom.chatRoomType === "TEAM";

    const otherParticipant = selectedRoom.participants.find(p => p.email !== user.email);

    useEffect(() => {
        const { scrollWidth, clientWidth } = scrollRef.current || {};
        if (scrollWidth > clientWidth) {
            console.error('메시지 버블이 부모를 초과하고 있습니다.');
        }
    }, [messages]);

    // 스크롤 위치 확인
    const handleScroll = () => {
        if (scrollRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
            const isNear = scrollHeight - scrollTop - clientHeight < 100;
            setIsUserNearBottom(isNear);
            if (isNear) {
                setShowNewMessageAlert(false);
            }
        }
    };

    // 스크롤 이벤트 리스너
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

    // 메시지 전송 핸들러
    const handleSendMessage = async (content) => {
        try {
            await onSendMessage(content);
            lastMessageWasMine.current = true;
            scrollToBottom();
        } catch (error) {
            console.error('메시지 전송 실패:', error);
        }
    };

    // 메시지 업데이트 시 스크롤 처리
    useEffect(() => {
        if (!messages?.length) return;

        const lastMessage = messages[messages.length - 1];
        const isMyMessage = lastMessage.senderEmail === user?.email;

        if (scrollRef.current) {
            if (lastMessageWasMine.current) {
                // 내가 방금 메시지를 보냈을 때만 스크롤
                scrollToBottom();
                lastMessageWasMine.current = false;
            } else if (!isMyMessage && !isUserNearBottom) {
                // 상대방 메시지이고 스크롤이 위에 있을 때
                setShowNewMessageAlert(true);
            } else if (isUserNearBottom) {
                // 사용자가 하단에 있을 때는 스크롤
                scrollToBottom();
            }
        }
    }, [messages, user?.email]);

    // 채팅방 변경 시 초기화
    useEffect(() => {
        if (selectedRoom?.id) {
            setShowNewMessageAlert(false);
            setIsUserNearBottom(true);
            lastMessageWasMine.current = false;
            setTimeout(scrollToBottom, 100);
        }
    }, [selectedRoom?.id]);

    // 스크롤 하단으로 이동
    const scrollToBottom = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
            setShowNewMessageAlert(false);
            setIsUserNearBottom(true);
        }
    };

    // 메시지 그룹화(날짜별로)
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
                    profileImage={!isTeamChat ? otherParticipant?.profileImageUrl : null}
                    userName={isTeamChat 
                        ? selectedRoom.participants
                            .filter(p => p.email !== user.email)
                            .map(p => p.username)
                            .join(', ')
                        : otherParticipant?.username}
                    userEmail={isTeamChat ? null : otherParticipant?.email}
                    isTeam={isTeamChat}
                    participants={isTeamChat ? selectedRoom.participants : null}
                    currentUserEmail={user.email}
                />
                {!isConnected && <div style={{ color: 'gray', fontSize: '14px' }}>연결 중...</div>}
            </ChatTitleWrapper>

            <ChatMessagesScroll ref={scrollRef}>
                <ChatMessages>
                    {groupedMessages && Object.entries(groupedMessages).map(([date, msgs]) => (
                        <React.Fragment key={date}>
                            <ChatDate>{date}</ChatDate>
                            {msgs.map(msg => {
                                const isMyMessage = msg.senderEmail === user?.email;
                                const sender = selectedRoom.participants.find(p => p.email === msg.senderEmail);

                                return (
                                    <ChatMessage
                                        key={msg.id}
                                        message={msg.contents}
                                        time={msg.sendTime}
                                        isMine={isMyMessage}
                                        senderName={isMyMessage ? user.username : sender?.username}
                                        senderProfile={isMyMessage 
                                            ? user.profileImageUrl 
                                            : sender?.profileImageUrl || '/images/default/defaultProfileImage.png'}
                                        showSenderInfo={isTeamChat && !isMyMessage} 
                                    />
                                );
                            })}
                        </React.Fragment>
                    ))}
                </ChatMessages>
            </ChatMessagesScroll>

            {showNewMessageAlert && (
                <NewMessageAlert onClick={scrollToBottom}>
                    <img src="/images/icon/ArrowDown.svg" alt="아래로" />
                    새로운 메시지가 있습니다
                </NewMessageAlert>
            )}

            <ChatInput>
                <InputChat onSendMessage={handleSendMessage} />
            </ChatInput>
        </ChatRoomContainer>
    );
};

export default ChatRoom;
