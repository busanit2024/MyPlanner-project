import React, { useEffect, useState } from 'react';
import { formatDate } from '@fullcalendar/core';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import "../../css/CalendarPage.css";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styled from 'styled-components';
import { collectFromHash } from '@fullcalendar/core/internal';

export default function CalendarPage() {
  const [weekendsVisible, setWeekendsVisible] = useState(true); // 주말 표시 여부 상태
  const [currentEvents, setCurrentEvents] = useState([]); // 현재 표시 중인 이벤트 상태
  const [eventList, setEventList] = useState([]); // 서버에서 가져온 이벤트 목록 상태
  const navigate = useNavigate(); // 페이지 이동을 위한 useNavigate
  const { user, loading } = useAuth(); // 인증된 사용자 정보 및 로딩 상태 가져오기

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

  useEffect(() => {
    // 인증되지 않은 사용자는 로그인 페이지로 이동
    if (!loading && !user) {
      navigate("/login");
    }
    console.log("user", user);

    // 인증된 사용자가 있다면 일정 데이터를 불러오기
    if (!loading && user) {
      axios
        .get('/api/schedules?id=' + user.id) // 사용자 ID 기반으로 일정 데이터 요청
        .then((response) => {
          if (response.data) {
            console.log("response.data", response.data);
            
            // 서버에서 받은 데이터를 FullCalendar 이벤트 형식으로 변환
            const newEvents = response.data.map((item) => ({
              id: item.id,
              title: item.title,
              start: item.startDate,
              end: item.endDate,
              backgroundColor: item.color || "#6c757e", // 데이터베이스의 color 컬럼 값 사용
            }));
            setEventList(newEvents); // 이벤트 목록 상태 업데이트
          }
        })
        .catch((error) => {
          console.error('Error fetching user schedules:', error); // 에러 처리
        });
    }
  }, [user, loading]); // user와 loading 상태가 변경될 때 실행

  function handleWeekendsToggle() {
    setWeekendsVisible(!weekendsVisible); // 주말 표시 토글
  }

  function handleDateSelect(selectInfo) {
    // 날짜를 선택하면 일정 작성 페이지로 이동하고 선택된 날짜 전달
    navigate('/calendarWrite', { state: { startDate: selectInfo.startStr, endDate: selectInfo.endStr } });
  }

  function handleEventClick(clickInfo) {
    // 일정 클릭 시 삭제 확인
    if (window.confirm(`Are you sure you want to delete the event '${clickInfo.event.title}'?`)) {
      clickInfo.event.remove(); // FullCalendar에서 이벤트 삭제
    }
  }

  function handleEvents(events) {
    setCurrentEvents(events); // 현재 표시 중인 이벤트 목록 상태 업데이트
  }

  const handleDayCellContent = (arg) => {
    // 달력 셀의 날짜 포맷 조정 (ex. '1일' -> '1')
    const dayNumber = arg.dayNumberText.replace("일", "");
    return dayNumber;
  };

  return (
    <div className="demo-app-main">
      <div>
        <ProfileImage>
          {/* 사용자 프로필 이미지 */}
          <img 
            src={user?.profileImageUrl ?? defaultProfileImage} 
            alt="profile" 
            onError={(e) => (e.target.src = defaultProfileImage)} // 이미지 로드 실패 시 기본 이미지로 대체
          />
        </ProfileImage> 
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
          <li>클릭해서 삭제</li>
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
        <h2>All Events ({currentEvents.length})</h2>
        <ul>
          {currentEvents.map((event) => (
            <SidebarEvent key={event.id} event={event} />
          ))}
        </ul>
      </div>
      
    </div>
  );
}