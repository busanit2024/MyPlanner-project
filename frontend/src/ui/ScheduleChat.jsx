import React from "react";
import styled from "styled-components";
import { useNavigate } from 'react-router-dom';

const ScheduleWrapper = styled.div`
  background-color: #ffffff;
  border-radius: 15px;
  border: 1px solid #B6B6B6;
  padding: 15px;
  width: 300px;
`

const Title = styled.div`
  font-size: 20px;
  font-weight: bold;
  padding: 5px;
  color: #000000;
  justify-content: left;
  border-bottom: 1px solid #B6B6B6;
`

const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;  // 요소들 사이 간격
  padding: 10px;
  font-size: 14px;
  color: #000000;
  margin-top: 5px;

  .schedule-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 5px;
  }

  .schedule-img-container {
    position: relative;
    width: 20px;
    height: 20px;
    margin-right: 20px;
    margin-bottom: 10px
  }

  .schedule-img {
    position: absolute;
    width: 30px;
    height: 30px;
    z-index: 1;
  }

  .schedule-img-background {
    position: absolute;
    width: 42px;
    height: 42px;
    background-color: #FFB800;  // 원하는 배경색으로 변경
    border-radius: 50%;
    left: -6px;
    top: -6px;
  }

  .schedule-title {
    display: flex;
    flex-direction: column;  // 세로 방향으로 변경
    gap: 3px;  // 날짜와 제목 사이 간격 조정
    color: #000000;
  }

  .schedule-date {
    font-size: 14px;
  }

  .schedule-name {
    font-size: 14px;
  }

  .schedule-time {
    display: flex;
    gap: 20px;
    color: #5A5A5A;
    margin-top: 10px;
    border-top: 1px solid #B6B6B6;
    padding-top: 15px;

    &::before {
      content: "시간";
      color: #000000;
    }
  }
`

const Button = styled.button`
  border-radius: 5px;
  border: none;
  width: 100%;
  height: 35px;
  background-color: #F5F5F5;
  font-size: 14px;
  color: #000000;
  margin-top: 5px;
  cursor: pointer;
`

const ScheduleChat = ({ schedule }) => {
  const navigate = useNavigate();
  
  if (!schedule) return null;

  const handleScheduleClick = () => {
    const eventData = {
      id: schedule.id,
      title: schedule.title,
      start: new Date(schedule.startDate),
      end: new Date(schedule.endDate)
    };
    
    navigate(`/schedule/${schedule.id}`, {
      state: { eventData }
    });
  };

  // 날짜 포맷팅 함수 추가
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}월${date.getDate()}일`;
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? '오후' : '오전';
    const formattedHours = hours % 12 || 12;
    return `${ampm} ${formattedHours}:${minutes.toString().padStart(2, '0')}`;
  };

  return (
    <ScheduleWrapper>
      <Title>일정이 공유되었어요.</Title>
      <Content>
        <div className="schedule-header">
          <div className="schedule-img-container">
            <div className="schedule-img-background" />
            <img className="schedule-img" src="/images/icon/schedule.svg" alt="일정" />
          </div>
          <div className="schedule-title">
            <span className="schedule-date">{formatDate(schedule.startDate)}</span>
            <span className="schedule-name">{schedule.title}</span>
          </div>
        </div>
        <div className="schedule-time">
          {formatTime(schedule.startDate)}
        </div>
        <Button onClick={handleScheduleClick}>일정보기</Button>
      </Content>
    </ScheduleWrapper>
  );
};

export default ScheduleChat;