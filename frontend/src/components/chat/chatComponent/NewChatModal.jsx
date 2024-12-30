import React from 'react';
import { useNavigate } from 'react-router-dom';
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
    
    
`;

const ButtonContainer = styled.div`
    display: flex;
    justify-content: space-between;
    margin-top: 20px;
`;

const Button = styled.button`
    padding: 10px 20px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 16px;
`;

const NewChatModal = ({ isOpen, onClose, otherUserEmail }) => {
    const navigate = useNavigate();

    const handleStartChat = () => {
        // 테스트용 채팅방 ID 생성 (실제로는 서버에서 생성해야 함)
        const chatRoomId = 'test-room-1';
        
        // 채팅방으로 이동
        navigate(`/chat/rooms/${chatRoomId}`);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <ModalOverlay>
            <ModalContent>
                <h2>새로운 채팅</h2>
                <p>채팅을 시작하시겠습니까?</p>
                <p>상대방: {otherUserEmail}</p>
                <ButtonContainer>
                    <Button onClick={handleStartChat}>시작하기</Button>
                    <Button onClick={onClose}>취소</Button>
                </ButtonContainer>
            </ModalContent>
        </ModalOverlay>
    );
};

export default NewChatModal;