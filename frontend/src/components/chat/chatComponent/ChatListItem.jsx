import React from 'react';

const ChatListItem = () => {
  // 더미 데이터
  const chatData = {
    profileImage: 'images/default/defaultProfileImage.png',
    name: '호두',
    date: '2024.11.09',
    message: '14일에 봐~',
  };

  // 인라인 스타일
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

  return (
    <div style={styles.container}>
      <img
        src={chatData.profileImage}
        alt={`${chatData.name} 프로필`}
        style={styles.profileImage}
      />
      <div style={styles.chatInfo}>
        <div style={styles.chatHeader}>
          <span style={styles.name}>{chatData.name}</span>
          <span style={styles.date}>{chatData.date}</span>
        </div>
        <div style={styles.message}>{chatData.message}</div>
      </div>
    </div>
  );
};

export default ChatListItem;