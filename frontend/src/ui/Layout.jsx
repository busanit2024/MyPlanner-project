import styled from "styled-components";
import { Outlet } from "react-router-dom";
import SideNavbar from "./SideNavbar";
import RightSidebar from "./RightSidebar";
import { useState } from "react";

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
  return (
    <Container className="layout">
      <SideNavbar />
      <InnerContainer className="inner-container" open={open}>
        <Topbar className="topbar" open={open}>
          topbar
          <div className="sidebar-icon" onClick={() => setOpen(!open)}>
            <img src="images/icon/menu.svg" alt="sidebar open" />
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