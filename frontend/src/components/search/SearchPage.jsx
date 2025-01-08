import { act, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSearch } from "../../context/SearchContext";
import styled from "styled-components";
import UserListItem from "../../ui/UserListItem";
import axios from "axios";
import Button from "../../ui/Button";
import { useAuth } from "../../context/AuthContext";
import ScheduleListItem from "../../ui/ScheduleListItem";

export default function SearchPage() {
  const { searchText, setOnSearch, searchType, setSearchType } = useSearch();
  const { user, loading } = useAuth();
  const [page, setPage] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [users, setUsers] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [listLoading, setListLoading] = useState(false);

  // SearchContext의 onSearch 함수를 setOnSearch로 설정
  useEffect(() => {
    setOnSearch(() => onSearch);
  }, [setOnSearch, searchType]);

  useEffect(() => {
    onSearch(searchText, searchType);
  }, [page]);

  useEffect(() => {
    setPage(0);
    setHasNext(false);
    setUsers([]);
    onSearch(searchText, searchType);
  }, [searchType]);


  const onSearch = (searchText, searchType) => {
    setListLoading(true);
    const size = 10;
    console.log("user", user);
    const userId = user?.id;
    if (!userId, !searchText) {
      return;
    }

    if (searchType === 'user') {
      axios.get(`/api/user/search`, { params: { searchText, userId, page, size } })
        .then(res => {
          console.log("user search", res.data);
          const data = res.data.content;
          setUsers(data);
          setHasNext(res.data.hasNext);
        })
        .catch(err => {
          console.error(err);
        })
        .finally(() => {
          setListLoading(false);
        });
    }
    if (searchType === 'schedule') {
      setListLoading(false);
      /// 추후구현
    }
  };


  return (
    <Container>
      <SearchTypeWrap>
        <div className={`search-type ${searchType === 'schedule' ? 'active' : ''}`} onClick={() => setSearchType("schedule")}>
          <span >일정</span>
          <div></div>
        </div>
        <div className={`search-type ${searchType === 'user' ? 'active' : ''}`} onClick={() => setSearchType("user")}>
          <span>사용자</span>
          <div></div>
        </div>
      </SearchTypeWrap>
        <SearchResultList>
        {(listLoading) && <p className="no-result">로딩중...</p>}
        {(!listLoading && searchType === 'user') &&
        <>
          {(users.length === 0) && <p className="no-result">검색 결과가 없습니다.</p>}
          {users.map((user, index) => (
            <UserListItem key={index} user={user} />
          ))}
        </> }
        {(!listLoading && searchType === 'schedule') &&
        <>
          {(schedules.length === 0) && <p className="no-result">검색 결과가 없습니다.</p>}
          {schedules.map((schedule, index) => (
            <div key={index}>{schedule.title}</div>
          ))}
          <ScheduleListItem />
        </>}
          {hasNext && <Button onClick={() => setPage(page + 1)}>더보기</Button>}
        </SearchResultList>
    </Container>
  );

}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
`;

const SearchTypeWrap = styled.div`
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
