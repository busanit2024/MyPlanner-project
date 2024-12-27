import styled from "styled-components";
import { Outlet, useLocation } from "react-router-dom";
import SideNavbar from "./SideNavbar";
import RightSidebar from "./RightSidebar";
import { useState } from "react";
import NewChatModal from "../components/chat/chatComponent/NewChatModal";
import NewChatButton from "../components/chat/chatComponent/NewChatButton";

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
  border-bottom-width: 1px;
  border-bottom-style: solid;
  border-bottom-color: var(--light-gray);
  background-color: white;
  height: 32px;

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
  padding: 36px 48px;
  flex-grow: 1;
  overflow-y: auto;
`;

export default function Layout() {
  const [open, setOpen] = useState(true);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const location = useLocation();

  const handleOpenModal = () => {
    setModalIsOpen(true);
  };

  const handleCloseModal = () => {
    setModalIsOpen(false);
  };
  
  const setPageName = () => {
    const path = location.pathname;

    const pageNames = {
      "/": "캘린더",
      "/calendar": "캘린더",
      "/grid": "100그리드",
      "/feed": "피드",
      "/group": "그룹",
      "/notification": "알림",
      "/chat": "쪽지",
      "/profile": "프로필"
    };

    return pageNames[path] || "캘린더";
    
  };
  
  return (
    <Container className="layout">
      <SideNavbar />
      <InnerContainer className="inner-container" open={open}>
        <Topbar className="topbar" open={open}>
          {setPageName()}
          {location.pathname === "/chat" && <NewChatButton onClick={handleOpenModal} />}
          <div className="sidebar-icon" onClick={() => setOpen(!open)}>
            <img src="images/icon/menu.svg" alt="sidebar open" />
          </div>
        </Topbar>
      <Main className="main">
        <Outlet />
      </Main>
    </InnerContainer>
    <RightSidebar open={open} setOpen={setOpen} />
    {modalIsOpen && <NewChatModal onClose={handleCloseModal} />}
    </Container>
  );
}