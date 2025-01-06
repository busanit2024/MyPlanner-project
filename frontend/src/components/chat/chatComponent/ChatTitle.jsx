import React from 'react';
import styled from 'styled-components';

const TitleContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
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

const Name = styled.span`
  font-weight: bold;
`;

const SubText = styled.span`
  color: #666;
  font-size: 0.9em;
`;

const ParticipantCount = styled(SubText)`
  color: var(--primary-color);
`;

const ChatTitle = ({ profileImage, userName, userEmail,isGroup, participantCount, ...props }) => {
  return (
    <TitleContainer {...props}>
      <ProfileImage 
          src={profileImage || (isGroup ? '/images/default/defaultGroupImage.png' : '/images/default/defaultProfileImage.png')} 
          alt={isGroup ? "그룹" : "프로필"} 
          onError={(e) => {
              e.target.src = isGroup ? '/images/default/defaultGroupImage.png' : '/images/default/defaultProfileImage.png';
          }}
      />
      <UserInfo>
          <Name>{userName}</Name>
          {!isGroup && userEmail && (
              <SubText>{userEmail}</SubText>
          )}
          {isGroup && participantCount && (
              <ParticipantCount>
                  참여자 {participantCount}명
              </ParticipantCount>
          )}
      </UserInfo>
    </TitleContainer>
  );
};

ChatTitle.defaultProps = {
  isGroup: false,
  profileImage: null,
  userName: '',
  userEmail: '',
  participantCount: 0
};

export default ChatTitle;