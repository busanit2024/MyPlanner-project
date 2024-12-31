import React from 'react';
import styled from 'styled-components';

const TitleContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  width:100%;
`;

const ProfileImage = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const UserName = styled.span`
  font-weight: bold;
`;

const UserEmail = styled.span`
  color: #666;
  font-size: 0.9em;
`;

const ChatTitle = ({ profileImage, userName, userEmail, ...props }) => {
  return (
    <TitleContainer {...props}>
      <ProfileImage 
        src={profileImage || '/images/default/defaultProfileImage.png'} 
        alt="프로필" 
        onError={(e) => {
          e.target.src = '/images/default/defaultProfileImage.png';
        }}
      />
      <UserInfo>
        <UserName>{userName}</UserName>
        <UserEmail>{userEmail}</UserEmail>
      </UserInfo>
    </TitleContainer>
  );
};

export default ChatTitle;