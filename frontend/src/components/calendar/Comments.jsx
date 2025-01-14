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
  const { scheduleId, likeUserIds } = props;
  const [commentList, setCommentList] = useState([]);
  const [commentCount, setCommentCount] = useState(0);
  const [likeCount, setLikeCount] = useState(0);
  const [liked, setLiked] = useState(false);
  const [page, setPage] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [commentLoading, setCommentLoading] = useState(false);
  const [input, setInput] = useState('');
  const [likeUserModalOpen, setLikeUserModalOpen] = useState(false);
  const [updateIndex, setUpdateIndex] = useState(-1);
  const [updateContent, setUpdateContent] = useState('');

  useEffect(() => {
    if (likeUserIds) {
      getLikeCount();
      checkLiked();
    }
  }, [likeUserIds]);

  useEffect(() => {
    if (scheduleId) {
      fetchComments();
    }
  }, [scheduleId, page]);

  const getLikeCount = () => {
    setLikeCount(likeUserIds.length);
  };

  const checkLiked = () => {
    const myLike = likeUserIds.includes(user.id);
    setLiked(myLike);
  };

  const handleUpdateButton = (index) => {
    setUpdateIndex(index);
    setUpdateContent(commentList[index].content);
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
    if (!user) {
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

  const handleUpdateComment = (index) => {
    Swal.fire({
      title: "댓글 수정",
      text: "댓글을 수정하시겠어요?",
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
        updateComment(index);
      }
    });
  }

  const updateComment = async (index) => {
    if (!user) {
      return;
    }

    try {
      console.log('comment', commentList[index]);
      await axios.post(`/api/reaction/comment/update`, {
        ...commentList[index], content: updateContent,
      });

      const updatedCommentList = [...commentList];
      updatedCommentList[index].content = updateContent;
      setCommentList(updatedCommentList);
      setUpdateIndex(-1);
    } catch (error) {
      console.error('Error updating comment:', error);
    }
  }

  const handleDeleteComment = (index) => {
    Swal.fire({
      title: "댓글 삭제",
      text: "댓글을 삭제하시겠어요?",
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
        deleteComment(index);
      }
    });
  }

  const deleteComment = async (index) => {
    if (!user) {
      return;
    }

    try {
      await axios.get(`/api/reaction/comment/delete`, {
        params: {
          id: commentList[index].id,
        }
      });
      const updatedCommentList = [...commentList];
      updatedCommentList.splice(index, 1);
      setCommentList(updatedCommentList);
      setCommentCount(commentCount - 1);

      Swal.fire({
        title: "삭제 완료",
        text: "댓글을 삭제했어요.",
        confirmButtonText: "확인",
        customClass: {
          title: "swal-title",
          htmlContainer: "swal-text-container",
          confirmButton: "swal-button swal-button-confirm",
        },
      });
    } catch (error) {
      console.error('Error deleting comment:', error);
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
            setLikeUserModalOpen(true)
          }}>
            좋아요 {likeCount}</span>
        </div>
        <div className="button comment">
          <img src="/images/icon/comment.svg" alt="comment" />
          <span className="count">댓글 {commentCount}</span>
        </div>
      </ButtonContainer>
      <CommentList className="comment-list item">
        {!commentLoading && commentList.map((comment, index) => (
          <CommentListItem key={comment.id}>
            <div className="profile-image">
              <img src={comment.user?.profileImageUrl || defaultProfileImage} alt="profile" onError={(e) => e.target.src = defaultProfileImage} />
            </div>
            <div className="comment-content">
              <div className="info">
                <span className="username">{comment.user?.username} {updateIndex === index && '(수정 중)'}</span>
                <span className="date">{calculateDate(comment.createdAt)} 전</span>
              </div>
              {updateIndex === index ?
                <textarea className="update-input" value={updateContent} onChange={(e) => setUpdateContent(e.target.value)} /> :
                <span className="comment">{comment.content}</span>
              }
            </div>
            {(checkMyComment(comment) && updateIndex !== index) &&
              <div className="button-wrap">
                <div className="button" onClick={() => handleUpdateButton(index)}>수정</div>
                <div className="button" onClick={() => handleDeleteComment(index)}>삭제</div>
              </div>}
            {(checkMyComment(comment) && updateIndex === index) &&
              <div className="button-wrap">
                <div className="button" onClick={() => setUpdateIndex(-1)}>취소</div>
                <div className="button" onClick={() => handleUpdateComment(index)}>확인</div>
              </div>}
          </CommentListItem>
        ))}
        {commentLoading && <div className="loading">댓글 불러오는 중...</div>}
        {!commentLoading && !commentList.length && <div className="loading">댓글이 없습니다.</div>}
        {hasNext &&
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <Button size="small" onClick={() => setPage(page + 1)}>더 불러오기</Button>
          </div>}
      </CommentList>
      <CommentWrite className="comment-write item">
        <div className="profile-image">
          <img src={user?.profileImageUrl} alt="profile" />
        </div>
        <textarea className="comment-input" placeholder="댓글 작성하기" value={input} onChange={(e) => setInput(e.target.value)} />
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
    margin-bottom: 8px;
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
    width: 100%;
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

  & .update-input {
    font-size: 16px;
    border: none;
    border-bottom: 1px solid var(--light-gray);
    padding: 4px;
    width: 100%;
    outline: none;
    resize: none;
    font-family: inherit;
    height: 60px;
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

  & .comment-input {
    flex-grow: 1;
    height: 60px;
    padding: 0 12px;
    border: none;
    border-bottom: 1px solid var(--light-gray);
    outline: none;
    font-size: 16px;
    font-family: inherit;
    resize: none;
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