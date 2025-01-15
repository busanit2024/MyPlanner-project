import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useAuth } from '../../context/AuthContext';
import Button from '../../ui/Button';
import UserChip from '../chat/chatComponent/UserChip';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';


const defaultProfileImageUrl = '/images/default/defaultProfileImage.png';
export default function LikeUserModal({ isOpen, onClose, scheduleId }) {
  const [likeUsers, setLikeUsers] = useState([]); // 좋아요 누른 유저 목록
  const [page, setPage] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen && scheduleId) {
      fetchLikeUsers();
    }
  }, [isOpen, scheduleId, page]);

  // 모달 닫기(선택 유저 및 검색어 초기화)
  const handleModalClose = (e) => {
    e.stopPropagation();
    resetState();
    onClose();
  };

  const resetState = () => {
    setLikeUsers([]);
    setPage(0);
    setHasNext(false);
  };

  const fetchLikeUsers = async () => {
    setLoading(true);
    const size = 10;
    if (!scheduleId) return;
    try {
      const response = await axios.get(`/api/reaction/like/list`, {
        params: {
          scheduleId,
          page: 0,
          size: size * (page + 1)
        },
      });
      setLikeUsers([...likeUsers, ...response.data.content]);
      setHasNext(!response.data.last);
    } catch (error) {
      console.error('Error fetching like users:', error);
    } finally {
      setLoading(false);
    }
  };



  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={handleModalClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}> {/* 클릭 이벤트 전파 방지 */}
        <div className="modal-header">

          <div className="header-center">좋아요한 사용자</div>
          <div className="cancel-icon" onClick={handleModalClose}>
            <img src="/images/icon/cancel.svg" alt="cancel" />
          </div>
        </div>
        <div className='user-list'>
          {!loading && likeUsers.length === 0 && <div className='loading'>아직 좋아요를 누른 사람이 없어요.</div>}
          {likeUsers.map(user => (
            <div
              key={user.email}
              className='user-item'
              onClick={() => navigate(`/user/${user.id}`)}
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
          {loading && <div className="loading">사용자 목록 불러오는 중...</div>}
          {hasNext && <div style={{ display: 'flex', justifyContent: 'center' }}>
            <Button size="small" onClick={() => setPage(page + 1)}>더 불러오기</Button>
          </div>
          }

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
      padding-top: 12px;
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

    .loading {
      padding: 12px 0;
      text-align: center;
      color: var(--mid-gray);
    }

    .user-item {
      display: flex;
      align-items: center;
      padding: 10px;
    }    
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