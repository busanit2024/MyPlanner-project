import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const WeeklyPage = () => {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const navigate = useNavigate();

  const startOfWeek = new Date(
    currentWeek.getFullYear(),
    currentWeek.getMonth(),
    currentWeek.getDate() - currentWeek.getDay()
  );
  const endOfWeek = new Date(
    startOfWeek.getFullYear(),
    startOfWeek.getMonth(),
    startOfWeek.getDate() + 6
  );

  const daysInWeek = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(startOfWeek);
    day.setDate(startOfWeek.getDate() + i);
    return day;
  });

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };
  
  const goToPreviousWeek = () => {
    setCurrentWeek(new Date(currentWeek.setDate(currentWeek.getDate() - 7)));
  };

  const goToNextWeek = () => {
    setCurrentWeek(new Date(currentWeek.setDate(currentWeek.getDate() + 7)));
  };

  return (
    <div>
      <header>
        <button onClick={goToPreviousWeek}>◀ 이전 주</button>
        <h2>
          {startOfWeek.toLocaleDateString()} - {endOfWeek.toLocaleDateString()}
        </h2>
        <button onClick={goToNextWeek}>다음 주 ▶</button>

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
      <div className="week-view">
        {daysInWeek.map((day, index) => (
          <div
            key={index}
            className="day"
            onClick={() => navigate(`/daily?date=${day.toISOString()}`)}
          >
            {day.toLocaleDateString()}
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeeklyPage;
