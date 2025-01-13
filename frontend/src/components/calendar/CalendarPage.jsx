import React, { useEffect, useState } from 'react';
import { formatDate } from '@fullcalendar/core';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import "../../css/CalendarPage.css";
import axios from 'axios';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styled from 'styled-components';
import Radio from '../../ui/Radio';
import CategoryEditModal from './CategoryEditModal';

export default function CalendarPage() {
  const [weekendsVisible, setWeekendsVisible] = useState(true); // 주말 표시 여부 상태
  const [currentEvents, setCurrentEvents] = useState([]); // 현재 표시 중인 이벤트 상태
  const [eventList, setEventList] = useState([]); // 서버에서 가져온 이벤트 목록 상태
  const [categoryBoxOpen, setCategoryBoxOpen] = useState(false); // 카테고리 박스 오픈 상태
  const [categoryModalOpen, setCategoryModalOpen] = useState(false); // 카테고리 모달 오픈 상태
  const [selectedCategory, setSelectedCategory] = useState(new Set()); // 선택된 카테고리 id 목록 (set으로 중복 방지)
  const navigate = useNavigate(); // 페이지 이동을 위한 useNavigate
  const { user, loading } = useAuth(); // 인증된 사용자 정보 및 로딩 상태 가져오기
  const { id: calendarUserId } = useParams(); // URL의 사용자 ID
  const { state } = useLocation();
  const eventData = state?.eventData;

  // 팔로잉 유저 리스트 상태
  const [followingList, setFollowingList] = useState([]);
  const [followingListState, setFollowingListState] = useState({
    page: 0,
    hasNext: false,
  });

  const defaultProfileImageUrl = "/images/default/defaultProfileImage.png";
  const defaultProfileImage = "/images/default/defaultProfileImage.png"; // 기본 프로필 이미지 URL

  const ProfileImage = styled.div`
    width: 72px;
    height: 72px;
    border-radius: 50%;
    background-color: var(--light-gray);

    & img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
    }
  `;


  // useEffect(() => {
  //   // 인증되지 않은 사용자는 로그인 페이지로 이동
  //   if (!loading && !user) {
  //     navigate("/login");
  //   }
  //   console.log("user", user);

  //   // 인증된 사용자가 있다면 일정 데이터를 불러오기
  //   if (!loading && user) {
  //     setSelectedCategory(new Set(user.categories.map((category) => category.id))); // 초기 상태: 전체 카테고리 선택

  //     axios
  //       .get('/api/schedules?id=' + user.id) // 사용자 ID 기반으로 일정 데이터 요청
  //       .then((response) => {
  //         if (response.data) {
  //           console.log("response.data", response.data);

  //           // 서버에서 받은 데이터를 FullCalendar 이벤트 형식으로 변환
  //           const newEvents = response.data.map((item) => ({
  //             id: item.id,
  //             title: item.title,
  //             start: item.startDate,
  //             end: item.endDate,
  //           }));

  //           setEventList(newEvents); // 이벤트 목록 상태 업데이트
  //         }
  //       })
  //       .catch((error) => {
  //         console.error('Error fetching user schedules:', error); // 에러 처리
  //       });
  //   }
  // }, [user, loading]); // user와 loading 상태가 변경될 때 실행
  useEffect(() => {
    // 인증되지 않은 사용자는 로그인 페이지로 이동
    if (!loading && !user) {
      navigate("/login");
    }
    if (!loading && user) {
      // 초기값: 로그인 유저의 스케줄 정보 가져오기
      fetchSchedules(user.id);
      // 팔로잉 유저 리스트 가져오기
      fetchFollowingList(user.id);
    }
  }, [user, loading]);

  // 로그인한 유저의 스케줄 불러오기기
  const fetchSchedules = (userId) => {
    axios.get(`/api/schedules/user/${userId}`)
      .then((response) => {
        const events = response.data.map(schedule => ({
          id: schedule.id,
          title: schedule.title,
          start: schedule.startDate,
          end: schedule.endDate,
        }));
        setEventList(events);
      })
      .catch((error) => console.error('Error fetching schedules:', error));
  };
  
  useEffect(() => {
    // 캘린더 데이터 가져오기
    if (user && (calendarUserId || user.id)) {
      const targetUserId = calendarUserId || user.id; // 현재 캘린더를 볼 사용자 ID
      fetchCalendarData(targetUserId);
    }
  }, [calendarUserId, user]);


  // 팔로잉 유저 리스트 불러오기
const fetchFollowingList = () => {
  axios.get(`/api/user/following`, {
    params: {
      userId: user?.id,
      page: followingListState.page,
      size: 10,
    },
  })
    .then((res) => {
      console.log("Following List:", res.data.content); // 확인용 로그
      setFollowingList(res.data.content); // 팔로잉 유저 리스트 저장
      setFollowingListState((prev) => ({
        ...prev,
        hasNext: res.data.hasNext,
      }));
    })
    .catch((err) => {
      console.error(err);
    });
};

// useEffect에 추가
useEffect(() => {
  if (user) {
    fetchFollowingList();
  }
}, [user]);

 // 캘린더 데이터 가져오기
 const fetchCalendarData = (targetUserId) => {
  axios.get(`/api/schedules/user/${targetUserId}`) // 적절한 엔드포인트 호출
    .then((response) => {
      const newEvents = response.data.map((item) => ({
        id: item.id,
        title: item.title,
        start: item.startDate,
        end: item.endDate,
      }));
      console.log('Fetched events:', newEvents); // 디버깅 로그
      setEventList(newEvents);
    })
    .catch((error) => {
      console.error('Error fetching user schedules:', error);
    });
};


// 팔로잉 유저 클릭 핸들러
const handleFollowingUserClick = (userId) => {
  fetchSchedules(userId); // 선택한 유저의 캘린더 데이터 불러오기
};
  // 주말 표시 토글
  function handleWeekendsToggle() {
    setWeekendsVisible(!weekendsVisible);
  }

  // 일정 작성 페이지 이동
  function handleDateSelect(selectInfo) {
    // 날짜를 선택하면 일정 작성 페이지로 이동하고 선택된 날짜 전달
    navigate('/calendarWrite', { state: { startDate: selectInfo.startStr, endDate: selectInfo.endStr } });
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
    if (selectedCategory.has(categoryId)) {
      setSelectedCategory((prev) => {
        const newSelected = new Set(prev);
        newSelected.delete(categoryId);
        return newSelected;
      });
    } else {
      setSelectedCategory((prev) => new Set(prev).add(categoryId));
    }
  };

  return (
    <div className="demo-app-main">
      <div className='calendar-header'>
      <div className="calendar-page">
      <ProfileContainer>
      {followingList.map((followingUser) => (
          <UserCard key={followingUser.id} onClick={() => handleFollowingUserClick(followingUser.id)}>
            <img
              src={followingUser.profileImageUrl || defaultProfileImageUrl}
              alt="profile"
              onError={(e) => (e.target.src = defaultProfileImageUrl)} // 기본 이미지로 대체
            />
            <span>{followingUser.username}</span>
          </UserCard>
        ))}
      </ProfileContainer>
    </div>
        <CategoryWrap>
          {/* 카테고리 필터 */}
          <div className="filter-icon" onClick={() => setCategoryBoxOpen(!categoryBoxOpen)}>
            카테고리 필터 버튼 (임시로 배치함, 나중에 위치 변경해 주세요)
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

      </div>
      <div>
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]} // 플러그인 설정
          headerToolbar={{
            left: 'prev,next today', // 헤더 왼쪽 버튼
            center: 'title', // 헤더 중앙 제목
            right: 'dayGridMonth,timeGridWeek,timeGridDay', // 헤더 오른쪽 버튼
          }}
          initialView="dayGridMonth" // 초기 뷰 설정 (월간 뷰)
          editable={true} // 이벤트 편집 가능
          selectable={true} // 달력 셀 선택 활성화
          selectMirror={true} // 선택 미러링 활성화
          dayMaxEvents={true} // 하루에 표시할 최대 이벤트 수
          displayEventTime={false} // 이벤트 시간 표시 비활성화
          eventColor='#374983' // 이벤트 기본 색상
          weekends={weekendsVisible} // 주말 표시 여부
          select={handleDateSelect} // 날짜 선택 이벤트 핸들러
          eventContent={renderEventContent} // 사용자 정의 이벤트 내용 렌더링
          eventClick={handleEventClick} // 이벤트 클릭 핸들러
          eventsSet={handleEvents} // 이벤트 상태 변경 핸들러
          events={eventList} // 이벤트 데이터
          locale="ko" // 한국어 로케일
          dayCellContent={handleDayCellContent} // 달력 셀 내용 핸들러
        />
      </div>
      <div className="demo-app">
        <Sidebar
          weekendsVisible={weekendsVisible} // 주말 표시 여부 전달
          handleWeekendsToggle={handleWeekendsToggle} // 주말 표시 토글 핸들러 전달
          currentEvents={currentEvents} // 현재 이벤트 목록 전달
        />
      </div>
      {categoryModalOpen && <CategoryEditModal categories={user.categories} onClose={() => setCategoryModalOpen(false)} />}
    </div>
  );
}

