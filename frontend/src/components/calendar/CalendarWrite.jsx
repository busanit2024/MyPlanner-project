import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { imageFileUpload } from '../../firebase';
import styled from 'styled-components';
import Switch from '../../ui/Switch';
import Button from '../../ui/Button';
import { useSearch } from '../../context/SearchContext';
import Modal from '../../ui/Modal';
import UserSelectModal from './UserSelectModal';
import Swal from 'sweetalert2';

const CalendarWrite = () => {
  const { user, loading } = useAuth();
  const { setOnWriteSchedule } = useSearch();
  const navigate = useNavigate();
  const location = useLocation();
  const [title, setTitle] = useState('');
  const [categoryList, setCategoryList] = useState([]); // 카테고리 목록
  const [categoryId, setCategoryId] = useState(null); // 카테고리 ID
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
  const [userSelectModalOpen, setUserSelectModalOpen] = useState(false); // 유저 선택 모달 오픈 여부

  const [previousStartTime, setPreviousStartTime] = useState(''); // 이전에 설정한 시작 시간
  const [previousEndTime, setpreviousEndTime] = useState(''); // 이전에 설정한 끝 시간

  // 컴포넌트가 마운트될 때 오늘 날짜로 초기화
  useEffect(() => {
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0]; // YYYY-MM-DD 형식
    setDate(formattedDate);
  }, []);


  useEffect(() => {
    // 유저 정보 있을 때 유저 카테고리 받아오기
    if (!loading && user) {
      setCategoryList(user.categories);
      setCategoryId(null);
    }
  }, [loading, user]);

  useEffect(() => {
    // 탑바에 일정 작성 버튼 표시하기 위해 context 사용
    setOnWriteSchedule(() => handleSubmit);
  }, [setOnWriteSchedule, title, categoryId, participants, startDate, endDate, startTime, endTime, allDay, repeat, reminder, viewOnlyMe, checklist, detail, image, createdAt, color, done, checkDone]);

  const handleAddParticipant = () => {
    setUserSelectModalOpen(true);
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
    if (user === null) {
      return;
    }
    console.log("user: ", user);
    console.log("user.id: ", user.id);

    // 전송할 데이터 객체 생성
    const scheduleData = {
      title: title || '제목 없는 일정',
      categoryId: categoryId !== null ? categoryId : -1,
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

      if (participants.length > 0) {
        const scheduleId = response.data;
        const participantIds = participants.map((participant) => participant.id);
        await axios.post(`/api/schedules/invite/${scheduleId}`, 
          participantIds,
        );
      }

      console.log('서버 응답:', response);
      console.log('일정이 저장되었습니다:', response.data);
      Swal.fire({
        title: '일정 저장 완료',
        text: '일정이 저장되었습니다.',
        confirmButtonText: '확인',
        customClass: {
          title: "swal-title",
          htmlContainer: "swal-text-container",
          confirmButton: "swal-button swal-button-confirm",
        },
      });
      navigate('/calendar');
    } catch (error) {
      console.error('일정 저장 중 오류 발생:', error.response.data);
      Swal.fire({
        title: '일정 저장 실패',
        text: '오류가 발생했습니다. 다시 시도해주세요.',
        confirmButtonText: '확인',
        customClass: {
          title: "swal-title",
          htmlContainer: "swal-text-container",
          confirmButton: "swal-button swal-button-confirm",
        },
      });
    }
  };

  // 날짜 유효성 검사 함수
  const isEndDateVaild = (newEndDate) => {
    if (newEndDate < startDate) {
      Swal.fire({
        title: "날짜 오류",
        text: "끝 날짜는 시작 날짜보다 이전일 수 없습니다.",
        customClass: {
          title: "swal-title",
          htmlContainer: "swal-text-container",
          confirmButton: "swal-button swal-button-confirm",
          cancelButton: "swal-button swal-button-cancel",
        },
      });
      setEndDate(startDate);
      return false;
    }
    return true;
  };

  // 시간 유효성 검사 함수
  const isEndTimeValid = (newEndTime) => {
    if (startDate === endDate && newEndTime < startTime) {
      Swal.fire({
        title: "시간 오류",
        text: "끝 시간은 시작 시간보다 이전일 수 없습니다.",
        customClass: {
          title: "swal-title",
          htmlContainer: "swal-text-container",
          confirmButton: "swal-button swal-button-confirm",
          cancelButton: "swal-button swal-button-cancel",
        },
      });
      setEndTime(startTime);
      return false;
    }
    return true;
  };

  // 하루 종일 여부 변화 감지 함수
  const handleAllDayChange = () => {
    if (allDay) {
      // 하루 종일 여부 꺼졌을 때
      setAllDay(false);
      setStartTime(previousStartTime);
      setEndTime(previousEndTime);
    } else {
      // 하루 종일 여부 켜졌을 때
      setPreviousStartTime(startTime);
      setpreviousEndTime(endTime);
      setAllDay(true);
      // 시간 초기화
      setStartTime('');
      setEndTime('');
    }
  };

  return (
    <Container>
      <UserSelectModal title={"일정 참가자 추가"} onClose={() => setUserSelectModalOpen(false)} isOpen={userSelectModalOpen} participants={participants} setParticipants={setParticipants}>
      </UserSelectModal>

      {/* 이미지 업로드 */}
      <ImageInput onClick={() => document.getElementById('imageUpload').click()}>
        {image ? <img src={image} alt="Uploaded" className="uploaded-image" /> : '사진 업로드'}
        <input
          type="file"
          id="imageUpload"
          accept="image/*"
          onChange={handleImageUpload}
        />
      </ImageInput>

      <InputContainer>
        {/* 제목, 카테고리 선택 */}
        <TitleAndCategory className='title-category input-field'>
          <input className='title'
            type="text"
            placeholder="제목"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <select className='category' value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            <option value={null}>카테고리 없음</option>
            {/* 유저 카테고리 불러오기 */}
            {categoryList.map((category) => (
              <option key={category.id} value={category.id}>
                <span className='name'>{category.categoryName}</span>
              </option>
            ))}
          </select>
        </TitleAndCategory>
        {/* 참가자 추가 */}
        <Participants className='input-field participant'>
          <span style={{ fontSize: "18px", marginBottom: "8px" }}>참가자</span>
          <div className='participant-list'>
            {participants.map((participant, index) => (
              <div key={index} className="participant">
                <div className='profile-image'>
                  <img src={participant.profileImageUrl} alt="Profile" />
                  <div className='delete-overlay' onClick={() => setParticipants(participants.filter((_, i) => i !== index))}>
                    <img src="/images/icon/cancelWhite.svg" alt="Delete" />
                  </div>
                </div>
                <div className='username'>{participant.username}</div>
              </div>
            ))}
            <div className="participant add" onClick={handleAddParticipant}>
              <img src="/images/icon/plusLine.svg" alt="Add" />
            </div>
          </div>
        </Participants>

        {/* 일정 날짜 입력 */}
        <ScheduleInput className='input-field'>
          <div className='input-list-item'>
            <img src="/images/icon/clock.svg" alt="Calendar" className='icon' />
            <div className='date'>
              <div className='input-item'>
                <span>하루 종일</span>
                <Switch size="small" value={allDay} onChange={handleAllDayChange} />
              </div>
              <div className='input-item'>
                <span>시작 날짜</span>
                <div className='date-time'>
                  <input className='date-time-input'
                    type="date"
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value);
                      setStartTime(''); // 날짜 변경 시 시간 초기화
                    }}
                  />
                  <input className='date-time-input'
                    type="time"
                    value={startTime}
                    disabled={allDay}
                    onChange={(e) => setStartTime(e.target.value)}
                  />
                </div>
              </div>
              <div className='input-item'>
                <span>끝 날짜</span>
                <div className='date-time'>
                  <input className='date-time-input'
                    type="date"
                    value={endDate}
                    onChange={(e) => {
                      const newEndDate = e.target.value;
                      if (isEndDateVaild(newEndDate)) {
                        setEndDate(newEndDate);
                        setEndTime(''); // 날짜 변경 시 시간 초기화
                      }
                    }}
                  />
                  <input className='date-time-input'
                    type="time"
                    value={endTime}
                    disabled={allDay || !startTime}
                    onChange={(e) => {
                      const newEndTime = e.target.value;
                      // 시작 시간이 설정되었을 때 유효성 검사
                      if (startTime) {
                        if (isEndTimeValid(newEndTime)) {
                          setEndTime(e.target.value);
                        }
                      } else {
                        Swal.fire({
                          title: "시간 오류",
                          text: "시작 시간을 먼저 설정해주세요.",
                          customClass: {
                            title: "swal-title",
                            htmlContainer: "swal-text-container",
                            confirmButton: "swal-button swal-button-confirm",
                            cancelButton: "swal-button swal-button-cancel",
                          },
                        });
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className='input-list-item'>
            <img src="/images/icon/loop.svg" alt="Repeat" className='icon' />
            <div className='input-item'>
              <span>{repeat ? '반복' : '반복 안함'}</span>
              <Switch size="small" value={repeat} onChange={() => setRepeat(!repeat)} />
            </div>
          </div>

          <div className='input-list-item'>
            <img src="/images/icon/bell.svg" alt="Alarm" className='icon' />
            <div className='input-item'>
              <span>{reminder ? '5분 전 알림' : '알림 없음'}</span>
              <Switch size="small" value={reminder} onChange={() => setReminder(!reminder)} />
            </div>
          </div>

          <div className='input-list-item'>
            {viewOnlyMe ? <img src="/images/icon/lock.svg" alt="Private" className='icon' /> : <img src="/images/icon/lockOpen.svg" alt="Public" className='icon' />}
            <div className='input-item'>
              <span>{viewOnlyMe ? '나만 보기' : '전체 공개'}</span>
              <Switch size="small" value={viewOnlyMe} onChange={() => setViewOnlyMe(!viewOnlyMe)} />
            </div>
          </div>
        </ScheduleInput>


        {/* 체크리스트 */}
        <ChecklistSection className='input-field'>

          {checklist.map((item, index) => (
            <div className='ckecklist-item'>
              <input type="checkbox" checked={checkDone[index]} onChange={(e) => handleCheckboxChange(index)} />
              <input type="text" value={item} onChange={(e) => handleChecklistChange(index, e.target.value)} placeholder={`체크리스트 ${index + 1}`} style={{ flex: 1 }} />
              <div className='delete-checklist-button' onClick={() => handleDeleteChecklist(index)}>
                <img src="/images/icon/cancelWhite.svg" alt="Delete" />
              </div>
            </div>
          ))}
          <div className='add-checklist-button' onClick={handleAddChecklist}>
            <img className='icon-small' src="/images/icon/plusLine.svg" alt="Add" />
            체크리스트 추가
          </div>
        </ChecklistSection>

        {/* 상세 내용 */}
        <DescSection className='input-field'>
          <textarea
            value={detail}
            onChange={(e) => setDetail(e.target.value)}
            placeholder="일정 상세내용 입력..."
          />
        </DescSection>
      </InputContainer>
    </Container >
  );
};

export default CalendarWrite;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  box-sizing: border-box;
  padding: 24px 128px;
/* 
  & img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  } */
`;

const ImageInput = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 240px;
  border: 1px dashed #ccc;
  border-radius: 5px;
  box-sizing: border-box;
  cursor: pointer;
  font-size: 20px;
  color: #ccc;
  margin-bottom: 20px;
  flex-shrink: 0;

  .uploaded-image {
    width: auto;
    height: 100%;
    object-fit: cover;
  }

  input {
    display: none;
  }
`;

const InputContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;

  .input-field {
    border-bottom: 1px solid var(--light-gray);
    padding: 28px 0;

    &:last-of-type {
      border-bottom: none;
    }
  }
`;

const TitleAndCategory = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;

  & .title {
    width: 70%;
    font-size: 18px;
    border: 1px solid var(--light-gray);
    border-radius: 4px;
    padding: 8px;
    outline: none;
  }

  & .category {
    font-size: 16px;
    border: 1px solid var(--light-gray);
    border-radius: 4px;
    padding: 8px;
    outline: none;
    
    & option {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    }

`;

const Participants = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;

  & .participant-list {
    display: flex;
    align-items: start;
    gap: 12px;
  }

  & .participant {
    display: flex;
    flex-direction: column;
    gap: 8px;
    align-items: center;

    & .profile-image {
      position: relative;
      flex-shrink: 0;
      width: 58px;
      height: 58px;
      background-color: var(--light-gray);
      border-radius: 50%;
      display: flex;
      justify-content: center;
      align-items: center;

      &:hover .delete-overlay {
      display: flex;
    }

    & .delete-overlay {
      position: absolute;
      top: 0;
      right: 0;
      width: 20px;
      height: 20px;
      background-color: var(--dark-gray);
      border-radius: 50%;
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      display: none;
    }

    & img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 50%;
    }
  }

    &.add {
      flex-shrink: 0;
      width: 58px;
      height: 58px;
      border-radius: 50%;
      align-self: flex-start;
      border: 1px solid var(--light-gray);
      background-color: #fff;
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;

      & img {
        width: 50%;
        height: 50%;
      }
    }

  }
