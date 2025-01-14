import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';

const ModalOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
`;

const ModalContent = styled.div`
    background: white;
    padding: 20px;
    border-radius: 5px;
    width: 600px;
    max-height: 80vh;
    overflow: hidden;
`;

const ModalHeader = styled.div`
    display: flex;
    align-items: center;
    margin-bottom: 20px;

    .close-button {
        cursor: pointer;
        width: 24px;
        height: 24px;
    }

    .title {
        flex: 1;
        text-align: left;
        font-size: 20px;
        margin: 0 20px;
    }
`;

const SearchBar = styled.div`
    display: flex;
    align-items: center;
    margin-bottom: 20px;
    padding: 10px 0;
    border-bottom: 1px solid #eee;

    img {
        width: 24px;
        height: 24px;
    }

    input {
        margin-left: 10px;
        font-size: 16px;
        border: none;
        outline: none;
        width: 100%;
    }
`;

const ScheduleList = styled.div`
    max-height: calc(80vh - 150px);
    overflow-y: auto;

    &::-webkit-scrollbar {
        width: 8px;
    }

    &::-webkit-scrollbar-track {
        background: #f1f1f1;
        border-radius: 4px;
    }

    &::-webkit-scrollbar-thumb {
        background: #888;
        border-radius: 4px;
    }
`;

const DateSection = styled.div`
    display: flex;
    margin-bottom: 5px;
    padding: 5px 0;
    border-bottom: 1px solid #eee;

    &:last-child {
        border-bottom: none;
    }
`;

const DateRow = styled.div`
    display: flex;
    flex-direction: column;
    margin-right: 16px;

    .date {
        font-size: 20px;
        font-weight: bold;
        color: #333;
    }

    .day {
        font-size: 14px;
        color: #999;
        margin-top: 4px;
        min-height: 0; /* 추가: 기존 min-height 덮어쓰기 */
        border: none;
        padding: 0; /* 추가: 기존 padding 제거 */
    }
`;

const ScheduleItem = styled.div`
    display: flex;
    align-items: center;
    flex: 1;
    padding: 4px 0;

    .time {
        font-size: 14px;
        color: #666;
        margin-right: 16px;
    }

    .title {
        flex: 1;
        font-size: 16px;
        color: #333;
        font-weight: 500;
    }
`;

const MyScheduleModal = ({ isOpen, onClose, onScheduleSelect }) => {
    const { user } = useAuth();
    const [schedules, setSchedules] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (isOpen && user?.id) {
            fetchSchedules();
        }
    }, [isOpen, user]);

    const fetchSchedules = async () => {
        try {
            const response = await fetch(`/api/schedules/todo?userId=${user.id}&size=20`);
            const data = await response.json();
            setSchedules(data.content);
        } catch (error) {
            console.error('일정 로드 실패:', error);
        }
    };

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return `${date.getMonth() + 1}.${date.getDate()}`;
    };

    const getDayOfWeek = (dateStr) => {
        const days = ['일', '월', '화', '수', '목', '금', '토'];
        return days[new Date(dateStr).getDay()];
    };

    const formatTime = (timeStr) => {
        return timeStr?.substring(0, 5) || '';
    };

    const groupSchedulesByDate = (schedules) => {
        return schedules
            .filter(schedule => 
                schedule.title?.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .reduce((groups, schedule) => {
                const date = schedule.startDate;
                if (!groups[date]) groups[date] = [];
                groups[date].push(schedule);
                return groups;
            }, {});
    };

    if (!isOpen) return null;

    const groupedSchedules = groupSchedulesByDate(schedules);

    return (
        <ModalOverlay onClick={onClose}>
            <ModalContent onClick={e => e.stopPropagation()}>
                <ModalHeader>
                    <img 
                        className="close-button" 
                        src="images/icon/cancel.svg" 
                        alt="닫기"
                        onClick={onClose}
                    />
                    <div className="title">내 일정</div>
                </ModalHeader>

                <SearchBar>
                    <img src="images/icon/search.svg" alt="검색" />
                    <input
                        type="text"
                        placeholder="일정 검색"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </SearchBar>

                <ScheduleList>
                    {Object.entries(groupedSchedules).map(([date, schedules]) => (
                        <DateSection key={date}>
                            <DateRow>
                                <span className="date">{formatDate(date)}</span>
                                <span className="day">{getDayOfWeek(date)}요일</span>
                            </DateRow>
                            {schedules.map(schedule => (
                                <ScheduleItem 
                                    key={schedule.id}
                                    onClick={() => onScheduleSelect(schedule)}
                                >
                                    <span className="time">{formatTime(schedule.startTime)}</span>
                                    <span className="title">{schedule.title}</span>
                                </ScheduleItem>
                            ))}
                        </DateSection>
                    ))}
                </ScheduleList>
            </ModalContent>
        </ModalOverlay>
    );
};

export default MyScheduleModal;
