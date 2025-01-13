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

const ChatRoom = ({ selectedRoom, onChatRoomUpdate, messages, user, isConnected, onSendMessage, onLeaveChat }) => {
    const scrollRef = useRef(null);
    const [showNewMessageAlert, setShowNewMessageAlert] = useState(false);
    const [isUserNearBottom, setIsUserNearBottom] = useState(true);
    const lastMessageWasMine = useRef(false);
    const isTeamChat = selectedRoom.chatRoomType === "TEAM";
    const [isEditingTitle, setIsEditingTitle] = useState(false);

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
            // 사용자가 채팅방에 있는지 먼저 확인
            const isUserInRoom = selectedRoom.participants.some(p => p.email === user.email);
            
            if (!isUserInRoom) {
                console.error('퇴장한 채팅방입니다.');
                return;
            }

            // 채팅방 정보 재확인
            const roomResponse = await fetch(`/api/chat/rooms/${selectedRoom.id}`);
            if (!roomResponse.ok) {
                console.error('채팅방 정보 확인 실패');
                return;
            }

            const currentRoom = await roomResponse.json();
            const isStillParticipant = currentRoom.participants.some(p => p.email === user.email);
            
            if (!isStillParticipant) {
                console.error('퇴장한 채팅방입니다.');
                return;
            }

            // 참여 확인 후 메시지 전송
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
                scrollToBottom();
                lastMessageWasMine.current = false;
            } else if (!isMyMessage && !isUserNearBottom) {
                setShowNewMessageAlert(true);
            } else if (isUserNearBottom) {
                scrollToBottom();
            }
        }
    }, [messages, user?.email, isUserNearBottom, scrollToBottom]);


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

    // 이미지 메시지 감지
    const isImageMessage = (msg) => {
        return msg?.includes('firebasestorage.googleapis.com') || 
               msg?.match(/\.(jpeg|jpg|gif|png)$/i) != null;
    };

    // 메시지 내용 표시 처리
    const getDisplayMessage = (msg) => {
        return isImageMessage(msg) ? '사진을 보냈습니다.' : msg;
    };

    // 사용자가 채팅방에 있는지 확인
    const isUserInRoom = selectedRoom.participants.some(p => p.email === user.email);

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
                                        displayMessage={getDisplayMessage(msg.contents)}
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
                <InputChat 
                    onSendMessage={handleSendMessage} 
                    isLeft={!isUserInRoom}  // 사용자가 채팅방을 나갔는지 여부 전달
                />
            </ChatInput>
        </ChatRoomContainer>
    );
};

export default ChatRoom;