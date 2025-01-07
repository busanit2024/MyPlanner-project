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

const ChatListItem = ({ chatRooms: propsChatRooms, onSelectRoom }) => {
  const { user } = useAuth();
  const [localChatRooms, setLocalChatRooms] = useState([]);

  // 채팅방 목록 로딩
  const fetchChatRooms = async () => {
    try {
      const response = await fetch(`/api/chat/rooms/user/${user.email}`);
      if (!response.ok) {
        throw new Error('채팅방 목록을 불러오는데 실패했습니다.');
      }
      const data = await response.json();

      setLocalChatRooms(prevRooms => {
        const updatedRooms = data.map(newRoom => {
          const existingRoom = prevRooms.find(room => room.id === newRoom.id);
          if (existingRoom) {
            return {
              ...newRoom,
              participants: existingRoom.participants || newRoom.participants
            };
          }
          return newRoom;
        });
        return updatedRooms;
      });
    } catch (error) {
      console.error('채팅방 목록 로딩 에러: ', error);
    }
  };

  useEffect(() => {
    if (user?.email) {
      fetchChatRooms();

      const interval = setInterval(() => {
        fetchChatRooms();
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [user]);

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
    if (!Array.isArray(chatRoom.participants)) {
      return {};
    }
    
    const isTeamChat = chatRoom.chatRoomType === "TEAM";
    const otherParticipants = chatRoom.participants.filter(
      participant => participant.email !== user.email
    );

    if (isTeamChat) {
      return {
        isTeam: true,
        name: otherParticipants.map(p => p.username).join(', '),
        participants: chatRoom.participants
      };
    } else {
      // 개인 채팅의 경우 상대방 정보를 직접 반환
      const otherUser = otherParticipants[0];
      return {
        isTeam: false,
        name: otherUser.username,  
        email: otherUser.email,
        profileImageUrl: otherUser.profileImageUrl,
        ...otherUser  
      };
    }
  };

  return (
    <>
      {allChatRooms.map(chatRoom => {
        const chatInfo = getChatRoomInfo(chatRoom);
        const lastMessageDate = chatRoom.lastMessageAt ? formatDate(chatRoom.lastMessageAt) : '';

        return (
          <Container 
            key={chatRoom.id}
            onClick={() => onSelectRoom(chatRoom, chatInfo)}
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
              <Message>
                {chatRoom.lastMessage || "새로운 채팅방이 생성되었습니다."}
              </Message>
            </ChatInfo>
          </Container>
        );
      })}
    </>
  );
};

export default ChatListItem;