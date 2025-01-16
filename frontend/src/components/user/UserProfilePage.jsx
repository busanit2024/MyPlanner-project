import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";
import Button from "../../ui/Button";
import { useAuth } from "../../context/AuthContext";
import Swal from "sweetalert2";
import Chip from "../../ui/Chip";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { generateISOString } from "../../util/generateISOString";
import { getTextColor } from "../../util/getTextColor";

const defaultProfileImageUrl = "/images/default/defaultProfileImage.png";

export const goToChat = async (user, targetUser, navigate) => {
  try {
    // 기존 채팅방 확인
    const response = await axios.get(`/api/chat/rooms/user/${user.email}`);
    const chatRooms = response.data;

    // Individual 타입의 채팅방 중 현재 선택된 사용자와의 채팅방 찾기
    const existingRoom = chatRooms.find(room =>
      room.chatRoomType === "INDIVIDUAL" &&
      room.participants.some(p => p.email === targetUser.email)
    );

    if (existingRoom) {
      // 기존 채팅방이 있으면 해당 채팅방으로 이동
      const otherUser = {
        email: targetUser.email,
        name: targetUser.username,
        profileImage: targetUser.profileImageUrl || defaultProfileImageUrl
      };

      navigate('/chat', {
        state: {
          initialRoom: {
            ...existingRoom,
            participants: existingRoom.participants.map(p =>
              p.email === targetUser.email
                ? { ...p, name: targetUser.username, profileImage: targetUser.profileImageUrl || defaultProfileImageUrl }
                : p
            )
          },
          initialPartner: otherUser
        }
      });
    } else {
      // 새로운 채팅방 생성
      const chatRoomRequest = {
        participantIds: [
          {
            email: user.email,
            name: user.username,
            profileImage: user.profileImageUrl || defaultProfileImageUrl,
            status: "ACTIVE"
          },
          {
            email: targetUser.email,
            name: targetUser.username,
            profileImage: targetUser.profileImageUrl || defaultProfileImageUrl,
            status: "ACTIVE"
          }
        ],
        chatroomTitle: targetUser.username,
        chatroomType: "INDIVIDUAL"
      };

      const newRoomResponse = await axios.post('/api/chat/rooms', chatRoomRequest);
      const newRoom = newRoomResponse.data;

      navigate('/chat', {
        state: {
          initialRoom: newRoom,
          initialPartner: {
            email: targetUser.email,
            name: targetUser.username,
            profileImage: targetUser.profileImageUrl || defaultProfileImageUrl
          }
        }
      });
    }
  } catch (error) {
    console.error('채팅방 생성/조회 실패:', error);
    Swal.fire({
      title: "오류",
      text: "채팅방을 열 수 없습니다. 다시 시도해주세요.",
      icon: "error",
    });
  }
};

