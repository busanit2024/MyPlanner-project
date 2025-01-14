import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useAuth } from "./AuthContext";
import axios from "axios";

export const NotiContext = createContext();

export const NotiProvider = ({ children }) => {
  const { user, loading } = useAuth();
  const [notifications, setNotifications] = useState({
    invite: [],
    noti: [],
  });
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadChatCount, setUnreadChatCount] = useState(0); // 채팅 알림
  const unreadCountRef = useRef(unreadCount);


  useEffect(() => {
    if (user && !loading) {
      subscribeToNotifications();
      fetchUnreadCount();
      fetchUnreadChatCount();
    }
  }, [user, loading]);

  useEffect(() => {
    unreadCountRef.current = unreadCount;
  }, [unreadCount]);

  useEffect(() => {
    const getUnreadCount = () => {
      const unread = notifications.invite.filter((noti) => !noti.read).length + notifications.noti.filter((noti) => !noti.read).length;
      setUnreadCount(unreadCountRef.current + unread);
    }
    if (notifications.invite.length > 0 || notifications.noti.length > 0) {
      getUnreadCount();
    }
  }, [notifications]);

  const fetchUnreadCount = () => {
    axios.get("/api/notification/unreadCount", { params: { userId: user.id } })
        .then (res => {
          console.log("unreadCount", res.data);
          setUnreadCount(res.data);
        })
        .catch(err => {
          console.error(err);
        });
  }

  // 채팅 알림
  const fetchUnreadChatCount = async () => {
    try {
        // user가 없거나 loading 중일 때는 실행하지 않음
        if (!user?.email) return;

        const response = await axios.get(`/api/chat/rooms/unread/${user.email}`);
        if (response.status === 200) {
            const totalUnread = Object.values(response.data).reduce((a, b) => a + b, 0);
            setUnreadChatCount(totalUnread);
        }
    } catch (error) {
        // 400 에러 발생 시 조용히 처리
        if (error.response?.status === 400) {
            console.warn('채팅 알림 카운트 가져오기 실패');
            setUnreadChatCount(0);
        } else {
            console.error('채팅 알림 에러:', error);
        }
    }
  };

  const clearNotiList = () => {
    setNotifications({
      invite: [],
      noti: [],
    });
  }

  const subscribeToNotifications = () => {
    console.log("subscribeToNotifications");
    const eventSource = new EventSource(`http://localhost:8080/api/notification/subscribe?userId=${user.id}`,
    );

    eventSource.onopen = () => {
      console.log("SSE opened");
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("data", data);

        setNotifications((prev) => {
          const newInvite = [...prev.invite];
          const newNoti = [...prev.noti];

          if (data.type === "INVITE") {
            const idx = newInvite.findIndex((item) => item.id === data.id);
            if (idx === -1) {
              newInvite.unshift(data);
            } else if (newInvite[idx].read && !data.read) {
              newInvite[idx] = data;
            }
          } else {
            const idx = newNoti.findIndex((item) => item.id === data.id);
            console.log(idx);
            if (idx === -1) {
              newNoti.unshift(data);
            } else if (newNoti[idx].read && !data.read) {
              newNoti[idx] = data;
            }
          }

          return {
            invite: newInvite,
            noti: newNoti,
          };
        });

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

  return (
    <NotiContext.Provider value={{ notifications, unreadCount, setUnreadCount, clearNotiList, unreadChatCount, setUnreadChatCount }}>
      {children}
    </NotiContext.Provider>
  )
}

export const useNoti = () => {
  return useContext(NotiContext);
}