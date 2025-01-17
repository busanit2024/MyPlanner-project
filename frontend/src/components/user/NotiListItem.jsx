import styled from "styled-components";
import Button from "../../ui/Button";
import { calculateDate } from "../../util/calculateDate";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import Swal from "sweetalert2";
import { useState } from "react";

const defaultProfileImage = "/images/default/defaultProfileImage.png";

export default function NotiListItem(props) {
  const { data, onClick, onReaction } = props;
  const { user, loading } = useAuth();
  const [inviteStatus, setInviteStatus] = useState(data.inviteStatus);

  const makeText = () => {
    if (!data) return "";
    const fromUser = data.fromUser;
    switch (data.type) {
      case "FOLLOW":
        return (
          <>
            <span>{fromUser.username}</span>님이 회원님을 팔로우했습니다.
          </>
        )
      case "HEART":
        return (
          <>
            <span>{fromUser.username}</span>님이
            <span>{data.targetName}</span> 일정에 좋아요를 눌렀습니다.
          </>
        )
      case "COMMENT":
        return (
          <>
            <span>{fromUser.username}</span>님이
            <span>{data.targetName}</span> 일정에 댓글을 남겼습니다.
          </>
        )
      case "INVITE":
        return (
          <>
            <span>{fromUser.username}</span> 님이
            <span>{data.targetName}</span> 일정에 회원님을 초대했습니다.
          </>
        )
      case "PARTICIPATE":
        return (
          <>
            <span>{fromUser.username}</span> 님이
            <span>{data.targetName}</span> 일정에 참여했습니다.
          </>
        )
      default:
        return "";
    }
  }

  const handleAccepButton = (e) => {
    e.stopPropagation();
    Swal.fire({
      title: "초대 수락하기",
      text: "초대를 수락하시겠어요?",
      confirmButtonText: "확인",
      showCancelButton: true,
      cancelButtonText: "취소",
      customClass: {
        title: "swal-title",
        htmlContainer: "swal-text-container",
        confirmButton: "swal-button swal-button-confirm",
        cancelButton: "swal-button swal-button-cancel",
      },
    }).then((result) => {
      if (result.isConfirmed) {
        acceptInvite();
      }
    });
  }

  const handleDeclineButton = (e) => {
    e.stopPropagation();
    Swal.fire({
      title: "초대 거절하기",
      text: "초대를 거절하시겠어요?",
      showCancelButton: true,
      confirmButtonText: "확인",
      cancelButtonText: "취소",
      customClass: {
        title: "swal-title",
        htmlContainer: "swal-text-container",
        confirmButton: "swal-button swal-button-confirm",
        cancelButton: "swal-button swal-button-cancel",
      },
    }).then((result) => {
      if (result.isConfirmed) {
        declineInvite();
      }
    });
  }

  const acceptInvite = async () => {
    if (!user) return;
    try {
      const res = await axios.get(`/api/schedules/invite/${data.targetId}/accept`, {
        params: {
          userId: user.id,
        }
      });
      if (res.data === 'success') {
        Swal.fire({
          title: "초대 수락",
          text: "초대를 수락했습니다.",
          confirmButtonText: "확인",
          customClass: {
            title: "swal-title",
            htmlContainer: "swal-text-container",
            confirmButton: "swal-button swal-button-confirm",
          },
        });
        setInviteStatus('ACCEPTED');
        onReaction();
      }
    } catch (error) {
      console.error("초대 수락 에러", error);
      let message = "초대 수락에 실패했습니다. 다시 시도해주세요.";
      if (error.response.data.message === 'Schedule not found') {
        message = "존재하지 않는 일정입니다.";
      }
        Swal.fire({
          title: "초대 수락 실패",
          text: message,
          confirmButtonText: "확인",
          customClass: {
            title: "swal-title",
            htmlContainer: "swal-text-container",
            confirmButton: "swal-button swal-button-confirm",
          },
        });
      
    }
  }

  const declineInvite = async () => {

    if (!user) return;
    try {
      const res = await axios.get(`/api/schedules/invite/${data.targetId}/decline`, {
        params: {
          userId: user.id,
        }
      });
      if (res.data === 'success') {
        Swal.fire({
          title: "초대 거절",
          text: "초대를 거절했습니다.",
          confirmButtonText: "확인",
          customClass: {
            title: "swal-title",
            htmlContainer: "swal-text-container",
            confirmButton: "swal-button swal-button-confirm",
          },
        });
        setInviteStatus('DECLINED');
        onReaction();
      }
    } catch (error) {
      console.error("초대 거절 에러", error);
      let message = "초대 거절에 실패했습니다. 다시 시도해주세요.";
      if (error.response.data.message === 'Schedule not found') {
        message = "존재하지 않는 일정입니다.";
      }
      Swal.fire({
        title: "초대 거절 실패",
        text: message,
        confirmButtonText: "확인",
        customClass: {
          title: "swal-title",
          htmlContainer: "swal-text-container",
          confirmButton: "swal-button swal-button-confirm",
        },
      });

    }
  }



  return (
    <Container className="noti-list-item" onClick={onClick}>
      <div className="content">
        <Avatar>
          <img src={data?.fromUser.profileImageUrl || defaultProfileImage} onError={(e) => e.target.src = defaultProfileImage} alt="profile" />
        </Avatar>

        <NotiText className={data?.read ? "read" : ""}>
          {makeText()}
          <span className="time"> {calculateDate(data?.updatedAt)} 전</span>
        </NotiText>
      </div>

      {data?.type === "INVITE" && <div className="button-group">
        {inviteStatus === 'PENDING' && <>
          <Button onClick={handleDeclineButton} >거절</Button>
          <Button color="primary" onClick={handleAccepButton}>수락</Button>
        </>}
        {inviteStatus === 'ACCEPTED' &&
          <Button color="gray" disabled>수락됨</Button>
        }
        {inviteStatus === 'DECLINED' &&
          <Button color="gray" disabled>거절됨</Button>
        }
      </div>}

    </Container>
  )

}

const Container = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 8px 0px;
  box-sizing: border-box;
  cursor: pointer;

  & .content {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  & .button-group {
    display: flex;
    gap: 12px;
  }
`;

const Avatar = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: var(--light-gray);

  & img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 50%;
    image-rendering: auto;
  }
`;

const NotiText = styled.div`
  font-size: 18px;
  display: flex;
  gap: 8px;
  align-items: center;

  &.read {
    color: var(--mid-gray);
  }
  
  & span {
    font-weight: bold;
  }

  & .time {
    font-size: 16px;
    font-weight: normal;
    color: var(--mid-gray);
  }
`;