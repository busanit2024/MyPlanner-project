import styled from "styled-components";
import Button from "../../ui/Button";

const defaultScheduleImageUrl = "/images/default/defaultScheduleImage.png";
export default function GroupScheduleItem({ schedule }) {
  return (
    <Container>
      <Left>
        <div className="schedule-image">
          <img src={schedule?.imageUrl ?? defaultScheduleImageUrl} onError={(e) => e.target.src = defaultScheduleImageUrl} alt="일정 이미지" />
        </div>
        <div className="schedule-info">
          <span className="title">일정 제목</span>
          <span className="date">2025-00-00</span>
          <span className="members">00명</span>
        </div>

      </Left>
      <Right>
        <Button color="primary">참여하기</Button>
      </Right>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 12px 0;
  cursor: pointer;

  &:hover img {
    transition: all 0.3s;
    transform: scale(1.1);
    filter: brightness(0.9);

  }
`;

const Left = styled.div`
  display: flex;
  gap: 24px;

  & .schedule-image {
    width: 100px;
    height: 100px;
    border-radius: 8px;
    background-color: var(--light-gray);
    overflow: hidden;

    & img {
      width: 100%;
      height: 100%;
      border-radius: 8px;
      object-fit: cover;
    }
  }

  & .schedule-info {
    display: flex;
    flex-direction: column;
    gap: 8px;

    & .title {
      font-size: 20px;
      font-weight: bold;
    }

    & .date {
      font-size: 16px;
      color: var(--mid-gray);
    }

    & .members {
      font-size: 16px;
    }
  }
`;

const Right = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;