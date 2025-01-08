import { useState } from "react";
import styled from "styled-components";
import { useAuth } from "../../context/AuthContext";
import GroupListItem from "./GroupListItem";
import Radio from "../../ui/Radio";
import { useNavigate } from "react-router-dom";

export default function GroupPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [searchType, setSearchType] = useState('my');
  const [myGroups, setMyGroups] = useState([]);
  const [exploreGroups, setExploreGroups] = useState([]);
  const [listLoading, setListLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filterBoxOpen, setFilterBoxOpen] = useState(false);

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
      {searchType === 'explore' && <SearchBarWrap>
        <SearchBar>
          <input type="text" placeholder="그룹 검색" />
          <div className="search-icon">
            <img src="/images/icon/search.svg" alt="search" />
          </div>
        </SearchBar>
        <div className="filter" style={{ position: 'relative' }} >
          <div className="filter-icon" onClick={() => setFilterBoxOpen(!filterBoxOpen)} >
            <img src="/images/icon/filter.svg" alt="filter" />
          </div>
          {filterBoxOpen && <FilterBox>
            <div className="title">필터</div>
            <div className="radioContainer">
              <label htmlFor="recent">
                <Radio id='recent' name="filter" />
                최신순
              </label>
              <label htmlFor="name">
                <Radio id='name' name="filter" />
                이름순
              </label>
            </div>
            <select name="category" id="category" className="categorySelect">
              <option value="all">전체</option>
              <option value="study">스터디</option>
              <option value="hobby">취미</option>
              <option value="team">팀</option>
            </select>
          </FilterBox>}
        </div>
      </SearchBarWrap>}
      <SearchResultList>
        <GroupListItem onClick={() => navigate('1')} />

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
  padding: 24px 64px;
  box-sizing: border-box;
  width: 100%;

  & .no-result {
    margin-top: 64px;
    font-size: 18px;
    text-align: center;
    color: var(--mid-gray);
  }
`;

const SearchBarWrap = styled.div`
  display: flex;
  padding: 24px 64px;
  padding-bottom: 0;
  align-items: center;
  gap: 12px;

  & .filter-icon {
    width: 32px;
    height: 32px;
    cursor: pointer;

    & img {
      width: 100%;
      height: 100%;
    }
  }


`;

const SearchBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  height: 48px;
  border: 1px solid var(--light-gray);
  border-radius: 48px;
  flex-grow: 1;
  overflow: hidden;
  padding: 0 24px;
  box-sizing: border-box;

  & input {
    width: 100%;
    height: 100%;
    font-size: 18px;
    padding: 0 12px;
    border: none;
    outline: none;
  }

  & .search-icon {
    width: 24px;
    height: 24px;
    cursor: pointer;

    & img {
      width: 100%;
      height: 100%;
    }
  }
`;

const FilterBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 12px 24px;
  padding-bottom: 24px;
  border: 1px solid var(--light-gray);
  border-radius: 4px;
  box-sizing: border-box;
  width: 200px;
  position: absolute;
  top: 32px;
  right:0;
  background-color: white;
  z-index: 100;

  & .title {
    font-size: 16px;
    font-weight: bold;
  }

  & .radioContainer {
    display: flex;
    align-items: center;
    justify-content: space-around;
    gap: 8px;

    & label {
      display: flex;
      align-items: center;
      gap: 4px;
    }
  }

  & .categorySelect {
    width: 100%;
    height: 32px;
    padding: 0 8px;
    border: 1px solid var(--light-gray);
    border-radius: 4px;
    outline: none;

    & option {
      padding: 4px;
    }

    &:focus {
      border: 1px solid var(--primary-color);
    }

  }
`;