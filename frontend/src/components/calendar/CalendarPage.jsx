import React, { useEffect, useRef, useState } from 'react';
import { formatDate } from '@fullcalendar/core';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import "../../css/CalendarPage.css";
import axios, { all } from 'axios';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styled from 'styled-components';
import Radio from '../../ui/Radio';
import CategoryEditModal from './CategoryEditModal';
import { getTextColor } from '../../util/getTextColor';
import { generateISOString } from '../../util/generateISOString';

export default function CalendarPage() {
  const [weekendsVisible, setWeekendsVisible] = useState(true); // 주말 표시 여부 상태
  const [currentEvents, setCurrentEvents] = useState([]); // 현재 표시 중인 이벤트 상태
  const [eventList, setEventList] = useState([]); // 서버에서 가져온 이벤트 목록 상태
  const [categoryBoxOpen, setCategoryBoxOpen] = useState(false); // 카테고리 박스 오픈 상태
  const [categoryModalOpen, setCategoryModalOpen] = useState(false); // 카테고리 모달 오픈 상태
  const [selectedCategory, setSelectedCategory] = useState(new Set()); // 선택된 카테고리 id 목록 (set으로 중복 방지)
  const [isMine, setIsMine] = useState(true); // 내 캘린더인지 여부
  const navigate = useNavigate(); // 페이지 이동을 위한 useNavigate
  const { user, loading } = useAuth(); // 인증된 사용자 정보 및 로딩 상태 가져오기
  const { id: calendarUserId } = useParams(); // URL의 사용자 ID
  const { state } = useLocation();
  const [selectedUserId, setSelectedUserId] = useState(null);
  const eventData = state?.eventData;
  const calendarContainerRef = useRef(null); // 캘린더 컨테이너 ref
  const calendarRef = useRef(null); // 캘린더 ref
  const [isResizing, setIsResizing] = useState(false); // 크기 변경 중인지 여부
  const resizeTimeout = useRef(null); // 크기 변경 타임아웃 ref
  const [eventChangeData, setEventChangeData] = useState(null); // 이벤트 변경 데이터
  const [followingList, setFollowingList] = useState([]);
  const [followingListState, setFollowingListState] = useState({
    page: 0,
    hasNext: false,
    total: 0,
    first: true,
    last: false,
  });

  const defaultProfileImageUrl = "/images/default/defaultProfileImage.png";

 

  useEffect(() => {
    setEventList([]); // 이벤트 목록 초기화
    // 캘린더 데이터 가져오기
    if (selectedUserId) {
      console.log("Fetching calendar data for user:", selectedUserId);
      fetchCalendarData(selectedUserId);
      setIsMine(user.id === selectedUserId);
    }
  }, [selectedUserId, selectedCategory], );
  
  


  // 팔로잉 유저 리스트 불러오기
  const fetchFollowingList = (userId, page = 0) => {
    console.log(`Fetching following list for user ${userId} at page ${page}`);
    axios.get(`/api/user/following`, {
      params: {
        userId: userId,
        page: page,
        size: 10, // 한 페이지에 가져올 팔로잉 유저의 수를 10으로 설정
      },
    })
      .then((res) => {
        console.log("Server Response:", res); // 서버 응답 전체를 출력
        console.log("res.data", res.data); // 서버 응답 전체를 출력
        console.log("Following List:", res.data.content); // 확인용 로그
        setFollowingList(res.data.content); // 팔로잉 유저 리스트 저장        
        setFollowingListState({
          page: page,
          hasNext: res.data.hasNext,
          total: res.data.totalElements, // 전체 유저 수 저장\
          first: res.data.first,
          last: res.data.last,
        });
        console.log("Updated followingListState:", { page, hasNext: res.data.hasNext, total: res.data.totalElements });
      })
      .catch((err) => {
        console.error(err);
      });
  };


useEffect(() => {
  const fetchData = async () => {
    // 인증되지 않은 사용자는 로그인 페이지로 이동
    if (!loading && !user) {
      navigate("/login");
    }
    if (!loading && user && user.id) {
      // 선택된 유저 ID를 로그인 유저로 초기화
      setSelectedUserId(user.id);
      setIsMine(true);
      // 팔로잉 유저 리스트 가져오기
      console.log("Fetching initial following list");
      fetchFollowingList(user.id, 0); // 초기 페이지를 0으로 설정하여 호출
      setSelectedCategory(new Set(user.categories.map((category) => category.id)));
    } else if (!loading && user && !user.id) {
      console.error("User ID is null or undefined");
      // Handle the error case, e.g., show an error message or navigate to an error page
    }
  }; 

  fetchData();
}, [user, loading]);

useEffect(() => {
  console.log("followingListState updated:", followingListState);
}, [followingListState]);

const handleNextPage = () => {
  console.log("Next page button clicked");
  if (!followingListState.last) {
    console.log("Fetching next page");
    fetchFollowingList(user.id, followingListState.page + 1);
  }
};

const handlePrevPage = () => {
  console.log("Previous page button clicked");
  if (!followingListState.first) {
    console.log("Fetching previous page");
    fetchFollowingList(user.id, followingListState.page - 1);
  }
};

// const handleNextPage = async () => {
//   console.log("Next page button clicked");
//   if (followingListState.hasNext) {
//     console.log("Fetching next page");
//     await fetchFollowingList(user.id, followingListState.page + 1);
//   }
// };

// const handlePrevPage = async () => {
//   console.log("Previous page button clicked");
//   if (followingListState.page > 0) {
//     console.log("Fetching previous page");
//     await fetchFollowingList(user.id, followingListState.page - 1);
//   }
// };

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


  const formatISOString = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();

    const offset = -date.getTimezoneOffset() / 60;
    const offsetString = offset >= 0 ? `+${offset}` : offset;
    return `${year}-${month < 10 ? '0' + month : month}-${day < 10 ? '0' + day : day}T${hours < 10 ? '0' + hours : hours}:${minutes < 10 ? '0' + minutes : minutes}:${seconds < 10 ? '0' + seconds : seconds}${offsetString}:00`;
  };

  useEffect(() => {
    // 이벤트 드래그 드롭으로 변경 시 업데이트
    const handleChangeEvent = (newEvent, oldEvent) => {

      if (!newEvent || !oldEvent) return;

      if (newEvent === oldEvent) return;

      const start = newEvent.startStr;
      const end = newEvent.endStr;

      console.log('Event changed:', start, end);

      //날짜 형식: 2021-09-01T00:00:00+09:00
      //Date 객체로 변환
      const newStartDate = new Date(start);
      const newEndDate = end ? new Date(end) : newStartDate;

      const formattedStartDate = formatISOString(newStartDate);
      let formattedEndDate = formatISOString(newEndDate);

      if (!newEvent.allDay && newStartDate === newEndDate) {
        newEndDate.setHours(newEndDate.getHours() + 1);
        formattedEndDate = formatISOString(newEndDate);
      }

      const newDateTime = {
        startDate: formattedStartDate.split('T')[0],
        startTime: formattedStartDate.split('T')[1].slice(0, 5),
        endDate: formattedEndDate.split('T')[0],
        endTime: formattedEndDate.split('T')[1].slice(0, 5),
        allDay: newEvent.allDay,
      };

      console.log('New datetime:', newDateTime);

      axios.put(`/api/schedules/${newEvent.id}/datetime`, newDateTime)
        .then((res) => {
          const updatedEvent = {
            id: res.data.id,
            title: res.data.title || '제목 없는 일정',
            allDay: res.data.allDay,
            start: generateISOString(res.data.startDate, res.data.startTime),
            end: generateISOString(res.data.endDate, res.data.endTime),
            backgroundColor: res.data.category?.color || 'var(--light-gray)',
            borderColor: 'transparent',
            textColor: getTextColor(res.data.category?.color),
            classNames: [`${res.data.done ? 'done' : ''}`, `color-${getTextColor(res.data.category?.color)}`],
          }
          setEventList((prev) => prev.map((event) => {
            if (event.id === updatedEvent.id) {
              return {
                ...event,
                start: updatedEvent.start,
                end: updatedEvent.end,
                allDay: updatedEvent.allDay,
              };
            }
            return event;
          }));
        })
        .catch((error) => {
          console.error('Error updating event datetime:', error);
        });

    };

    if (eventChangeData && isMine) {
      handleChangeEvent(eventChangeData.newEvent, eventChangeData.oldEvent);
    }
  }, [eventChangeData]);


  // 캘린더 데이터 가져오기
  const fetchCalendarData = async (targetUserId) => {
    setEventList([]); // 이벤트 목록 초기화
    let scheduleList = [];
    let participatedList = [];
  
    try {
      const response = await axios.get(`/api/schedules/user/${targetUserId}`);
      console.log('Fetched user schedules:', response.data); // 디버깅 로그
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
        category: item.category,
      }));
      console.log('Fetched events:', newEvents); // 디버깅 로그
  
      let filteredEvents = newEvents;
  
      if (targetUserId === user?.id) {
        // 선택된 카테고리로 필터링 (로그인된 유저의 경우에만)
        filteredEvents = newEvents.filter(event => event.category && selectedCategory.has(event.category.id));
        console.log("filteredEvents", filteredEvents);
      }
  
      if (targetUserId !== user?.id) {
        // 비공개 일정 필터링
        scheduleList = filteredEvents.filter((event) => response.data.find((item) => item.id === event.id).isPrivate === false);
      } else {
        scheduleList = filteredEvents;
      }
  
      // 참여한 일정 가져오기
      if (targetUserId === user?.id) {
        participatedList = await fetchParticipatedEvents();
      }
  
      // 이벤트 목록 업데이트
      setEventList([...scheduleList, ...participatedList]);
  
    } catch (error) {
      console.error('Error fetching user schedules:', error);
    }
  };

  const fetchParticipatedEvents = async () => {
    try {
      const response = await axios.get(`/api/schedules/${user.id}/participated`);
      const newEvents = response.data.map((item) => ({
        id: item.id,
        editable: false,
        title: item.title || '제목 없는 일정',
        allDay: item.allDay,
        start: generateISOString(item.startDate, item.startTime),
        end: generateISOString(item.endDate, item.endTime),
        backgroundColor: 'white',
        borderColor: 'var(--dark-gray)',
        textColor: 'var(--dark-gray)',
        classNames: [`${item.done ? 'done' : ''}`, `color-black`],
      }));
      console.log('Fetched participated events:', newEvents); // 디버깅 로그
      return newEvents;
    } catch (error) {
      console.error('Error fetching participated schedules:', error);
    }
  };



  // 팔로잉 유저 클릭 핸들러
  const handleFollowingUserClick = (userId) => {
    setSelectedUserId(userId); // 선택한 유저 ID 상태 업데이트
  };

  // 일정 작성 페이지 이동
  function handleDateSelect(selectInfo) {
    const { startStr, endStr } = selectInfo;

    const endDateAdjusted = new Date(endStr);
    // endStr를 강제로 하루 전으로 설정(FullCalendar의 특성상 endDate가 무조건 startDate의 하루 뒤가 되어버림)
    endDateAdjusted.setDate(endDateAdjusted.getDate() - 1);
    const adjustedEndDate = endDateAdjusted.toISOString().split('T')[0];  // YYYY-MM-DD 형식으로 조정

    // 날짜를 선택하면 일정 작성 페이지로 이동하고 선택된 날짜 전달
    navigate('/calendarWrite', {
      state: {
        startDate: startStr,
        endDate: adjustedEndDate
      }
    });
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

  // 전체 카테고리 선택 토글
  const selectAllCategoryToggle = (e) => {
    if (e.target.checked) {
      setSelectedCategory(new Set(user.categories.map((category) => category.id)));
    } else {
      setSelectedCategory(new Set());
    }
  };

  // 개별 카테고리 선택 토글
  const selectCategoryToggle = (e) => {
    const categoryId = parseInt(e.target.id);
    const category_checked = e.target.checked;

    setSelectedCategory((prev) => {
      const newSelected = new Set(prev);
      if (category_checked) {
        // checked = true이면 카테고리 리스트에 추가
        newSelected.add(categoryId);
      } else {
        // checked = false이면 카테고리 리스트에서 삭제
        newSelected.delete(categoryId);
      }
      return newSelected;
    });
  };


  return (
    <div className="demo-app-main calendar-page">
      {loading && <div className="no-result">로딩중...</div>}
      {!loading && (
        <>
          <div className='calendar-header'>
            <ProfileContainer>
            <PaginationButtons>
              <PaginationButton onClick={handlePrevPage} disabled={followingListState.first}>
                이전
                {console.log("Previous button disabled:", followingListState.page === 0)}
              </PaginationButton>
              
              <UserCard onClick={() => handleFollowingUserClick(user?.id)} selected={user?.id === selectedUserId}>
                <img
                  src={user?.profileImageUrl || defaultProfileImageUrl}
                  alt="profile"
                  onError={(e) => (e.target.src = defaultProfileImageUrl)} // 기본 이미지로 대체
                />
                <span>나</span>
              </UserCard>
              
              {followingList.map((followingUser) => (
                <UserCard key={followingUser.id} onClick={() => handleFollowingUserClick(followingUser.id)} selected={followingUser.id === selectedUserId}>                  
                  <img
                    src={followingUser.profileImageUrl || defaultProfileImageUrl}
                    alt="profile"
                    onError={(e) => (e.target.src = defaultProfileImageUrl)} // 기본 이미지로 대체
                  />                  
                  <span>{followingUser.username}</span>
                </UserCard>
              ))}
              
              <PaginationButton onClick={handleNextPage} disabled={followingListState.last}>
                다음
                {console.log("Next button disabled:", followingListState.last)}
              </PaginationButton>
            </PaginationButtons>        
            </ProfileContainer>
      </div>
      <CalendarWrap ref={calendarContainerRef}>
          {(selectedUserId == user.id) && (
            <CategoryWrap className="category-wrap">
          {/* 카테고리 필터 */}
          <div className="filter-icon" onClick={() => setCategoryBoxOpen(!categoryBoxOpen)}>
            카테고리
            <img src="/images/icon/filter.svg" alt="filter" />
          </div>
          {categoryBoxOpen && <div className="category-box">
            <div className='title'>카테고리</div>
            <CategoryLabel htmlFor="all">
              <input type="checkbox" id="all" name="category" className='category-check' onChange={selectAllCategoryToggle} checked={selectedCategory.size === user.categories.length}
              />
              <div className='color-box'>
                <img src="/images/icon/checkWhite.svg" alt="check" />
              </div>
              <span>전체</span>
            </CategoryLabel>
            {user.categories.map((category) => (
              <CategoryLabel key={category.id} htmlFor={category.id} color={category.color}>
                <input type="checkbox" id={category.id} name="category" className='category-check' onChange={selectCategoryToggle} checked={selectedCategory.has(category.id)} />
                <div className='color-box'>
                  <img src="/images/icon/checkWhite.svg" alt="check" />
                </div>
                <span>{category.categoryName}</span>
              </CategoryLabel>
            ))}
            <div className='category-button' onClick={() => setCategoryModalOpen(true)}>
              <img src="/images/icon/setting.svg" alt="plus" />
              <span>카테고리 편집...</span>
            </div>
          </div>}
        </CategoryWrap>
          )}
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
          editable={isMine} // 이벤트 수정 활성화
          eventStartEditable={isMine} // 이벤트 시작 시간 수정 활성화
          droppable={isMine} // 이벤트 드래그 앤 드롭 활성화
          selectable={isMine} // 달력 셀 선택 활성화
          selectMirror={true} // 선택 미러링 활성화
          dayMaxEvents={true} // 하루에 표시할 최대 이벤트 수
          displayEventTime={false} // 이벤트 시간 표시 비활성화
          weekends={true} // 주말 표시 여부
          select={handleDateSelect} // 날짜 선택 이벤트 핸들러
          eventContent={renderEventContent} // 사용자 정의 이벤트 내용 렌더링
          eventClick={handleEventClick} // 이벤트 클릭 핸들러
          eventsSet={handleEvents} // 이벤트 상태 변경 핸들러
          events={eventList} // 이벤트 데이터
          locale="ko" // 한국어 로케일
          dayCellContent={handleDayCellContent} // 달력 셀 내용 핸들러
          eventDisplay='block'
          eventMouseEnter={(arg) => { arg.el.style.cursor = 'pointer'; }}
          eventMouseLeave={(arg) => { arg.el.style.cursor = 'default'; }}
          eventLeave={(arg) => { setEventChangeData((prev) => ({ ...prev, oldEvent: arg.event })) }}
          eventReceive={(arg) => { setEventChangeData((prev) => ({ ...prev, newEvent: arg.event })) }}
          eventResize={(arg) => { setEventChangeData({ oldEvent: arg.oldEvent, newEvent: arg.event })}}
        />
      </CalendarWrap>
      {categoryModalOpen && <CategoryEditModal categories={user.categories} onClose={() => setCategoryModalOpen(false)} />}
      </>
      )}
    </div>
  );
}


