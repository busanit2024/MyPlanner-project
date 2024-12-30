import styled from "styled-components";
import Button from "./Button";

const defaultProfileImageUrl = "/images/default/defaultProfileImage.png";

export default function UserListItem({ user }) {
  return (
    <Container className="user-list-item">
      <div className="left">
        <Avatar>
          <img src={user?.profileImageUrl ?? defaultProfileImageUrl} alt="profile" onError={(e) => e.target.src={defaultProfileImageUrl} } />
        </Avatar>
        <Info>
          <span className="name">{user?.username}</span>
          <span className="email">{user?.email}</span>

        </Info>

      </div>

      <div className="right">
        <div className="message-icon">
          <img src="/images/icon/message.svg" alt="message" />
        </div>
        <Button color="primary">팔로우하기</Button>
      </div>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 0;

  & .left {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  & .right {
    display: flex;
    align-items: center;
    gap: 12px;

    & .message-icon {
      cursor: pointer;
      width: 36px;
      height: 36px;

      & img {
        width: 100%;
        height: 100%;
      }
    }
  }
`;

const Avatar = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background-color: var(--light-gray);
  
  & img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
  }
`;

const Info = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-left: 12px;

  & .name {
    font-size: 18px;
    font-weight: bold;
  }

  & .email {
    color: var(--mid-gray);
  }
`;