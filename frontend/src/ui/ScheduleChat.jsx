import React from "react";
import styled from "styled-components";

const ScheduleWrapper = styled.div`
  background-color: #ffffff;
  border-radius: 15px;
  border: 1px solid #B6B6B6;
  padding: 10px;
  width: 330px;
  height: 200px;
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
  justify-content: left;
  padding: 10px;
  font-size: 14px;
  color: #000000;

  .schedule-img {
    width: 25px;
    height: 25px;
    margin-right: 10px;
    color: #F9AD47;
  }

  .schedule-title {
    border-bottom: 1px solid #B6B6B6;
  }

  .schedule-time {
    margin-top: 5px;
    margin-bottom: 10px;
    font-color: #5A5A5A;
  }
`

const Button = styled.button`
  border-radius: 5px;
  border: none;
  width: 280px;
  height: 30px;
  background-color: #ECECEC;
  font-size: 14px;
  color: #000000;
  justify-content: center;
`

const ScheduleChat = ({ schedule }) => {
  if (!schedule) return null;

  return (
    <ScheduleWrapper>
      <Title>일정이 공유되었어요.</Title>
      <Content>
        <div className="schedule-img">
          <img src="/images/icon/schedule.svg" alt="일정" />
        </div>
        <div className="schedule-title">
          {schedule.startDate}
          {schedule.title}
        </div>
        <div className="schedule-time">
          시간 {schedule.startTime}
        </div>
        <Button>
          일정보기
        </Button>
      </Content>
    </ScheduleWrapper>
  );
};

export default ScheduleChat;