import React from 'react';
import styled from 'styled-components';
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

const ChatListItem = ({ chatRooms: propsChatRooms, onSelectRoom, user }) => {
  const [localChatRooms, setLocalChatRooms] = useState([]);

  useEffect(() => {
    if (propsChatRooms) {
      setLocalChatRooms(propsChatRooms);
    }
  }, [propsChatRooms]);

  const handleRoomSelect = (chatRoom, chatInfo) => {
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

  const getChatRoomInfo = (chatRoom) => {
    if (!Array.isArray(chatRoom.participants) || chatRoom.participants.length === 0 || !user?.email) {
      return {
        isTeam: false,
        name: "알 수 없는 사용자",
        email: "",
        profileImageUrl: "/images/default/defaultProfileImage.png"
      };
    }
    
    const isTeamChat = chatRoom.chatRoomType === "TEAM";
    const otherParticipants = chatRoom.participants.filter(
      participant => participant.email !== user?.email
    );

    if (isTeamChat) {
      return {
        isTeam: true,
        name: chatRoom.chatroomTitle || otherParticipants.map(p => p.username).join(', '),
        participants: chatRoom.participants
      };
    } else {
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

  const isImageMessage = (msg) => {
    return msg?.includes('firebasestorage.googleapis.com') || 
           msg?.match(/\.(jpeg|jpg|gif|png)$/i) != null;
  };

  const getDisplayMessage = (msg) => {
    if (!msg) return "새로운 채팅방이 생성되었습니다.";
    
    try {
        const parsed = JSON.parse(msg);
        if (parsed.type === 'SCHEDULE') {
            return "일정이 공유되었습니다.";
        }
    } catch {}
    
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
                currentUserEmail={user?.email}
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