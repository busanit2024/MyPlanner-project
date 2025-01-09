import styled from "styled-components";

export default function GroupBoardItem({ board }) {
  return (
    <Container className="group-board-item">
      <BoardInfo className="board-info">
        <div className="title">제목</div>
        <div className="content">내용</div>
        <div className="authorAndDate">
          <span className="author">작성자</span>
          <span className="date">2025-00-00</span>
        </div>
      </BoardInfo>

      <ButtonGroup className="button-group">
        <div className="button like">
          <img src="/images/icon/heartEmpty.svg" alt="like" />
        </div>
        <div className="button comment">
          <img src="/images/icon/comment.svg" alt="comment" />
        </div>
      </ButtonGroup>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  padding: 12px;
  border-bottom: 1px solid var(--light-gray);

  &:last-of-type {
    border-bottom: none;
  }

`;

const BoardInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  cursor: pointer;

  &:hover .title {
    color: var(--mid-gray);
  }

  & .title {
    font-size: 18px;
    font-weight: bold;
  }

  & .content {
    font-size: 16px;
    -webkit-line-clamp: 2;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  & .authorAndDate {
    display: flex;
    gap: 12px;
  }

  & .date {
    color: var(--mid-gray);
  }


`;


const ButtonGroup = styled.div` 
  display: flex;
  gap: 48px;
  flex-shrink: 0;

  & .button {
    width: 28px;
    height: 28px;
    cursor: pointer;

    & img {
      width: 100%;
      height: 100%;
    }
  }
`;