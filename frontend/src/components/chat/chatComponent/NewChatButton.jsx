import React from 'react';
import styled from 'styled-components';

const Button = styled.button`
    background-color: none;
    border: none;
    cursor: pointer;
`
const NewChatButton = ({ onClick }) => {
    return (
        <Button onClick={onClick}>
            <img src="images/icon/newChat.png" alt="newChat open" />
        </Button>
    );
};

export default NewChatButton;
