import { useNavigate } from "react-router-dom";
import { FullPageContainer, InputBox, Logo, Title } from "../../styles/Login.styles";
import styled from "styled-components";
import { useEffect, useState } from "react";
import Input from "../../ui/Input";
import Button from "../../ui/Button";
import axios from "axios";

export default function FindPage() {
  const navigate = useNavigate();
  const [type, setType] = useState("email");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [foundEmail, setFoundEmail] = useState("");
  const [inputStart, setInputStart] = useState(false);
  const [errorMessege, setErrorMessege] = useState("");

  useEffect(() => {
    setErrorMessege("");
    setEmail("");
    setPhone("");
  }, [type]);

  useEffect(() => {
    setInputStart(false);

    if (type === "email") {
      if (phone.length > 0) {
        setInputStart(true);
      }
      if (inputStart) {
        checkPhone();
      }
    }

    if (type === "password") {
      if (email.length > 0) {
        setInputStart(true);
      }

      if (inputStart) {
        checkEmail();
      }
    }

  }, [type, phone, email]);


  const checkPhone = () => {
    const phonePattern = /^\d{3}\d{3,4}\d{4}$/;
    if (!phonePattern.test(phone)) {
      if (phone === "") {
        setErrorMessege("전화번호를 입력해주세요.");
      } else {
        setErrorMessege("'-' 없이 숫자만 입력해주세요.");
      }
    } else {
      setErrorMessege("");
    }
  }


  const checkEmail = () => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      if (email === "") {
        setErrorMessege("이메일을 입력해주세요.");
      } else {
        setErrorMessege("유효한 이메일 형식을 입력해주세요.");
      }
    } else {
      setErrorMessege("");
    }
  };

  const handleFindEmail = () => {
    if (errorMessege) {
      return;
    }
    axios.get("/api/user/findEmail", { params: { phone: phone } })
      .then((res) => {
        const email = res.data;
        const emailArr = email.split("@");
        const blurEmail = emailArr[0].slice(0, 2) + "****" + emailArr[0].slice(-2);
        const emailText = blurEmail + "@" + emailArr[1];
        setFoundEmail(emailText);
        setType("emailFound");
      }).catch((error) => {
        if (error.response.status === 404) {
          setFoundEmail("notFound");
          setType("emailFound");
        } else {
          console.error(error);
        }
      });
  };



  const findEmail = (
    <InputWrap>
      <Input id="phone" type="tel" size="large" grow placeholder="가입시 등록한 전화번호를 입력하세요." value={phone} onChange={(e) => setPhone(e.target.value)} onInput={(e) => setPhone(e.target.value)} />
      {errorMessege && <ErrorText>{errorMessege}</ErrorText>}
      <Button onClick={handleFindEmail} color="primary">이메일 찾기</Button>
    </InputWrap>
  );

  const findPassword = (
    <InputWrap>
      <Input id="email" type="email" size="large" grow placeholder="내 계정 이메일을 입력하세요." value={email} onChange={(e) => setEmail(e.target.value)} onInput={(e) => setEmail(e.target.value)} />
      {errorMessege && <ErrorText>{errorMessege}</ErrorText>}
      <Button color="primary">비밀번호 재설정 메일 전송</Button>
    </InputWrap>
  );

  const emailFound = (
    <InputWrap>
      {foundEmail === "notFound" &&
        <>
          <p className="emailfound"> 입력된 정보와 일치하는 이메일이 없어요. </p>
          <Button onClick={() => setType("email")}>다시 찾기</Button>
        </>
      }
      {foundEmail !== "notFound" &&
        <>
          <p className="emailfound">회원님의 이메일은
            <strong className="foundEmail"> {foundEmail} </strong>
            입니다.</p>
          <Button color="primary" size="large" onClick={() => navigate("/login")}>로그인하기</Button>
        </>
      }
    </InputWrap>
  );

  const mailSent = (
    <InputWrap>
      <p className="emailSent">
        <span> {email} </span> 로
        비밀번호 재설정 메일이 전송되었어요.</p>
      <Button onClick={() => navigate("/login")}>로그인하기</Button>
    </InputWrap>
  );

  return (
    <FullPageContainer style={{ paddingTop: "80px" }} className="find-page">
      <Logo onClick={() => navigate("/")}>
        <img src="images/logo/textLogo.svg" alt="CiRCLE" />
      </Logo>

      <InputBox className="input-box">
        <TitltWrap className="title-wrap">
          <div className={`title-container ${(type === "email" || type === "emailFound") ? "active" : ""}`} onClick={() => setType("email")}>
            <Title>이메일 찾기</Title>
            <div className="selectbox"></div>
          </div>
          <div className={`title-container ${(type === "password" || type === "mailSent") ? "active" : ""}`} onClick={() => setType("password")}>
            <Title>비밀번호 재설정</Title>
            <div className="selectbox"></div>
          </div>
        </TitltWrap>

        {type === "email" && findEmail}
        {type === "password" && findPassword}
        {type === "emailFound" && emailFound}
        {type === "mailSent" && mailSent}
      </InputBox>
    </FullPageContainer>
  );
};

const TitltWrap = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 4px;

  & .title-container {
    display: flex;
    width: 200px;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    cursor: pointer;
  }

  & .selectbox {
    margin-top: -8px;
    width: 100%;
    height: 2px;
    background-color: var(--light-gray);
  }

  & .active .selectbox {
    height: 2px;
    background-color: var(--primary-color);
  }
`;

const InputWrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  align-items: center;
  width: 100%;
  padding: 86px 86px;
  box-sizing: border-box;

  & .emailfound { 
    font-size: 18px;
  }
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