import styled from "styled-components";
import Button from "./Button";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { useEffect, useState } from "react";

const defaultProfileImageUrl = "/images/default/defaultProfileImage.png";

export default function UserListItem({ user: item }) {
  const { user, loading } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    if (user) {
      checkFollow();
    }
  }, [user]);

  const onFollow = () => {
    if (loading || !user) {
      return;
    }

    const userId = user.id;
    const targetUserId = item.id;

    if (isFollowing) {
      return;
    }

    axios.get(`/api/user/follow`, { params: { userId, targetUserId } })
      .then(res => {
        console.log(`follow id ${targetUserId}`, res.data);
        setIsFollowing(true);
      })
      .catch(err => {
        console.error(err);
      });
  }

  const onUnfollow = () => {
    if (loading || !user) {
      return;
    }

    const userId = user.id;
    const targetUserId = item.id;

    if (!isFollowing) {
      return;
    }

    axios.get(`/api/user/unfollow`, { params: { userId, targetUserId } })
      .then(res => {
        console.log(`unfollow id ${targetUserId}`, res.data);
        setIsFollowing(false);
      })
      .catch(err => {
        console.error(err);
      });
  }

  const checkFollow = () => {
    const follows = user?.follows ?? [];
    const isFollow = follows.some(follow => follow === item.id);
    setIsFollowing(isFollow);
  }


  return (
    <Container className="user-list-item">
      <div className="left">
        <Avatar>
          <img src={item?.profileImageUrl ?? defaultProfileImageUrl} alt="profile" onError={(e) => e.target.src = { defaultProfileImageUrl }} />
        </Avatar>
        <Info>
          <span className="name">{item?.username}</span>
          <span className="email">{item?.email}</span>

        </Info>

      </div>

      <div className="right">
        {isFollowing &&
          <div className="message-icon">
            <img src="/images/icon/message.svg" alt="message" />
          </div>
        }
        {isFollowing ? <Button onClick={onUnfollow} >팔로잉</Button> : <Button color="primary" onClick={onFollow}>팔로우하기</Button>}
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
    cursor: pointer;
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