import styled from "styled-components";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import SideNavbar from "./SideNavbar";
import RightSidebar from "./RightSidebar";
import { useState } from "react";
import { FaChevronLeft, FaCircleXmark } from "react-icons/fa6";
import { useSearch } from "../context/SearchContext";


export default function Layout() {
  const [open, setOpen] = useState(true);
  const { searchText, setSearchText, handleSearch } = useSearch();
  const location = useLocation();
  const navigate = useNavigate();

  const setPageName = () => {
    const path = location.pathname;

    const pageNames = {
      "/": "CiRCLE",
      "/calendar": "캘린더",
      "/grid": "100그리드",
      "/feed": "피드",
      "/group": "그룹",
      "/notification": "알림",
      "/chat": "쪽지",
      "/profile": "프로필",
      "/profile/edit": "프로필 수정",
      "/search": "검색",
    };

    return pageNames[path] || "CiRCLE";

  };

  const checkBackButton = () => {
    if (location.pathname === "/" || location.pathname === "/calendar") {
      return false;
    } else {
      return true;
    }
  };

  return (
    <Container className="layout">
      <SideNavbar />
      <InnerContainer className="inner-container" open={open}>
        <Topbar className="topbar" open={open}>
          <div className="page-name-wrap">
            {checkBackButton() &&
              <div className="back-icon" onClick={() => navigate(-1)}>
                <img src="/images/icon/chevronLeft.svg" alt="back" />
              </div>}
            <span>{setPageName()}</span>
          </div>
          <SearchForm onSubmit={(e) => e.preventDefault()} onKeyDown={(e) => e.key === 'Enter' && handleSearch()}>
            <SearchInputWrap value={searchText}>
              <input id="search" underline grow placeholder="검색어를 입력하세요" value={searchText} onChange={(e) => setSearchText(e.target.value)} onInput={(e) => setSearchText(e.target.value)} />
              <FaCircleXmark className="delete-icon" onClick={() => setSearchText("")} />
            </SearchInputWrap>
            <div className="search-icon">
              <img src="/images/icon/search.svg" alt="search" onClick={handleSearch} />
            </div>
          </SearchForm>
          <div className="sidebar-icon" onClick={() => setOpen(!open)}>
            <img src="/images/icon/menu.svg" alt="sidebar open" />
          </div>
        </Topbar>
        <Main className="main">
          <Outlet />
        </Main>
      </InnerContainer>
      <RightSidebar open={open} setOpen={setOpen} />
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  position: fixed;
  width: 100%;
  height: 100%;
`;

const InnerContainer = styled.div`  
  display: flex;
  flex-grow: 1;
  flex-direction: column;
  overflow-y: auto;
  transition: all 0.3s;
`;

const Topbar = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 48px;
  gap: 20px;
  border-bottom-width: 1px;
  border-bottom-style: solid;
  border-bottom-color: var(--light-gray);
  background-color: white;
  height: 32px;

  & .page-name-wrap {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  & span {
    font-size: 18px;
    flex-shrink: 0;
  }

  & .back-icon {
    flex-shrink: 0;
    cursor: pointer;
    width: 24px;
    height: 24px;

    & img {
      width: 100%;
      height: 100%;
    }
  }

  & .search-icon {
    flex-shrink: 0;
    cursor: pointer;
    width: 24px;
    height: 24px;

    & img {
      width: 100%;
      height: 100%;
  }
}

  .sidebar-icon {
    display: ${props => props.open ? 'none' : 'block'};
    cursor: pointer;
    width: 24px;
    height: 24px;

    & img {
      width: 100%;
      height: 100%;
    }
  }
`;

const Main = styled.main`
  display: flex;
  flex-direction: column;
  padding: 0;
  flex-grow: 1;
  overflow-y: auto;
`;

const SearchForm = styled.form` 
  display: flex;
  align-items: center;
  width: 40%;
  gap: 12px;
  justify-self: flex-end;
  margin-left: auto;
  box-sizing: border-box;


`;

const SearchInputWrap = styled.div`
  display: flex;
  align-items: center;
  padding: 0;
  padding-right: 12px;
  gap: 12px;
  border: none;
  border-bottom: 1px solid;
  border-width: 1px;
  border-color: var(--light-gray);
  width: 100%;
  flex-grow: 1;
  box-sizing: border-box;

  & input {
    padding: 12px;
    margin: 0;
    border: none;
    flex-grow: 1;
    font-size: 18px;
  }

  & input:focus {
    outline: none;
  }

  &:focus-within {
    border-color: var(--primary-color);
  }

  & .delete-icon {
    display: ${props => props.value ? 'block' : 'none'};
    cursor: pointer;
    color: var(--light-gray);
  }

`;