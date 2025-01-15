import styled from "styled-components"
import Button from "../../ui/Button";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import UserListItem from "../../ui/UserListItem";

const defaultProfileImage = "/images/default/defaultProfileImage.png";

export default function MyPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [followType, setFollowType] = useState("follower");
  const [followList, setFollowList] = useState([]);
  const [followerList, setFollowerList] = useState([]);
  const [page, setPage] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [listLoading, setListLoading] = useState(true);

  useEffect(() => {
    // 로그인하지 않은 경우 로그인 페이지로 이동
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading]);

  useEffect(() => {
    // 유저 정보 불러오기
    if (!loading && user) {
      setListLoading(true);
      setFollowList([]);
      setFollowerList([]);
      setPage(0);
      setHasNext(false);
      fetchFollowList(followType);
    }
  }, [followType, loading, user]);

  const fetchFollowList = (type) => {
    const size = 10;
    const userId = user?.id;
    const url = type === "follower" ? "/api/user/follower" : "/api/user/following";
    axios.get(url, {
      params: {
        userId,
        page: 0,
        size: page * size + size
      }
    })
      .then(res => {
        if (type === "follower") {
          setFollowerList([...followerList, ...res.data.content]);
        } else {
          setFollowList([...followList, ...res.data.content]);
        }
        setHasNext(!res.data.last);
      })
      .catch(err => {
        console.error(err);
      })
      .finally(() => {
        setListLoading(false);
      });
  };

  return (
    <Container>
      <ProfileContainer className="profile-container">
        <div className="left">
          <div className="inner-container">
            <ProfileImage>
              <img src={user?.profileImageUrl || defaultProfileImage} alt="profile" onError={(e) => (e.target.src = defaultProfileImage)} />
            </ProfileImage>
            <div className="info">
              <span className="name">{user?.username}</span>
              <span className="email">{user?.email}</span>
            </div>
          </div>
          <div className="bio">
            {user?.bio}
          </div>
        </div>
        <div className="right">
          <Button onClick={() => navigate("edit")} >프로필 수정</Button>
        </div>
      </ProfileContainer>

      <FollowTypeWrap>
        <div className={`follow-type ${followType === "follower" ? "active" : ""}`} onClick={() => setFollowType("follower")}>
          <span>팔로워</span>
          <div></div>
        </div>
        <div className={`follow-type ${followType === "following" ? "active" : ""}`} onClick={() => setFollowType("following")}>
          <span>팔로잉</span>
          <div></div>
        </div>
      </FollowTypeWrap>

      <UserList>
        {listLoading && <p className="no-list">로딩 중...</p>}
        {followType === "follower" &&
          <>
            {(!listLoading && followerList.length === 0) && <p className="no-list">아직 당신을 팔로우하는 사람이 없어요.</p>}
            {followerList.map((follower) => (
              <UserListItem key={follower.id} user={follower} />
            ))}
          </>}
        {followType === "following" &&
          <>
            {(!listLoading && followList.length === 0) && <p className="no-list">아직 팔로잉 중인 이용자가 없어요.</p>}
            {followList.map((follow) => (
              <UserListItem key={follow.id} user={follow} />
            ))}
          </>}
        {hasNext && <Button onClick={() => setPage(page + 1)}>더 불러오기</Button>}
      </UserList>
    </Container>
  )
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
`;

const ProfileContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: end;
  padding: 48px 128px;
  box-sizing: border-box;
  flex-shrink: 0;

  & .left {
    display: flex;
    flex-direction: column;
    gap: 32px;

    & .inner-container {
    display: flex;
    gap: 24px;
    width: 100%;
  }

    & .info {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    & .name {
      font-size: 24px;
      font-weight: bold;
    }

    & .email {
      font-size: 18px;
      color: var(--mid-gray);
    }
  }

  & .right {
    display: flex;
    gap: 12px;
  }

  & .bio {
    font-size: 18px;
  }
`;

const ProfileImage = styled.div`
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background-color: var(--light-gray);

  & img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
  }
`;

const FollowTypeWrap = styled.div`
  position: sticky;
  top: 0;
  background-color: white;
  z-index: 1;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 4px;
  height: 64px;
  border-bottom: 1px solid var(--light-gray);
  flex-shrink: 0;

  & .follow-type {
    display: flex;
    flex-direction: column;
    height: 100%;
    flex-grow: 1;
    justify-content: center;
    align-items: center;
    cursor: pointer;

    & span {
      font-size: 18px;
      justify-self: center;
      margin: auto;
    }

    & div {
      width: 120px;
      height: 2px;
      justify-self: flex-end;
      background-color: var(--light-gray);
    }

    &.active div {
      background-color: var(--primary-color);
    }

    &.active span {
      font-weight: bold;
    }
  }
`;

const UserList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 24px 128px;
  box-sizing: border-box;
  width: 100%;
  flex-grow: 1;
  overflow-y: auto;

  & .no-list {
    margin-top: 36px;
    font-size: 18px;
    color: var(--mid-gray);
    text-align: center;
  }
`;