import React, { useState } from 'react';
import styled from 'styled-components';

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
    width: 300px;

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
    }

    .user-item {
      display: flex;
      align-items: center;
      padding: 10px;
    }    
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
    const users = [
        { name: '호두', email: 'hodo@test.com', profileImage: 'images/default/defaultProfileImage.png'},
        { name: '하츄핑', email: 'heartping@test.com', profileImage: 'images/default/defaultProfileImage.png'},
        { name: '토코몬', email: 'tocomon@test.com', profileImage: 'images/default/defaultProfileImage.png'},
    ];

    const filteredUsers = users.filter(user =>
        user.name.includes(searchTerm) || user.email.includes(searchTerm)
    );

    if (!isOpen) return null;

    return (
        <ModalOverlay>
            <ModalContent>
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
                <div className='user-list'>
                    {filteredUsers.map(user => (
                        <div key={user.email} className='user-item'>
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