
import {  useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import styled from "styled-components";


const IndexPageContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100%;

  & .logo {
    width: 100px;
  }

  & img {
    width: 100%;
  }
`;

export default function IndexPage() {
  const navigate = useNavigate();
  const { isLoggedIn, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (isLoggedIn) {
      navigate("/calendar");
    } else {
      navigate("/login");
    }
  }, [isLoggedIn, loading]);



  return (
    <IndexPageContainer>
      <div className="logo">
        <img src="images/logo/logo.svg" alt="logo" />
      </div>
    </IndexPageContainer>
  );
}