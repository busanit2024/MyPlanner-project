import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useAuth } from '../../context/AuthContext';
import Button from '../../ui/Button';
import UserChip from '../chat/chatComponent/UserChip';



  export default function UserSelectModal ({ isOpen, onClose, participants, setParticipants }) {   
    const { user, loading } = useAuth(); // 로그인한 유저
    const [searchTerm, setSearchTerm] = useState(''); // 검색 키워드
    const [selectedUsers, setSelectedUsers] = useState([]); // 추가할 상대 유저
    const [follows, setFollows] = useState([]); // 로그인한 유저의 팔로우 유저

    const resetState = () => {

      setSelectedUsers([]); // 대화할 상대 유저 초기화
      setSearchTerm(''); // 검색 키워드 초기화
    }

    useEffect(() => {
      if (isOpen && user?.id) {  // user.id가 있을 때만 실행
          resetState();

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

    // 대화할 상대 유저 선택 로직
    const handleUserSelect = (user) => {
      if (!selectedUsers.some(selectedUser => selectedUser.email === user.email)) {
          setSelectedUsers(prevSelectedUsers => [...prevSelectedUsers, user]);
      }
    };

    // 대화할 상대 유저 칩 삭제
    const handleUserRemove = (email) => {
        setSelectedUsers(prevSelectedUsers => prevSelectedUsers.filter(user => user.email !== email));
    };

    // 모달 닫기(선택 유저 및 검색어 초기화)
    const handleModalClose = (e) => {
      e.stopPropagation();
      resetState();
      onClose();
    };

    const handleSetParticipants = () => {
      const newParticipants = [...participants];

      selectedUsers.forEach(user => {
        if (!newParticipants.some(participant => participant.email === user.email)) {
          newParticipants.push(user);
        }
      });

      setParticipants(newParticipants);
      resetState();
      onClose();
    };

    if (!isOpen) return null;

    return (
        <ModalOverlay onClick={handleModalClose}>
            <ModalContent onClick={(e) => e.stopPropagation()}> {/* 클릭 이벤트 전파 방지 */}
                <div className="modal-header">
                    <div className="cancel-icon" onClick={onClose}>
                        <img src="/images/icon/cancel.svg" alt="cancel" />
                    </div>
                    <div className="header-center">참가자 선택</div>
                    <Button 
                      color={selectedUsers.length > 0 ? "primary" : "unselected"}
                      size="small"
                      onClick={handleSetParticipants}
                      disabled={selectedUsers.length === 0}
                    >
                      추가하기
                    </Button>
                </div>
                <div className='search-user'>
                    <img src="/images/icon/search.svg" alt="search" />                    
                    <input style={{ marginLeft: '10px', fontSize: '22px', border: 'none' }} 
                    type="text" placeholder='사용자 검색'
                    value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
                <ChipsContainer>
                    {selectedUsers.map(user => (
                        <UserChip 
                            key={user.email} 
                            user={{ name: user.username, profileImage: user.profileImageUrl }} 
                            onRemove={() => handleUserRemove(user.email)} 
                        />
                    ))}
                </ChipsContainer>
                <div className='user-list'>
                  {filteredUsers.map(user => (
                    <div 
                        key={user.email} 
                        className='user-item' 
                        onClick={() => handleUserSelect(user)}
                        style={{ cursor: 'pointer' }}
                    >
                        <ProfileImage className='profileImage'>
                          <img src={user.profileImageUrl || '/images/default/defaultProfileImage.png'} alt="프로필 이미지" />
                        </ProfileImage>
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
    z-index: 100;
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
      justify-content: space-between;
      align-items : center;
      width: 100%;
      margin-bottom: 15px;
    }

    .header-center {
      flex: 1;  
      text-align: center;  
      margin: 0 20px;  
    }

    .header-right {
      margin-left: auto; 
    }

    .header-left {
      display: flex;
      align-items: center;
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

const ProfileImage = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;

  & img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
  }
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