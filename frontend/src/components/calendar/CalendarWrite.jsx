import React, { useState, useEffect, useCallback } from 'react';
import '../../css/CalendarWrite.css';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { imageFileUpload } from '../../firebase';
import { ChromePicker } from 'react-color';

const CalendarWrite = () => {
  const { user, loading } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  const [label, setLabel] = useState({ color: '' });

  const [title, setTitle] = useState('');
  const [categoryList, setCategoryList] = useState([]); // 카테고리 목록
  const [categoryId, setCategoryId] = useState(4); // 카테고리 ID
  const [participants, setParticipants] = useState([]);
  const [date, setDate] = useState(''); // 오늘 날짜 상태

  // URL로부터 전달된 데이터
  const { startDate: initialStartDate, endDate: initialEndDate } = location.state || {};

  const [startDate, setStartDate] = useState(initialStartDate || ''); // 시작 날짜 상태
  const [endDate, setEndDate] = useState(initialEndDate || ''); // 끝 날짜 상태

  const [startTime, setStartTime] = useState(''); // 시작 시간 상태
  const [endTime, setEndTime] = useState(''); // 끝 시간 상태
  const [allDay, setAllDay] = useState(false);  // 종일 여부
  const [repeat, setRepeat] = useState(false);  // 반복 여부
  const [reminder, setReminder] = useState(false);  // 5분 전 알림 여부
  const [viewOnlyMe, setViewOnlyMe] = useState(false);  // 나만 보기 여부
  const [checklist, setChecklist] = useState([]); // 체크리스트
  const [detail, setDetail] = useState(''); // 상세 내용
  const [image, setImage] = useState(null); // 이미지 상태
  const [createdAt, setCreatedAt] = useState(''); // 등록 시간
  const [color, setColor] = useState(''); // 색깔
  const [done, setDone] = useState(false);  // 일정 완료 여부
  const [checkDone, setCheckDone] = useState([]);  // 체크리스트 완료 여부

  

  // 컴포넌트가 마운트될 때 오늘 날짜로 초기화
  useEffect(() => {
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0]; // YYYY-MM-DD 형식
    setDate(formattedDate);
  }, []);

  useEffect(() => {
    if (!label.color) {
      setColor(''); // 받아온 레이블 컬러가 없을 시 빈칸
    }
    setColor(label.color);  // 데이터 있을 시 컬러 세팅
  }, [label]);

  useEffect(() => {
    // 유저 정보 있을 때 유저 카테고리 받아오기
    if(!loading && user) {
      setCategoryList(user.categories);
      // setCategoryId(user.categories[4].id); // 첫 번째 카테고리 ID로 초기화
    }
  }, [loading, user]);

  const handleAddParticipant = () => {
    setParticipants(user?.follows.map(follow => follow.id) || []);
  };

  const handleAddChecklist = () => {
    if (checklist.length < 10) {
      setChecklist([...checklist, '']); // 체크리스트가 10개 미만일 때 빈 문자열 추가
      setCheckDone([...checkDone, false]);
    }
  };

  const handleDeleteChecklist = (index) => {
    const updatedChecklist = checklist.filter((_, i) => i !== index);
    setChecklist(updatedChecklist);
    setCheckDone(checkDone.filter((_, i) => i !== index));
  }

  const handleChecklistChange = (index, value) => {
    const updatedChecklist = [...checklist];
    updatedChecklist[index] = value; // 해당 인덱스의 값을 업데이트
    setChecklist(updatedChecklist);
  };
  
  const handleCheckboxChange = (index) => {
    const newCheckDone = [...checkDone];
    newCheckDone[index] = !newCheckDone[index];
    setCheckDone(newCheckDone);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]; // 업로드한 파일
    if (file) {
      try {
        const { url } = await imageFileUpload(file);
        setImage(url);
      } catch (error) {
        console.error("이미지 업로드 중 오류 발생: ", error);
      }
    }
  };

  const handleSubmit = async () => {
    console.log("user: ", user);
    console.log("user.id: ", user.id);

    // 전송할 데이터 객체 생성
    const scheduleData = {
      title: title, // 제목
      categoryId: categoryId,
      participants: participants.length > 0 ? participants : [],
      startDate: startDate || date,
      endDate: endDate || date,
      startTime: startTime,
      endTime: endTime,
      allDay: allDay,
      isRepeat: repeat,
      isAlarm: reminder,
      isPrivate: viewOnlyMe,
      checkListItem: checklist.map((item, index) => ({
        content: item,
        isDone: checkDone[index] || false,
      })),
      detail: detail,
      imageUrl: image || '',
      done: done,
      createdAt: createdAt || new Date().toISOString(), // 현재 시간
      userId: user.id || '',
      color: color,
    };

    console.log("전송할 데이터: ", scheduleData);

    try {
      // POST 요청
      const response = await axios.post('/api/schedules', JSON.stringify(scheduleData), {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log('일정이 저장되었습니다:', response.data);
      navigate('/calendar');
    } catch (error) {
      console.error('일정 저장 중 오류 발생:', error.response.data);
      alert('일정 저장에 실패했습니다. 다시 시도해 주세요.');
    }
  };

  // 날짜 유효성 검사 함수
  const isEndDateVaild = (newEndDate) => {
    if (newEndDate < startDate) {
      alert('끝 날짜는 시작 날짜보다 이전일 수 없습니다.');
      setEndDate(startDate);
      return false;
    }
    return true;
  };

  // 시간 유효성 검사 함수
  const isEndTimeValid = (newEndTime) => {
    if (startDate === endDate && newEndTime < startTime) {
      alert('끝 시간은 시간 시간보다 이전일 수 없습니다.');
      setEndTime(startTime);
      return false;
    }
    return true;
  };

  return (
    <div className="calendar-write">
      <div className='header' style={{ position: 'relative' }}>
        <h2>일정 입력</h2>
        {/* <input
          value={color}
          onClick={togglePicker}  // 클릭 시 색상 선택기 열기
          style={{ marginLeft: "10px" }}
        />
        {isPickerVisible && (
          <div className='color-picker-container' 
            style={{ 
              position: 'absolute', 
              zIndex: 2, 
              top: 'calc(100% - 5px)', 
              left: '50%',
              transform: 'translateX(-50%)'
            }}>
            <ChromePicker
              color={color}
              onChange={color => handleColorChange(color.hex)}
            />
          </div>
        )} */}
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
            onChange={(e) => setCategoryId(e.target.value)}
            value={categoryId}
          > {/* 유저 카테고리 불러오기 */}
            {categoryList.map((category) => (
              <option key={category.id} value={category.id}>{category.categoryName}</option>
            ))}
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
          {/* 시작 시간 */}
          {startDate && !allDay && (
            <input 
              type="time" 
              className="input-field" 
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
          )}
          <p/>
          <span>끝 날짜</span>
          <input 
            type="date" 
            className="input-field" 
            disabled={allDay}
            value={endDate}
            onChange={(e) => {
              const newEndDate = e.target.value;
              if (isEndDateVaild(newEndDate)) {
                setEndDate(newEndDate);
                setEndTime(''); // 날짜 변경 시 시간 초기화
              }
            }}
          />
          {/* 끝 시간 */}
          {endDate && !allDay && (
            <input 
              type="time" 
              className="input-field" 
              value={endTime}
              onChange={(e) => {
                const newEndTime = e.target.value;
                if (isEndTimeValid(newEndTime)) {
                  setEndTime(e.target.value);
                }
              }}
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
                checked={checkDone[index]}
                onChange={(e) => handleCheckboxChange(index)}
                style={{ marginRight: '10px' }} 
              />
              <input 
                type="text" 
                value={item} 
                onChange={(e) => handleChecklistChange(index, e.target.value)} 
                placeholder={`체크리스트 ${index + 1}`}
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
