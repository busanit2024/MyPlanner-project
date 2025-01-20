import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import ScheduleListItem from "../../ui/ScheduleListItem";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Button from "../../ui/Button";

const defaultProfileImageUrl = "/images/default/defaultProfileImage.png";

export default function FeedPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [feedType, setFeedType] = useState("follow");
  const [followFeed, setFollowFeed] = useState([]);
  const [exploreFeed, setExploreFeed] = useState([]);
  const [feedState, setFeedState] = useState({
    loading: false,
    page: 0,
    hasNext: false
  });
  const [followingList, setFollowingList] = useState([]);
  const [followingListState, setFollowingListState] = useState({
    page: 0,
    hasNext: false,
    first: true,
    last: false,
  });
  const userRef = useRef(user);
  const containerRef = useRef(null);
  const scrollPositon = useRef(0);

  // 초기 로딩 (유저정보 로딩되면 팔로잉 리스트와 피드 불러오기)
  useEffect(() => {
    if (!loading && user) {
      userRef.current = user;
      fetchFollowingList();
      fetchFeedByType();
    }
  }, [user, loading]);

  // 피드 타입 변경시 피드 초기화 및 불러오기
  useEffect(() => {
    setFeedState({
      loading: true,
      page: 0,
      hasNext: false
    });
    setFollowFeed([]);
    setExploreFeed([]);
    fetchFeedByType();

  }, [feedType]);

  useEffect(() => {
    if (feedState.page > 0) {
      fetchFeedByType();
    }
  }, [feedState.page]);

  const fetchFeedByType = () => {
    if (feedType === "follow") {
      if (userRef.current) {
        fetchFollowFeed();
      }
    } else {
      fetchFeed();
    }
  };

  // 팔로잉 유저 리스트 불러오기
  const fetchFollowingList = (userId, page = 0) => {
    console.log(`Fetching following list for user ${userId} at page ${page}`);
    axios.get(`/api/user/following`, {
      params: {
        userId: userId,
        page: page,
        size: 10, // 한 페이지에 가져올 팔로잉 유저의 수를 10으로 설정
      },
    })
      .then((res) => {
        console.log("Server Response:", res); // 서버 응답 전체를 출력
        console.log("res.data", res.data); // 서버 응답 전체를 출력
        console.log("Following List:", res.data.content); // 확인용 로그
        setFollowingList(res.data.content); // 팔로잉 유저 리스트 저장        
        setFollowingListState({
          page: page,
          hasNext: res.data.hasNext,
          total: res.data.totalElements, // 전체 유저 수 저장\
          first: res.data.first,
          last: res.data.last,
        });
        console.log("Updated followingListState:", { page, hasNext: res.data.hasNext, total: res.data.totalElements });
      })
      .catch((err) => {
        console.error(err);
      });
  };
  useEffect(() => {
    const fetchData = async () => {
      // 인증되지 않은 사용자는 로그인 페이지로 이동
      if (!loading && !user) {
        navigate("/login");
      }
      if (!loading && user && user.id) {
        // 팔로잉 유저 리스트 가져오기
        console.log("Fetching initial following list");
        await fetchFollowingList(user.id, 0); // 초기 페이지를 0으로 설정하여 호출
      } else if (!loading && user && !user.id) {
        console.error("User ID is null or undefined");
        // Handle the error case, e.g., show an error message or navigate to an error page
      }
    };
  
    fetchData();
  }, [user, loading]);
  // 팔로잉 유저 다음 페이지지
  const handleNextPage = () => {
    console.log("Next page button clicked");
    if (!followingListState.last) {
      console.log("Fetching next page");
      fetchFollowingList(user.id, followingListState.page + 1);
    }
  };
  //팔로잉 유저 이전 페이지
  const handlePrevPage = () => {
    console.log("Previous page button clicked");
    if (!followingListState.first) {
      console.log("Fetching previous page");
      fetchFollowingList(user.id, followingListState.page - 1);
    }
  };
  // 전체 피드 불러오기
  const fetchFeed = () => {
    setFeedState((prev) => ({ ...prev, loading: true }));
    const size = 10;

    axios.get(`/api/schedules/feed`, {
      params: {
        page: 0,
        size: feedState.page * size + size
      }
    })
      .then(res => {
        console.log(res.data);
        setExploreFeed(res.data.content ?? []);
        setFeedState((prev) => ({ ...prev, hasNext: !res.data.last }));
      })
      .catch(err => {
        console.error(err);
      })
      .finally(() => {
        setFeedState((prev) => ({ ...prev, loading: false }));
        containerRef.current.scrollTop = scrollPositon.current;
      });
  };

  // 팔로잉 피드 불러오기
  const fetchFollowFeed = () => {
    setFeedState((prev) => ({ ...prev, loading: true }));
    const size = 10;

    axios.get(`/api/schedules/feed/follow`, {
      params: {
        userId: user?.id,
        page: 0,
        size: feedState.page * size + size
      }
    })
      .then(res => {
        console.log(res.data);
        setFollowFeed(res.data.content ?? []);
        setFeedState((prev) => ({ ...prev, hasNext: !res.data.last }));
      })
      .catch(err => {
        console.error(err);
      })
      .finally(() => {
        setFeedState((prev) => ({ ...prev, loading: false }));
        if(containerRef.current) {
        containerRef.current.scrollTop = scrollPositon.current;
        }
      });
  };

  //더 불러올때 스크롤 위치 저장
  const handleLoadMore = () => {
    if (containerRef.current) {
    scrollPositon.current = containerRef.current.scrollTop;
    }
    setFeedState((prev) => ({ ...prev, page: prev.page + 1 }));
  }




  return (
    <Container className="feed-page" ref={containerRef}>
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
        {feedType === "follow" && <>
          <FollowingListContainer>
          <div className="pagination-buttons">
                <button onClick={handlePrevPage} disabled={followingListState.first}>
                  이전
                  {console.log("Previous button disabled:", followingListState.page === 0)}
                </button>
              </div>
            {followingList.map((item) => (
              <div className="item" key={item.id} onClick={() => navigate(`/user/${item.id}`)}>
                <div className="avatar" key={item.id}>
                  <img src={item.profileImageUrl || defaultProfileImageUrl} alt="profile" onError={(e) => e.target.src = defaultProfileImageUrl} />
                </div>
                <span className="username">{item.username}</span>
              </div>
            ))}
            <div className="pagination-buttons">
              <button onClick={handleNextPage} disabled={followingListState.last}>
                다음
                {console.log("last!!!!!!!!!!!!!!!", followingListState.last)}
              </button>
              </div>       
          </FollowingListContainer>
          {followFeed.map((item) => (
            <ScheduleListItem key={item.id} data={item} />
          ))}
          {feedState.loading && <div className="no-result">로딩중...</div>}

          {(!feedState.loading && followFeed.length === 0) && <div className="no-result">팔로우한 사용자의 새 글이 없어요.</div>}
        </>}


        {feedType === "explore" && <>
          {exploreFeed.map((item) => (
            <ScheduleListItem key={item.id} data={item} />
          ))}
          {feedState.loading && <div className="no-result">로딩중...</div>}
          {(!feedState.loading && exploreFeed.length === 0) && <div className="no-result">새 글이 없어요.</div>}
        </>}
        {feedState.hasNext &&
          <div style={{ padding: "24px" }}>
            <Button onClick={handleLoadMore}>더 불러오기</Button>
          </div>}
      </FeedResultList>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  overflow-y: auto;
`;

const FeedTypeWrap = styled.div`
  position: sticky;
  top: 0;
  background-color: white;
  z-index: 1;
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
  align-items: center;
  gap: 12px;
  padding: 24px 96px;
  box-sizing: border-box;
  width: 100%;

  & .no-result {
    margin-top: 64px;
    font-size: 18px;
    text-align: center;
    color: var(--mid-gray);
  }
`;