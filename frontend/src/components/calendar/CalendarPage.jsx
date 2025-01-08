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


export default function CalendarPage() {
  const [weekendsVisible, setWeekendsVisible] = useState(true);
  const [currentEvents, setCurrentEvents] = useState([]);  
  const [eventList, setEventList] = useState([]);
  const navigate = useNavigate(); // 페이지 이동을 위한 useNavigate
  const { user,loading } = useAuth(); // useAuth 훅 호출

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
    console.log("user", user);
  }, [user, loading]);


  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
    console.log("user:", user);
    console.log("loading:", loading);
    axios.get('/api/schedules?id=' + user.id)
      .then((response) => {
        if (response.data) {
          console.log("response.data", response.data);
          const newEvents = response.data.map((item) => ({
            
            id: item.id,
            title: item.title,
            start: item.startDate,
            end: item.endDate,
            
           
          }));
          
          setEventList(newEvents);
        }
      })
      .catch((error) => {
        console.error('Error fetching user schedules:', error);
      });
  }, []);


  function handleWeekendsToggle() {
    setWeekendsVisible(!weekendsVisible);
  }

  function handleDateSelect(selectInfo) {
    // CalendarWrite.jsx로 이동하며 선택된 날짜를 URL 파라미터로 전달
    navigate('/calendarWrite', { state: { startDate: selectInfo.startStr, endDate: selectInfo.endStr } });
  }

  function handleEventClick(clickInfo) {
    if (window.confirm(`Are you sure you want to delete the event '${clickInfo.event.title}'?`)) {
      clickInfo.event.remove();
    }
  }

  function handleEvents(events) {
    setCurrentEvents(events);
  }

  const handleDayCellContent = (arg) => {
    const dayNumber = arg.dayNumberText.replace("일", "");
    return dayNumber;
  };

  return (
    <div className="demo-app-main">
      <div>프로필1 프로필2 프로필3 카테고리 일정작성</div>
      <div>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay',
        }}
        initialView="dayGridMonth"
        editable={true}
        selectable={true}       //달력 셀 선택 활성화
        selectMirror={true}
        dayMaxEvents={true}
        displayEventTime={false} // 시간 표시 제거
        eventColor='#374983'             // 색 설정
        weekends={weekendsVisible}
        select={handleDateSelect} // 달력 셀을 클릭할 때 모달 열기
        eventContent={renderEventContent}
        eventClick={handleEventClick}
        eventsSet={handleEvents}
        events={eventList}
        locale="ko"
        dayCellContent={handleDayCellContent}
      />
      </div>
      <div className="demo-app">
        <Sidebar
          weekendsVisible={weekendsVisible}
          handleWeekendsToggle={handleWeekendsToggle}
          currentEvents={currentEvents}
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
      <b>{eventInfo.timeText}</b>
      <i>{eventInfo.event.title}</i>
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
            checked={weekendsVisible}
            onChange={handleWeekendsToggle}
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
