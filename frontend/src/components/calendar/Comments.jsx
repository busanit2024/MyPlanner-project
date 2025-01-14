import styled from "styled-components";
import { useAuth } from "../../context/AuthContext";
import { use, useEffect, useState } from "react";
import axios from "axios";
import { calculateDate } from "../../util/calculateDate";
import Swal from "sweetalert2";
import Button from "../../ui/Button";
import LikeUserModal from "./LikeUserModal";

const defaultProfileImage = "/images/default/defaultProfileImage.png";
export default function Comments(props) {
  const { user, loading } = useAuth();
  const { scheduleId } = props;
  const [commentList, setCommentList] = useState([]);
  const [commentCount, setCommentCount] = useState(0);
  const [likeCount, setLikeCount] = useState(0);
  const [liked, setLiked] = useState(false);
  const [page, setPage] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [commentLoading, setCommentLoading] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);
  const [input, setInput] = useState('');
  const [likeUserModalOpen, setLikeUserModalOpen] = useState(false);

  useEffect(() => {
    if (scheduleId) {
      fetchLikeCount();
      checkLiked();
    }
  }, [scheduleId]);

  useEffect(() => {
    if (scheduleId) {
      fetchComments();
    }
  }, [scheduleId, page]);

  const fetchLikeCount = async () => {
    try {
      const response = await axios.get(`/api/reaction/like/count`, {
        params: {
          scheduleId,
        }
      });
      setLikeCount(response.data);
    } catch (error) {
      console.error('Error fetching like count:', error);
    }
  };

  const checkLiked = async () => {  
    setLikeLoading(true);
    if (!user) {
      setLikeLoading(false);
      return;
    }
    try {
      const response = await axios.get(`/api/reaction/like/check`, {
        params: {
          scheduleId,
          userId: user.id,
        }
      });
      setLiked(response.data);
    } catch (error) {
      console.error('Error checking like:', error);
    } finally {
      setLikeLoading(false);
    }
  };



  const fetchComments = async () => {
    setCommentLoading(true);
    const size = 10;
    try {
      const response = await axios.get(`/api/reaction/comment/list`, {
        params: {
          scheduleId,
          page: 0,
          size: size * (page + 1)
        }
      });
      setCommentList([...commentList, ...response.data.content]);
      setHasNext(!response.data.last);

      const commentCount = await axios.get(`/api/reaction/comment/count`, {
        params: {
          scheduleId,
        }
      });
      setCommentCount(commentCount.data);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setCommentLoading(false);
    }
  }

  const handleSendComment = async () => {
    if (!input || !user) {
      return;
    }

    try {
      const response = await axios.post(`/api/reaction/comment/write/${user.id}`, {
        scheduleId,
        content: input,
      });
      console.log('Comment written:', response.data);
      setCommentList([response.data, ...commentList]);
      setCommentCount(commentCount + 1);
      setInput('');
    } catch (error) {
      Swal.fire({
        title: "오류",
        text: "댓글 작성에 실패했습니다. 다시 시도해주세요.",
        customClass: {
          title: "swal-title",
          htmlContainer: "swal-text-container",
          confirmButton: "swal-button swal-button-confirm",
          cancelButton: "swal-button swal-button-cancel",
        },
      });
    }
  }

  const checkMyComment = (comment) => {
    if (!user) {
      return false;
    }
    return comment.user?.id === user.id;
  }

  const handleLike = async () => {
    if (!user || likeLoading) {
      return;
    }

    try {
      await axios.get(`/api/reaction/like`, {
        params: {
          scheduleId,
          userId: user.id,
        }
      });
      setLiked(!liked);
      setLikeCount(liked ? likeCount - 1 : likeCount + 1);
    } catch (error) {
      console.error('Error liking schedule:', error);
    }
  }

  return (
    <Container className="comments">
      <LikeUserModal isOpen={likeUserModalOpen} onClose={() => setLikeUserModalOpen(false)} scheduleId={scheduleId} />
      <ButtonContainer className="button-container item">
        <div className="button heart" onClick={handleLike}>
          {liked ? <img src="/images/icon/heartFill.svg" alt="like" /> : <img src="/images/icon/heartEmpty.svg" alt="like" />}
          <span className="count like" onClick={(e) => {
            e.stopPropagation();
            setLikeUserModalOpen(true)}}>
          좋아요 {likeCount}</span>
        </div>
        <div className="button comment">
          <img src="/images/icon/comment.svg" alt="comment" />
          <span className="count">댓글 {commentCount}</span>
        </div>
      </ButtonContainer>
      <CommentList className="comment-list item">
        {!commentLoading && commentList.map(comment => (
          <CommentListItem key={comment.id}>
            <div className="profile-image">
              <img src={comment.user?.profileImageUrl || defaultProfileImage} alt="profile" onError={(e) => e.target.src = defaultProfileImage} />
            </div>
            <div className="comment-content">
              <div className="info">
                <span className="username">{comment.user?.username}</span>
                <span className="date">{calculateDate(comment.createdAt)} 전</span>
              </div>
              <span className="comment">{comment.content}</span>
            </div>
            {checkMyComment(comment) &&
            <div className="button-wrap">
              <div className="button">수정</div>
              <div className="button">삭제</div>
            </div>}
          </CommentListItem>
        ))}
        {commentLoading && <div className="loading">댓글 불러오는 중...</div>}
        {!commentLoading && !commentList.length && <div className="no-item">댓글이 없습니다.</div>}
        {hasNext &&
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <Button size="small" onClick={() => setPage(page + 1)}>더 불러오기</Button>
          </div>}
      </CommentList>
      <CommentWrite className="comment-write item">
        <div className="profile-image">
          <img src={user?.profileImageUrl} alt="profile" />
        </div>
        <input type="text" placeholder="댓글 작성하기" value={input} onChange={(e) => setInput(e.target.value)} />
        <div className="send" onClick={handleSendComment}>
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

    & .like {
      cursor: pointer; 

      &:hover {
        text-decoration: underline;
      }
    }
  }
`;

const CommentList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;

  & .loading {
    text-align: center;
    color: var(--mid-gray);
  }

  & .no-item {
    text-align: center;
    color: var(--mid-gray);
  }
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
      color: var(--mid-gray); 
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