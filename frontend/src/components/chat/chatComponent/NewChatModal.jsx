import React from 'react';
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
`;

const CloseButton = styled.button`
    background: none;
    border: none;
    cursor: pointer;
`;

const NewChatModal = ({ onClose }) => {
    return (
        <ModalOverlay>
            <ModalContent>
                <h2>새 쪽지</h2>
                {/* 채팅방 만들기 관련 내용 추가 */}
                <CloseButton onClick={onClose}>닫기</CloseButton>
            </ModalContent>
        </ModalOverlay>
    );
};

export default NewChatModal;