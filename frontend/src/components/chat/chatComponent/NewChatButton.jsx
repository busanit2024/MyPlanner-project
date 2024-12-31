import React, { useState } from 'react';
import NewChatModal from './NewChatModal';

const NewChatButton = ({ currentUser }) => {
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
            />
        </>
    );
};

export default NewChatButton;
