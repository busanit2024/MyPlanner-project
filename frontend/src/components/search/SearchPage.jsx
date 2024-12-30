import { act, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSearch } from "../../context/SearchContext";
import styled from "styled-components";
import UserListItem from "../../ui/UserListItem";
import axios from "axios";
import Button from "../../ui/Button";

const dummyUser = {
  username: "닉네임",
  email: "email@test.com",
}

export default function SearchPage() {
  const { searchText, setOnSearch, searchType, setSearchType } = useSearch();
  const [page, setPage] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [users, setUsers] = useState([]);

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
    const size = 10;
    console.log(searchText, searchType);
    if (searchType === 'user') {
    axios.get(`/api/user/search`, {params: {searchText, page, size}})
      .then(res => {
        console.log(res.data);
        const data = res.data.content;
        setUsers(data);
        setHasNext(res.data.hasNext);
      })
      .catch(err => {
        console.error(err);
      });
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
      <UserList>
        <UserListItem user={dummyUser} />
        {users && users.map((user, index) => (
          <UserListItem key={index} user={user} />
        ))}
        {hasNext && <Button onClick={() => setPage(page + 1)}>더보기</Button>}
      </UserList>
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

const UserList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 24px 128px;
  box-sizing: border-box;
  width: 100%;
`;
