import { useEffect, useState } from "react";
import styled from "styled-components";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { generateDateFormat } from "../util/generateDateFormat";
import { useNavigate } from "react-router-dom";


export default function RightSidebar({ open, setOpen }) {
  const { user, loading } = useAuth();
  const [schedules, setSchedules] = useState([]);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      fetchSchedules();
    }
  }, [user, loading]);

  const fetchSchedules = async () => {
    setScheduleLoading(true);
    setSchedules([]);
    if (!user)  {
      setScheduleLoading(false);
      return;
    }
    try {
      const response = await axios.get(`/api/schedules/todo`, {
        params: {
          userId: user.id,
          size: 10,
        }
      });
      setSchedules(response.data.content);
    } catch (error) {
      console.error('Error fetching schedules:', error);
    } finally {
      setScheduleLoading(false);
    }
  };


  const getCategoryColor = (schedule) => {
    const category = schedule.category;
    return category ? category.color : 'var(--light-gray)';
  };

  // 일정 완료 체크
  const handleScheduleCheck = (scheduleId, done) => {
    axios.get(`/api/schedules/check`, {
      params: {
        id: scheduleId,
        done: done,
      }}).then((response) => {
        setSchedules(schedules.map((schedule) => {
          if (schedule.id === scheduleId) {
            return { ...schedule, done: done };
          } else {
            return schedule;
          }
        }));
      }).catch((error) => {
        console.error('Error checking schedule:', error);
      });
  };

  // 일정 체크리스트 완료 체크
  const handleTodoCheck = (todoId, done) => {
    axios.get(`/api/schedules/checklist/check`, {
      params: {
        id: todoId,
        done: done,
      }}).then((response) => {
        setSchedules(schedules.map((schedule) => {
          if (schedule.checkList) {
            return {
              ...schedule,
              checkList: schedule.checkList.map((todo) => {
                if (todo.id === todoId) {
                  return { ...todo, isDone: done };
                } else {
                  return todo;
                }
              })
            };
          } else {
            return schedule;
          }
        }));
      }).catch((error) => {
        console.error('Error checking todo:', error);
      });
  };

    

  return (
    <SidebarContainer className="right-sidebar" open={open}>
      <SidebarHeader>
        <h2>일정</h2>
        <button onClick={fetchSchedules} className="refresh">
          <img src="/images/icon/refresh.svg" alt="refresh" />
        </button>
        <button onClick={() => setOpen(false)} className="close">
          <img src="/images/icon/doubleArrowRight.svg" alt="close" />
        </button>
      </SidebarHeader>

      <ScheduleList>
        {scheduleLoading && <div className="loading">일정 불러오는 중...</div>}
        {!scheduleLoading && schedules.length === 0 && <div className="loading">예정된 일이 없어요.</div>}
        {schedules.map((schedule) => (
          <ScheduleItem key={schedule.id}>
            <div className="color-dot" style={{ backgroundColor: getCategoryColor(schedule) }}></div>
            <div className="content">
              <span className={`title ${schedule.done ? 'done' : ''}`} onClick={() => navigate(`/schedule/${schedule.id}`)}>{schedule.title}</span>
              <span className="date">{generateDateFormat(schedule.startDate, schedule.startTime, schedule.endDate, schedule.endTime)}</span>

              {schedule.checkList && (
                <ScheduleTodoList>
                  {schedule.checkList.map((todo) => (
                    <ScheduleTodoItem key={todo.id}>
                      <div className="todo-checkbox">
                        <input type="checkbox" checked={todo.isDone} onChange={(e) => handleTodoCheck(todo.id, e.target.checked)} />
                      </div>
                      <span className={`todo-content ${todo.isDone ? 'done' : ''}`}>{todo.content}</span>
                    </ScheduleTodoItem>
                  ))}
                </ScheduleTodoList>
              )}
            </div>
            <div className="checkbox">
              <input type="checkbox" checked={schedule.done} onChange={(e) => handleScheduleCheck(schedule.id, e.target.checked)} />
            </div>
          </ScheduleItem>
        ))}
      </ScheduleList>

    </SidebarContainer>
  );
}



const SidebarContainer = styled.aside`
  --sidebar-width: 300px;
  display: flex;
  position: fixed;
  top: 0;
  right: 0;
  flex-direction: column;
  gap: 24px;
  width: ${props => props.open ? 'var(--sidebar-width)' : '0'};
  padding-top: 20px;
  border-left: 1px solid;
  border-color: var(--light-gray);
  position: relative;
  right: ${props => props.open ? '0' : 'calc(-1 * var(--sidebar-width))'};
  transition: all 0.3s;
`;

const SidebarHeader = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  padding: 0 24px;

  & .close {
    justify-self: flex-end;
    margin-left: auto;
  }

  & h2 {
    font-weight: normal;
    font-size: 18px;
    margin: 0;
  }

  & button {
    background-color: white;
    border: none;
    cursor: pointer;
    width: 32px;
    height: 32px;
    margin-right: -8px;

    & img {
      width: 100%;
      height: 100%;
    }
  }


`;

const ScheduleList = styled.ul`
  list-style: none;
  padding: 0 24px;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex-grow: 1;
  overflow-y: auto;
  padding-bottom: 36px;

  & .loading {
    color: var(--mid-gray);
    justify-self: center;
    margin: 24px auto;
  }
`;

const ScheduleItem = styled.li`
  display: flex;
  align-items: flex-start;
  gap: 12px;

  & .done {
    text-decoration: line-through;
    color: var(--mid-gray);
  }

  & .color-dot {
    width: 12px;
    height: 12px;
    margin: 6px 0;
    border-radius: 50%;
    flex-shrink: 0;
    background-color: var(--light-gray);
  }

  & .content {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  & .title {
    font-size: 16px;
    -webkit-line-clamp: 2;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;

    &:hover {
      text-decoration: underline;
      cursor: pointer;
    }
  }

  & .date {
    font-size: 14px;
    color: var(--mid-gray);
  }

  & .checkbox {
    justify-self: flex-end;
    margin-left: auto;
  }
`;

const ScheduleTodoList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0;
`;

const ScheduleTodoItem = styled.li`
  display: flex;
  align-items: flex-start;  
  gap: 8px;

  & .todo-content {
    font-size: 16px;
    -webkit-line-clamp: 2;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
  }

`;