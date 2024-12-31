import styled from "styled-components";


const SidebarContainer = styled.aside`
  --sidebar-width: 260px;
  display: flex;
  position: fixed;
  top: 0;
  right: 0;
  flex-direction: column;
  width: ${props => props.open ? 'var(--sidebar-width)' : '0'};
  padding: 20px ${props => props.open ? '24px' : '0'};
  border-left: 1px solid;
  border-color: var(--light-gray);
  position: relative;
  right: ${props => props.open ? '0' : 'calc(-1 * var(--sidebar-width))'};
  transition: all 0.3s;
`;

const SidebarHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  & h2 {
    font-weight: normal;
    font-size: 18px;
    margin: 0;
  }

  & button {
    background-color: white;
    border: none;
    cursor: pointer;
    width: 32px;
    height: 32px;
    margin-right: -8px;

    & img {
      width: 100%;
      height: 100%;
    }
  }


`;

export default function RightSidebar({ open, setOpen }) {

  return (
    <SidebarContainer className="right-sidebar" open={open}>
      <SidebarHeader>
        <h2>일정</h2>
        <button onClick={() => setOpen(false)}>
          <img src="/images/icon/doubleArrowRight.svg" alt="close" />
        </button>
      </SidebarHeader>

    </SidebarContainer>
  );
}