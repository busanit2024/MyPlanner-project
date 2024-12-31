import styled from "styled-components";
import Button from "../../ui/Button";

export default function NotiListItem(props) {

  return (
    <Container className="noti-list-item">
      <div className="content">
        <Avatar>
          <img src="/images/default/defaultProfileImage.png" alt="profile" />
        </Avatar>
      </div>

      <div className="button-group">
        <Button size="small" >거절</Button>
        <Button color="primary" size="small">수락</Button>
      </div>

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