import styled from "styled-components";
import { useAuth } from "../../context/AuthContext";

export default function Comments(props) {
  const { user, loading } = useAuth();
  const { scheduleId } = props;

  return (
    <Container className="comments">
      <ButtonContainer className="button-container item">
        <div className="button heart">
          <img src="/images/icon/heartEmpty.svg" alt="like" />
          <span className="count">0</span>
        </div>
        <div className="button comment">
          <img src="/images/icon/comment.svg" alt="comment" />
          <span className="count">0</span>
        </div>
      </ButtonContainer>
      <CommentList className="comment-list item">
        <CommentListItem>
          <div className="profile-image">
            <img src={user?.profileImageUrl} alt="profile" />
          </div>
          <div className="comment-content">
            <div className="info">
              <span className="username">{user?.username}</span>
              <span className="date">2021.08.01</span>
            </div>
            <span className="comment">댓글 내용</span>
          </div>
          <div className="button-wrap">
            <div className="button">수정</div>
            <div className="button">삭제</div>
          </div>
        </CommentListItem>
      </CommentList>
      <CommentWrite className="comment-write item">
        <div className="profile-image">
          <img src={user?.profileImageUrl} alt="profile" />
        </div>
        <input type="text" placeholder="댓글 작성하기" />
        <div className="send">
          <img src="/images/icon/sendMsg_48.png" alt="send" />
        </div>

      </CommentWrite>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  width: 100%;
  flex-direction: column;
  gap: 12px;

  & .item {
    border-bottom: 1px solid var(--light-gray);
    padding: 24px 0;
    
    &:last-of-type {
      border-bottom: none;
    }
  }

  & .profile-image {
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
`;

const ButtonContainer = styled.div`
  display: flex;
  width: 100%;
  justify-content: flex-end;
  gap: 12px;

  & .button {
    display: flex;
    align-items: center;
    gap: 4px;

    & img {
      width: 28px;
      height: 28px;
      cursor: pointer; 
    }
  }
`;

const CommentList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const CommentListItem = styled.div`
  display: flex;
  gap: 12px;
  align-items: flex-start;

  & .comment-content {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  & .info {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  & .username {
    font-size: 16px;
    font-weight: bold;
  }

  & .date {
    font-size: 14px;
    color: var(--mid-gray);
  }

  & .comment {
    font-size: 16px;
  }

  & .button-wrap {
    display: flex;
    gap: 12px;
    justify-self: flex-end;
    margin-left: auto;
    flex-shrink: 0;

    & .button {
      font-size: 16px;
      cursor: pointer;

      &:hover {
        text-decoration: underline;
      }
    }
  }
`;

const CommentWrite = styled.div`
  display: flex;
  gap: 12px;

  & input {
    flex-grow: 1;
    height: 40px;
    padding: 0 12px;
    border: none;
    border-bottom: 1px solid var(--light-gray);
    outline: none;
    font-size: 16px;
  }

  & .send {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    padding-left: 4px;
    background-color: var(--primary-color);
    border-radius: 50%;
    cursor: pointer;

    & img {
      width: 24px;
      height: 24px;
    }
  }
`;