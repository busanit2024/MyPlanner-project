import styled from "styled-components";
import Button from "../../ui/Button";
import { calculateDate } from "../../util/calculateDate";
import axios from "axios";

const defaultProfileImage = "/images/default/defaultProfileImage.png";

export default function NotiListItem(props) {
  const { data, onClick } = props;

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
      case "LIKE_POST":
      case "COMMENT":
      case "INVITE":
      default:
        return "";
    }
  }



  return (
    <Container className="noti-list-item" onClick={onClick}>
      <div className="content">
        <Avatar>
          <img src={data?.fromUser.profileImageUrl ?? defaultProfileImage} onError={(e) => e.target.src = defaultProfileImage} alt="profile" />
        </Avatar>

        <NotiText className={data?.read ? "read" : ""}>
          {makeText()}
          <span className="time"> {calculateDate(data?.updatedAt)} 전</span>
        </NotiText>
      </div>

      {data?.type === "INVITE" && <div className="button-group">
        <Button size="small" >거절</Button>
        <Button color="primary" size="small">수락</Button>
      </div>}

    </Container>
  )

}

const Container = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 16px 0px;
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

  &.read {
    color: var(--mid-gray);
  }
  
  & span {
    font-weight: bold;
  }

  & .time {
    font-weight: normal;
    color: var(--mid-gray);
  }
`;