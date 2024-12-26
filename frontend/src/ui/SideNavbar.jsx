import styled from "styled-components";
import { Link, useLocation } from "react-router-dom";

const SidebarContainer = styled.aside`
  display: flex;
  flex-direction: column;
  width: 180px;
  padding: 24px 36px;
  padding-left: 48px;
  border-right: 1px solid;
  border-color: var(--light-gray);
`;

const Logo = styled.div`
  width: 120px;
  & img {
    width: 100%;
  }
`;

const NavList = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 24px;
  list-style: none;
  padding: 0;
  margin-top: 36px;
`;

const NavItem = styled.li`
  
  & a {
    text-decoration: none;
    color: inherit;
    font-size: 18px;
    display: flex;
    align-items: center;
    gap: 12px;

    &:hover {
      color: var(--mid-gray);
    }
  }

  & .active {
    font-weight: bold;
  }


`;

const ProfileImage = styled.div`
  width: 42px;
  height: 42px;
  border: 1px solid;
  border-color: var(--light-gray);
  display: flex;
  align-items: center;
  border-radius: 50%;
  overflow: hidden;

  & img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const navItems = [
  {
    name: "캘린더",
    link: "/calendar",
  },
  {
    name: "100그리드",
    link: "/grid",
  },
  {
    name: "피드",
    link: "/feed",
  },
  {
    name: "그룹",
    link: "/group",
  },
  {
    name: "알림",
    link: "/notification",
  },
  {
    name: "쪽지",
    link: "/message",
  }
];

const defaultProfileImage = "images/default/defaultProfileImage.png";


export default function SideNavbar() {

  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <SidebarContainer className="sidebar">
      <Logo>
        <Link to="/">
          <img src="images/logo/logo.svg" alt="Logo" />
        </Link>
      </Logo>
      <NavList>
        <NavItem className="profile">
          <Link to="/profile">
            <ProfileImage>
              <img src="images/profile.jpg" onError={(e) => e.target.src=defaultProfileImage} alt="Profile" />
            </ProfileImage>
            {"프로필"}
          </Link>
        </NavItem>
        {navItems.map((item, index) => (
          <NavItem key={index}>
            <Link to={item.link} className={currentPath.includes(item.link) ? "active" : ""}>
              {item.name}
            </Link>
          </NavItem>
        ))}
      </NavList>


    </SidebarContainer>
  );
}