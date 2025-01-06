import styled from "styled-components";
import { useAuth } from "../../context/AuthContext";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../../ui/Input";
import axios from "axios";
import Textarea from "../../ui/Textarea";
import Button from "../../ui/Button";
import { deleteFile, imageFileUpload } from "../../firebase";
import Modal from "../../ui/Modal";
import Swal from "sweetalert2";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../firebase";

const defaultProfileImage = "/images/default/defaultProfileImage.png";

export default function ProfileEditPage() {
  const { user, loading, loadUser } = useAuth();
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(null);
  const [userInput, setUserInput] = useState({
    username: "",
    phone: "",
    bio: "",
  });
  const [prevPhone, setPrevPhone] = useState("");
  const [phoneCheck, setPhoneCheck] = useState("notyet");
  const [phoneError, setPhoneError] = useState("");
  const [changeEmail, setChangeEmail] = useState("");
  const [changeEmailError, setChangeEmailError] = useState({
    error: "notyet",
    message: "",
  });

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }

    if (!loading && user) {
      getUserInfo();
    }

  }, [user, loading]);

  useEffect(() => {
    if (prevPhone) {
      if (userInput.phone === prevPhone) {
        setPhoneCheck("ok");
      } else {
        setPhoneCheck("notyet");
        checkPhoneValid();
      }
    }
  }, [userInput.phone, prevPhone]);

  useEffect(() => {
    if (changeEmail) {
      checkEmail();
    } else {
      setChangeEmailError({ error: "notyet", message: "" });
    }
  }, [changeEmail]);

  const getUserInfo = () => {
    if (!user) {
      return;
    }

    axios.get(`/api/user/getEditInfo`, { params: { userId: user.id } })
      .then(res => {
        console.log("get edit info", res.data);
        setUserInput({
          username: res.data.username,
          phone: res.data.phone,
          bio: res.data.bio,
        });
        setPrevPhone(res.data.phone);
      })
      .catch(err => {
        console.error(err);
      });
  };

  const checkPhoneValid = () => {
    const phonePattern = /^\d{3}\d{3,4}\d{4}$/;

    if (userInput.phone === "") {
      setPhoneError("전화번호를 입력해주세요.");
    } else {
      if (!phonePattern.test(userInput.phone)) {
        setPhoneError("'-' 없이 숫자만 입력해주세요.");
      } else {
        setPhoneError("");
        setPhoneCheck("valid");
      }
    }
  };

  const checkPhoneDuplicate = () => {
    if (phoneCheck !== "valid") {
      return;
    }
    if (userInput.phone === prevPhone) {
      setPhoneCheck("ok");
      return;
    }
    axios.get(`/api/user/checkPhone?phone=${userInput.phone}`).then((res) => {
      setPhoneError("");
      if (res.data === false) {
        setPhoneCheck("ok");
      }
      if (res.data === true) {
        setPhoneCheck("no");
      }
    }).catch((e) => {
      setPhoneError("전화번호 중복확인에 실패했어요. 다시 시도해 주세요.");
      console.error(e);
    });
  }

  const checkEmail = () => {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (changeEmail === "") {
      setChangeEmailError({ error: "no", message: "이메일을 입력해주세요." });
      return;
    } else {
      if (!emailPattern.test(changeEmail)) {
        setChangeEmailError({ error: "no", message: "유효한 이메일 형식을 입력해주세요." });
        return;
      } else {
        setChangeEmailError({ error: "ok", message: "" });
      }
    }
  }

  const sendChangeEmail = () => {
    checkEmail();
    if (changeEmailError.error === "no") {
      return;
    }

    sendPasswordResetEmail(auth, changeEmail)
    .then(() => {
      setChangeEmailError({ error: "ok", message: "비밀번호 변경 메일을 전송했어요." });
    }).catch((error) => {
      console.error(error);
      setChangeEmailError({ error: "no", message: "메일 전송에 실패했어요. 다시 시도해주세요." });
    });
  }


      const updateUser = async () => {
        if (phoneCheck === "notyet" || phoneCheck === "valid") {
          setPhoneError("전화번호 중복확인을 해주세요.");
          return;
        }

        if (phoneCheck === "no") {
          return;
        }

        const prevProfileImageUrl = user.profileImageUrl;
        let newProfileImage = null;
        if (selectedImage) {
          newProfileImage = await imageFileUpload(selectedImage);
        }

        axios.post(`/api/user/saveProfile`, {
          id: user.id,
          email: user.email,
          username: userInput.username,
          phone: userInput.phone,
          bio: userInput.bio,
          profileImageUrl: newProfileImage ? newProfileImage.url : prevProfileImageUrl,
        })
          .then(res => {
            console.log("save profile image", res.data);
            if (newProfileImage) {
              deleteFile(prevProfileImageUrl);
            }
            updateComplete();
          })
          .catch(err => {
            console.error(err);
          });
      }

      const updateComplete = () => {
        Swal.fire({
          title: "프로필 수정 완료",
          text: "프로필을 수정했어요.",
          confirmButtonText: "확인",
          customClass: {
            //App.css에 정의된 클래스 사용
            title: "swal-title",
            htmlContainer: "swal-text-container",
            confirmButton: "swal-button swal-button-confirm",
            cancelButton: "swal-button swal-button-cancel",
          },
        }).then((result) => {
          if (result.isConfirmed) {
            loadUser();
            navigate("/profile");
          }
        });
      }



      return (
        <Container className="profile-edit">
          <ProfileImageWrap className="profile-image-wrap">
            <ProfileImage>
              <img src={selectedImage ? URL.createObjectURL(selectedImage) : user?.profileImageUrl || defaultProfileImage} onError={(e) => (e.target.src = { defaultProfileImage })} alt="Profile" />
            </ProfileImage>
            <div className="input-wrap">
              <span className="email">{user?.email ?? '로딩중...'}</span>
              <ImageInput>
                사진 변경...
                <input type="file" accept="image/*" onChange={(e) => setSelectedImage(e.target.files[0])} />
              </ImageInput>
            </div>
          </ProfileImageWrap>

          <InputWrap>
            <div className="input-item">
              <label htmlFor="username">닉네임</label>
              <Input grow size="large" type="text" id="username" value={userInput.username} onChange={(e) => setUserInput({ ...userInput, username: e.target.value })} />
            </div>
            <div className="input-item bio">
              <label htmlFor="bio">자기소개</label>
              <Textarea grow size="large" height={120} id="bio" value={userInput.bio} onChange={(e) => setUserInput({ ...userInput, bio: e.target.value })} />
            </div>
            <div className="input-item">
              <label htmlFor="phone">전화번호</label>
              <Input grow size="large" type="text" id="phone" value={userInput.phone} onChange={(e) => setUserInput({ ...userInput, phone: e.target.value })} />
              <Button rect onClick={checkPhoneDuplicate}>중복확인</Button>
            </div>
            {phoneError && <ErrorText>{phoneError}</ErrorText>}
            {(phoneCheck === "ok" || phoneCheck === "no") && <ErrorText check={phoneCheck}>
              {phoneCheck === "ok" ? "사용 가능한 전화번호입니다." : phoneCheck === "no" ? "이미 사용 중인 전화번호입니다." : ""}
            </ErrorText>}

            <div className="input-item">
              <label htmlFor="email">비밀번호 변경</label>
              <Input grow size="large" type="email" id="email" value={changeEmail} placeholder={'이메일을 다시 한번 입력하세요.'} onChange={(e) => setChangeEmail(e.target.value)} onInput={(e) => setChangeEmail(e.target.value)} />
              <Button rect onClick={sendChangeEmail}>변경 메일 전송</Button>
            </div>
            {changeEmailError.error && <ErrorText check={changeEmailError.error}>{changeEmailError.message}</ErrorText>}
          </InputWrap>
          <div style={{ display: "flex", justifyContent: "center", marginTop: "64px" }}>
            <Button color="primary" size="large" onClick={updateUser} >수정 완료</Button>
          </div>
        </Container>
      )
    };

    const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 64px 160px;
  gap: 64px;
  box-sizing: border-box;
`;

    const ProfileImageWrap = styled.div`
  display: flex;
  align-items: center;
  gap: 36px;
  width: 100%;
  box-sizing: border-box;

  & .input-wrap {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
    width: 100%;
  }

  & .email {
      font-size: 18px;
      color: var(--mid-gray);
    }
`;

    const ProfileImage = styled.div`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background-color: var(--light-gray);
  flex-shrink: 0;

  & img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 50%;
  }
`;

    const ImageInput = styled.label`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 8px 16px;
  margin: 0;
  border-radius: 8px;
  border: 1px solid var(--mid-gray);
  cursor: pointer;

  & input {
    display: none;
  }
`;


    const InputWrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 100%;
  box-sizing: border-box;

  & .input-item {
    display: flex;
    gap: 12px;
    align-items: center;
    width: 100%;
    box-sizing: border-box;

    & label {
    width: 120px;
    font-size: 18px;
    flex-shrink: 0;
  }

  &.bio {
    & label {
      align-self: flex-start;
    }
  }

  }
`;

    const ErrorText = styled.p`
  font-size: 14px;
  margin: 0;
  margin-left: 144px;
  margin-top: -16px;
  color: ${props => props.check === "ok" ? "var(--mid-gray)" : "var(--danger-color)"};
`;