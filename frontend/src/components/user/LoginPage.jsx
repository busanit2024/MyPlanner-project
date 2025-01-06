import styled from "styled-components";
import { FullPageContainer, Title,  TextAndLink } from "../../styles/Login.styles";
import Button from "../../ui/Button";
import Input from "../../ui/Input";
import { Link, useNavigate } from "react-router-dom";
import {  useEffect, useState } from "react";
import { auth } from "../../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginPage() {
  const navigate = useNavigate();
  const [inputData, setInputData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [inputStart, setInputStart] = useState(false);
  const [loginFail, setLoginFail] = useState(false);
  const [passwordView, setPasswordView] = useState(false);


  useEffect(() => {
    if (inputData.email && inputData.password) {
      setInputStart(true);
    }

    if (inputStart) {
      if (!inputData.email || !inputData.password) {
        setError("이메일과 비밀번호를 입력해주세요.");
      } else if (!emailPattern.test(inputData.email)) {
        setError("유효한 이메일 형식을 입력해주세요.");
      } else if (loginFail) {
        setError("아이디 또는 비밀번호가 일치하지 않습니다.");
      } else {
        setError("");
      }
    }
  }, [inputData, error, loginFail]);


  const handleLogin = async () => {
    try {
      const { email, password } = inputData;
      if (!email || !password) {
        setError("이메일과 비밀번호를 입력해주세요.");
        return;
      }
      if (!emailPattern.test(email)) {
        setError("유효한 이메일 형식을 입력해주세요.");
        return;
      }

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (user) {
        setLoginFail(false);
        const userToken = await user.getIdToken();
        sessionStorage.setItem("userToken", userToken);
        navigate("/calendar");
      }
    } catch (error) {
      console.error(error);
      setLoginFail(true);
    }
  };

  return (
    <FullPageContainer style={{justifyContent: "center", height: "100%"}} className="container">
      <WelcomeContainer className="box">
        <LeftContainer>
          <div className="logo">
            <img src="/images/logo/logoWhite.svg" alt="CiRCLE" />
          </div>
          <div className="logoText">
            <img src="/images/logo/textLogoWhite.svg" alt="CiRCLE" />
          </div>
          <p className="description">
            친구들과 공유하는 일정관리 SNS
          </p>
        </LeftContainer>

        <RightContainer>
          <Title className="title">
            로그인
          </Title>
          <InputWrap>
            <Input size="large" id="email" grow placeholder="이메일을 입력하세요" onChange={(e) => setInputData({ ...inputData, email: e.target.value })} />
            <PasswordInputWrap>
            <input size="large" id="password" type={passwordView ? "text" : "password"} grow placeholder="비밀번호를 입력하세요" onChange={(e) => setInputData({ ...inputData, password: e.target.value })} />
            <div className="password-view" onClick={() => setPasswordView(!passwordView)}>
              {passwordView ? <FaEye /> : <FaEyeSlash />}
              </div>
            </PasswordInputWrap>
            {error && <ErrorText>{error}</ErrorText>}
          </InputWrap>

          <TextAndLink style={{ marginBottom: "24px" }}>
            이메일 또는 비밀번호를 잊어버리셨나요?
            <Link to="/find">이메일/비밀번호 찾기</Link>
          </TextAndLink>

          <Button color="primary" size="large" onClick={handleLogin}>로그인</Button>
          <TextAndLink>
            회원이 아니신가요?
            <Link to="/register">회원가입</Link>
          </TextAndLink>
        </RightContainer>

      </WelcomeContainer>

    </FullPageContainer>
  );
};

const WelcomeContainer = styled.div`
  display: flex;
  box-sizing: border-box;
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1);
  border-radius: 16px;
  height: 640px;
  overflow: hidden;
  width: 1280px;
`;

const LeftContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px;
  width: 50%;
  background-color: var(--primary-color);
  box-sizing: border-box;

  .logo {
    width: 148px;
  }

  .logoText {
    margin-top: 24px;
    width: 240px;
  }

  img {
    width: 100%;
  }

  .description {
    font-size: 18px;
    color: white;
    text-align: center;
    margin: 0;
    margin-top: 16px;
  }
`;

const RightContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 24px;
  padding: 48px;
  width: 50%;
  box-sizing: border-box;

`;

const InputWrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  align-items: center;
  width: 100%;
  padding: 0 86px;
  box-sizing: border-box;
`;

const ErrorText = styled.p`
  color: var(--danger-color);
  font-size: 14px;
  margin: 0;
  width: 100%;
  text-align: start;
  margin-top: -12px;
  margin-bottom: 12px;
`;

const PasswordInputWrap = styled.div`
  display: flex;
  align-items: center;
  padding: 0;
  padding-right: 12px;
  gap: 12px;
  border-width: 2px;
  border-style: solid;
  border-color: var(--light-gray);
  border-radius: 8px;
  width: 100%;
  flex-grow: 1;
  box-sizing: border-box;

  & input {
    padding: 12px;
    margin: 0;
    border: none;
    border-radius: 8px;
    flex-grow: 1;
    font-size: 18px;
  }

  & input:focus {
    outline: none;
  }

  &:focus-within {
    border-color: var(--primary-color);
  }

  & .password-view {
    cursor: pointer;
  }

  & svg {
    color: var(--mid-gray);
    font-size: 18px;
  }
`;