function renderEventContent(eventInfo) {
  return (
    <>
      <b>{eventInfo.timeText}</b> {/* 이벤트 시간 */}
      <i>{eventInfo.event.title}</i> {/* 이벤트 제목 */}
    </>
  );
}


const CalendarWrap = styled.div`
  position: relative;
  margin-bottom: 24px;
`;

const CategoryWrap = styled.div`
position: absolute;

top: 4px;
right: 168px;


flex-shrink: 0;
& .filter-icon {
  font-size: 16px;
  white-space: nowrap;
  height: 36px;
  display: flex;
  align-items: center;
  cursor: pointer;

  & img {
    width: auto;
    height: 100%;
  }
}


& .category-box {
  position: absolute;
  top: 28px;
  right: 0;
  display: flex;
  flex-direction: column;
  min-width: 200px;
  white-space: nowrap;
  gap: 12px;
  padding: 24px;
  background-color: white;
  z-index: 100;
  border-radius: 4px;
  border: 1px solid var(--light-gray);

  & .title {
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 12px;
  }

  & label {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  & .category-button {
    margin-top: 12px;
    display: flex;
    align-items: center;
    gap: 4px;
    cursor: pointer;

    & img {
      width: 16px;
      height: 16px;
    }
  }
}
`;


const CategoryLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;

  & .color-box {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background-color: ${(props) => props.color ?? 'var(--light-gray)'};
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2px;
    box-sizing: border-box;
    cursor: pointer;

    & img {
      display: none;
      width: 100%;
      height: 100%;
    }
  }

  & input:checked + .color-box img {
    display: block;
  }

  & input {
    display: none;
  }

  & span {
    font-size: 16px;
  }
`;

// 스타일 컴포넌트
const ProfileContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  padding: 16px;
  justify-content: flex-start;
  width: 100%;
  margin-bottom: 16px; 

  & .item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    cursor: pointer;

    & .avatar {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background-color: var(--light-gray);

      & img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: 50%;
      }
    }

    & .username {
      font-size: 14px;
      color: var(--dark-gray);
    }
  }
`;

const UserCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;

  img {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    object-fit: cover;
    margin-bottom: 8px;
    outline: 2px solid ${(props) => (props.selected ? 'var(--primary-color)' : 'transparent')};
  }

  span {
    font-size: 14px;
    text-align: center;
  }
`;

const PaginationButtons = styled.div`
  display: flex;
  justify-content: flex-start;
  margin-top: 16px;
  gap: 10px;
`;

const PaginationButton = styled.button`
  background-color: var(--primary-color);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;

  &:disabled {
    background-color: var(--light-gray);
    cursor: not-allowed;
  }
`;