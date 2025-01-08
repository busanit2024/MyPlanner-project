import React, { useState } from "react";
import styled from "styled-components";

const EditTeamChatTitle = ({ onUpdateTitle, onClose }) => {
    const [newTitle, setNewTitle] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!newTitle.trim()) return;
        try {
            await onUpdateTitle(newTitle.trim());
            setNewTitle('');
            onClose();  
        } catch (error) {
            console.error('채팅방 이름 수정 실패:', error);
        }
    };

    const handleClose = (e) => {
        e.preventDefault();  
        e.stopPropagation();
        setNewTitle('');  
        onClose();  
    };

    return (
        <EditTitle>
            <form onSubmit={handleSubmit}>
                <InputWrapper>
                    <img src="/images/icon/Users.svg" />
                    <TitleInput
                        type="text"
                        placeholder="그룹이름 정하기..."
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        autoFocus
                    />
                    <CloseButton type="button" onClick={handleClose}>×</CloseButton>
                </InputWrapper>    
            </form>
        </EditTitle>
    );
};

const EditTitle = styled.div`
  position: absolute;
  top: 100%;  
  left: 0;
  right: 0;
  background: white;
  padding: 8px;
  border-radius: 0 0 8px 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 10;
`;

const TitleInput = styled.input`
  width: 100%;
  border: none;
  background: transparent;
  font-size: 14px;
  padding: 8px;
  color: var(--gray);
  opacity: 0.8;
  margin-left : 3px;
  
  &::placeholder {
    color: var(--gray);
  }
  
  &:focus {
    outline: none;
    background: rgba(0, 0, 0, 0.05);
  }
`;

const InputWrapper = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 20px;
  color: var(--gray);
  cursor: pointer;
  padding: 0 8px;
  opacity: 0.6;
  
  &:hover {
    opacity: 1;
  }
`;


export default EditTeamChatTitle;