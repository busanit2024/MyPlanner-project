import styled from "styled-components";
import Button from "../../ui/Button";
import Input from "../../ui/Input";
import { FullPageContainer, Logo, Title, InputBox, TextAndLink } from "../../styles/Login.styles";
import { Link } from "react-router-dom";

const InputWrap = styled.div`
  display : flex;
  gap : 24px;
  align-items: center;
  width: 100%;

  & label {
    width: 100px;
    white-space: nowrap;
    flex-shrink: 0;
    font-size: 18px;
    font-weight: bold;
    text-align: right;
  }
`;



export default function RegisterPage() {
  return (
    <FullPageContainer>
      <Logo>
        <img src="images/logo/logo.svg" alt="CiRCLE" />
      </Logo>

      <InputBox>
      <Title>
        회원가입
      </Title>
        <InputWrap>
          <label htmlFor="email">이메일</label>
          <Input id="email" grow placeholder="이메일을 입력하세요." />
          <Button rect >중복확인</Button>
        </InputWrap>

        <InputWrap>
          <label htmlFor="password">비밀번호</label>
          <Input type="password" id="password" grow placeholder="비밀번호를 입력하세요." />
        </InputWrap>

        <InputWrap>
          <label htmlFor="password-confirm">비밀번호 확인</label>
          <Input type="password" id="password-confirm" grow placeholder="비밀번호를 다시 한 번 입력하세요." />
        </InputWrap>

        <InputWrap>
          <label htmlFor="phone">전화번호</label>
          <Input type="tel" id="phone" grow placeholder="전화번호는 아이디/비밀번호 찾기에 사용돼요." />
        </InputWrap>
      </InputBox>

      <TextAndLink style={{ marginBottom: "24px" }}>
        이미 회원이라면?
        <Link to="/login">로그인</Link>
      </TextAndLink>

      <Button color="primary" size="large">회원가입</Button>

    </FullPageContainer>
  );
}