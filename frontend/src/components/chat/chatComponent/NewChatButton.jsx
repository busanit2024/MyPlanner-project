import React, { useState } from 'react';
import NewChatModal from './NewChatModal';

const NewChatButton = ({ currentUser, onChatCreated }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleClick = () => {
        setIsModalOpen(true);
    };

    return (
        <>
            <img 
                src="images/icon/newChat.svg" 
                alt="새 채팅" 
                onClick={handleClick}
            />
            <NewChatModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)}
                currentUser={currentUser}
                onChatCreated={onChatCreated} 
            />
        </>
    );
};

export default NewChatButton;
