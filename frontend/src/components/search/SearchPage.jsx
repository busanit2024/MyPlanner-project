import { act, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSearch } from "../../context/SearchContext";
import styled from "styled-components";
import UserListItem from "../../ui/UserListItem";
import axios from "axios";
import Button from "../../ui/Button";
import { useAuth } from "../../context/AuthContext";
import ScheduleListItem from "../../ui/ScheduleListItem";
import { list } from "firebase/storage";

export default function SearchPage() {
  const { searchText, setOnSearch, searchType, setSearchType } = useSearch();
  const { user, loading } = useAuth();
  const [page, setPage] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [users, setUsers] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [listLoading, setListLoading] = useState(false);
  const [noSearchText, setNoSearchText] = useState(true);
  const containerRef = useRef(null);
  const scrollPosition = useRef(0);

  // SearchContext의 onSearch 함수를 setOnSearch로 설정
  useEffect(() => {
    setOnSearch(() => onSearch);
  }, [setOnSearch, searchType]);

  useEffect(() => {
    onSearch(searchText, searchType);
  }, [page]);

  // 검색 타입 변경시 상태 초기화 및 다시 불러오기
  useEffect(() => {
    setPage(0);
    setHasNext(false);
    setUsers([]);
    setSchedules([]);
    setNoSearchText(!searchText);
    onSearch(searchText, searchType);
  }, [searchType]);


  const onSearch = (searchText, searchType) => {
    setListLoading(true);
    const size = 10;
    console.log("user", user);
    const userId = user?.id;
    if (!userId, !searchText) {
      // 검색어 없는 경우 함수 종료
      setNoSearchText(true);
      setListLoading(false);
      return;
    }
    setNoSearchText(false);

    if (searchType === 'user') {
      axios.get(`/api/user/search`, { params: { 
        searchText,
        userId, 
        page: 0, 
        size: page * size + size
        } })
        .then(res => {
          console.log("user search", res.data);
          const data = res.data.content;
          setUsers(data);
          setHasNext(!res.data.last);
        })
        .catch(err => {
          console.error(err);
        })
        .finally(() => {
          setListLoading(false);
          containerRef.current.scrollTop = scrollPosition.current;
        });
    }
    if (searchType === 'schedule') {
      axios.get(`/api/schedules/search`, { params: { searchText, userId, page, size } })
        .then(res => {
          console.log("schedule search", res.data);
          const data = res.data.content;
          setSchedules(data);
          setHasNext(!res.data.last);
        })
        .catch(err => {
          console.error(err);
        })
        .finally(() => {
          setListLoading(false);
          containerRef.current.scrollTop = scrollPosition.current;
        });
    }
  };

  const handleLoadMore = () => {
    scrollPosition.current = containerRef.current.scrollTop;
    setPage(page + 1);
  };


  return (
    <Container className="search-page" ref={containerRef}>
      <SearchTypeWrap className="search-type-wrap">
        <div className={`search-type ${searchType === 'schedule' ? 'active' : ''}`} onClick={() => setSearchType("schedule")}>
          <span >일정</span>
          <div></div>
        </div>
        <div className={`search-type ${searchType === 'user' ? 'active' : ''}`} onClick={() => setSearchType("user")}>
          <span>사용자</span>
          <div></div>
        </div>
      </SearchTypeWrap>
        <SearchResultList className="search-result-list">
        {(listLoading) && <p className="no-result">로딩중...</p>}
        {(!listLoading && noSearchText ) && <p className="no-result">일정이나 사용자를 검색해보세요.</p>}

        {(searchType === 'user' && !noSearchText) && <>
          {users.map((user, index) => (
            <UserListItem key={index} user={user} />
          ))}
          {(!listLoading && users.length === 0) && <p className="no-result">검색 결과가 없습니다.</p>}
        </>}

        {(searchType === 'schedule' && !noSearchText) && <>
          {schedules.map((schedule, index) => (
            <ScheduleListItem key={index} data={schedule} />
          ))}
          {(!listLoading && schedules.length === 0) && <p className="no-result">검색 결과가 없습니다.</p>}
        </>}
          {hasNext && <Button onClick={handleLoadMore}>더보기</Button>}
        </SearchResultList>
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

const SearchTypeWrap = styled.div`
  position: sticky;
  top: 0;
  background-color: white;
  z-index: 50;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 4px;
  height: 64px;
  border-bottom: 1px solid var(--light-gray);
  flex-shrink: 0;
  width: 100%;

  & .search-type {
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

const SearchResultList = styled.div`
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