function SidebarEvent({ event }) {
  return (
    <li>
      <b>{formatDate(event.start, { year: 'numeric', month: 'short', day: 'numeric' })}</b>
      <i>{event.title}</i>
    </li>
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

function Sidebar({ weekendsVisible, handleWeekendsToggle, currentEvents }) {
  return (
    <div className="demo-app-sidebar">
      <div className="demo-app-sidebar-section">
        <h2>안내</h2>
        <ul>
          <li>클릭해서 작성</li>
          <li>드래그 앤 드롭</li>
          <li></li>
        </ul>
      </div>
      <div className="demo-app-sidebar-section">
        <label>
          <input
            type="checkbox"
            checked={weekendsVisible} // 주말 표시 여부 체크박스
            onChange={handleWeekendsToggle} // 체크박스 변경 핸들러
          />
          주말 추가/제거 토글
        </label>
      </div>
      <div className="demo-app-sidebar-section">
        <h2>일정 ({currentEvents.length})</h2>
        <ul>
          {currentEvents.map((event) => (
            <SidebarEvent key={event.id} event={event} />
          ))}
        </ul>
      </div>
    </div>
  );
};

const CategoryWrap = styled.div`
position: relative;
flex-shrink: 0;
& .filter-icon {
  font-size: 12px;
  white-space: nowrap;
  height: 24px;
  display: flex;
  align-items: center;

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
  margin: 24px;

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

const FollowingList = styled.div`
  display: flex;
  gap: 16px;
  overflow-x: auto;
  padding: 16px 0;
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
  }

  span {
    font-size: 14px;
    text-align: center;
  }
`;