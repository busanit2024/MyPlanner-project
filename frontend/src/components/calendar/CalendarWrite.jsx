import React, { useState } from 'react';
import '../../css/CalendarWrite.css';
import { useNavigate } from 'react-router-dom';

const CalendarWrite = () => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('카테고리');
  const [participants, setParticipants] = useState([]);
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [allDay, setAllDay] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const [reminder, setReminder] = useState(false);
  const [viewBefore, setViewBefore] = useState(false);
  const [checklist, setChecklist] = useState(['체크리스트1', '체크리스트2']);
  const [detail, setDetail] = useState('');

  const navigate = useNavigate();

  const handleAddParticipant = () => {
    setParticipants([...participants, `참가자${participants.length + 1}`]);
  };

  const handleAddChecklist = () => {
    setChecklist([...checklist, `체크리스트${checklist.length + 1}`]);
  };

  return (
    <div className="calendar-write">
      <div className='header'>
        <h2>일정 입력</h2>
        <button className="submit-button"
          onClick={() => navigate('/calendar')}>
          완료
        </button>
      </div>
      <div className="input-section">
        <div className="image-placeholder">사진</div>
        <input 
          type="text" 
          className="input-field" 
          placeholder="제목" 
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
        />
        <div className="date-category-container">
          <input 
            type="date" 
            className="input-field" 
            value={date} 
            onChange={(e) => setDate(e.target.value)} 
          />
          <select 
            value={category} 
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="카테고리">카테고리</option>
            <option value="미팅">미팅</option>
            <option value="일정">일정</option>
            <option value="기타">기타</option>
          </select>
        </div>
        <hr />
        <div className="participants-list">
          {participants.map((participant, index) => (
            <div key={index} className="participant">{participant}</div>
          ))}
          <div className="participant add" onClick={handleAddParticipant}>+</div>
        </div>
        <hr />
        <div className="toggle-container">
          <span>⏰ 종일</span>
          <label className="toggle">
            <input 
              type="checkbox" 
              checked={allDay} 
              onChange={() => setAllDay(!allDay)} 
            />
            <span className="slider"></span>
          </label>
        </div>
        <div>
          <span>시작 날짜</span>
          <input 
            type="date" 
            className="input-field" 
            disabled={allDay}
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
          <span>끝 날짜</span>
          <input 
            type="date" 
            className="input-field" 
            disabled={allDay}
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />
        </div>
        <div className="toggle-container">
          <span>🔁 반복 안함</span>
          <label className="toggle">
            <input 
              type="checkbox" 
              checked={repeat} 
              onChange={() => setRepeat(!repeat)} 
            />
            <span className="slider"></span>
          </label>
        </div>
        <div className="toggle-container">
          <span>🔔 5분 전 알람</span>
          <label className="toggle">
            <input 
              type="checkbox" 
              checked={reminder} 
              onChange={() => setReminder(!reminder)} 
            />
            <span className="slider"></span>
          </label>
        </div>
        <div className="toggle-container">
          <span>
            {viewBefore ? '🔒︎ 나만 보기' : '🔓︎ 나만 보기'}
          </span>
          <label className="toggle">
            <input 
              type="checkbox" 
              checked={viewBefore} 
              onChange={() => setViewBefore(!viewBefore)} 
            />
            <span className="slider"></span>
          </label>
        </div>
        <hr />
        <div className="checklist-section">
          {checklist.map((item, index) => (
            <div className="checklist-item" key={index}>
              <input type="checkbox" />
              {item}
            </div>
          ))}
          <button onClick={handleAddChecklist}>체크리스트 추가</button>
        </div>
        <p />
        <input 
          type="text" 
          className="textarea-placeholder" 
          placeholder="일정 상세내용 입력..." 
          value={detail}
          onChange={(e) => setDetail(e.target.value)}
        />
      </div>
    </div>
  );
};

export default CalendarWrite;
