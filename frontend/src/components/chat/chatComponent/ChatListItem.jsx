import React from 'react';

const ChatListItem = ({ chatRoom }) => {
  // 채팅방 없을 시엔 렌더링 안함
  if (!chatRoom) return null;

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

  // 날짜 포맷팅
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ko-KR', {
      month: 'short',
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }).format(date);
  }

  return (
    <div style={styles.container}>
      <img
        src="/images/default/defaultProfileImage.png"
        style={styles.profileImage}
      />
      <div style={styles.chatInfo}>
        <div style={styles.chatHeader}>
          <span style={styles.name}>{chatRoom.chatRoomTitle}</span>
          <span style={styles.date}>{formatDate(chatRoom.lastMessage.sendTime)}</span>
        </div>
        <div style={styles.message}>{chatRoom.lastMessage.contents}</div>
      </div>
    </div>
  );
};

export default ChatListItem;