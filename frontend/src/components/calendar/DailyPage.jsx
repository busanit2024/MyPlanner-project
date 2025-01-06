import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

const DailyPage = () => {
  const [searchParams] = useSearchParams();
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const date = searchParams.get('date') || new Date().toISOString().split('T')[0];
  const navigate = useNavigate();

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };
  
  const addTask = () => {
    if (newTask.trim()) {
      setTasks([...tasks, newTask]);
      setNewTask('');
    }
  };

  const deleteTask = (index) => {
    setTasks(tasks.filter((_, i) => i !== index));
  };

  return (
    
    <div>
      <h1>{date} - 해야 할 일</h1>
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
      <div>
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="할 일을 입력하세요"
        />
        <button onClick={addTask}>추가</button>
      </div>
      <ul>
        {tasks.map((task, index) => (
          <li key={index}>
            {task}
            <button onClick={() => deleteTask(index)}>삭제</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DailyPage;
