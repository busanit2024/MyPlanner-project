import React from 'react';
import { useNavigate } from 'react-router-dom'; // React Router import
import '../../css/CalendarPage.css';

const CalendarPage = () => {
  const navigate = useNavigate(); // useNavigate 훅 사용

  // 더미 데이터
  const events = [
    { date: '2017-04-03', title: '1주간 프로젝트', time: '10:00' },
    { date: '2017-04-10', title: '미팅', time: '15:00' },
    { date: '2017-04-21', title: '회의', time: '14:00' },
    { date: '2017-04-16', title: '팀 점검', time: '11:00' },
  ];

  // 날짜를 계산하는 함수
  const getDaysInMonth = (year, month) => {
    const date = new Date(year, month + 1, 0);
    return date.getDate();
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(2017, 3); // 4월 (0부터 시작)
    const days = [];
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(
        <div className="day" key={i}>
          <div className="day-header">{i}</div>
          {events
            .filter(event => new Date(event.date).getDate() === i)
            .map((event, index) => (
              <div className="event" key={index}>
                {event.title} {event.time}
              </div>
            ))}
        </div>
      );
    }
    return days;
  };

  return (
    <div className="calendar-page">
      <div className="header">
        <h1>캘린더</h1>
        <div className="profile-pictures">
          <img src="profile1.jpg" alt="Profile 1" className="profile-picture" />
          <img src="profile2.jpg" alt="Profile 2" className="profile-picture" />
          <img src="profile3.jpg" alt="Profile 3" className="profile-picture" />
        </div>
        <div className="category-dropdown">
          <button>카테고리 ▼</button>
          <div className="dropdown-content">
            <p>카테고리1</p>
            <p>카테고리2</p>
            <p>카테고리3</p>
          </div>
        </div>
        <button 
          className="add-event-button" 
          onClick={() => navigate('/calendarWrite')} // 클릭 시 이동
          style={{ fontSize: '24px', marginLeft: '20px', background: 'none', border: 'none', cursor: 'pointer' }}
        >
          📅+
        </button>
      </div>
      <div className="calendar">
        {renderCalendarDays()}
      </div>
    </div>
  );
};

export default CalendarPage;
