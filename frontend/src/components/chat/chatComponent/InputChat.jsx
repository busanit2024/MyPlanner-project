import styled from "styled-components";
import sendMsg from "../../../images/sendMsg_48.png";
import chatImage from "../../../images/chatImage.png";
import chatCal from "../../../images/chatCal.png";
import { useState } from "react";

const InputChatBox = styled.div`
    display: flex;
    align-items: center;
    background-color: #F2F2F2; 
    border-radius: 50px;
    padding: 8px 16px;
    gap: 12px;
    position : relative;
`;

const Input = styled.input`
    flex: 1;
    border: none;
    background: none;
    outline: none;
    padding: 8px 0;
    font-size: 14px;

    &::placeholder {
        color: #999;
    }
`;


const SendButton = styled.button`
    background: #FF9F57;
    border: none;
    border-radius: 50%;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;

    img {
        width: 16px;
        height: 16px;
    }

    &:active {
        box-shadow: 0 2px 2px rgba(0, 0, 0, 0.2);
    }
`;

const Dropdown = styled.div`
    position : absolute;
    bottom: 100%;
    left : 0;
    background: rgb(252, 245, 237);
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

export default function InputChat() {
    const [isDropdownOpen, setDropdownOpen] = useState(false);
    const toggleDropdown = () => {
        setDropdownOpen(!isDropdownOpen);
    };

    return (
        <InputChatBox>
            <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="30" height="30" viewBox="0 0 24 24" onClick={toggleDropdown}>
                <path d="M 12 2 C 6.4889971 2 2 6.4889971 2 12 C 2 17.511003 6.4889971 22 12 22 C 17.511003 22 22 17.511003 22 12 C 22 6.4889971 17.511003 2 12 2 z M 12 4 C 16.430123 4 20 7.5698774 20 12 C 20 16.430123 16.430123 20 12 20 C 7.5698774 20 4 16.430123 4 12 C 4 7.5698774 7.5698774 4 12 4 z M 11 7 L 11 11 L 7 11 L 7 13 L 11 13 L 11 17 L 13 17 L 13 13 L 17 13 L 17 11 L 13 11 L 13 7 L 11 7 z"></path>
            </svg>
            <Input 
                type="text"
                placeholder="메시지 보내기..."
            />
            <SendButton >
                <img src={sendMsg} alt="sent"/>
            </SendButton>
            {isDropdownOpen && (
                <Dropdown>
                     <DropdownItem>
                        <img src={chatImage} alt="이미지 추가" />
                        <p>이미지 추가</p>
                    </DropdownItem>
                    <DropdownItem>
                        <img src={chatCal} alt="일정 공유" />
                        <p>일정 공유</p>
                    </DropdownItem>
                </Dropdown>
            )}
        </InputChatBox>
    );
}