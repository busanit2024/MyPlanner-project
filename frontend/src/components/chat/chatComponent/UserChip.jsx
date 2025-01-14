import React from 'react';
import styled from 'styled-components';

const ChipContainer = styled.div`
    display: flex;
    align-items: center;
    background: #ffffff;
    border-radius: 30px;
    border: solid 1px #e0e0e0;
    padding: 5px 8px;
    margin: 5px;
    width: fit-content;
    overflow: hidden;
`;

const ProfileImage = styled.img`
    width: 25px;
    height: 25px;
    border-radius: 50%;
    margin-right: 5px;
`;

const UserName = styled.span`
    white-space: nowrap;
    overflow: hidden;
`;

const RemoveButton = styled.span`
    cursor: pointer;
    width: 24px;
    height: 24px;
    margin-left: auto;

    & img {
    width: 100%;
    height: 100%;      
    }
`;

const UserChip = ({ user, onRemove }) => {
    return (
        <ChipContainer>
            <ProfileImage src={user.profileImage} alt="프로필 이미지" />
            <UserName>{user.name}</UserName>
            <RemoveButton onClick={() => {
                onRemove();
            }}>
                <img src="/images/icon/cancel.svg" alt="cancel" />
            </RemoveButton>
        </ChipContainer>
    );
};

export default UserChip;