import styled from "styled-components";
import Button from "../../ui/Button";
import Input from "../../ui/Input";
import { FullPageContainer, Logo, Title, InputBox, TextAndLink } from "../../styles/Login.styles";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import Textarea from "../../ui/Textarea";

const InputWrap = styled.div`
  display : flex;
  flex-direction : column;
  width : 100%;

  & .input {
    display : flex;
  gap : 24px;
  align-items: center;
  width: 100%;

  }

  & label {
    width: 100px;
    white-space: nowrap;
    flex-shrink: 0;
    font-size: 18px;
    font-weight: bold;
    text-align: right;
  }
`;


const ErrorText = styled.p`
  color: var(--danger-color);
  font-size: 14px;
  margin: 0;
  margin-left: 124px;
  margin-top: 8px;
`;

const EmailCheck = styled.p`
  color: ${props => props.check === 1 ? "var(--mid-gray)" : "var(--danger-color)"};
  font-size: 14px;
  margin: 0;
  margin-left: 124px;
  margin-top: 8px;
`;

const StepIconWrap = styled.div`  
  display: flex;
  gap: 8px;
  margin-top: -36px;
  margin-bottom: 24px;
`;

const StepIcon = styled.div`
  width: 64px;
  height: 3px;
  background-color: ${props => props.active ? "var(--primary-color)" : "var(--light-gray)"};
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  font-size: 14px;
  font-weight: bold;
`;

const ProfileImage = styled.div`
  width: 64px;
  height: 64px;
  border: 1px solid;
  border-color: var(--light-gray);
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 24px;
  overflow: hidden;

  & img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const CustomFileInput = styled.label`
  border: 1px solid;
  border-color: var(--light-gray);
  border-radius: 4px;
  padding: 8px 16px;
  cursor: pointer;
  font-size: 16px;
  color: var(--dark-gray);
  font-weight: normal;

  & input {
    display: none;
  }
