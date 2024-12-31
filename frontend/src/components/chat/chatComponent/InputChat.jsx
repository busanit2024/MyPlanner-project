import styled from "styled-components";
import { useState } from "react";
import ImageUploadModal from '../../../ui/ImageUploadModal';

const InputChatBox = styled.div`
    display: flex;
    align-items: center;
    background-color: var(--chat-gray); 
    border-radius: 50px;
    padding: 6px 16px;
    gap: 12px;
    position: relative;
    margin-right: 24px;
`;

const Input = styled.input`
    flex: 1;
    border: none;
    background: none;
    outline: none;
    padding: 6px 0;
    font-size: 14px;

    &::placeholder {
        color: #999;
    }
`;

const SendButton = styled.button`
    background: var(--primary-color);
    border: none;
    border-radius: 50%;
    width: 25px;
    height: 25px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    flex-shrink: 0;

    img {
        width: 16px;
        height: 16px;
    }

    &:active {
        opacity: 0.9;
    }
`;

const Dropdown = styled.div`
    position : absolute;
    bottom: 100%;
    left : 0;
    background: var(--light-primary);
    border-radius:4px;
    padding : 10px;
    margin-bottom : 5px;
    z-index: 1000;
`;

const DropdownItem = styled.div`
    display:flex;
    align-items: center;
    height:35px;
    img {
        width : 28px;
        height: 28px;
        margin-right: 3px;
    }
`;

export default function InputChat({ onSendMessage }) {
    const [isDropdownOpen, setDropdownOpen] = useState(false);
    const [isImageModalOpen, setImageModalOpen] = useState(false);
    const [message, setMessage] = useState('');

    const toggleDropdown = () => {
        setDropdownOpen(!isDropdownOpen);
    };

    const attachImg = () => {
        setImageModalOpen(true);
        setDropdownOpen(false);
    };

    const handleImageUpload = (files) => {
        files.forEach(file => {
            console.log('Uploaded file:', file);
            // 이미지 업로드 로직 추가해야함
        });
    };

    const handleSend = () => {
        if (message.trim()) {
            onSendMessage(message);
            setMessage('');
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <>
            <InputChatBox>
                <img src="images/icon/plus.svg" alt="plus" onClick={toggleDropdown} />
                <Input 
                    type="text"
                    placeholder="메시지 보내기..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                />
                <SendButton onClick={handleSend}>
                    <img src="images/icon/sendMsg_48.png" alt="sent"/>
                </SendButton>
                {isDropdownOpen && (
                    <Dropdown>
                        <DropdownItem onClick={attachImg}>
                            <img src="images/icon/chatImage.png" alt="이미지 추가" />
                            <p>이미지 추가</p>
                        </DropdownItem>
                        <DropdownItem>
                            <img src="images/icon/chatCal.png" alt="일정 공유" />
                            <p>일정 공유</p>
                        </DropdownItem>
                    </Dropdown>
                )}
            </InputChatBox>
            
            <ImageUploadModal 
                isOpen={isImageModalOpen}
                onClose={() => setImageModalOpen(false)}
                onUpload={handleImageUpload}
            />
        </>
    );
}