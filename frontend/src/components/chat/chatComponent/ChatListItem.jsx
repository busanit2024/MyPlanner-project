import React from "react";

const ChatListItem = ({ profileImage, name, date, message }) => {
  return(
    <div className="chat-list-item">
      <img src={profileImage} alt={`${name} 프로필`} className="profile-image" />
      <div className="chat-info">
        <div className="chat-header">
          <span className="name">{name}</span>
          <span className="date">{date}</span>
        </div>
        <div className="message">{message}</div>
      </div>
    </div>
  );
}

export default ChatListItem;