import React from 'react';
import styled from 'styled-components';
import { useAuth } from '../../../context/AuthContext';
import { useEffect, useState } from 'react';
import TeamChatProfileImage from './TeamChatProfileImage';

const Container = styled.div`
  display: flex;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid #eee;
`;

const ProfileImage = styled.img`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 10px;
`;

const ChatInfo = styled.div`
  flex: 1;
  position: relative;
`;

const ChatHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
`;

const Name = styled.span`
  font-weight: bold;
  font-size: 14px;
`;

const Date = styled.span`
  font-size: 12px;
  color: gray;
`;

const Message = styled.div`
  font-size: 14px;
  color: #333;
`;

const UnreadBadge = styled.span`
  background-color: var(--primary-color);
  color: white;
  border-radius: 50%;
  padding: 2px 6px;
  font-size: 12px;
  position: absolute;
  right: 10px;
  top: 80%;
  transform: translateY(-60%);
`;

// 날짜 포맷팅
const formatDate = (timestamp) => {
  if (!timestamp) return '';
  
  try {
    const [datePart] = timestamp.toString().split('T');
    const [year, month, day] = datePart.split('-');
    
    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error('날짜 변환 중 오류 발생:', error, 'timestamp:', timestamp);
    return '';
  }
};

const ChatListItem = ({ chatRooms: propsChatRooms, onSelectRoom, deletedRoomId }) => {
  const { user } = useAuth();
  const [localChatRooms, setLocalChatRooms] = useState([]);

  // 채팅방 목록 로딩
  const fetchChatRooms = async () => {
    try {
      const [roomsResponse, unreadResponse] = await Promise.all([
        fetch(`/api/chat/rooms/user/${user.email}`),
        fetch(`/api/chat/rooms/unread/${user.email}`)
      ]);

      if (!roomsResponse.ok || !unreadResponse.ok) {
        throw new Error('데이터를 불러오는데 실패했습니다.');
      }

      const [rooms, unreadCounts] = await Promise.all([
        roomsResponse.json(),
        unreadResponse.json()
      ]);

      const roomsWithUnread = rooms.map(room => ({
        ...room,
        unreadCount: unreadCounts[room.id] || 0
      }));

      setLocalChatRooms(roomsWithUnread);
    } catch (error) {
      console.error('채팅방 목록 로딩 에러: ', error);
    }
  };

  useEffect(() => {
    if (deletedRoomId) {
      setLocalChatRooms(prevRooms => 
        prevRooms.filter(room => room.id !== deletedRoomId)
      );
    }
  }, [deletedRoomId]);

  useEffect(() => {
    if (user?.email) {
      fetchChatRooms();

      const interval = setInterval(() => {
        fetchChatRooms();
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [user]);

  const handleRoomSelect = (chatRoom, chatInfo) => {
    // 채팅방 선택 시 unreadCount를 0으로 설정
    setLocalChatRooms(prevRooms => 
      prevRooms.map(room => 
        room.id === chatRoom.id ? { ...room, unreadCount: 0 } : room
      )
    );

    onSelectRoom(chatRoom, chatInfo);
  };

  const allChatRooms = [...(propsChatRooms || []), ...localChatRooms]
    .reduce((unique, room) => {
      const exists = unique.find(r => r.id === room.id);
      if (!exists) {
        unique.push(room);
      } else {
        const updatedRoom = {
          ...room,
          participants: exists.participants || room.participants
        };
        unique[unique.indexOf(exists)] = updatedRoom;
      }
      return unique;
    }, [])
    .sort((a, b) => {
      if (!a.lastMessageAt) return 1;
      if (!b.lastMessageAt) return -1;
      
      const dateA = a.lastMessageAt.toString();
      const dateB = b.lastMessageAt.toString();
      
      return dateB.localeCompare(dateA);
    });

  // 채팅방 정보 가져오기
  const getChatRoomInfo = (chatRoom) => {
    if (!Array.isArray(chatRoom.participants) || chatRoom.participants.length === 0) {
        return {
            isTeam: false,
            name: "알 수 없는 사용자",
            email: "",
            profileImageUrl: "/images/default/defaultProfileImage.png"
        };
    }
    
    const isTeamChat = chatRoom.chatRoomType === "TEAM";
    const otherParticipants = chatRoom.participants.filter(
        participant => participant.email !== user.email
    );

    if (isTeamChat) {
        return {
            isTeam: true,
            name: chatRoom.chatroomTitle || otherParticipants.map(p => p.username).join(', '),
            participants: chatRoom.participants
        };
    } else {
        // 개인 채팅의 경우 상대방이 없을 때도 처리
        const otherUser = otherParticipants[0] || {
            username: "알 수 없는 사용자",
            email: "",
            profileImageUrl: "/images/default/defaultProfileImage.png"
        };
        
        return {
            isTeam: false,
            name: otherUser.username,
            email: otherUser.email,
            profileImageUrl: otherUser.profileImageUrl,
            ...otherUser
        };
    }
  };

  // 이미지 메시지 감지
  const isImageMessage = (msg) => {
    return msg?.includes('firebasestorage.googleapis.com') || 
           msg?.match(/\.(jpeg|jpg|gif|png)$/i) != null;
  };

  // lastMessage 표시 처리
  const getDisplayMessage = (msg) => {
    if (!msg) return "새로운 채팅방이 생성되었습니다.";
    return isImageMessage(msg) ? "사진을 보냈습니다." : msg;
  };

  return (
    <>
      {allChatRooms.map(chatRoom => {
        const chatInfo = getChatRoomInfo(chatRoom);
        const lastMessageDate = chatRoom.lastMessageAt ? formatDate(chatRoom.lastMessageAt) : '';

        return (
          <Container 
            key={chatRoom.id}
            onClick={() => handleRoomSelect(chatRoom, chatInfo)}
            style={{ cursor: 'pointer' }}
          >
            {chatInfo.isTeam ? (
              <TeamChatProfileImage 
                participants={chatRoom.participants}
                currentUserEmail={user.email}
              />
            ) : (
              <ProfileImage
                src={chatInfo.profileImageUrl || "/images/default/defaultProfileImage.png"}
                alt="프로필 이미지"
                onError={(e) => {
                  e.target.src = "/images/default/defaultProfileImage.png";
                }}
              />
            )}
            <ChatInfo>
              <ChatHeader>
                  <Name>{chatInfo.name || "알 수 없음"}</Name>
                  <Date>{lastMessageDate}</Date>
              </ChatHeader>
              <Message>{getDisplayMessage(chatRoom.lastMessage)}</Message>
                {console.log('Unread count for room', chatRoom.id, ':', chatRoom.unreadCount)}
                {chatRoom.unreadCount > 0 && (
                    <UnreadBadge>{chatRoom.unreadCount}</UnreadBadge>
                )}
            </ChatInfo>
          </Container>
        );
      })}
    </>
  );
};

export default ChatListItem;