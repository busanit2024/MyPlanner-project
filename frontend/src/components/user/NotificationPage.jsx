import styled from "styled-components";
import NotiListItem from "./NotiListItem";
import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import Button from "../../ui/Button";

export default function NotificationPage() {
  const size = 10;
  const { user, loading } = useAuth();
  const [notiList, setNotiList] = useState({
    invite: [],
    noti: [],
  });
  const [isloading, setLoading] = useState({
    invite: true,
    noti: true,
  });
  const [page, setPage] = useState({
    invite: 0,
    noti: 0,
  });
  const [hasNext, setHasNext] = useState({
    invite: false,
    noti: false,
  });

  useEffect(() => {
    if (!user && !loading) {
      return;
    }

    if (user) {
      subscribeToNotifications();
      fetchInviteList();
      fetchNotiList();
    }
  }, [user, loading]);


  const subscribeToNotifications = () => {
    console.log("subscribeToNotifications");
    const eventSource = new EventSource(`http://localhost:8080/api/notification/subscribe?userId=${user.id}`,
    );

    eventSource.onopen = () => {
      console.log("SSE opened");
    };

    eventSource.onmessage = (event) => {
      console.log("event", event);
      try {
        const data = JSON.parse(event.data);
        console.log("data", data);
        if (data.type === "INVITE") {
          setNotiList((prev) => ({
            ...prev,
            invite: [data, ...prev.invite],
          }));
        } else {
          setNotiList((prev) => ({
            ...prev,
            noti: [data, ...prev.noti],
          }));
        }
      } catch (error) {
        console.log("EventStream Created");
      }
    };

    eventSource.onerror = (error) => {
      console.error("SSE error", error);
      eventSource.close();
    }

    return () => {
      eventSource.close();
    }

  };

  const fetchNotiList = async () => {
    setLoading((prev) => ({ ...prev, noti: true }));
    try {
      const res = await axios.get("/api/user/notification", {
        params: {
          userId: user.id,
          type: "noti",
          page: page.noti,
          size: size,
        },
      });
      setNotiList((prev) => ({
        ...prev,
        noti: [...prev.noti, ...res.data.content],
      }));
      setHasNext((prev) => ({ ...prev, noti: res.data.hasNext }));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading((prev) => ({ ...prev, noti: false }));
    }
  }

  const fetchInviteList = async () => {
    setLoading((prev) => ({ ...prev, invite: true }));
    try {
      const res = await axios.get("/api/user/notification", {
        params: {
          userId: user.id,
          type: "invite",
          page: page.invite,
          size: size,
        },
      });
      setNotiList((prev) => ({
        ...prev,
        invite: [...prev.invite, ...res.data.content],
      }));
      setHasNext((prev) => ({ ...prev, invite: res.data.hasNext }));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading((prev) => ({ ...prev, invite: false }));
    }
  }


  return (
    <Container>
      <InnerContainer>
        <h2 className="title">일정 초대</h2>
        {isloading.invite && <p>로딩중...</p>}
        {notiList.invite.length === 0 && !isloading.invite && <p>받은 초대가 없어요.</p>}
        {notiList.invite.map((invite) => (
          <NotiListItem key={invite.id} data={invite} />
        ))}

        <div className="button-wrap">
        {hasNext.invite && (<Button onClick={() => setPage((prev) => ({ ...prev, invite: prev.invite + 1 }))}>더보기</Button>)}
        </div>
      </InnerContainer>
      <InnerContainer>
        
        <h2 className="title">반응</h2>
        {isloading.noti && <p>로딩중...</p>}
        {notiList.noti.length === 0 && !isloading.noti && <p>받은 알림이 없어요.</p>}
        {notiList.noti.map((noti) => (
          <NotiListItem key={noti.id} data={noti} />
        ))}
<div className="button-wrap">
        {hasNext.noti && (<Button onClick={() => setPage((prev) => ({ ...prev, noti: prev.noti + 1 }))}>더보기</Button>)}
</div>
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

  & .button-wrap {
    display: flex;
    justify-content: center;
  }

  & p {
    text-align: center;
    margin: 0;
  }
`;