import { useState } from "react";
import styled from "styled-components";
import { useAuth } from "../../context/AuthContext";
import GroupListItem from "./GroupListItem";

export default function GroupPage() {
  const { user, loading } = useAuth();
  const [searchType, setSearchType] = useState('my');
  const [myGroups, setMyGroups] = useState([]);
  const [exploreGroups, setExploreGroups] = useState([]);
  const [listLoading, setListLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasNext, setHasNext] = useState(false);

  return (
    <Container>
      <SearchTypeWrap>
        <div className={`search-type ${searchType === 'my' ? 'active' : ''}`} onClick={() => setSearchType("my")}>
          <span >내 그룹</span>
          <div></div>
        </div>
        <div className={`search-type ${searchType === 'explore' ? 'active' : ''}`} onClick={() => setSearchType("explore")}>
          <span>탐색</span>
          <div></div>
        </div>
      </SearchTypeWrap>
      <SearchResultList>
        <GroupListItem />

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
