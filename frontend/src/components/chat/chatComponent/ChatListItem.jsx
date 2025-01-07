import React from 'react';
import styled from 'styled-components';
import { useAuth } from '../../../context/AuthContext';
import { useEffect, useState } from 'react';

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

const formatDate = (timestamp) => {
  if (!timestamp) return '';
  
  try {
    // 문자열 형식의 날짜를 직접 파싱
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

  const fetchChatRooms = async () => {
    try {
      const response = await fetch(`/api/chat/rooms/user/${user.email}`);
      if (!response.ok) {
        throw new Error('채팅방 목록을 불러오는데 실패했습니다.');
      }
      const data = await response.json();

      // 기존 채팅방 정보 유지하면서 업데이트
      setLocalChatRooms(prevRooms => {
        const updatedRooms = data.map(newRoom => {
          const existingRoom = prevRooms.find(room => room.id === newRoom.id);
          if (existingRoom) {
            // 기존 참가자 정보 유지
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

  //props와 로컬 채팅방 목록 합치기
  // const allChatRooms = [...(propsChatRooms || []), ...localChatRooms].reduce((unique, room) => {
  //   const exists = unique.find(r => r.id === room.id);
  //   if (!exists) {
  //     unique.push(room);
  //   } else {
  //     // 기존 방 정보 업데이트 하되, participants 정보 유지
  //     const updatedRoom = {
  //       ...room,
  //       participants : exists.participants || room.participants
  //     };
  //     unique[unique.indexOf(exists)] = updatedRoom;
  //   }
  //   return unique;
  // }, []);
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
      // lastMessageAt이 없는 경우 가장 뒤로 정렬
      if (!a.lastMessageAt) return 1;
      if (!b.lastMessageAt) return -1;
      
      // 날짜 문자열을 비교
      const dateA = a.lastMessageAt.toString();
      const dateB = b.lastMessageAt.toString();
      
      return dateB.localeCompare(dateA);
    });
  
  const getOtherUserInfo = (chatRoom) => {
    if (!Array.isArray(chatRoom.participants)) {
      return {};
    }
    
    const otherUser = chatRoom.participants.find(
      participant => participant.email !== user.email
    );
    return otherUser || {};
  };

  return (
    <>
      {allChatRooms.map(chatRoom => {
        const otherUser = getOtherUserInfo(chatRoom);
        const lastMessageDate = chatRoom.lastMessageAt ? formatDate(chatRoom.lastMessageAt) : '';

        return (
          <Container 
            key={chatRoom.id}
            onClick={() => onSelectRoom(chatRoom, otherUser)}
            style={{ cursor: 'pointer' }}
          >
            <ProfileImage
              src={otherUser.profileImageUrl || "/images/default/defaultProfileImage.png"}
              alt="프로필 이미지"
            />
            <ChatInfo>
              <ChatHeader>
                <Name>{otherUser.username || "알 수 없음"}</Name>
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