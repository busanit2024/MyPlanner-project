import styled from "styled-components";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext, useAuth } from "../context/AuthContext";
import Swal from "sweetalert2";
import { useNoti } from "../context/NotiContext";

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

const defaultProfileImage = "/images/default/defaultProfileImage.png";


export default function SideNavbar() {
  const { user, logout } = useAuth();
  const { unreadCount,  unreadChatCount } = useNoti();
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
        <NavItem className={"profile"}>
          <Link to="/profile" className={currentPath.includes("/profile") ? "active" : ""}>
            <ProfileImage>
              <img src={user?.profileImageUrl || defaultProfileImage} onError={(e) => (e.target.src=defaultProfileImage)} alt="Profile" />
            </ProfileImage>
            {user?.username ?? "닉네임"}
          </Link>
        </NavItem>
        {navItems.map((item, index) => (
          <NavItem key={index}>
            <Link to={item.link} className={currentPath.includes(item.link) ? "active" : ""}>
              {item.name}
            </Link>
            {item.name === "알림" && unreadCount > 0 && <span className="badge">{unreadCount}</span>}
            {item.name === "쪽지" && unreadChatCount > 0 && <span className="badge">{unreadChatCount}</span>}
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

  display: flex;
  align-items: center;
  gap: 12px;
  
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

  & .badge {
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: var(--primary-color);
    color: white;
    width: 24px;
    height: 24px;
    border-radius: 12px;
    font-size: 14px;
    font-weight: bold;
  }


`;

const ProfileImage = styled.div`
  width: 42px;
  height: 42px;
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