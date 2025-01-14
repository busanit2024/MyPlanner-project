import React, { useState, useEffect, useCallback } from 'react';
import '../../css/CalendarWrite.css';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { imageFileUpload } from '../../firebase';
import { ChromePicker } from 'react-color';

const CalendarUpdate = () => {
  const { user, loading } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const eventData = location.state?.eventData;

  const [label, setLabel] = useState({ color: '' });

  const [title, setTitle] = useState(eventData?.title || '');
  const [category, setCategory] = useState(eventData?.category || { id: 5, name: "과제" });
  const [categoryId, setCategoryId] = useState(eventData?.categoryId || 5); // 카테고리 ID
  const [participants, setParticipants] = useState(eventData?.participants || []); // 참가자
  const [date, setDate] = useState(''); // 날짜
  const [startDate, setStartDate] = useState(eventData?.startDate || '');   // 시작 날짜
  const [endDate, setEndDate] = useState(eventData?.endDate || '');   // 끝 날짜
  const [startTime, setStartTime] = useState(eventData?.startTime || '');   // 시작 시간
  const [endTime, setEndTime] = useState(eventData?.endTime || '');   // 끝 시간
  const [allDay, setAllDay] = useState(eventData?.allDay || false);  // 종일 여부
  const [repeat, setRepeat] = useState(eventData?.isRepeat || false);  // 반복 여부
  const [reminder, setReminder] = useState(eventData?.isAlarm || false);  // 알람 여부
  const [viewOnlyMe, setViewOnlyMe] = useState(eventData?.isPrivate || false);  // 나만 보기 여부
  //const [checklist, setChecklist] = useState((eventData?.checkList || []).map(item => item.content));   // 체크리스트
  const [checklist, setChecklist] = useState((eventData?.checkList || []).map(item => ({ content: item.content, isDone: false })));
  const [detail, setDetail] = useState(eventData?.detail || ''); // 상세 내용
  const [image, setImage] = useState(eventData?.imageUrl || null); // 이미지 URL
  const [createdAt, setCreatedAt] = useState(eventData?.createdAt || '');   // 생성 날짜
  const [color, setColor] = useState(eventData?.color || '');   // 색상
  const [done, setDone] = useState(eventData?.done);  // 일정 완료 여부
  // const [checkDone, setCheckDone] = useState((eventData?.checkDone || []).slice(0, checklist.length)); // 체크리스트 완료 여부
  // const [checkDone, setCheckDone] = useState([]);
  const [isOwner, setIsOwner] = useState(false);  // 작성자 확인

  // 컴포넌트 마운트 시 기존 일정 데이터 불러오기
  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const response = await axios.get(`/api/schedules/${id}`);
        console.log("API Response: ", response.data);
        console.log("유저 아이디: ", user.id);
        console.log("eventData: ", eventData);
        console.log("repeat의 상태: ", eventData?.isRepeat);
        const scheduleData = response.data;

        if (scheduleData) {
          console.log("checklist", scheduleData.checkList);
          console.log("checklist type", typeof scheduleData.checkList);

            setTitle(scheduleData.title);
            setCategory(scheduleData.category);
            setCategoryId(scheduleData.categoryId);
            setParticipants(scheduleData.user?.follows.map(follow => follow.id) || []);
            setStartDate(scheduleData.startDate.split('T')[0]);
            setEndDate(scheduleData.endDate.split('T')[0]);
            setStartTime(scheduleData.startTime);
            setEndTime(scheduleData.endTime);
            setAllDay(scheduleData.allDay);
            setRepeat(scheduleData.isRepeat === "true");
            setReminder(scheduleData.isAlarm);
            setViewOnlyMe(scheduleData.isPrivate);
            //setChecklist((scheduleData.checkList || []).map(item => item.content)); 
            setChecklist(scheduleData.checkList, scheduleData.isDone);
            setDetail(scheduleData.detail);
            setImage(scheduleData.imageUrl);
            setCreatedAt(scheduleData.createdAt);
            setColor(scheduleData.color || '');
            setLabel({ color: scheduleData.color || '' });
            setDone(scheduleData.done);
            // setCheckDone((scheduleData.checkDone || []).slice(0, (scheduleData.checkList || []).length));

            // 작성자 확인
            setIsOwner(scheduleData.user.id === user.id);

            const today = new Date();
            const formattedDate = today.toISOString().split('T')[0];
            setDate(formattedDate);
        } else {
            throw new Error("일정 데이터가 없습니다.");
        }        
      } catch (error) {
        console.error('일정 데이터 불러오기 실패:', error.response ? error.response.data : error.message);
        alert('일정 데이터를 불러오는데 실패했습니다.');
        navigate('/calendar');
      }
    };

    if (id) {
      fetchSchedule();
    }
  }, [id, user.id]);

  useEffect(() => {
    if (!label.color) {
      setColor('');
    }
    setColor(label.color);
  }, [label]);

  // useEffect(() => {
  //   setCheckDone(prev => {
  //     const newCheckDone = [...prev];
  //     while (newCheckDone.length < checklist.length) {
  //       newCheckDone.push(false); // 체크 상태 추가
  //     }
  //     return newCheckDone;
  //   });
  // }, [checklist]);

  const handleAddParticipant = () => {
    setParticipants([...participants, `참가자${participants.length + 1}`]);
  };

  const handleAddChecklist = () => {
    if (checklist.length < 10) {
      setChecklist([...checklist, { content: '', isDone: false }]); // 새로운 체크리스트 항목 추가
    }
  };

  const handleDeleteChecklist = (index) => {
    const updatedChecklist = checklist.filter((_, i) => i !== index);
    setChecklist(updatedChecklist); // 체크리스트 항목 삭제
  };

  const handleChecklistChange = (index, value) => {
    const updatedChecklist = [...checklist];
    updatedChecklist[index].content = value; // content 업데이트
    setChecklist(updatedChecklist);
  };

  const handleCheckboxChange = (index) => {
    const updatedChecklist = [...checklist];
    updatedChecklist[index].isDone = !updatedChecklist[index].isDone; // isDone 토글
    setChecklist(updatedChecklist);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const { url } = await imageFileUpload(file);
        setImage(url);
      } catch (error) {
        console.error("이미지 업로드 중 오류 발생: ", error);
      }
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm("정말로 이 일정을 삭제하시겠습니까?");

    if (confirmed) {
      try {
        await axios.delete(`/api/schedules/${id}`);
        alert("일정이 삭제되었습니다.");
        navigate('/calendar');  // 삭제 후 캘린더 페이지로 이동
      } catch (error) {
        console.error("일정 삭제 중 오류 발생: ", error.message.data);
        alert("일정 삭제에 실패했습니다. 다시 시도해 주세요.");
      }
    }
  };

  const handleComplete = async () => {
    const confirmed = window.confirm("이 일정을 완료하시겠습니까?");

    if (confirmed) {
      try {
        await axios.put(`/api/schedules/${id}`, { 
          ...eventData, 
          done: true,
          allDay: eventData.allDay || false,
          startDate: eventData.startDate || new Date().toISOString(),
          endDate: eventData.endDate || new Date().toISOString(),
        });  // 일정 완료 처리
        setDone(true);
        alert("일정이 완료되었습니다.");
        navigate('/calendar');
      } catch (error) {
        console.error("일정 완료 중 오류 발생: ", error.response.data);
        alert("일정 완료에 실패했습니다. 다시 시도해 주세요.");
      }
    }
  };

  const handleSubmit = async () => {
    const scheduleData = {
      title: title,
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
      checkList: checklist.map((item) => ({
        content: item.content,
        isDone: item.isDone,
      })),
      detail: detail,
      imageUrl: image || '',
      done: done,
      createdAt: createdAt,
      userId: user.id || '',
      color: color,
    };

    console.log("제출할 데이터: ", scheduleData);

    try {
      const response = await axios.put(`/api/schedules/${id}`, JSON.stringify(scheduleData), {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log('일정이 수정되었습니다:', response.data);
      navigate('/calendar');
    } catch (error) {
      console.error('일정 수정 중 오류 발생:', error.response.data);
      alert('일정 수정에 실패했습니다. 다시 시도해 주세요.');
    }
  };

  if (loading) {
    return <div>로딩 중...</div>;
  }

  return (
    <div className="calendar-write">
      <div className='header' style={{ position: 'relative' }}>
        <h2>일정 수정</h2>
        {(isOwner && !done) && (
          <>
            {/* <input
              value={color}
              onClick={togglePicker}
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
            <button className="complete-button" onClick={handleComplete}>
              일정 완료
            </button>
            <button className="submit-button" onClick={handleSubmit}>
              수정
            </button>
            
          </>
        )}
        <button className="delete-button" onClick={handleDelete}>
          삭제
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
          disabled={!isOwner || done}
        />
        <input 
          type="text" 
          className="input-field" 
          placeholder="제목" 
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
          disabled={!isOwner || done}
        />
        <div className="date-category-container">
          <p className="date-display">
            {date}
          </p>
          <select 
            value={categoryId} 
            onChange={(e) => {
                setCategoryId(e.target.value);
                // 카테고리 업데이트
                const selectedCategory = category.find(cat => cat.id === parseInt(e.target.value));
                setCategory(selectedCategory || {});
            }}
            disabled={!isOwner || done}
          >
            <option value="4">약속</option>
            <option value="5">과제</option>
            <option value="6">스터디</option>
            <option value="7">여행</option>
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
              disabled={!isOwner || done}
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
            disabled={allDay || !isOwner || done}
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              setStartTime('');
            }}
          />
          {startDate && !allDay && (
            <input 
              type="time" 
              className="input-field" 
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              disabled={!isOwner || done}
            />
          )}
          <p/>
          <span>끝 날짜</span>
          <input 
            type="date" 
            className="input-field" 
            disabled={allDay || !isOwner || done}
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              setEndTime('');
            }}
          />
          {endDate && !allDay && (
            <input 
              type="time" 
              className="input-field" 
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              disabled={!isOwner || done}
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
              disabled={!isOwner || done}
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
              disabled={!isOwner || done}
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
              disabled={!isOwner || done}
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
                checked={item.isDone}
                onChange={() => handleCheckboxChange(index)}
                disabled={!isOwner || done}
                style={{ marginRight: '10px' }} 
              />
              <input 
                type="text" 
                value={item.content} 
                onChange={(e) => handleChecklistChange(index, e.target.value)} 
                placeholder={`체크리스트 ${index + 1}`}
                disabled={!isOwner || done}
                style={{ flex: 1 }}
              />
              <button 
                className='delete-checklist-button'
                onClick={() => handleDeleteChecklist(index)}
                disabled={!isOwner || done}
                style={{ marginLeft: "10px" }}
              >X</button>
            </div>
          ))}
          {checklist.length < 10 && (
            <button 
              className="add-checklist-button" 
              onClick={handleAddChecklist}
              disabled={!isOwner || done}
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
            disabled={!isOwner || done}
            style={{ minHeight: "100px", fontFamily: "fantasy" }}
          />
        </pre>
      </div>
    </div>
  );
};

export default CalendarUpdate;