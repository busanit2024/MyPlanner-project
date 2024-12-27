import styled from "styled-components";
import { FullPageContainer, Logo, Title, InputBox, TextAndLink } from "../../styles/Login.styles";
import Button from "../../ui/Button";
import Input from "../../ui/Input";
import { Link } from "react-router-dom";

const InputWrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  align-items: center;
  width: 100%;
  padding: 0 86px;
  box-sizing: border-box;
`;

export default function LoginPage() {
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
          <Input size="large" id="email" grow placeholder="이메일을 입력하세요" />
          <Input size="large" id="password" type="password" grow placeholder="비밀번호를 입력하세요" />
        </InputWrap>

        <TextAndLink style={{marginBottom: "24px"}}>
          아이디 또는 비밀번호를 잃어버리셨나요?
          <Link to="/find">아이디/비밀번호 찾기</Link>
        </TextAndLink>

        <Button color="primary" size="large">로그인</Button>


      </InputBox>
      <TextAndLink style={{ marginTop: "24px" }}>
        회원이 아니신가요?
        <Link to="/register">회원가입</Link>
      </TextAndLink>

    </FullPageContainer>
  );
}