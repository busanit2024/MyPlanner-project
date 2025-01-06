import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import styled from "styled-components";
import Button from "../../ui/Button";
import { useAuth } from "../../context/AuthContext";
import Swal from "sweetalert2";
import Chip from "../../ui/Chip";

const defaultProfileImageUrl = "/images/default/defaultProfileImage.png";

export default function UserProfilePage() {
  const { userId } = useParams();
  const { user, loading } = useAuth();
  const [pageUser, setPageUser] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followsMe, setFollowsMe] = useState(false);

  useEffect(() => {
    axios.get(`/api/user/${userId}`)
      .then(res => {
        console.log(res.data);
        setPageUser(res.data);
      })
      .catch(err => {
        console.error(err);
      });
  }, [userId]);

  useEffect(() => {
    if (!loading && user && pageUser) {
      checkFollow();
      checkFollowsMe();
    }
  }, [user, loading, pageUser]);

  const checkFollow = () => {
    const pageUserFollowers = pageUser?.followers ?? [];
    const isFollow = pageUserFollowers.some(follower => follower === user?.id);
    setIsFollowing(isFollow);
  }

  const checkFollowsMe = () => {
    const followers = user?.followers ?? [];
    const follows = followers.some(follower => follower === pageUser?.id);
    setFollowsMe(follows);
  }

  const onFollow = () => {
    if (loading || !user) {
      return;
    }

    const userId = user?.id;
    const targetUserId = pageUser?.id;

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
    const targetUserId = pageUser?.id;

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

  const handleUnfollowButton = () => {
    Swal.fire({
      title: "언팔로우하기",
      text: "이 회원을 언팔로우하시겠어요?",
      showCancelButton: true,
      confirmButtonText: "언팔로우",
      cancelButtonText: "취소",
      customClass: {
        //App.css에 정의된 클래스 사용
        title: "swal-title",
        htmlContainer: "swal-text-container",
        confirmButton: "swal-button swal-button-danger",
        cancelButton: "swal-button swal-button-cancel",
      },
    }).then((result) => {
      if (result.isConfirmed) {
        onUnfollow();
      }
    });
  }


  return (
    <Container>
      <UserInfoContainer>
        <LeftContainer>
          <div className="profileImage">
            <img src={pageUser?.profileImageUrl ?? defaultProfileImageUrl} onError={(e) => e.target.src=defaultProfileImageUrl} alt="profile" />
          </div>
          <div className="info">
            <div className="nameContainer">
              <div className="username">{pageUser?.username}</div>
              <div className="email">{pageUser?.email}</div>
              {followsMe && <Chip size="small">나를 팔로우함</Chip>}
            </div>
            <div className="bio">{pageUser?.bio}</div>
          </div>

        </LeftContainer>
        <RightContainer>
          {isFollowing && <>
            <div className="button">
              <img src="/images/icon/message.svg" alt="message" />
            </div>
            <Button onClick={handleUnfollowButton}>팔로잉</Button>
          </>}
          {(!isFollowing && followsMe) &&
            <Button color="primary" onClick={onFollow}>맞팔로우하기</Button>
          }
          {(!isFollowing && !followsMe) &&
            <Button color="primary" onClick={onFollow}>팔로우하기</Button>
          }
        </RightContainer>
      </UserInfoContainer>
      <UserDataContainer>
        //다른 데이터
      </UserDataContainer>
    </Container>
  );
}

const Container = styled.div`
    display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
`;

const UserInfoContainer = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  border-bottom: 1px solid var(--light-gray);
  margin: 0 128px;
  padding: 36px 0;
`;

const LeftContainer = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 24px;

  & .profileImage {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    background-color: var(--light-gray);

    & img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      object-fit: cover;
    }
  }

  & .info {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  & .nameContainer {
    display: flex;
    align-items: center;
    gap: 12px;

    & .username {
      font-size: 18px;
      font-weight: bold;
    }

    & .email {
      font-size: 16px;
      color: var(--mid-gray);
    }

  }

  & .bio {
    font-size: 16px;
  }

`;

const RightContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 24px;

  & .button {
    width: 36px;
    height: 36px;
    cursor: pointer;
    
    & img {
      width: 100%;
      height: 100%;
    }
  }
`;

const UserDataContainer = styled.div`
  display: flex;
  gap: 24px;
  padding: 24px 128px;
`;

