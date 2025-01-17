import React, { useState, useEffect, useRef } from 'react';
import '../../css/CalendarWrite.css';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { imageFileUpload } from '../../firebase';
import styled from 'styled-components';
import Switch from '../../ui/Switch';
import { useSearch } from '../../context/SearchContext';
import UserSelectModal from './UserSelectModal';
import Button from '../../ui/Button';
import Comments from './Comments';
import Swal from 'sweetalert2';
import { generateDateFormat } from '../../util/generateDateFormat';


const defaultProfileImageUrl = '/images/default/defaultProfileImage.png';

const CalendarUpdate = () => {
  const { user, loading } = useAuth();
  const { setOnEditSchedule, setOnDeleteSchedule, setOnCompleteSchedule, setIsOwnerContext, setIsDone } = useSearch();
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const eventData = location.state?.eventData;

  const [label, setLabel] = useState({ color: '' });
  const [cancelButtonHover, setCancelButtonHover] = useState(false);

  const [scheduleLoading, setScheduleLoading] = useState(true);

  const [title, setTitle] = useState(eventData?.title || '');
  const [categoryList, setCategoryList] = useState([]);
  const [categoryId, setCategoryId] = useState(eventData?.categoryId || 5); // 카테고리 ID
  const [participants, setParticipants] = useState(eventData?.participants || []); // 참가자
  const [newParticipants, setNewParticipants] = useState([]); // 추가할 참가자
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
  const [checklist, setChecklist] = useState((eventData?.checkList || []));
  const [detail, setDetail] = useState(eventData?.detail || ''); // 상세 내용
  const [image, setImage] = useState(eventData?.imageUrl || null); // 이미지 URL
  const [createdAt, setCreatedAt] = useState(eventData?.createdAt || '');   // 생성 날짜
  const [color, setColor] = useState(eventData?.color || '');   // 색상
  const [done, setDone] = useState(eventData?.done);  // 일정 완료 여부
  const [isOwner, setIsOwner] = useState(false);  // 작성자 확인
  const [userSelectModalOpen, setUserSelectModalOpen] = useState(false);
  const [likeUserIds, setLikeUserIds] = useState([]);
  const [scheduleOwner, setScheduleOwner] = useState(null);
  const [isPrivate, setIsPrivate] = useState(false);
  const doneRef = useRef(done);
  const newParticipantsRef = useRef(newParticipants);

  useEffect(() => {
    //탑바에서 수정, 삭제, 완료 버튼 표시하기 위해 context 사용
    setOnDeleteSchedule(() => handleDelete);
    setOnCompleteSchedule(() => handleComplete);
  }, [setOnCompleteSchedule, setOnDeleteSchedule]);

  useEffect(() => {
    setOnEditSchedule(() => handleSubmit);
  }, [setOnEditSchedule, title, categoryId, participants, startDate, endDate, startTime, endTime, allDay, repeat, reminder, viewOnlyMe, checklist, detail, image, color, done]);

  useEffect(() => {
    setIsOwnerContext(isOwner);
  }, [setIsOwnerContext, isOwner]);

  useEffect(() => {
    newParticipantsRef.current = newParticipants;
  }, [newParticipants]);

  useEffect(() => {
    setIsDone(done);
    doneRef.current = done;
  }, [setIsDone, done]);
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
          setCategoryId(scheduleData.category?.id);
          setParticipants(scheduleData.participants);
          setNewParticipants(scheduleData.participants.map((participant) => ({
            id: participant.user.id,
            username: participant.user.username,
            profileImageUrl: participant.user.profileImageUrl,
            email: participant.user.email,
            status: participant.status
          })));
          setScheduleOwner(scheduleData.user);
          setStartDate(scheduleData.startDate.split('T')[0]);
          setEndDate(scheduleData.endDate.split('T')[0]);
          setStartTime(scheduleData.startTime);
          setEndTime(scheduleData.endTime);
          setAllDay(scheduleData.allDay);
          setRepeat(scheduleData.isRepeat === "true");
          setReminder(scheduleData.isAlarm);
          setViewOnlyMe(scheduleData.isPrivate);
          //setChecklist((scheduleData.checkList || []).map(item => item.content)); 
          setChecklist(scheduleData.checkList || []);
          setDetail(scheduleData.detail);
          setImage(scheduleData.imageUrl);
          setCreatedAt(scheduleData.createdAt);
          setColor(scheduleData.color || '');
          setLabel({ color: scheduleData.color || '' });
          setDone(scheduleData.done);
          setIsPrivate(scheduleData.isPrivate);

          // 작성자 확인
          setIsOwner(scheduleData.user?.id === user?.id);

          setCategoryList(scheduleData.user?.categories);

          setLikeUserIds(scheduleData.heartUserIds);

          const today = new Date();
          const formattedDate = today.toISOString().split('T')[0];
          setDate(formattedDate);
        } else {
          throw new Error("일정 데이터가 없습니다.");
        }
      } catch (error) {
        console.error('일정 데이터 불러오기 실패:', error.response ? error.response.data : error.message);
        Swal.fire({
          title: '일정 불러오기 실패',
          text: '일정을 불러오는 중 오류가 발생했습니다. 다시 시도해 주세요.',
          confirmButtonText: '확인',
          customClass: {
            title: "swal-title",
            htmlContainer: "swal-text-container",
            confirmButton: "swal-button swal-button-confirm",
          },
        });
        navigate('/calendar');
      } finally {
        setScheduleLoading(false);
      }
    };

    if (id && user && !loading) {
      setScheduleLoading(true);
      fetchSchedule();
    }
  }, [id, user, loading]);

  const handleAddParticipant = () => {
    setUserSelectModalOpen(true);
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

  // 참가 여부 체크
  const checkParticipation = () => {
    if (!user) {
      return false;
    }

    return newParticipants.some((participant) => participant.id === user?.id && participant.status === 'ACCEPTED');
  };

  // 참가 버튼 클릭
  const handleParticipate = () => {
    Swal.fire({
      title: '일정 참가하기',
      text: '이 일정에 참가하시겠습니까?',
      showCancelButton: true,
      confirmButtonText: '참가',
      cancelButtonText: '취소',
      customClass: {
        title: "swal-title",
        htmlContainer: "swal-text-container",
        confirmButton: "swal-button swal-button-confirm",
        cancelButton: "swal-button swal-button-cancel",
      },
    }).then((result) => {
      if (result.isConfirmed) {
        participate();
      }
    });
  };

  const participate = async () => {
    if (!user) {
      return;
    }
    try {
      const response = await axios.get(`/api/schedules/participate/${id}`, {
        params: {
          userId: user.id,
        }
      });
      if (response.data === 'success') {
        setNewParticipants([...newParticipants, { id: user.id, username: user.username, profileImageUrl: user.profileImageUrl, email: user.email, status: 'ACCEPTED' }]);
        Swal.fire({
          title: '참가 요청 완료',
          text: '일정에 참가했습니다.',
          confirmButtonText: '확인',
          customClass: {
            title: "swal-title",
            htmlContainer: "swal-text-container",
            confirmButton: "swal-button swal-button-confirm",
          },
        });
      }
    } catch (error) {
      console.error("참가 요청 중 오류 발생: ", error.response.data);
      Swal.fire({
        title: '참가 요청 실패',
        text: '일정 참가 요청에 실패했습니다. 다시 시도해 주세요.',
        confirmButtonText: '확인',
        customClass: {
          title: "swal-title",
          htmlContainer: "swal-text-container",
          confirmButton: "swal-button swal-button-confirm",
        },
      });
    };
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

  const handleDelete = () => {
    Swal.fire({
      title: '일정 삭제',
      text: '일정을 삭제하시겠습니까?',
      showCancelButton: true,
      confirmButtonText: '삭제',
      cancelButtonText: '취소',
      customClass: {
        title: "swal-title",
        htmlContainer: "swal-text-container",
        confirmButton: "swal-button swal-button-danger",
        cancelButton: "swal-button swal-button-cancel",
      },
    }).then((result) => {
      if (result.isConfirmed) {
        deleteSchedule();
      }
    });
  };

  const deleteSchedule = async () => {
    try {
      await axios.delete(`/api/schedules/${id}`);
      Swal.fire({
        title: '일정 삭제 완료',
        text: '일정을 삭제했습니다.',
        confirmButtonText: '확인',
        customClass: {
          title: "swal-title",
          htmlContainer: "swal-text-container",
          confirmButton: "swal-button swal-button-confirm",
        },
      });
      navigate('/calendar');
    } catch (error) {
      console.error("일정 삭제 중 오류 발생: ", error.response.data);
      Swal.fire({
        title: '일정 삭제 실패',
        text: '일정 삭제에 실패했습니다. 다시 시도해 주세요.',
        confirmButtonText: '확인',
        customClass: {
          title: "swal-title",
          htmlContainer: "swal-text-container",
          confirmButton: "swal-button swal-button-confirm",
        },
      });
    }
  };


  const handleComplete = async () => {
    let confirmed = false;
    let checkDone = false;


    await Swal.fire({
      title: '일정 완료 상태 변경',
      text: `${doneRef.current ? '완료되지 않은' : '완료된'} 일정으로 변경하시겠습니까?`,
      showCancelButton: true,
      confirmButtonText: '변경',
      cancelButtonText: '취소',
      customClass: {
        title: "swal-title",
        htmlContainer: "swal-text-container",
        confirmButton: "swal-button swal-button-confirm",
        cancelButton: "swal-button swal-button-cancel",
      },
    }).then((result) => {
      checkDone = !doneRef.current;
      if (result.isConfirmed) {
        confirmed = true;
      }
    });

    if (confirmed) {
      try {
        await axios.get(`/api/schedules/check`, {
          params: {
            id: id,
            done: checkDone,
          }
        });  // 일정 완료 처리
        setDone(checkDone);
        checkDone
          ? Swal.fire({
            title: '일정 완료 상태 변경',
            text: '일정이 완료된 상태로 변경되었습니다.',
            confirmButtonText: '확인',
            customClass: {
              title: "swal-title",
              htmlContainer: "swal-text-container",
              confirmButton: "swal-button swal-button-confirm",
            },
          })
          : Swal.fire({
            title: '일정 완료 상태 변경',
            text: '일정이 완료되지 않은 상태로 변경되었습니다.',
            confirmButtonText: '확인',
            customClass: {
              title: "swal-title",
              htmlContainer: "swal-text-container",
              confirmButton: "swal-button swal-button-confirm",
            },
          });
      } catch (error) {
        console.error("일정 완료 상태 변경 중 오류 발생: ", error.response.data);
        Swal.fire({
          title: '일정 완료 상태 변경 실패',
          text: '일정 완료 상태 변경에 실패했습니다. 다시 시도해 주세요.',
          confirmButtonText: '확인',
          customClass: {
            title: "swal-title",
            htmlContainer: "swal-text-container",
            confirmButton: "swal-button swal-button-confirm",
          },
        });
      }
    }
  };

  const handleSubmit = async () => {
    if (!user) return;
    const scheduleData = {
      title: title,
      category: categoryList.find((category) => category.id === parseInt(categoryId)) || null,
      startDate: startDate || date,
      endDate: endDate || date,
      startTime: startTime,
      endTime: endTime,
      allDay: allDay,
      isRepeat: repeat,
      isAlarm: reminder,
      isPrivate: viewOnlyMe,
      checkList: checklist,
      detail: detail,
      imageUrl: image || '',
      done: done,
      createdAt: createdAt,
      userId: user?.id || '',
      color: color,
    };

    console.log("제출할 데이터: ", scheduleData);

    const newParticipantList = newParticipantsRef.current;
    console.log("새로운 참가자 목록: ", newParticipantList);
    console.log("기존 참가자 목록: ", participants);

    const newUsers = newParticipantList.filter((participant) =>
      !participants.some((p) => p.user.id === participant.id)
    );

    const usersDeclined = newParticipantList.filter((participant) =>
      participants.some((p) => p.user.id === participant.id && p.status === 'DECLINED')
    );

    const usersToInvite = [...newUsers, ...usersDeclined];

    const usersToDelete = participants.filter((participant) =>
      !newParticipantList.some((p) => p.id === participant.user.id)
    );

    console.log("초대할 사용자: ", usersToInvite);
    console.log("삭제할 사용자: ", usersToDelete);

    try {
      const response = await axios.put(`/api/schedules/${id}`, JSON.stringify(scheduleData), {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (usersToInvite.length > 0) {
        await axios.post(`/api/schedules/invite/${id}`, usersToInvite.map((user) => user.id));
      }

      if (usersToDelete.length > 0) {
        await axios.post(`/api/schedules/invite/${id}/cancel`, usersToDelete.map((user) => user.user.id));
      }

      Swal.fire({
        title: '일정 수정 완료',
        text: '일정이 수정되었습니다.',
        confirmButtonText: '확인',
        customClass: {
          title: "swal-title",
          htmlContainer: "swal-text-container",
          confirmButton: "swal-button swal-button-confirm",
        },
      });

      navigate('/calendar');


    } catch (error) {
      console.error('일정 수정 중 오류 발생:', error.response.data);
      Swal.fire({
        title: '일정 수정 실패',
        text: '일정 수정에 실패했습니다. 다시 시도해 주세요.',
        confirmButtonText: '확인',
        customClass: {
          title: "swal-title",
          htmlContainer: "swal-text-container",
          confirmButton: "swal-button swal-button-confirm",
        },
      });
    }
  };

  const handleMouseEnter = () => {
    setCancelButtonHover(true);
  };

  const handleMouseLeave = () => {
    setCancelButtonHover(false);
  };

  const handleParticipateCancel = () => {
    Swal.fire({
      title: '참가 취소',
      text: '일정 참가를 취소하시겠습니까?',
      showCancelButton: true,
      confirmButtonText: '참가 취소',
      cancelButtonText: '돌아가기',
      customClass: {
        title: "swal-title",
        htmlContainer: "swal-text-container",
        confirmButton: "swal-button swal-button-danger",
        cancelButton: "swal-button swal-button-cancel",
      },
    }).then((result) => {
      if (result.isConfirmed) {
        participateCancel();
      }
    });
  }

  const participateCancel = async () => {
    if (!user) {
      return;
    }
    try {
      const response = await axios.get(`/api/schedules/participate/${id}/cancel`, {
        params: {
          userId: user.id,
        }
      });
      if (response.data === 'success') {
        setNewParticipants(newParticipants.filter((participant) => participant.id !== user.id));
        Swal.fire({
          title: '참가 취소 완료',
          text: '일정 참가를 취소했습니다.',
          confirmButtonText: '확인',
          customClass: {
            title: "swal-title",
            htmlContainer: "swal-text-container",
            confirmButton: "swal-button swal-button-confirm",
          },
        });
      }
    } catch (error) {
      console.error("참가 취소 요청 중 오류 발생: ", error.response.data);
      Swal.fire({
        title: '참가 취소 실패',
        text: '일정 참가 취소에 실패했습니다. 다시 시도해 주세요.',
        confirmButtonText: '확인',
        customClass: {
          title: "swal-title",
          htmlContainer: "swal-text-container",
          confirmButton: "swal-button swal-button-confirm",
        },
      });
    };
  }


  // 일정이 로딩된 경우 출력할 화면
  const schedulePage = (
    <>
      <UserSelectModal title={"일정 참가자 추가"} onClose={() => setUserSelectModalOpen(false)} isOpen={userSelectModalOpen} participants={newParticipants} setParticipants={setNewParticipants}>
      </UserSelectModal>

      {/* 이미지 업로드 */}
      {isOwner ? (
        <ImageInput onClick={() => document.getElementById('imageUpload').click()}>
          {image ? <img src={image} alt="Uploaded" className="uploaded-image" /> : '사진 업로드'}
          <input
            type="file"
            id="imageUpload"
            accept="image/*"
            onChange={handleImageUpload}
            disabled={!isOwner || done}
          />
        </ImageInput>
      ) : image && (
        <ImageContainer>
          <img src={image} alt="Schedule" />
        </ImageContainer>
      )}

      {!isOwner && (
        <ProfileContainer onClick={() => navigate(`/user/${scheduleOwner.id}`)}>
          <div className='profile-image'>
            <img src={scheduleOwner?.profileImageUrl || defaultProfileImageUrl} onError={(e) => e.target.src = defaultProfileImageUrl} alt="profile" />
          </div>
          <div className='username'>{scheduleOwner?.username}</div>
        </ProfileContainer>
      )}

      <InputContainer>
        {/* 제목, 카테고리 선택 */}
        <TitleAndCategory className='title-category input-field'>
          <input className='title'
            type="text"
            placeholder={`${isOwner ? "제목" : "제목 없는 일정"} ${done ? '(완료된 일정)' : ''}`}
            value={`${title}`}
            onChange={(e) => setTitle(e.target.value)}
            disabled={!isOwner || done}
          />
          {isOwner ? (
            <select className='category' onChange={(e) => {
              setCategoryId(e.target.value);
              // 카테고리 업데이트
            }}
              disabled={!isOwner || done}
              value={categoryId}
            >
              <option value={null}>카테고리 없음</option>
              {/* 유저 카테고리 불러오기 */}
              {categoryList.map((category) => (
                <option key={category.id} value={category.id}>
                  <span className='name'>{category.categoryName}</span>
                </option>
              ))}
            </select>
          ) : (
            <div className='category-box'>
              {categoryList.find((category) => category.id === categoryId)?.categoryName || '카테고리 없음'}
            </div>
          )}
        </TitleAndCategory>

        {/* 참가자 목록 */}
        <Participants className='input-field participant'>
          <span style={{ fontSize: "18px", marginBottom: "8px" }}>
            {`${newParticipants.filter((participant) => participant.status === 'ACCEPTED').length}명 참가중`}
          </span>
          <div className='participant-list'>
            {newParticipants.map((participant, index) => (
              <div key={index} className="participant">
                <div className='profile-image'>
                  <img src={participant?.profileImageUrl || defaultProfileImageUrl} onError={(e) => e.target.src = defaultProfileImageUrl} alt="profile" />
                  {isOwner && (
                    <div className='delete-overlay' onClick={() => setNewParticipants(newParticipants.filter((_, i) => i !== index))}>
                      <img src="/images/icon/cancelWhite.svg" alt="Delete" />
                    </div>
                  )}
                  <div className={`status-overlay ${participant.status !== 'ACCEPTED' && 'visible'}`} >
                    {participant.status === 'PENDING' ? '초대중' : participant.status === 'DECLINED' ? '거절됨' : '추가됨'}
                  </div>
                </div>
                <div className='username' onClick={() => navigate(`/user/${participant.id}`)}>
                  {participant?.username}
                </div>
              </div>
            ))}
            {isOwner && (
              <div className="participant add" onClick={handleAddParticipant}>
                <img src="/images/icon/plusLine.svg" alt="Add" />
              </div>
            )}
            {!isOwner && newParticipants.length === 0 && <div className='no-participant'>참가자 없음</div>}
            {!isOwner &&
              <div className='participate-button'>
                {checkParticipation() ? (
                  <Button color={cancelButtonHover ? 'danger' : 'gray'}
                    onClick={handleParticipateCancel}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                  >
                    {cancelButtonHover ? '참가 취소' : '참가중'}
                  </Button>
                ) : (
                  <Button color="primary" onClick={handleParticipate}>참가하기</Button>
                )}
              </div>
            }
          </div>
        </Participants>

        {/* 일정 날짜 입력 */}
        <ScheduleInput className='input-field'>

          <div className='input-list-item'>
            <img src="/images/icon/clock.svg" alt="Calendar" className='icon' />
            {isOwner && (
              <div className='date'>
                <div className='input-item'>
                  <span>하루 종일</span>
                  {(isOwner && !done) && <Switch size="small" value={allDay} onChange={() => setAllDay(!allDay)} />}
                </div>
                <div className='input-item'>
                  <span>시작 날짜</span>
                  <div className='date-time'>
                    <input className='date-time-input'
                      type="date"
                      value={startDate}
                      disabled={!isOwner || done}
                      onChange={(e) => {
                        setStartDate(e.target.value);
                        setStartTime(''); // 날짜 변경 시 시간 초기화
                      }}
                    />
                    {(isOwner || startTime) &&
                      <input className='date-time-input'
                        type="time"
                        value={startTime}
                        disabled={allDay || !isOwner || done}
                        onChange={(e) => setStartTime(e.target.value)}
                      />
                    }
                  </div>
                </div>
                <div className='input-item'>
                  <span>끝 날짜</span>
                  <div className='date-time'>
                    <input className='date-time-input'
                      type="date"
                      value={endDate}
                      disabled={!isOwner || done}
                      onChange={(e) => {
                        setEndDate(e.target.value);
                        setEndTime(''); // 날짜 변경 시 시간 초기화
                      }}
                    />
                    {(isOwner || endTime) &&
                      <input className='date-time-input'
                        type="time"
                        value={endTime}
                        disabled={allDay || !isOwner || done}
                        onChange={(e) => setEndTime(e.target.value)}
                      />
                    }
                  </div>
                </div>
              </div>
            )}
            {!isOwner && (
              <div className='date-format'>
                <span className='formated-date'>{generateDateFormat(startDate, startTime, endDate, endTime, 'long')}</span>
                <span className='allday'>{allDay ? '(하루 종일)' : ''}</span>
              </div>
            )}

          </div>

          {isOwner && (
            <>
              <div className='input-list-item'>
                <img src="/images/icon/loop.svg" alt="Repeat" className='icon' />
                <div className='input-item'>
                  <span>{repeat ? '반복' : '반복 안함'}</span>
                  {(isOwner && !done) && <Switch size="small" value={repeat} onChange={() => setRepeat(!repeat)} />}
                </div>
              </div>

              <div className='input-list-item'>
                <img src="/images/icon/bell.svg" alt="Alarm" className='icon' />
                <div className='input-item'>
                  <span>{reminder ? '5분 전 알림' : '알림 없음'}</span>
                  {(isOwner && !done) && <Switch size="small" value={reminder} onChange={() => setReminder(!reminder)} />}
                </div>
              </div>

              <div className='input-list-item'>
                {viewOnlyMe ? <img src="/images/icon/lock.svg" alt="Private" className='icon' /> : <img src="/images/icon/lockOpen.svg" alt="Public" className='icon' />}
                <div className='input-item'>
                  <span>{viewOnlyMe ? '나만 보기' : '전체 공개'}</span>
                  {(isOwner && !done) && <Switch size="small" value={viewOnlyMe} onChange={() => setViewOnlyMe(!viewOnlyMe)} />}
                </div>
              </div>
            </>
          )}
        </ScheduleInput>

        {/* 체크리스트 */}
        {(isOwner || checklist.length > 0) &&
          <ChecklistSection className='input-field'>

            {checklist.map((item, index) => (
              <div className='ckecklist-item'>
                <input type="checkbox" checked={item.isDone} onChange={(e) => handleCheckboxChange(index)} disabled={!isOwner || done} />
                <input type="text" value={item.content} onChange={(e) => handleChecklistChange(index, e.target.value)} placeholder={`체크리스트 ${index + 1}`} style={{ flex: 1 }} disabled={!isOwner || done} />
                {isOwner &&
                  <div className='delete-checklist-button' onClick={() => handleDeleteChecklist(index)}>
                    <img src="/images/icon/cancelWhite.svg" alt="Delete" />
                  </div>}
              </div>
            ))}
            {(isOwner && !done && checklist.length < 10) && (
              <div className='add-checklist-button' onClick={handleAddChecklist}>
                <img className='icon-small' src="/images/icon/plusLine.svg" alt="Add" />
                체크리스트 추가
              </div>
            )}
          </ChecklistSection>
        }

        {/* 상세 내용 */}
        {(isOwner || detail) &&
          <DescSection className='input-field'>
            <textarea
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              placeholder={`${isOwner ? "일정 상세 내용을 입력해 보세요." : ""}`}
              disabled={!isOwner || done}
            />
          </DescSection>
        }

      </InputContainer>

      {/* 댓글 */}
      <Comments scheduleId={id} likeUserIds={likeUserIds} />
    </>
  );

  const privateSchedule = (
    <PrivateContainer>
      <div className='private'>비공개 일정입니다.</div>
      <Button color="primary" onClick={() => navigate(-1)}>뒤로가기</Button>
    </PrivateContainer>
  );



  return (
    <Container>
      {scheduleLoading ? <div className='loading'>일정 로딩중...</div> : (!isOwner && isPrivate) ? privateSchedule : schedulePage}
    </Container>
    
  );
};

export default CalendarUpdate;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  box-sizing: border-box;
  padding: 24px 128px;
  flex-grow: 1;

`;

const PrivateContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  flex-grow: 1;
  gap: 24px;
  margin-top: -120px;

  .private {
    font-size: 18px;
    color: var(--dark-gray);
  }

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

  .uploaded-image {
    height: 100%;
    width: auto;
    object-fit: cover;
  }

  input {
    display: none;
  }
`;

const ImageContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 240px;
  border: 1px solid #ccc;
  border-radius: 5px;
  box-sizing: border-box;
  margin-bottom: 20px;
  overflow: hidden;

  img {
    height: 100%;
    width: auto;
    object-fit: cover;
  }
`;

const ProfileContainer = styled.div`  
  display: flex;
  width: 100%;
  align-items: center;
  gap: 12px;
  margin-top: 12px;
  cursor: pointer;

  .profile-image {
    width: 42px;
    height: 42px;
    border-radius: 50%;
    overflow: hidden;
    background-color: var(--light-gray);

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  .username {
    font-weight: bold;
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

    &:disabled {
      background-color: transparent;
      border: none;
      color: #000;
    }

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

  & .category-box {
    font-size: 16px;
    border: 1px solid var(--light-gray);
    border-radius: 4px;
    padding: 8px;
    min-width: 48px;
    display: flex;
    justify-content: center;
    align-items: center;
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

  & .no-participant {
    font-size: 16px;
    color: var(--mid-gray);
    align-self: center;
  }

  & .participate-button {
    display: flex;
    justify-self: flex-end;
    margin-left: auto;
    align-self: center;
  }

  & .participant {
    display: flex;
    flex-direction: column;
    gap: 4px;
    align-items: center;

    & .username {
      font-size: 14px;
      cursor: pointer;
      
      &:hover {
        text-decoration: underline;
      }
    }

    & .profile-image {
      position: relative;
      flex-shrink: 0;
      width: 50px;
      height: 50px;
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
      z-index: 2;
    }

    & .status-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background-color: #000;
      opacity: 0.5;
      color: #fff;
      justify-content: center;
      align-items: center;
      display: none;
      cursor: default;

      &.visible {
        display: flex;
      }
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
      width: 50px;
      height: 50px;
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

    &:disabled {
      background-color: transparent;
      border: none;
      color: #000;
    }
  }

  & .date-format {
    font-size: 16px;
    display: flex;
    gap: 4px;
  }

  & .allday {
    color: var(--dark-gray);
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

    & .no-checklist {
      font-size: 16px;
      color: var(--mid-gray);
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

      &:disabled {
        background-color: transparent;
        border: none;
        color: #000;
      }

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
    min-height: 32px;
    font-size: 16px;
    border: none;
    padding: 8px;
    outline: none;
    resize: none;
    font-family: inherit;
    white-space: pre-wrap;

    &:disabled {
      background-color: transparent;
      border: none;
      color: #000;
    }
  }
`;
