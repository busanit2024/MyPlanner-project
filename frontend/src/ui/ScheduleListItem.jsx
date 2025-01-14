import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { generateDateFormat } from "../util/generateDateFormat";

const defaultProfileImageUrl = "/images/default/defaultProfileImage.png";
const defaultScheduleImageUrl = "/images/default/defaultScheduleImage.png";

export default function ScheduleListItem(props) {
  const { data } = props;
  const navigate = useNavigate();

  return (
    <Container className="schedule-list-item" onClick={() => navigate(`/schedule/${data?.id}`)}>
      <UserInfo className="user-info" onClick={() => navigate(`/user/${data?.user.id}`)}>
        <div className="profileImage">
          <img src={data?.user.profileImageUrl || defaultProfileImageUrl}  onError={(e) => e.target.src=defaultProfileImageUrl} alt="profile" />
        </div>
        <span className="username">{data?.user.username ?? "닉네임"}</span>
      </UserInfo>
      <InnerContainer className="inner-container">
        <div className="left">
          <div className="image-container">
            <img src={data?.imageUrl || defaultScheduleImageUrl} onError={(e) => e.target.src=defaultScheduleImageUrl} alt="일정 이미지" />
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
            <div className="button">
              <img src="/images/icon/heartEmpty.svg" alt="like" />
            </div>
            <div className="button">
              <img src="/images/icon/calendarPlus.svg" alt="add" />
            </div>
          </div>
        </div>
      </InnerContainer>
      <Comment className="comment">
        <div className="commentIcon">
          <img src="/images/icon/comment.svg" alt="comment" />
        </div>
        <span className="username">닉네임</span>
        <span className="comment">댓글 내용</span>
      </Comment>
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-bottom: 24px;
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
  cursor: pointer;

  &:hover img {
      transform: scale(1.1);
      filter: brightness(0.9);
    }

  & .left {
    display: flex;
    align-items: flex-start;
    gap: 18px;

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

  & .comment {
    font-size: 16px;
    color: var(--mid-gray);
  }
`;