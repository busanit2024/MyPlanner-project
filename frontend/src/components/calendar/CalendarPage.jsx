import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../css/CalendarPage.css';
import Modal from '../../ui/Modal'; // Modal.jsx 파일 경로

const CalendarPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isYearMonthSelectorOpen, setIsYearMonthSelectorOpen] = useState(false);
  const navigate = useNavigate();

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const toggleYearMonthSelector = () => {
    setIsYearMonthSelectorOpen(!isYearMonthSelectorOpen);
  };

  const handleYearMonthChange = (year, month) => {
    setCurrentDate(new Date(year, month - 1, 1));
    setIsYearMonthSelectorOpen(false);
  };

  const getDaysInMonth = (year, month) => {
    const lastDay = new Date(year, month + 1, 0).getDate();
    return Array.from({ length: lastDay }, (_, i) => i + 1);
  };

  const daysInMonth = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth());
  const firstDayOfWeek = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const goToDailyPage = (day) => {
    const selectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    navigate(`/daily?date=${selectedDate.toISOString().split('T')[0]}`);
  };

  return (
    <div className="calendar-page">
      <header className="calendar-header">
        <button onClick={goToPreviousMonth}>◀</button>
        <h2 onClick={toggleYearMonthSelector} style={{ cursor: 'pointer' }}>
          {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월
        </h2>
        <button onClick={goToNextMonth}>▶</button>

        {/* Modal for Year and Month Selector */}
        <Modal
          isOpen={isYearMonthSelectorOpen}
          onClose={() => setIsYearMonthSelectorOpen(false)}
          title="연도와 월 선택"
        >
          <div>
            <h3>연도 선택</h3>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {Array.from({ length: 10 }).map((_, index) => {
                const year = currentDate.getFullYear() - 5 + index;
                return (
                  <button
                    key={year}
                    onClick={() => handleYearMonthChange(year, currentDate.getMonth() + 1)}
                  >
                    {year}년
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <h3>월 선택</h3>
            <div style={{ display: 'flex', gap: '8px' }}>
              {Array.from({ length: 12 }).map((_, index) => (
                <button
                  key={index + 1}
                  onClick={() => handleYearMonthChange(currentDate.getFullYear(), index + 1)}
                >
                  {index + 1}월
                </button>
              ))}
            </div>
          </div>
        </Modal>

        {/* Profile Pictures */}
        <div className="profile-pictures">
          <img src="profile1.jpg" alt="Profile 1" className="profile-picture" />
          <img src="profile2.jpg" alt="Profile 2" className="profile-picture" />
          <img src="profile3.jpg" alt="Profile 3" className="profile-picture" />
        </div>

        {/* Category Dropdown */}
        <div className="category-dropdown">
          <button onClick={toggleDropdown}>카테고리 ▼</button>
          {isDropdownOpen && (
            <div className="dropdown-content">
              <button onClick={() => navigate('/calendar')}>월간</button>
              <button onClick={() => navigate('/weekly')}>주간</button>
              <button onClick={() => navigate('/daily')}>매일</button>
            </div>
          )}
        </div>

        <button 
          className="add-event-button" 
          onClick={() => navigate('/calendarWrite')}
          style={{ fontSize: '24px', marginLeft: '20px', background: 'none', border: 'none', cursor: 'pointer' }}
        >
          📅+
        </button>
      </header>

      {/* Calendar Weekdays */}
      <div className="calendar-weekdays">
        {['일', '월', '화', '수', '목', '금', '토'].map((day, index) => (
          <div key={index} className="weekday">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Days */}
      <div className="calendar-days">
        {Array.from({ length: firstDayOfWeek }).map((_, index) => (
          <div key={index} className="empty-day"></div>
        ))}
        {daysInMonth.map(day => (
          <div key={day} 
          className="day"
          onClick={() => goToDailyPage(day)} // 날짜 클릭 시 매일 페이지로 이동
          style={{ cursor: 'pointer' }}
          >
            <div className="day-number">{day}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalendarPage;
