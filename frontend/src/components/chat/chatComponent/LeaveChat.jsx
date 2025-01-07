import React from 'react';
import styled from 'styled-components';

const MessageContainer = styled.div`
    display: flex;
    justify-content: center;
    margin: 16px;
`;

const MessageBox = styled.div`
    background-color: rgba(0, 0, 0, 0.05);
    paddig: 8px 16px;
    border-radius: 16px;
    font-size: 13px;
    color: #666;
`;

const LeaveChat = () => {
    return (
        <MessageContainer>
            <MessageBox>
                `${}님이 나갔습니다.`
            </MessageBox>
        </MessageContainer>
    )
}