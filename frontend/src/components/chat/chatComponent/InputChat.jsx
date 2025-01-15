import styled from "styled-components";
import { useState } from "react";
import ImageUploadModal from '../../../ui/ImageUploadModal';
import MyScheduleModal from '../../../ui/MyScheduleModal';
import { imageFileUpload } from "../../../firebase";

const InputChatBox = styled.div`
    display: flex;
    align-items: center;
    background-color: ${props => props.disabled ? '#f0f0f0' : 'var(--chat-gray)'}; 
    border-radius: 50px;
    padding: 6px 16px;
    gap: 12px;
    position: relative;
    margin-right: 24px;
    opacity: ${props => props.disabled ? 0.7 : 1};
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

    &:disabled {
        cursor: not-allowed;
        background: none;
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

    &:disabled {
        background: #ccc;
        cursor: not-allowed;
        opacity: 0.7;
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
    cursor: pointer;
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

export default function InputChat({ onSendMessage, isLeft }) {
    const [isDropdownOpen, setDropdownOpen] = useState(false);
    const [isImageModalOpen, setImageModalOpen] = useState(false);
    const [isScheduleModalOpen, setScheduleModalOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [uploadedImages, setUploadedImages] = useState([]);
    const [selectedSchedule, setSelectedSchedule] = useState(null);

    const toggleDropdown = () => {
        setDropdownOpen(!isDropdownOpen);
    };

    const MaxImages = 5;

    const attachImg = () => {
        setImageModalOpen(true);
        setDropdownOpen(false);
    };

    const attachSchedule = () => {
        setScheduleModalOpen(true);
        setDropdownOpen(false);
    };

    const handleImageUpload = async(files) => {
        try {
            const uploadPromises = files.map(file => imageFileUpload(file));
            const results = await Promise.all(uploadPromises);
            const imageUrls = results.map(result => result.url).filter(url => url);
            
            if (imageUrls.length > 0) {
                // 이미지 URL들을 JSON 문자열로 변환하여 하나의 메시지로 전송
                await onSendMessage(JSON.stringify(imageUrls));
                setImageModalOpen(false);
            }
        } catch (error) {
            console.error('이미지 업로드 실패:', error);
        }
    };

    const handleScheduleSelect = (schedule) => {
        setSelectedSchedule(schedule);
    };

    const handleSend = async () => {
        if (message.trim()) {
            try {
                await onSendMessage(message);  
                setMessage('');
            } catch (error) {
                console.error('메시지 전송 실패:', error);
            }
        }
    };

    const handleKeyPress = async (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            await handleSend();
        }
    };

    // 버튼 클릭 핸들러 분리
    const handleButtonClick = async (e) => {
        e.preventDefault();
        await handleSend();
    };

    return (
        <>
            <InputChatBox disabled={isLeft}>
                <img 
                    src="images/icon/plus.svg" 
                    alt="plus" 
                    onClick={!isLeft ? toggleDropdown : undefined}
                    style={{ cursor: isLeft ? 'not-allowed' : 'pointer' }}
                />
                <Input 
                    type="text"
                    placeholder={isLeft ? "퇴장한 채팅방입니다" : "메시지 보내기..."}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={isLeft}
                />
                <SendButton 
                    onClick={handleButtonClick}
                    disabled={!message.trim() || isLeft}
                >
                    <img src="images/icon/sendMsg_48.png" alt="sent"/>
                </SendButton>
                {isDropdownOpen && !isLeft && (
                    <Dropdown>
                        <DropdownItem onClick={attachImg}>
                            <img src="images/icon/chatImage.png" alt="이미지 추가" />
                            <p>이미지 추가</p>
                        </DropdownItem>
                        <DropdownItem onClick={attachSchedule}>
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
            <MyScheduleModal
                isOpen={isScheduleModalOpen}
                onClose={() => setScheduleModalOpen(false)}
                onScheduleSelect={handleScheduleSelect}
            />
            {selectedSchedule && <ScheduleChat schedule={selectedSchedule} />}
        </>
    );
}