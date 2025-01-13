import React, { useRef, useEffect, useState, useCallback } from 'react';
import styled from 'styled-components';
import ChatTitle from './ChatTitle';
import ChatMessage from './ChatMessage';
import InputChat from './InputChat';
import EditTeamChatTitle from './EditTeamChatTitle';
import SystemMessage from '../../../ui/SystemMessage';

const ChatRoomContainer = styled.div`
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    height: 100%;
`;

const ChatTitleWrapper = styled.div`
    position: relative;
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
    font-weight: 600;
    font-size: 14px;
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

const ChatRoom = ({ selectedRoom, onChatRoomUpdate, messages, user, isConnected, onSendMessage, onLeaveChat, stompClient }) => {
    const scrollRef = useRef(null);
    const [showNewMessageAlert, setShowNewMessageAlert] = useState(false);
    const [isUserNearBottom, setIsUserNearBottom] = useState(true);
    const lastMessageWasMine = useRef(false);
    const isTeamChat = selectedRoom.chatRoomType === "TEAM";
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [readStatuses, setReadStatuses] = useState({});

    const otherParticipant = selectedRoom.participants.find(p => p.email !== user.email);

    // 스크롤 위치 확인
    const handleScroll = useCallback(() => {
        if (scrollRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
            const isNear = scrollHeight - scrollTop - clientHeight < 100;
            setIsUserNearBottom(isNear);
            if (isNear) {
                setShowNewMessageAlert(false);
            }
        }
    }, []);

    // 스크롤 하단으로 이동
    const scrollToBottom = useCallback(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
            setShowNewMessageAlert(false);
            setIsUserNearBottom(true);
        }
    }, []);

    // 읽음 상태 업데이트
    const updateMyReadStatus = useCallback(async () => {
        if (!messages?.length || !selectedRoom?.id) return;

        const lastMessageId = messages[messages.length - 1].id;
        try {
            const response = await fetch(`/api/chat/rooms/${selectedRoom.id}/read`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userEmail: user.email,
                    lastChatLogId: lastMessageId
                })
            });
            
            if (!response.ok) throw new Error('Failed to update read status');
            const updatedStatuses = await response.json();
            console.log('읽음 상태 업데이트 응답:', updatedStatuses);
            setReadStatuses(updatedStatuses);
            
        } catch (error) {
            console.error('읽음 상태 업데이트 실패:', error);
        }
    }, [messages, selectedRoom?.id, user?.email]);

    // 읽음 상태 가져오기
    const fetchReadStatuses = useCallback(async () => {
        try {
            const response = await fetch(`/api/chat/rooms/${selectedRoom.id}/unread`);
            if (!response.ok) throw new Error('Failed to fetch read statuses');
            const data = await response.json();
            console.log('서버 응답 데이터:', data);
            setReadStatuses(data);
        } catch (error) {
            console.error('읽음 상태 조회 실패:', error);
        }
    }, [selectedRoom?.id]);

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
    }, [handleScroll]);

    // 메시지 업데이트 시 스크롤 처리
    useEffect(() => {
        if (!messages?.length) return;

        const lastMessage = messages[messages.length - 1];
        const isMyMessage = lastMessage.senderEmail === user?.email;

        if (scrollRef.current) {
            if (lastMessageWasMine.current) {
                scrollToBottom();
                lastMessageWasMine.current = false;
            } else if (!isMyMessage && !isUserNearBottom) {
                setShowNewMessageAlert(true);
            } else if (isUserNearBottom) {
                scrollToBottom();
            }
        }
    }, [messages, user?.email, isUserNearBottom, scrollToBottom]);

    // 채팅방 변경 시 초기화
    useEffect(() => {
        if (selectedRoom?.id) {
            setShowNewMessageAlert(false);
            setIsUserNearBottom(true);
            lastMessageWasMine.current = false;
            setTimeout(scrollToBottom, 100);
            fetchReadStatuses();
        }
    }, [selectedRoom?.id, scrollToBottom, fetchReadStatuses]);

    // 읽음상태 실시간 업데이트
    useEffect(() => {
        if (!stompClient || !selectedRoom?.id) return;
    
        const subscription = stompClient.subscribe(
            `/sub/chat/rooms/${selectedRoom.id}/read-status`,
            (message) => {
                const updatedStatuses = JSON.parse(message.body);
                console.log('Received read status update:', updatedStatuses);
                setReadStatuses(updatedStatuses); // 새로운 상태로 완전히 교체
            }
        );
    
        return () => subscription.unsubscribe();
    }, [selectedRoom?.id, stompClient]);

    // 스크롤이 하단에 있을 때 읽음 상태 업데이트
    useEffect(() => {
        if (isUserNearBottom && messages?.length > 0) {
            updateMyReadStatus();
        }
    }, [messages, isUserNearBottom, updateMyReadStatus]);

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

    // 단체채팅 채팅방 이름 변경
    const handleUpdateTitle = async (newTitle) => {
        try {
            const response = await fetch(`/api/chat/rooms/${selectedRoom.id}/title`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    chatroomTitle: newTitle,
                    chatroomType: selectedRoom.chatRoomType,
                    participantIds: selectedRoom.participants
                })
            });

            if(!response.ok) {
                throw new Error('채팅방 이름 수정에 실패했습니다.');
            }

            const updatedRoom = await response.json();
            onChatRoomUpdate(updatedRoom);
            setIsEditingTitle(false);

        } catch (error) {
            console.error('채팅방 이름 수정 중 오류:', error);
            alert('채팅방 이름 수정에 실패했습니다.');
        }
    };

    return (
        <ChatRoomContainer>
            <ChatTitleWrapper>
                <img src="/images/icon/ArrowLeft.svg" alt="뒤로 가기" />
                <ChatTitle 
                    profileImage={!isTeamChat ? otherParticipant?.profileImageUrl : null}
                    userName={isTeamChat 
                        ? selectedRoom.chatroomTitle ||
                          selectedRoom.participants
                            .filter(p => p.email !== user.email)
                            .map(p => p.username)
                            .join(', ')
                        : otherParticipant?.username}
                    userEmail={isTeamChat ? null : otherParticipant?.email}
                    isTeam={isTeamChat}
                    participants={isTeamChat ? selectedRoom.participants : null}
                    currentUserEmail={user.email}
                    onEditTitle={() => setIsEditingTitle(true)}
                    onLeaveChat={() => onLeaveChat(selectedRoom.id)}
                />
                {isTeamChat && isEditingTitle && (
                    <EditTeamChatTitle
                        onUpdateTitle={handleUpdateTitle}
                        onClose={() => setIsEditingTitle(false)}
                    />
                )}
                {!isConnected && <div style={{ color: 'gray', fontSize: '14px' }}>연결 중...</div>}
            </ChatTitleWrapper>

            <ChatMessagesScroll ref={scrollRef}>
                <ChatMessages>
                    {groupedMessages && Object.entries(groupedMessages).map(([date, msgs]) => (
                        <React.Fragment key={date}>
                            <ChatDate>{date}</ChatDate>
                            {msgs.map((msg, index) => {
                                if(msg.messageType === "LEAVE"){
                                    return <SystemMessage key={msg.id} content={msg.contents}
                                            margin="8px 0" backgroundColor="var(--light-gray)" color="var(--dark-gray)" padding="4px 10px" />;
                                }
                                const isMyMessage = msg.senderEmail === user?.email;
                                const sender = selectedRoom.participants.find(p => p.email === msg.senderEmail);

                                // 같은 시간대의 메시지인지 확인
                                const currentMessageTime = new Date(msg.sendTime).getTime();
                                const nextMessage = msgs[index + 1];
                                const nextMessageTime = nextMessage ? new Date(nextMessage.sendTime).getTime() : null;

                                // 다음 메시지가 같은 사람이고 1분 이내의 메시지면 시간 표시하지 않음
                                const showTime = !nextMessage || nextMessage.senderEmail !== msg.senderEmail || 
                                    Math.abs(currentMessageTime - nextMessageTime) > 60000;

                                return (
                                    <ChatMessage
                                        key={msg.id}
                                        messageId={msg.id}
                                        message={msg.contents}
                                        time={msg.sendTime}
                                        isMine={isMyMessage}
                                        senderName={isMyMessage ? user.username : sender?.username}
                                        senderProfile={isMyMessage 
                                            ? user.profileImageUrl 
                                            : sender?.profileImageUrl || '/images/default/defaultProfileImage.png'}
                                        showSenderInfo={isTeamChat && !isMyMessage} 
                                        showTime={showTime}
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