export default function UserProfilePage() {
  const { userId } = useParams();
  const { user, loading } = useAuth();
  const [pageUser, setPageUser] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followsMe, setFollowsMe] = useState(false);
  const navigate = useNavigate();
  const calendarContainerRef = useRef(null); // 캘린더 컨테이너 ref
  const calendarRef = useRef(null); // 캘린더 ref
  const [weekendsVisible, setWeekendsVisible] = useState(true); // 주말 표시 여부 상태
  const [currentEvents, setCurrentEvents] = useState([]); // 현재 표시 중인 이벤트 상태
  const [eventList, setEventList] = useState([]); // 서버에서 가져온 이벤트 목록 상태
  const [isResizing, setIsResizing] = useState(false); // 크기 변경 중인지 여부
  const resizeTimeout = useRef(null); // 크기 변경 타임아웃 ref
  // 팔로우 유저 리스스트 상태
  const [followingList, setFollowingList] = useState([]);
  const [followingListState, setFollowingListState] = useState({
    page: 0,
    hasNext: false,
  });




  useEffect(() => {
    axios.get(`/api/user/${userId}`)
      .then(res => {
        console.log(res.data);
        setPageUser(res.data);
      })
      .catch(err => {
        console.error(err);
      });
  }, [userId]);

  useEffect(() => {
    if (!loading && user && pageUser) {
      checkFollow();
      checkFollowsMe();
    }
  }, [user, loading, pageUser]);

  const checkFollow = () => {
    const pageUserFollowers = pageUser?.followers ?? [];
    const isFollow = pageUserFollowers.some(follower => follower === user?.id);
    setIsFollowing(isFollow);
  }

  const checkFollowsMe = () => {
    const followers = user?.followers ?? [];
    const follows = followers.some(follower => follower === pageUser?.id);
    setFollowsMe(follows);
  }

  const onFollow = () => {
    if (loading || !user) {
      return;
    }

    const userId = user?.id;
    const targetUserId = pageUser?.id;

    if (isFollowing) {
      return;
    }

    axios.get(`/api/user/follow`, { params: { userId, targetUserId } })
      .then(res => {
        console.log(`follow id ${targetUserId}`, res.data);
        setIsFollowing(true);
      })
      .catch(err => {
        console.error(err);
      });
  }

  const onUnfollow = () => {
    if (loading || !user) {
      return;
    }

    const userId = user?.id;
    const targetUserId = pageUser?.id;

    if (!isFollowing) {
      return;
    }

    axios.get(`/api/user/unfollow`, { params: { userId, targetUserId } })
      .then(res => {
        console.log(`unfollow id ${targetUserId}`, res.data);
        setIsFollowing(false);
      })
      .catch(err => {
        console.error(err);
      });
  }


  const fetchCalendarData = (userId) => {
    let eventList = [];
    axios.get(`/api/schedules/user/${userId}`) // 적절한 엔드포인트 호출
      .then((response) => {
        const newEvents = response.data.map((item) => ({
          id: item.id,
          title: item.title || '제목 없는 일정',
          allDay: item.allDay,
          start: generateISOString(item.startDate, item.startTime),
          end: generateISOString(item.endDate, item.endTime),
          backgroundColor: item.category?.color || 'var(--light-gray)',
          borderColor: 'transparent',
          textColor: getTextColor(item.category?.color),
          classNames: [`${item.done ? 'done' : ''}`, `color-${getTextColor(item.category?.color)}`],
        }));
        console.log('userId:', userId); // 디버깅 로그
        console.log('Fetched events:', newEvents); // 디버깅 로그
        if (userId !== user?.id) {
          // 비공개 일정 필터링
          eventList = newEvents.filter((event) => response.data.find((item) => item.id === event.id).isPrivate === false);
        } else {
          eventList = newEvents;
        }

        setEventList(eventList); // 이벤트 목록 상태 업데이트
      })
      .catch((error) => {
        console.error('Error fetching user schedules:', error);
      });
  };

  useEffect(() => {
    // 캘린더 데이터 가져오기
    if (user) {
      fetchCalendarData(userId);
    }
  }, [user]);

  const handleUnfollowButton = () => {
    Swal.fire({
      title: "언팔로우하기",
      text: "이 회원을 언팔로우하시겠어요?",
      showCancelButton: true,
      confirmButtonText: "언팔로우",
      cancelButtonText: "취소",
      customClass: {
        //App.css에 정의된 클래스 사용
        title: "swal-title",
        htmlContainer: "swal-text-container",
        confirmButton: "swal-button swal-button-danger",
        cancelButton: "swal-button swal-button-cancel",
      },
    }).then((result) => {
      if (result.isConfirmed) {
        onUnfollow();
      }
    });
  }

  const handleMessageButton = (e) => {
    e.stopPropagation();
    goToChat(user, pageUser, navigate);
  }


  function renderEventContent(eventInfo) {
    return (
      <>
        <b>{eventInfo.timeText}</b> {/* 이벤트 시간 */}
        <i>{eventInfo.event.title}</i> {/* 이벤트 제목 */}
      </>
    );
  }


  // 일정 클릭 시 업데이트 페이지 이동
  function handleEventClick(clickInfo) {
    // 이벤트 ID를 이용해 CalendarUpdate로 이동
    const eventId = clickInfo.event.id;
    const eventData = {
      id: eventId,
      title: clickInfo.event.title,
      start: clickInfo.event.start,
      end: clickInfo.event.end,
    };
    navigate(`/schedule/${eventId}`, {
      state: { eventData }
    });
  }


  function handleEvents(events) {
    setCurrentEvents(events); // 현재 표시 중인 이벤트 목록 상태 업데이트
  }

  const handleDayCellContent = (arg) => {
    // 달력 셀의 날짜 포맷 조정 (ex. '1일' -> '1')
    const dayNumber = arg.dayNumberText.replace("일", "");
    return dayNumber;
  };




  useEffect(() => {
    //컨테이너 사이즈 변경 시 캘린더 크기 업데이트
    if (!calendarContainerRef.current || !calendarRef.current) return;

    const calendarApi = calendarRef.current.getApi();

    const handleResize = () => {
      if (!isResizing) {
        setIsResizing(true);
      }

      if (resizeTimeout.current) {
        clearTimeout(resizeTimeout.current);
      }

      resizeTimeout.current = setTimeout(() => {
        setIsResizing(false);
        calendarApi.updateSize();
      }, 100);
    };

    const resizeObserver = new ResizeObserver(() => { handleResize(); });
    resizeObserver.observe(calendarContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      if (resizeTimeout.current) {
        clearTimeout(resizeTimeout.current);
      };
    };
  }, [calendarContainerRef, calendarRef, isResizing]);


  return (
    <Container className="user-profile-page">
      <UserInfoContainer className="user-info-container">
        <LeftContainer className="left-container">
          <div className="profileImage">
            <img src={pageUser?.profileImageUrl || defaultProfileImageUrl} onError={(e) => e.target.src = defaultProfileImageUrl} alt="profile" />
          </div>
          <div className="info">
            <div className="nameContainer">
              <div className="username">{pageUser?.username}</div>
              <div className="email">{pageUser?.email}</div>
              {followsMe && <Chip size="small">나를 팔로우함</Chip>}
            </div>
            <div className="bio">{pageUser?.bio}</div>
          </div>

        </LeftContainer>
        <RightContainer className="right-container">
          {isFollowing && <>
            <div className="button" onClick={handleMessageButton}>
              <img src="/images/icon/message.svg" alt="message" />
            </div>
            <Button onClick={handleUnfollowButton}>팔로잉</Button>
          </>}
          {(!isFollowing && followsMe) &&
            <Button color="primary" onClick={onFollow}>맞팔로우하기</Button>
          }
          {(!isFollowing && !followsMe) &&
            <Button color="primary" onClick={onFollow}>팔로우하기</Button>
          }
        </RightContainer>
      </UserInfoContainer>
      <UserDataContainer className="user-data-container">

      </UserDataContainer>
      <CalendarWrap ref={calendarContainerRef}>
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]} // 플러그인 설정
          headerToolbar={{
            left: 'prev,next today', // 헤더 왼쪽 버튼
            center: 'title', // 헤더 중앙 제목
            right: 'dayGridMonth,timeGridWeek,timeGridDay', // 헤더 오른쪽 버튼
          }}
          buttonText={{
            today: '오늘', // 오늘 버튼
            month: '월간', // 월간 버튼
            week: '주간', // 주간 버튼
            day: '일간', // 일간 버튼
          }}
          initialView="dayGridMonth" // 초기 뷰 설정 (월간 뷰)
          editable={false} // 이벤트 편집 가능
          selectable={true} // 달력 셀 선택 활성화
          selectMirror={true} // 선택 미러링 활성화
          dayMaxEvents={true} // 하루에 표시할 최대 이벤트 수
          displayEventTime={false} // 이벤트 시간 표시 비활성화
          weekends={weekendsVisible} // 주말 표시 여부
          eventContent={renderEventContent} // 사용자 정의 이벤트 내용 렌더링
          eventClick={handleEventClick} // 이벤트 클릭 핸들러
          eventsSet={handleEvents} // 이벤트 상태 변경 핸들러
          events={eventList} // 이벤트 데이터
          locale="ko" // 한국어 로케일
          dayCellContent={handleDayCellContent} // 달력 셀 내용 핸들러
          eventDisplay='block'
          eventMouseEnter={(arg) => { arg.el.style.cursor = 'pointer'; }}
          eventMouseLeave={(arg) => { arg.el.style.cursor = 'default'; }}
        />
      </CalendarWrap>
    </Container>
  );
}

const Container = styled.div`
    display: flex;
  flex-direction: column;
  width: 100%;
  box-sizing: border-box;
  padding: var(--layout-padding);
`;

const UserInfoContainer = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  border-bottom: 1px solid var(--light-gray);
  padding: 24px 48px;
`;

const LeftContainer = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 24px;

  & .profileImage {
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

  & .info {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  & .nameContainer {
    display: flex;
    align-items: center;
    gap: 12px;

    & .username {
      font-size: 18px;
      font-weight: bold;
    }

    & .email {
      font-size: 16px;
      color: var(--mid-gray);
    }

  }

  & .bio {
    font-size: 16px;
  }

`;

const RightContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 24px;

  & .button {
    width: 36px;
    height: 36px;
    cursor: pointer;
    
    & img {
      width: 100%;
      height: 100%;
    }
  }
`;

const UserDataContainer = styled.div`
  display: flex;
  gap: 24px;
  padding: 24px 48px;
`;

const CalendarWrap = styled.div`
  position: relative;
  margin-bottom: 24px;
  padding: 0 24px;
`;
