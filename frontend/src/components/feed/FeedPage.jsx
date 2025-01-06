import { useEffect, useState } from "react";
import styled from "styled-components";
import ScheduleListItem from "../../ui/ScheduleListItem";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";

const defaultProfileImageUrl = "/images/default/defaultProfileImage.png";

export default function FeedPage() {
  const { user, loading } = useAuth();
  const [feedType, setFeedType] = useState("follow");
  const [followFeed, setFollowFeed] = useState([]);
  const [exploreFeed, setExploreFeed] = useState([]);
  const [feedLoading, setFeedLoading] = useState(false);
  const [followingList, setFollowingList] = useState([]);
  const [followingListState, setFollowingListState] = useState({
    page: 0,
    hasNext: false
  });

  useEffect(() => {
    if (!loading && user) {
      fetchFollowingList();
    }
  }, [user, loading]);


  const fetchFollowingList = () => {
    axios.get(`/api/user/following`, {
      params: {
        userId: user?.id,
        page: followingListState.page,
        size: 10
      }
    })
      .then(res => {
        setFollowingList(res.data.content);
        setFollowingListState((prev) => ({
          ...prev,
          hasNext: res.data.hasNext
        }));
      })
      .catch(err => {
        console.error(err);
      });
  }



  return (
    <Container>
      <FeedTypeWrap>
        <div className={`feed-type ${feedType === "follow" ? "active" : ""}`} onClick={() => setFeedType("follow")}>
          <span>팔로우</span>
          <div></div>
        </div>
        <div className={`feed-type ${feedType === "explore" ? "active" : ""}`} onClick={() => setFeedType("explore")}>
          <span>탐색</span>
          <div></div>
        </div>
      </FeedTypeWrap>
      <FeedResultList>
        {feedLoading && <div>로딩중...</div>}
        {feedType === "follow" && <>
        <FollowingListContainer>
          {followingList.map((item) => (
            <div className="item" key={item.id}>
            <div className="avatar" key={item.id}>
              <img src={item.profileImageUrl || defaultProfileImageUrl} alt="profile" />
            </div>
            <span className="username">{item.username}</span>
          </div>
          ))}
        </FollowingListContainer>

          {!feedLoading && <>
            {followFeed.length === 0 && <div className="no-result">팔로우한 사용자의 새 글이 없어요.</div>}
            <ScheduleListItem />
          </>}
        </>}


        {(!feedLoading && feedType === "explore") && <>
          {exploreFeed.length === 0 && <div className="no-result">새 글이 없어요.</div>}
          <ScheduleListItem />
        </>}
      </FeedResultList>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
`;

const FeedTypeWrap = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 4px;
  height: 64px;
  border-bottom: 1px solid var(--light-gray);
  flex-shrink: 0;
  width: 100%;

  & .feed-type {
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

const FollowingListContainer = styled.div`
  width: 100%;
  box-sizing: border-box;
  display: flex;
  gap: 24px;
  align-items: center;

  & .item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    cursor: pointer;

    & .username {
      font-size: 14px;
    }

    & .avatar {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background-color: var(--light-gray);

      & img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: 50%;
      }
    }
  }
  `;

const FeedResultList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 24px 128px;
  box-sizing: border-box;
  width: 100%;

  & .no-result {
    margin-top: 64px;
    font-size: 18px;
    text-align: center;
    color: var(--mid-gray);
  }
`;