import React, { useEffect, useRef, useState } from 'react';
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
import { getTextColor } from '../../util/getTextColor';

export default function CalendarPage() {
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

  // 팔로잉 유저 리스트 상태
  const [followingList, setFollowingList] = useState([]);
  const [followingListState, setFollowingListState] = useState({
    page: 0,
    hasNext: false,
  });

  const defaultProfileImageUrl = "/images/default/defaultProfileImage.png";

  useEffect(() => {
    // 인증되지 않은 사용자는 로그인 페이지로 이동
    if (!loading && !user) {
      navigate("/login");
    }
    if (!loading && user) {
      // 선택된 유저 ID를 로그인 유저로 초기화
      setSelectedUserId(user.id);
      setIsMine(true);
      // 팔로잉 유저 리스트 가져오기
      fetchFollowingList(user.id);
      setSelectedCategory(new Set(user.categories.map((category) => category.id)));
    }
  }, [user, loading]);

  useEffect(() => {
    setEventList([]); // 이벤트 목록 초기화
    // 캘린더 데이터 가져오기
    if (selectedUserId) {
      fetchCalendarData(selectedUserId);
      setIsMine(user.id === selectedUserId);
    }
  }, [selectedUserId]);


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


  // 캘린더 데이터 가져오기
  const fetchCalendarData = async (targetUserId) => {
    setEventList([]); // 이벤트 목록 초기화
    let scheduleList = [];
    let participatedList = [];

    try {
      const response = await axios.get(`/api/schedules/user/${targetUserId}`);
      const newEvents = response.data.map((item) => ({
        id: item.id,
        title: item.title || '제목 없는 일정',
        start: item.startDate,
        end: item.endDate,
        backgroundColor: item.category?.color || 'var(--light-gray)',
        borderColor: 'transparent',
        textColor: getTextColor(item.category?.color),
        classNames: [`${item.done ? 'done' : ''}`, `color-${getTextColor(item.category?.color)}`],
      }));
      console.log('Fetched events:', newEvents); // 디버깅 로그
      scheduleList = newEvents;

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
        title: item.title || '제목 없는 일정',
        start: item.startDate,
        end: item.endDate,
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
    <div className="demo-app-main calendar-page">
      <div className='calendar-header'>
        <ProfileContainer>
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
        </ProfileContainer>
      </div>
      <CalendarWrap ref={calendarContainerRef}>
        <CategoryWrap>
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

        />
      </CalendarWrap>
      {categoryModalOpen && <CategoryEditModal categories={user.categories} onClose={() => setCategoryModalOpen(false)} />}
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
    outline: 2px solid ${(props) => (props.selected ? 'var(--primary-color)' : 'transparent')};
  }

  span {
    font-size: 14px;
    text-align: center;
  }
`;