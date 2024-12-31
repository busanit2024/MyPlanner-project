import styled from "styled-components";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import Swal from "sweetalert2";

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
    link: "/chat",
  }
];

const defaultProfileImage = "images/default/defaultProfileImage.png";


export default function SideNavbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  const handleLogout = () => {
    Swal.fire({
      title: "로그아웃",
      text: "로그아웃하시겠어요?",
      showCancelButton: true,
      confirmButtonText: "로그아웃",
      cancelButtonText: "취소",
      customClass: {
        //App.css에 정의된 클래스 사용
        title: "swal-title",
        htmlContainer: "swal-text-container",
        confirmButton: "swal-button swal-button-confirm",
        cancelButton: "swal-button swal-button-cancel",
      },
    }).then((result) => {
      if (result.isConfirmed) {
        logout();
        navigate("/login");
      }
    });
  };

  return (
    <SidebarContainer className="sidebar">
      <Logo>
        <Link to="/">
          <img src="/images/logo/textLogo.svg" alt="Logo" />
        </Link>
      </Logo>
      <NavList>
        <NavItem className="profile">
          <Link to="/profile">
            <ProfileImage>
              <img src={user?.profileImageUrl} onError={(e) => (e.target.src=defaultProfileImage)} alt="Profile" />
            </ProfileImage>
            {user?.username ?? "닉네임"}
          </Link>
        </NavItem>
        {navItems.map((item, index) => (
          <NavItem key={index}>
            <Link to={item.link} className={currentPath.includes(item.link) ? "active" : ""}>
              {item.name}
            </Link>
          </NavItem>
        ))}
        <NavItem style={{ justifySelf: "flex-end", marginTop: "auto"}}>
          <a className="logout" onClick={handleLogout}>로그아웃</a>
        </NavItem>
      </NavList>


    </SidebarContainer>
  );
};

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
  flex-grow: 1;
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

  & .logout {
    color: var(--dark-gray);
    cursor: pointer;
    text-decoration: underline;
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
    image-rendering: auto;
  }
`;