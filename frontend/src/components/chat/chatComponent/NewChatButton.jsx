import React, { useState } from 'react';
import styled from 'styled-components';
import NewChatModal from './NewChatModal';

const Button = styled.button`
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;

    & img {
      width: 24px;
      height: 24px;
    }
`

const NewChatButton = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleModalOpen = () => {
        console.log('Opening modal');
        setIsModalOpen(true);
    };

    const handleModalClose = () => {
        console.log('Modal is closing');
        setIsModalOpen(false);
    };

    return (
        <>
            <Button onClick={handleModalOpen}>
                <img src="images/icon/newChat.svg" alt="newChat open" />
            </Button>
            <NewChatModal 
                isOpen={isModalOpen} 
                onClose={handleModalClose}
            />
        </>
    );
};

export default NewChatButton;
