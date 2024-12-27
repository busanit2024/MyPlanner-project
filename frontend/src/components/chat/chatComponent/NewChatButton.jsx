import React from 'react';
import styled from 'styled-components';

const Button = styled.button`
    background: none;
    border: none;
    cursor: pointer;

    & img {
      width: 70%;
      height: 70%;
    }
`
const NewChatButton = ({ onClick }) => {
    return (
        <Button onClick={onClick}>
            <img src="images/icon/newChat.svg" alt="newChat open" />
        </Button>
    );
};

export default NewChatButton;
