import styled from "styled-components";
import NotiListItem from "./NotiListItem";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import Button from "../../ui/Button";
import { useNoti } from "../../context/NotiContext";
import { useLocation, useNavigate } from "react-router-dom";

export default function NotificationPage() {
  const size = 10;
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { notifications, setUnreadCount, clearNotiList } = useNoti();
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
    // 페이지 이동시 실시간 알림 초기화

    return () => {
      clearNotiList();
    };

  }, []);

  useEffect(() => {
    if (!loading && user) {
      fetchInviteList();
      fetchNotiList();
    }
  }, [user, loading]);


  useEffect(() => {
    if (isloading.invite || isloading.noti) {
      return;
    }
    if (notifications.invite.length > 0 || notifications.noti.length > 0) {
      const newInvite = [...notiList.invite];
      const newNoti = [...notiList.noti];

      notifications.invite.forEach((noti) => {
        const idx = newInvite.findIndex((item) => item.id === noti.id);
        if (idx === -1) {
          newInvite.push(noti);
        } else if (newInvite[idx].read && !noti.read) {
          newInvite[idx] = noti;
        }
      });

      notifications.noti.forEach((noti) => {
        const idx = newNoti.findIndex((item) => item.id === noti.id);
        if (idx === -1) {
          newNoti.push(noti);
        } else if (newNoti[idx].read && !noti.read) {
          newNoti[idx] = noti;
        }
      });

      setNotiList({
        invite: newInvite,
        noti: newNoti,
      });

      console.log("new notifications", newInvite, newNoti);
      
    }
  }, [notifications, isloading]);


  const fetchNotiList = async () => {
    setLoading((prev) => ({ ...prev, noti: true }));
    try {
      const res = await axios.get("/api/user/notification", {
        params: {
          userId: user.id,
          type: "noti",
          page: 0,
          size: page.noti * size + size,
        },
      });
      setNotiList((prev) => ({
        ...prev,
        noti: [...prev.noti, ...res.data.content],
      }));
      setHasNext((prev) => ({ ...prev, noti: !res.data.last }));
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
          page: 0,
          size: page.invite * size + size,
        },
      });
      setNotiList((prev) => ({
        ...prev,
        invite: [...prev.invite, ...res.data.content],
      }));
      setHasNext((prev) => ({ ...prev, invite: !res.data.last }));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading((prev) => ({ ...prev, invite: false }));
    }
  }


  const handleClick = (item) => {
    readNoti(item);
    const targetId = item.targetId;
    switch (item.type) {
      case "INVITE":
        navigate(`/schedule/${targetId}`);
        break;
      case "FOLLOW":
        navigate(`/user/${targetId}`);
        break;
      case "LIKE":
      case "COMMENT":
        navigate(`/schedule/${targetId}`);
        break;
      default:
        break;
    }
  };


  const readNoti = (item) => {
    if (item.read) {
      return;
    }
    axios.get(`/api/notification/read`, {
      params: {
        notificationId: item.id,
      }
    }).then((res) => {
      if (item.type === "INVITE") {
        setNotiList((prev) => ({
          ...prev,
          invite: prev.invite.map((noti) => {
            if (noti.id === item.id) {
              return { ...noti, read: true };
            }
            return noti;
          })
        }));
      } else {
        setNotiList((prev) => ({
          ...prev,
          noti: prev.noti.map((noti) => {
            if (noti.id === item.id) {
              return { ...noti, read: true };
            }
            return noti;
          })
        }));
      }
      setUnreadCount((prev) => prev - 1);
    }).catch((error) => {
      console.error(error);
    });
  };


  return (
    <Container>
      <InnerContainer>
        <h2 className="title">일정 초대</h2>
        {isloading.invite && <p>로딩중...</p>}
        {notiList.invite.length === 0 && !isloading.invite && <p>받은 초대가 없어요.</p>}
        {notiList.invite.map((invite) => (
          <NotiListItem key={invite.id} data={invite} onClick={() => handleClick(invite)} onReaction={() => readNoti(invite)} />
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
          <NotiListItem key={noti.id} data={noti} onClick={() => handleClick(noti)} />
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