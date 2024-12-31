import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import UserChip from './UserChip';

const ModalOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
`;

const ModalContent = styled.div`
    background: white;
    padding: 20px;
    border-radius: 5px;
    width: 600px;
    max-height: 80vh;
    display: flex;
    flex-direction: column;

    .modal-header {
      display: flex;
      font-size: 20px;
    }
    
    .cancel-icon {
      cursor: pointer;
      width: 24px;
      height: 24px;

      & img {
      width: 100%;
      height: 100%;
      margin-top: 5px;
      
      }
    }

    .search-user {
      display: flex;
      width: 24px;
      height: 24px;
      margin-top: 15px;

      & img {
        width: 100%;
        height: 100%;
      }
    }

    .user-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
      border-top: solid 1px #e0e0e0;
      margin-top: 10px;
      max-height: 28vh;
      overflow-y: auto;
      padding-right: 10px;

      /* 스크롤바 */
      &::-webkit-scrollbar {
          width: 8px;
      }

      &::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 4px;
      }

      &::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 4px;
      }

      &::-webkit-scrollbar-thumb:hover {
          background: #555;
      }
    }

    .user-item {
      display: flex;
      align-items: center;
      padding: 10px;
    }    
`;

const ChipsContainer = styled.div`
    display: flex;
    flex-wrap: wrap; // 칩이 넘칠 경우 아래로 내려오도록 설정
    gap: 5px; // 칩 간의 간격 설정
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

const NewChatModal = ({ isOpen, onClose }) => {   
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUsers, setSelectedUsers] = useState([]);

    const resetState = () => {
      setSelectedUsers([]);
      setSearchTerm('');
    }

    useEffect(() => {
      if (isOpen) {
        resetState();
      }
    }, [isOpen]);

    const users = [
        { name: '호두', email: 'hodo@test.com', profileImage: 'images/default/defaultProfileImage.png'},
        { name: '하츄핑', email: 'heartping@test.com', profileImage: 'images/default/defaultProfileImage.png'},
        { name: '토코몬', email: 'tocomon@test.com', profileImage: 'images/default/defaultProfileImage.png'},
        { name: '웨이', email: 'way@test.com', profileImage: 'images/default/defaultProfileImage.png'},
        { name: '바훈', email: 'bahun@test.com', profileImage: 'images/default/defaultProfileImage.png'},
        { name: '카단', email: 'kadan@test.com', profileImage: 'images/default/defaultProfileImage.png'},
        { name: '아크', email: 'ark@test.com', profileImage: 'images/default/defaultProfileImage.png'},
        { name: '아만', email: 'aman@test.com', profileImage: 'images/default/defaultProfileImage.png'},
        { name: '니나브', email: 'ninav@test.com', profileImage: 'images/default/defaultProfileImage.png'},
        { name: '안녕안녕안녕안녕안녕', email: 'silian@test.com', profileImage: 'images/default/defaultProfileImage.png'},
    ];

    const filteredUsers = users.filter(user =>
        user.name.includes(searchTerm) || user.email.includes(searchTerm)
    );

    const handleUserSelect = (user) => {
        // 선택된 사용자인지 확인
        const isAlreadySeleted = selectedUsers.some(seletedUser => seletedUser.email === user.email);

        // 선택되지 않은 사용자만 추가 선택 가능
        if (!isAlreadySeleted) {
          setSelectedUsers([...selectedUsers, user]);
        }
    };

    const handleUserRemove = (email) => {
        setSelectedUsers(prevSelectedUsers => prevSelectedUsers.filter(user => user.email !== email));
    };

    const handleModalClose = (e) => {
      e.stopPropagation();
      resetState();
      onClose();
    };

    if (!isOpen) return null;

    return (
        <ModalOverlay onClick={handleModalClose}>
            <ModalContent onClick={(e) => e.stopPropagation()}> {/* 클릭 이벤트 전파 방지 */}
                <div className="modal-header">
                    <div className="cancel-icon" onClick={onClose}>
                        <img src="images/icon/cancel.svg" alt="cancel" />
                    </div>
                    <span style={{ marginLeft: '10px' }}>새 쪽지</span>
                </div>
                <div className='search-user'>
                    <img src="images/icon/search.svg" alt="search" />                    
                    <input style={{ marginLeft: '10px', fontSize: '22px', border: 'none' }} 
                    type="text" placeholder='사용자 검색'
                    value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
                <ChipsContainer>
                  {selectedUsers.map(user => {
                      return (
                          <UserChip key={user.email} user={user} onRemove={() => handleUserRemove(user.email)} />
                      );
                  })}
                </ChipsContainer>
                <div className='user-list'>
                    {filteredUsers.map(user => (
                        <div key={user.email} className='user-item' onClick={() => handleUserSelect(user)}>
                            <ProfileImage src={user.profileImage} alt="프로필 이미지" />
                            <UserInfo style={{ marginLeft: '10px' }}>
                                <UserName>{user.name}</UserName>
                                <UserEmail>{user.email}</UserEmail>
                            </UserInfo>
                        </div>
                    ))}
                </div>
            </ModalContent>
        </ModalOverlay>
    );
};

export default NewChatModal;