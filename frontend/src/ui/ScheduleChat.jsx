import React from "react";
import styled from "styled-components";

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
  padding: 10px;
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

  .schedule-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 5px;
  }

  .schedule-img {
    width: 20px;
    height: 20px;
  }

  .schedule-title {
    display: flex;
    gap: 5px;
    color: #000000;
  }

  .schedule-time {
    color: #5A5A5A;
    margin-left: 30px;  // 아이콘 너비만큼 들여쓰기
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
  if (!schedule) return null;

  return (
    <ScheduleWrapper>
      <Title>일정이 공유되었어요.</Title>
      <Content>
        <div className="schedule-header">
          <img className="schedule-img" src="/images/icon/schedule.svg" alt="일정" />
          <div className="schedule-title">
            <span>{schedule.startDate}</span>
            <span>{schedule.title}</span>
          </div>
        </div>
        <div className="schedule-time">
          시간 {schedule.startTime}
        </div>
        <Button>일정보기</Button>
      </Content>
    </ScheduleWrapper>
  );
};

export default ScheduleChat;