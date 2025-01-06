import styled from "styled-components";

export default function ScheduleListItem(props) {
  const { data, onClick } = props;

  return (
    <Container className="schedule-list-item" onClick={onClick}>
      <UserInfo>
        <div className="profileImage">
          <img src={data?.user.profileImageUrl} alt="profile" />
        </div>
        <span className="username">{data?.user.username ?? "닉네임"}</span>
      </UserInfo>
      <InnerContainer>
        <div className="left">
          <div className="image-container">
            <img src={data?.imageUrls[0]} alt="일정 이미지" />
          </div>
          <div className="info">
            <span className="title">{data?.title ?? "일정 제목"}</span>
            <span className="content">{data?.content ?? "일정 내용"}</span>
            <span className="date">{data?.date ?? "2025-00-00"}</span>
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
      <Comment>
        <div className="commentIcon">
          <img src="/images/icon/comment.svg" alt="comment" />
        </div>
        <span className="username">{data?.user.username ?? "닉네임"}</span>
        <span className="comment">{data?.comment ?? "댓글 내용"}</span>
      </Comment>
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  cursor: pointer;  
`;

const UserInfo = styled.div`  
  display: flex;
  align-items: center;
  gap: 12px;

  & .profileImage {
    width: 48px;
    height: 48px;
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
    font-size: 18px;
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

  & .commentIcon {
    width: 32px;
    height: 32px;

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