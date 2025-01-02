import styled from "styled-components";
import NotiListItem from "./NotiListItem";

export default function NotificationPage() {
  return (
    <Container>
      <InnerContainer>
        <h2 className="title">일정 초대</h2>
        <NotiListItem />
        <NotiListItem />


      </InnerContainer>
      <InnerContainer>
        <h2 className="title">반응</h2>
        <NotiListItem />
        <NotiListItem />

      </InnerContainer>
    </Container>
  );

}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  padding: var(--layout-padding);
  box-sizing: border-box;
`;

const InnerContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 100%;
  padding: 24px 48px;
  box-sizing: border-box;

  &:first-of-type {
    padding-top: 0
  }

  &:last-of-type {
    border-top: 1px solid var(--light-gray);
  }

  & .title {
    font-size: 24px;
    font-weight: bold;
  }
`;