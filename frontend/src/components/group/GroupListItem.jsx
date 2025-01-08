import styled from "styled-components";

const defaultGroupImageUrl = "/images/default/defaultGroupImage.png";
export default function GroupListItem({ group, onClick }) {
  return(
    <Container src={group?.ImageUrl} onClick={onClick}>
      <GroupHeader>
        <div className="group-image">
          <img src={group?.profileImageUrl || defaultGroupImageUrl} alt="그룹 이미지" onError={(e) => e.target.src=defaultGroupImageUrl} />
        </div>
        <div className="group-name">{group?.name ?? "그룹명"}</div>
      </GroupHeader>
      <GroupInfo>
        <span className="next-schedule">다음 일정</span>
        <div className="schedule-info">
          <span className="date">{"2015-00-00"}</span>
          <span className="schedule-title">{"일정 이름"}</span>
        </div>
      </GroupInfo>

    </Container>

  );
}

const Container = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 100%;
  height: 240px;
  padding: 36px;
  box-sizing: border-box;
  border-radius: 8px;
  cursor: pointer;
  background-image: url(${(props) => props.src});
  background-size: cover;
  background-position: center;
  background-color: #fff;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.1);
    z-index: 1;
  }

  & > * {
    position: relative;
    z-index: 2;
  }
`;

const GroupHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;

  & .group-image {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    background-color: var(--light-gray);

    & img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      object-fit: cover;
    }
  }

  & .group-name {
    font-size: 18px;
    font-weight: bold;
  }
`;

const GroupInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;

  & .schedule-info {
    display: flex;
    gap: 4px;
  }

  & .next-schedule {
    font-size: 16px;
    font-weight: bold;
  } 

  & .date {
    color: var(--mid-gray);
  }
`;