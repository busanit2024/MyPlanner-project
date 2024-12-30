import React, { useState } from 'react';
import NewChatModal from './NewChatModal';

const NewChatButton = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleClick = () => {
        setIsModalOpen(true);
    };

    return (
        <>
            <img 
                src="images/icon/plus.svg" 
                alt="새 채팅" 
                onClick={handleClick}
            />
            <NewChatModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)}
                otherUserEmail="tokomon@test.com"  // 테스트용 상대방 이메일
            />
        </>
    );
};

export default NewChatButton;