`;

const ScheduleInput = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;

  & .input-list-item {
    display: flex;
    gap: 12px;
    width: 100%;
    margin-bottom: 20px;
  }

  & .icon {
    width: 28px;
    height: 28px;
  }

  & .date {
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: 100%;
  }

  & .input-item {
    display: flex;
    flex-grow: 1;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
    font-size: 16px;
  }

  & .date-time {  
    display: flex;
    gap: 8px;
  }

  & .date-time-input {
    width: 100%;
    font-size: 16px;
    border: 1px solid var(--light-gray);
    border-radius: 4px;
    padding: 4px 8px;
    outline: none;
    font-family: inherit;
  }
  
`;

const ChecklistSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;

  & .icon-small {
      width: 24px;
      height: 24px;
    }

  & .ckecklist-item {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 8px;

    & input[type="checkbox"] {
      width: 18px;
      height: 18px;
      outline: none;
      border: 2px solid var(--light-gray);
    }

    & input[type="text"] {
      width: 50%;
      font-size: 16px;
      border: none;
      border-bottom: 1px solid var(--light-gray);
      padding: 8px;
      outline: none;
    }
  }

  & .delete-checklist-button {
    width: 20px;
    height: 20px;
    border: none;
    background-color: var(--light-gray);
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    margin-left: -24px;
    
    & img {
      width: 80%;
      height: 80%;
    }
  }

  & .add-checklist-button {
    width: fit-content;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 16px;
    cursor: pointer;
    flex-shrink: 1;

  }
`;

const DescSection = styled.div` 
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  padding: 24px 0;

  & textarea {
    width: 100%;
    height: 120px;
    font-size: 16px;
    border: none;
    padding: 8px;
    outline: none;
    resize: none;
    font-family: inherit;
    white-space: pre-wrap;
  }
`;
