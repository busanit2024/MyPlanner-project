import React, {useState} from 'react';
import styled from 'styled-components';
import TeamChatProfileImage from './TeamChatProfileImage';

const TitleContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  position : relative;
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
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;  // 적절한 최대 너비 설정
`;

const SubText = styled.span`
  color: #666;
  font-size: 0.9em;
`;

const MenuContainer = styled.div`
  margin-left: auto;  
  position: relative;
  cursor: pointer;

  img {
    width: 24px;
    height: 24px;
    vertical-align: middle;
  }
`;

const Dropdown = styled.div`
  position: absolute;
  top: 100%;  
  right: 0;   
  background: white;
  border-radius: 8px;
  padding: 8px 0;
  margin-top: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  min-width: 150px;
  z-index: 1000;
`;

const DropdownItem = styled.div`
  padding: 8px 16px;
  cursor: pointer;
  
  &:hover {
    background: var(--light-gray);
  }

  p {
    margin: 0;
    color: var(--black);
  }

`;

const ChatTitle = ({ profileImage, userName, userEmail, isTeam, participants, currentUserEmail, ...props }) => {
  const [isDropdownOpen, setDropdownOpen] = useState(false);

  const toggleDropdown = (e) => {
    e.stopPropagation();
    setDropdownOpen(!isDropdownOpen);
  };

  return (
    <TitleContainer {...props}>
      {isTeam && participants ? (
        <TeamChatProfileImage 
          participants={participants}
          currentUserEmail={currentUserEmail}
        />
      ) : (
        <ProfileImage 
          src={profileImage || '/images/default/defaultProfileImage.png'} 
          alt={isTeam ? "그룹" : "프로필"} 
          onError={(e) => {
            e.target.src = '/images/default/defaultProfileImage.png';
          }}
        />
      )}
      <UserInfo>
        <Name>{userName}</Name>
        {!isTeam && userEmail && (
          <SubText>{userEmail}</SubText>
        )}
      </UserInfo>
      <MenuContainer>
        <img 
          src="/images/icon/threeDotsMenu.svg" 
          alt="메뉴" 
          onClick={toggleDropdown}
        />
        {isDropdownOpen && (
          <Dropdown>
            <DropdownItem>
              <p>채팅방 나가기</p>
            </DropdownItem>
          </Dropdown>
        )}
      </MenuContainer>
    </TitleContainer>
  );
};

ChatTitle.defaultProps = {
  isTeam: false,
  profileImage: null,
  userName: '',
  userEmail: '',
  participantCount: 0
};



export default ChatTitle;