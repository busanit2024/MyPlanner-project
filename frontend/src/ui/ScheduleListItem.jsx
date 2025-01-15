import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { generateDateFormat } from "../util/generateDateFormat";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const defaultProfileImageUrl = "/images/default/defaultProfileImage.png";
const defaultScheduleImageUrl = "/images/default/defaultScheduleImage.png";

export default function ScheduleListItem(props) {
  const { data } = props;
  const { user } = useAuth();
  const navigate = useNavigate();
  const [liked, setLiked] = useState(false);
  const [participated, setParticipated] = useState(false);

  useEffect(() => {
    if (!user) return;
    checkLiked();
    checkParticipated();
  }, [user, data]);

  const handleLike = async (e) => {
    e.stopPropagation();
    if (!user) return;
    try {
      const response = await axios.get(`/api/reaction/like`, {
        params: {
          userId: user.id,
          scheduleId: data.id
        }
      });
      liked ? setLiked(false) : setLiked(true);
    } catch (error) {
      console.error('Error liking schedule:', error);
    }
  };

  const checkLiked = () => {
    if (!user) return;
    setLiked(data.heartUserIds?.includes(user.id));
  }

  // 참가 버튼 클릭
  const handleParticipate = (e) => {
    e.stopPropagation();
    if (!user || participated) return;

    Swal.fire({
      title: '일정 참가하기',
      text: '이 일정에 참가하시겠습니까?',
      showCancelButton: true,
      confirmButtonText: '참가',
      cancelButtonText: '취소',
      customClass: {
        title: "swal-title",
        htmlContainer: "swal-text-container",
        confirmButton: "swal-button swal-button-confirm",
        cancelButton: "swal-button swal-button-cancel",
      },
    }).then((result) => {
      if (result.isConfirmed) {
        participate();
      }
    });
  };

  const participate = async () => {
    if (!user) {
      return;
    }
    try {
      const response = await axios.get(`/api/schedules/participate/${data.id}`, {
        params: {
          userId: user.id,
        }
      });
      if (response.data === 'success') {
        Swal.fire({
          title: '참가 요청 완료',
          text: '일정에 참가했습니다.',
          confirmButtonText: '확인',
          customClass: {
            title: "swal-title",
            htmlContainer: "swal-text-container",
            confirmButton: "swal-button swal-button-confirm",
          },
        });
        setParticipated(true);
      }
    } catch (error) {
      console.error("참가 요청 중 오류 발생: ", error.response.data);
      alert("참가 요청에 실패했습니다. 다시 시도해 주세요.");
    };
  };

  const checkParticipated = () => {
    if (!user) return;
    const acceptedParticipants = data.participants.filter(p => p.status === 'ACCEPTED');
    const userIds = acceptedParticipants.map(p => p.user.id);
    setParticipated(userIds.includes(user.id));
  }



  return (
    <Container className="schedule-list-item" onClick={() => navigate(`/schedule/${data?.id}`)}>
      <UserInfo className="user-info" onClick={() => navigate(`/user/${data?.user.id}`)}>
        <div className="profileImage">
          <img src={data?.user.profileImageUrl || defaultProfileImageUrl} onError={(e) => e.target.src = defaultProfileImageUrl} alt="profile" />
        </div>
        <span className="username">{data?.user.username ?? "닉네임"}</span>
      </UserInfo>
      <InnerContainer className="inner-container">
        <div className="left">
          <div className="image-container">
            <img src={data?.imageUrl || defaultScheduleImageUrl} onError={(e) => e.target.src = defaultScheduleImageUrl} alt="일정 이미지" />
          </div>
          <div className="info">
            <span className="title">{data?.title || "제목 없는 일정"}</span>
            <span className="content">{data?.detail}</span>
            <span className="date">
              {generateDateFormat(data?.startDate, data?.startTime, data?.endDate, data?.endTime)}
            </span>
          </div>
        </div>
        <div className="right">
          <div className="button-wrap">
            <div className="button" onClick={handleLike}>
              {liked ? <img src="/images/icon/heartFill.svg" alt="like" /> : <img src="/images/icon/heartEmpty.svg" alt="like" />}
            </div>
            <div className="button" onClick={handleParticipate}>
              {participated ? <img src="/images/icon/calendarUser.svg" alt="participate" /> : <img src="/images/icon/calendarPlus.svg" alt="participate" />}
            </div>
          </div>
        </div>
      </InnerContainer>
      {data.recentComment &&
        <Comment className="comment">
          <div className="commentIcon">
            <img src="/images/icon/comment.svg" alt="comment" />
          </div>
          <span className="username">{data.recentComment?.user?.username}</span>
          <span className="comment-text">{data.recentComment?.content}</span>
        </Comment>}
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-bottom: 16px;
  padding-top: 12px;
  border-bottom: 1px solid var(--light-gray);
  width: 100%;

  &:first-of-type {
    padding-top: 0;
  }

  &:last-of-type {
    border-bottom: none;
  }
`;

const UserInfo = styled.div`  
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;

  & .profileImage {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: var(--light-gray);

    & img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      object-fit: cover;
    }
  }

  & .username {
    font-size: 16px;
  }
`;

const InnerContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 8px;

  & .left {
    display: flex;
    align-items: flex-start;
    gap: 18px;
    cursor: pointer;

    & .image-container {
      width: 100px;
      height: 100px;
      border-radius: 4px;
      overflow: hidden;
      background-color: var(--light-gray);

      & img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: all 0.3s;

        &:hover {
          transform: scale(1.1);
          filter: brightness(0.9);
        }
      }


    }

    & .info {
      display: flex;
      flex-direction: column;
      gap: 4px;

      & .title {
        font-size: 18px;
        font-weight: bold;
      }

      & .content {
        font-size: 16px;
      }

      & .date {
        font-size: 16px;
        color: var(--mid-gray);
      }
    }
  }

  & .right {
    display: flex;
    align-items: center;
    gap: 8px;

    & .button-wrap {
      display: flex;
      gap: 12px;

      & .button {
        width: 32px;
        height: 32px;
        cursor: pointer;

        & img {
          width: 100%;
          height: 100%;
        }
      }
    }
  }
`;

const Comment = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  margin-top: 8px;

  & .commentIcon {
    width: 28px;
    height: 28px;

    & img {
      width: 100%;
      height: 100%;
  }
}

  & .username {
    font-size: 16px;
    font-weight: bold;
  }

  & .comment-text {
    font-size: 16px;
    color: var(--mid-gray);
    -webkit-line-clamp: 1;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;