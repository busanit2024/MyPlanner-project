import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';

const ChatListItem = ({ chatRoom }) => {

  const styles = {
    container: {
      display: 'flex',
      alignItems: 'center',
      padding: '10px',
      borderBottom: '1px solid #eee',
    },
    profileImage: {
      width: '50px',
      height: '50px',
      borderRadius: '50%',
      objectFit: 'cover',
      marginRight: '10px',
    },
    chatInfo: {
      flex: 1,
    },
    chatHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '5px',
    },
    name: {
      fontWeight: 'bold',
      fontSize: '14px',
    },
    date: {
      fontSize: '12px',
      color: 'gray',
    },
    message: {
      fontSize: '14px',
      color: '#333',
    },
  };

  const { user } = useAuth();
  const [chatRooms, setChatRooms] = useState([]);

  // 날짜 포맷팅
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return ''; // 유효하지 않은 날짜인 경우 빈 문자열 반환
      
      return new Intl.DateTimeFormat('ko-KR', {
        month: 'short',
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      }).format(date);
    } catch (error) {
      console.error('날짜 형식 변환 오류:', error);
      return '';
    }
  }

  const fetchChatRooms = () => {
    if (user?.email) {
      // 현재 사용자의 채팅방 목록 조회
      fetch(`/api/chat/rooms/user/${user.email}`, {
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('userToken')}`
        }
      })
      .then(res => res.json())
      .then(data => {
        setChatRooms(data);
      })
      .catch(error => console.error('채팅방 목록 로드 실패:', error));
    }
  };

  useEffect(() => {
    fetchChatRooms();
  }, [user]);

  return (
    <div>
      {chatRooms.map((chatRoom) => (
        <div key={chatRoom.id} style={styles.container}>
          <img
            src="/images/default/defaultProfileImage.png"
            style={styles.profileImage}
          />
          <div style={styles.chatInfo}>
            <div style={styles.chatHeader}>
              <span style={styles.name}>{chatRoom.chatRoomTitle}</span>
              <span style={styles.date}>
                {chatRoom.lastMessage && formatDate(chatRoom.lastMessage.sendTime)}
              </span>
            </div>
            <div style={styles.message}>
              {chatRoom.lastMessage && chatRoom.lastMessage.contents}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ChatListItem;