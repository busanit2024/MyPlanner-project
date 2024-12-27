import styled from "styled-components";
import { FullPageContainer, Logo, Title, InputBox, TextAndLink } from "../../styles/Login.styles";
import Button from "../../ui/Button";
import Input from "../../ui/Input";
import { Link, useNavigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { auth } from "../../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { AuthContext } from "../../context/AuthContext";
import axios from "axios";

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

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [inputData, setInputData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [inputStart, setInputStart] = useState(false);
  const [loginFail, setLoginFail] = useState(false);


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
        login(userToken);
        sessionStorage.setItem("userToken", userToken);
        navigate("/calendar");
      }
    } catch (error) {
      console.error(error);
      setLoginFail(true);
    }
  };

  return (
    <FullPageContainer>
      <Logo>
        <img src="images/logo/logo.svg" alt="CiRCLE" />
      </Logo>
      <InputBox>
        <Title>
          로그인
        </Title>
        <InputWrap>
          <Input size="large" id="email" grow placeholder="이메일을 입력하세요" onChange={(e) => setInputData({ ...inputData, email: e.target.value })} />
          <Input size="large" id="password" type="password" grow placeholder="비밀번호를 입력하세요" onChange={(e) => setInputData({ ...inputData, password: e.target.value })} />
          {error && <ErrorText>{error}</ErrorText>}
        </InputWrap>

        <TextAndLink style={{marginBottom: "24px"}}>
          아이디 또는 비밀번호를 잃어버리셨나요?
          <Link to="/find">아이디/비밀번호 찾기</Link>
        </TextAndLink>

        <Button color="primary" size="large" onClick={handleLogin}>로그인</Button>


      </InputBox>
      <TextAndLink style={{ marginTop: "24px" }}>
        회원이 아니신가요?
        <Link to="/register">회원가입</Link>
      </TextAndLink>

    </FullPageContainer>
  );
}