`;


export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [userInfo, setUserInfo] = useState({
    email: "",
    password: "",
    passwordConfirm: "",
    phone: "",
    username: "",
    bio: "",
    profileImage: "",
  });

  const [selectedImage, setSelectedImage] = useState(null);

  const [emailCheck, setEmailCheck] = useState(-1);

  const [inputError, setInputError] = useState({
    email: "",
    password: "",
    passwordConfirm: "",
    phone: ""
  });

  const [inputStart, setInputStart] = useState({
    email: false,
    password: false,
    passwordConfirm: false,
    phone: false
  });

  useEffect(() => {
    setInputStart({
      email: userInfo.email.length > 0,
      password: userInfo.password.length > 0,
      passwordConfirm: userInfo.passwordConfirm.length > 0,
      phone: userInfo.phone.length > 0
    });

    if (inputStart.email) {
      checkEmail();
    }
    if (inputStart.password) {
      checkPassword();
    }
    if (inputStart.passwordConfirm) {
      checkPasswordConfirm();
    }
    if (inputStart.phone) {
      checkPhone();
    }
  }, [userInfo]);

  const checkEmail = () => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(userInfo.email)) {
      if (userInfo.email === "") {
        setEmailCheck(-1);
        setInputError({ ...inputError, email: "이메일을 입력해주세요." });
      } else {
        setEmailCheck(-1);
        setInputError({ ...inputError, email: "유효한 이메일 형식을 입력하세요." });
      }
    } else {
      setInputError({ ...inputError, email: "" });
    }
  };

  const checkPassword = () => {
    if (userInfo.password.length < 6) {
      if (userInfo.password === "") {
        setInputError({ ...inputError, password: "비밀번호를 입력해주세요." });
      } else {
        setInputError({ ...inputError, password: "비밀번호는 6자 이상이어야 합니다." });
      }
    } else {
      setInputError({ ...inputError, password: "" });
    }
  }

  const checkPasswordConfirm = () => {
    if (userInfo.password !== userInfo.passwordConfirm) {
      setInputError({ ...inputError, passwordConfirm: "비밀번호가 일치하지 않습니다." });
    } else {
      setInputError({ ...inputError, passwordConfirm: "" });
    }
  }

  const checkPhone = () => {
    const phonePattern = /^\d{3}\d{3,4}\d{4}$/;
    if (!phonePattern.test(userInfo.phone)) {
      if (userInfo.phone === "") {
        setInputError({ ...inputError, phone: "전화번호를 입력해주세요." });
      } else {
        setInputError({ ...inputError, phone: "'-' 없이 숫자만 입력해주세요." });
      }
    } else {
      setInputError({ ...inputError, phone: "" });
    }
  }

  const handleCheckEmail = () => {
    if (inputError.email) {
      return;
    }
    axios.get(`/api/user/checkEmail?email=${userInfo.email}`).then((res) => {
      if (!res.data.result) {
        setEmailCheck(1);
      } else {
        setEmailCheck(0);
      }
    }).catch((e) => {
      console.error(e);
    });
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (inputError.email || inputError.password || inputError.passwordConfirm || inputError.phone) {
        return;
      }
      setStep(2);
    }
  };

  const firstStep = (
    <>
      <InputBox className="input-box">
        <Title className="title">
          회원가입
        </Title>

        <StepIconWrap className="step-icon-wrap">
          {Array.from({ length: 3 }).map((_, index) => (
            <StepIcon active={index + 1 === step}></StepIcon>
          ))}
        </StepIconWrap>

        <InputWrap className="input-wrap">
          <div className="input">
            <label htmlFor="email">이메일</label>
            <Input id="email" grow placeholder="이메일을 입력하세요." value={userInfo.email} onChange={(e) => setUserInfo({ ...userInfo, email: e.target.value })} />
            <Button rect onClick={handleCheckEmail} >중복확인</Button>
          </div>
          {inputError.email && <ErrorText>{inputError.email}</ErrorText>}
          {emailCheck !== -1 && <EmailCheck check={emailCheck}>
            {emailCheck === 1 ? "사용 가능한 이메일입니다." : "이미 사용 중인 이메일입니다."}
          </EmailCheck>}
        </InputWrap>

        <InputWrap className="input-wrap">
          <div className="input">
            <label htmlFor="password">비밀번호</label>
            <Input type="password" id="password" grow placeholder="비밀번호를 입력하세요." value={userInfo.password} onChange={(e) => setUserInfo({ ...userInfo, password: e.target.value })} />
          </div>
          {inputError.password && <ErrorText>{inputError.password}</ErrorText>}

        </InputWrap>

        <InputWrap className="input-wrap">
          <div className="input">
            <label htmlFor="password-confirm">비밀번호 확인</label>
            <Input type="password" id="password-confirm" grow placeholder="비밀번호를 다시 한 번 입력하세요." value={userInfo.passwordConfirm} onChange={(e) => setUserInfo({ ...userInfo, passwordConfirm: e.target.value })} />
          </div>
          {inputError.passwordConfirm && <ErrorText>{inputError.passwordConfirm}</ErrorText>}
        </InputWrap>

        <InputWrap className="input-wrap">
          <div className="input">
            <label htmlFor="phone">전화번호</label>
            <Input type="tel" id="phone" grow placeholder="전화번호는 아이디/비밀번호 찾기에 사용돼요." value={userInfo.phone} onChange={(e) => setUserInfo({ ...userInfo, phone: e.target.value })} />
          </div>
          {inputError.phone && <ErrorText>{inputError.phone}</ErrorText>}
        </InputWrap>
      </InputBox>

      <TextAndLink style={{ marginBottom: "24px" }} className="text-and-link">
        이미 회원이라면?
        <Link to="/login">로그인</Link>
      </TextAndLink>

      <Button color="primary" onClick={handleNextStep} size="large">다음으로</Button>
    </>

  );

  const secondStep = (
    <>
    <InputBox className="input-box">
      <Title className="title">
        프로필 설정
      </Title>

      <StepIconWrap className="step-icon-wrap">
        {Array.from({ length: 3 }).map((_, index) => (
          <StepIcon active={index + 1 === step}></StepIcon>
        ))}
      </StepIconWrap>

      <InputWrap className="input-wrap">
        <div className="input">
          <label>프로필 사진</label>
          <ProfileImage className="profile-image">
            <img src={userInfo.profileImage ? URL.createObjectURL(selectedImage) : "images/default/defaultProfileImage.png"} alt="프로필 사진" />
          </ProfileImage>

          <CustomFileInput className="custom-file-input">
            사진 선택하기...
            <input type="file" accept="image/*" />
          </CustomFileInput>
        </div>
      </InputWrap>

      <InputWrap className="input-wrap">
        <div className="input">
          <label htmlFor="username">닉네임</label>
          <Input id="username" grow placeholder="닉네임을 입력하세요." value={userInfo.username} onChange={(e) => setUserInfo({ ...userInfo, username: e.target.value })} /> 
        </div>
      </InputWrap>

      <InputWrap className="input-wrap">
      <div style={{ alignItems: "flex-start" }} className="input">
        <label htmlFor="bio">자기소개</label>
        <Textarea id="bio" grow placeholder="한줄로 나를 소개해 보세요." value={userInfo.bio} onChange={(e) => setUserInfo({ ...userInfo, bio: e.target.value })} />
      </div>
      </InputWrap>



    </InputBox>

    <TextAndLink style={{ marginBottom: "24px" }} className="text-and-link">
      이미 회원이라면?
      <Link to="/login">로그인</Link>
    </TextAndLink>

    <Button color="primary" onClick={handleNextStep} size="large">다음으로</Button>
  </>
  );


  return (
    <FullPageContainer>
      <Logo>
        <img src="images/logo/logo.svg" alt="CiRCLE" />
      </Logo>

      {step === 1 && firstStep}
      {step === 2 && secondStep}


    </FullPageContainer>
  );
}