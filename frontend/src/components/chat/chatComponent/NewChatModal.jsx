import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import UserChip from './UserChip';
import { useAuth } from '../../../context/AuthContext';

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
    const { user } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [follows, setFollows] = useState([]);

    const resetState = () => {
      setSelectedUsers([]);
      setSearchTerm('');
    }

    useEffect(() => {
      if (isOpen && user?.id) {  // user.id가 있을 때만 실행
          resetState();
          console.log('현재 사용자 ID:', user.id);  // user.id 로그 추가

          // 바로 following 목록 조회
          fetch(`/api/user/following?userId=${user.id}&page=0&size=20`)
              .then(res => {
                  if (!res.ok) {
                      console.error('응답 상태:', res.status);
                      throw new Error('팔로우 목록 로드 실패');
                  }
                  return res.json();
              })
              .then(followData => {
                  console.log('팔로우 목록:', followData);
                  setFollows(followData.content);
              })
              .catch(error => {
                  console.error('데이터 로드 중 에러:', error);
              });
      }
    }, [isOpen, user]);

    // chip
    const filteredUsers = follows.filter(user =>
        user.username?.includes(searchTerm) || user.email?.includes(searchTerm)
    );

    const handleUserSelect = (user) => {
      if (!selectedUsers.some(selectedUser => selectedUser.email === user.email)) {
        setSelectedUsers([...selectedUsers, {
            name: user.username, 
            email: user.email,
            profileImage: user.profileImageUrl || 'images/default/defaultProfileImage.png'
        }]);
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
                    {selectedUsers.map(user => (
                        <UserChip 
                            key={user.email} 
                            user={user} 
                            onRemove={() => handleUserRemove(user.email)} 
                        />
                    ))}
                </ChipsContainer>
                <div className='user-list'>
                    {filteredUsers.map(user => (
                        <div key={user.email} className='user-item' onClick={() => handleUserSelect(user)}>
                            <ProfileImage src={user.profileImageUrl|| 'images/default/defaultProfileImage.png'} alt="프로필 이미지" />
                            <UserInfo style={{ marginLeft: '10px' }}>
                                <UserName>{user.username}</UserName>
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