import React, { useState } from 'react';
import '../../css/CalendarWrite.css';

const CalendarWrite = () => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('카테고리');
  const [participants, setParticipants] = useState([]);
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [reminder, setReminder] = useState(false);
  const [viewBefore, setViewBefore] = useState(false);
  const [checklist, setChecklist] = useState(['체크리스트1', '체크리스트2']);

  const handleAddParticipant = () => {
    // 참가자 추가 로직
    setParticipants([...participants, '새 참가자']);
  };

  const handleAddChecklist = () => {
    setChecklist([...checklist, `체크리스트${checklist.length + 1}`]);
  };

  return (
    <div className="calendar-write">
        <div className='header'>
            <h2>일정 입력</h2>
            <button className="submit-button">완료</button>
        </div>
      <div className="input-section">
        <div className="image-placeholder">사진</div>
        <label>제목</label>
        <input 
          type="text" 
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
        />
        <br/>
        <label>날짜</label>
        <input 
          type="date" 
          value={date} 
          onChange={(e) => setDate(e.target.value)} 
        />
        <br/>
        <label>시간</label>
        <div className="time-inputs">
          <input 
            type="time" 
            value={startTime} 
            onChange={(e) => setStartTime(e.target.value)} 
          />
          <input 
            type="time" 
            value={endTime} 
            onChange={(e) => setEndTime(e.target.value)} 
          />
        </div>
        <label>카테고리</label>
        <select 
          value={category} 
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="카테고리">카테고리</option>
          <option value="미팅">미팅</option>
          <option value="일정">일정</option>
          <option value="기타">기타</option>
        </select>
        <div className="participants">
          <label>참가자 추가</label>
          <button onClick={handleAddParticipant}>+</button>
          <div className="participants-list">
            {participants.map((participant, index) => (
              <div key={index}>{participant}</div>
            ))}
          </div>
        </div>
        <div className="reminder-section">
          <label>5분 전 알람</label>
          <input 
            type="checkbox" 
            checked={reminder} 
            onChange={() => setReminder(!reminder)} 
          />
        </div>
        <div className="view-before-section">
          <label>나 보기</label>
          <input 
            type="checkbox" 
            checked={viewBefore} 
            onChange={() => setViewBefore(!viewBefore)} 
          />
        </div>
        <div className="checklist-section">
          {checklist.map((item, index) => (
            <div key={index}>
              <input type="checkbox" />
              {item}
            </div>
          ))}
          <button onClick={handleAddChecklist}>체크리스트 추가</button>
        </div>
        <label>일정 상세내용 입력</label>
        <br/>
        <textarea rows="4" />
      </div>
    </div>
  );
};

export default CalendarWrite;
