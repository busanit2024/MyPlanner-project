import styled from "styled-components";
import Button from "./Button";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { useEffect, useState } from "react";
import Modal from "./Modal";
import Chip from "./Chip";

const defaultProfileImageUrl = "/images/default/defaultProfileImage.png";

export default function UserListItem({ user: item }) {
  const { user, loading } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [followsMe, setFollowsMe] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMyAccount, setIsMyAccount] = useState(false);

  useEffect(() => {
    if (user) {
      checkFollow();
      checkFollowsMe();
      checkMyAccount();
    }
  }, [user]);

  const onModalClose = () => {
    setIsModalOpen(false);
  }

  const onFollow = () => {
    if (loading || !user) {
      return;
    }

    const userId = user?.id;
    const targetUserId = item?.id;

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

    const userId = user?.id;
    const targetUserId = item?.id;

    if (!isFollowing) {
      return;
    }

    axios.get(`/api/user/unfollow`, { params: { userId, targetUserId } })
      .then(res => {
        console.log(`unfollow id ${targetUserId}`, res.data);
        setIsFollowing(false);
        setIsModalOpen(false);
      })
      .catch(err => {
        console.error(err);
      });
  }

  const checkFollow = () => {
    const follows = user?.follows ?? [];
    const isFollow = follows.some(follow => follow === item?.id);
    setIsFollowing(isFollow);
  }

  const checkFollowsMe = () => {
    const followers = user?.followers ?? [];
    const follows = followers.some(follower => follower === item?.id);
    setFollowsMe(follows);
  }

  const checkMyAccount = () => {
    if (user?.id === item?.id) {
      setIsMyAccount(true);
    }
  }


  return (
    <Container className="user-list-item">
      <Modal title={"언팔로우하기"} isOpen={isModalOpen} onClose={onModalClose}>
        <div className="subtitle">이 회원을 언팔로우하시겠어요?</div>
        <div className="button-group">
          <Button onClick={onUnfollow} color="danger">언팔로우</Button>
          <Button onClick={onModalClose}>취소</Button>
        </div>
      </Modal>
      <div className="left">
        <Avatar>
          <img src={item?.profileImageUrl ?? defaultProfileImageUrl} alt="profile" onError={(e) => e.target.src = { defaultProfileImageUrl }} />
        </Avatar>
        <Info>
          <span className="name">{item?.username}
            {(!isMyAccount && followsMe) && <Chip size="small" style={{ marginLeft: "8px" }}>나를 팔로우함</Chip> }
          </span>
          <span className="email">{item?.email}</span>

        </Info>

      </div>

      <div className="right">
        { !isMyAccount && 
        <>
        {isFollowing &&
          <div className="message-icon">
            <img src="/images/icon/message.svg" alt="message" />
          </div>
        }
        {isFollowing ? <Button onClick={() => setIsModalOpen(true)} >팔로잉</Button> : <Button color="primary" onClick={onFollow}>팔로우하기</Button>}
        </> }
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
    object-fit: cover;
    border-radius: 50%;
  }
`;

const Info = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-left: 12px;

  & .name {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 18px;
    font-weight: bold;
  }

  & .email {
    color: var(--mid-gray);
  }
`;