import React, { useState, useEffect } from 'react';
import '../../css/CalendarWrite.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const CalendarWrite = () => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('카테고리');
  const [participants, setParticipants] = useState([]);
  const [date, setDate] = useState(''); // 오늘 날짜 상태
  const [startDate, setStartDate] = useState(''); // 시작 날짜 상태
  const [endDate, setEndDate] = useState(''); // 끝 날짜 상태
  const [startTime, setStartTime] = useState(''); // 시작 시간 상태
  const [endTime, setEndTime] = useState(''); // 끝 시간 상태
  const [allDay, setAllDay] = useState(false);  // 종일 여부
  const [repeat, setRepeat] = useState(false);  // 반복 여부
  const [reminder, setReminder] = useState(false);  // 5분 전 알림 여부
  const [viewOnlyMe, setViewOnlyMe] = useState(false);  // 
  const [checklist, setChecklist] = useState(['체크리스트1', '체크리스트2']);
  const [detail, setDetail] = useState('');
  const [image, setImage] = useState(null); // 이미지 상태

  const navigate = useNavigate();

  // 컴포넌트가 마운트될 때 오늘 날짜로 초기화
  useEffect(() => {
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0]; // YYYY-MM-DD 형식
    setDate(formattedDate);
    setStartDate(''); // 시작 날짜 초기화
    setEndDate(''); // 끝 날짜 초기화
  }, []);

  const handleAddParticipant = () => {
    setParticipants([...participants, `참가자${participants.length + 1}`]);
  };

  const handleAddChecklist = () => {
    if (checklist.length < 10) {
      setChecklist([...checklist, '']); // 체크리스트가 10개 미만일 때 빈 문자열 추가
    }
  };

  const handleDeleteChecklist = (index) => {
    const updatedChecklist = checklist.filter((_, i) => i !== index);
    setChecklist(updatedChecklist);
  }

  const handleChecklistChange = (index, value) => {
    const updatedChecklist = [...checklist];
    updatedChecklist[index] = value; // 해당 인덱스의 값을 업데이트
    setChecklist(updatedChecklist);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0]; // 업로드한 파일
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result); // 이미지 미리보기
      };
      reader.readAsDataURL(file); // 파일을 base64로 읽기
    }
  };

  const handleSubmit = async () => {
    // 전송할 데이터 객체 생성
    const scheduleData = {
      title: title,
      category: category === '카테고리' ? '카테고리 없음' : category,
      // participants: participants.length > 0 ? participants : [''],
      startDate: startDate || date,
      endDate: endDate || date,
      startTime: startTime,
      endTime: endTime,
      allDay: allDay,
      isRepeat: repeat,
      isAlarm: reminder,
      isPrivate: viewOnlyMe,
      // checkList: checklist,
      detail: detail,
      // imageUrl: image,
      done: true,      
    };

    console.log("전송할 데이터: ", scheduleData);

    try {
      // POST 요청
      const response = await axios.post('/api/schedules', scheduleData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log('일정이 저장되었습니다:', response.data);
      navigate('/calendar');
    } catch (error) {
      console.error('일정 저장 중 오류 발생:', error);
      alert('일정 저장에 실패했습니다. 다시 시도해 주세요.');
    }
  };

  return (
    <div className="calendar-write">
      <div className='header'>
        <h2>일정 입력</h2>
        <button className="submit-button"
          onClick={handleSubmit}>
          완료
        </button>
      </div>
      <div className="input-section">
        <div className="image-placeholder" onClick={() => document.getElementById('imageUpload').click()}>
          {image ? <img src={image} alt="Uploaded" className="uploaded-image" /> : '사진 업로드'}
        </div>
        <input 
          type="file" 
          id="imageUpload" 
          style={{ display: 'none' }} 
          accept="image/*" 
          onChange={handleImageUpload} 
        />
        <input 
          type="text" 
          className="input-field" 
          placeholder="제목" 
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
        />
        <div className="date-category-container">
          <p className="date-display">
            {date} {/* 오늘 날짜 표시 */}
          </p>
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
          {participants.slice(0, 4).map((participant, index) => (
            <div key={index} className="participant">{participant}</div>
          ))}
          {participants.length > 4 && <div className="participant">...</div>}
          <div 
            className="participant add" 
            onClick={participants.length < 4 ? handleAddParticipant : null}
            style={{ cursor: participants.length < 4 ? 'pointer' : 'not-allowed', opacity: participants.length < 4 ? 1 : 0.5 }}
          >
            +
          </div>
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
        <p/>
        <div>
          <span>시작 날짜</span>
          <input 
            type="date" 
            className="input-field" 
            disabled={allDay}
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              setStartTime(''); // 날짜 변경 시 시간 초기화
            }}
          />
          {startDate && !allDay && (
            <input 
              type="time" 
              className="input-field" 
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
          )}
          <span>끝 날짜</span>
          <input 
            type="date" 
            className="input-field" 
            disabled={allDay}
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              setEndTime(''); // 날짜 변경 시 시간 초기화
            }}
          />
          {endDate && !allDay && (
            <input 
              type="time" 
              className="input-field" 
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          )}
        </div>
        <p/>
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
        <p/>
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
        <p/>
        <div className="toggle-container">
          <span>
            {viewOnlyMe ? '🔒︎ 나만 보기' : '🔓︎ 나만 보기'}
          </span>
          <label className="toggle">
            <input 
              type="checkbox" 
              checked={viewOnlyMe} 
              onChange={() => setViewOnlyMe(!viewOnlyMe)} 
            />
            <span className="slider"></span>
          </label>
        </div>
        <hr />
        <div className="checklist-section">
          {checklist.map((item, index) => (
            <div className="checklist-item" key={index}>
              <input 
                type="checkbox" 
                style={{ marginRight: '10px' }} 
              />
              <input 
                type="text" 
                value={item} 
                onChange={(e) => handleChecklistChange(index, e.target.value)} 
                style={{ flex: 1 }}
              />
              <button 
                className='delete-checklist-button'
                onClick={() => {handleDeleteChecklist(index)}}
                style={{ marginLeft: "10px" }}
              >X</button>
            </div>
          ))}
          {checklist.length < 10 && (
            <button 
              className="add-checklist-button" 
              onClick={handleAddChecklist}
            >
              + 체크리스트 추가
            </button>
          )}
        </div>
        <p />
        <pre>
          <textarea 
            type="text" 
            className="textarea-placeholder" 
            placeholder="일정 상세내용 입력..." 
            value={detail}
            onChange={(e) => setDetail(e.target.value)}
            style={{ minHeight: "100px", fontFamily: "fantasy" }}
          />
        </pre>
      </div>
    </div>
  );
};

export default CalendarWrite;
