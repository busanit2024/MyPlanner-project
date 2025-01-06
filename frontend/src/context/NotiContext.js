import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";

export const NotiContext = createContext();

export const NotiProvider = ({ children }) => {
  const { user, loading } = useAuth();
  const [notifications, setNotifications] = useState({
    invite: [],
    noti: [],
  });
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user && !loading) {
      subscribeToNotifications();
    }
  }, [user, loading]);

  useEffect(() => {
    const getUnreadCount = () => {
      const unread = notifications.invite.filter((noti) => !noti.read).length + notifications.noti.filter((noti) => !noti.read).length;
      console.log("unread", unread);
      setUnreadCount(unread);
    }
    if (notifications.invite.length > 0 || notifications.noti.length > 0) {
      getUnreadCount();
    }
  }, [notifications]);


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
    <NotiContext.Provider value={{ notifications, unreadCount, setUnreadCount, clearNotiList }}>
      {children}
    </NotiContext.Provider>
  )
}

export const useNoti = () => {
  return useContext(NotiContext);
}