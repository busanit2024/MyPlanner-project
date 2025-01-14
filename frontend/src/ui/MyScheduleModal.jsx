import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';
import Button from './Button';

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
    height: auto;
    display: flex;
    flex-direction: column;
    overflow-y: auto;

    /* 스크롤바 */
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

    &::-webkit-scrollbar-thumb:hover {
        background: #555;
    }
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
    padding: 5px 10px;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s ease;
    
    ${props => props.isSelected && `
        background-color: #f0f7ff;
        border: 1px solid #0066ff;
    `}

    &:hover {
        background-color: ${props => props.isSelected ? '#f0f7ff' : '#f5f5f5'};
    }

    &:last-child {
        border-bottom: none;
    }
`;

const DateRow = styled.div`
    display: flex;
    flex-direction: column;
    margin-right: 16px;
    padding: 8px 0;
    cursor: pointer;

    .date {
        font-size: 20px;
        font-weight: bold;
        color: #333;
    }

    .day {
        font-size: 14px;
        color: #999;
        margin-top: 4px;
        min-height: 0;
        border: none;
        padding: 0;
    }
`;

const ScheduleItem = styled.div`
    display: flex;
    align-items: center;
    flex: 1;
    padding: 8px 12px;
    border-radius: 4px;
    
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
    const [selectedSchedule, setSelectedSchedule] = useState(null);

    const resetState = () => {
        setSelectedSchedule(null);
        setSearchTerm('');
    }

    useEffect(() => {
        if (isOpen && user?.id) {
            resetState();
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

    const handleScheduleClick = (schedule) => {
        // 이미 선택된 일정을 다시 클릭하면 선택 취소
        if (selectedSchedule?.id === schedule.id) {
            setSelectedSchedule(null);
        } else {
            setSelectedSchedule(schedule);
        }
    };

    const handleNextClick = () => {
        if (selectedSchedule) {
            onScheduleSelect(selectedSchedule);
            onClose();
        }
    };

    const handleClose = () => {
        resetState();
        onClose();
    };

    return (
        <ModalOverlay onClick={handleClose}>
            <ModalContent onClick={e => e.stopPropagation()}>
                <ModalHeader>
                    <img 
                        className="close-button" 
                        src="images/icon/cancel.svg" 
                        alt="닫기"
                        onClick={handleClose}
                    />
                    <div className="title">내 일정</div>
                    <Button 
                        color={selectedSchedule ? "primary" : "unselected"}
                        onClick={handleNextClick}
                        disabled={!selectedSchedule}
                    >
                        공유하기
                    </Button>
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
                    <DateSection 
                        key={date} 
                        isSelected={schedules.some(schedule => schedule.id === selectedSchedule?.id)}
                        onClick={() => handleScheduleClick(schedules[0])} // 해당 날짜의 첫 번째 일정 선택
                    >
                        <DateRow onClick={(e) => {
                            e.stopPropagation();
                            handleScheduleClick(schedules[0]);
                        }}>
                            <span className="date">{formatDate(date)}</span>
                            <span className="day">{getDayOfWeek(date)}요일</span>
                        </DateRow>
                        {schedules.map(schedule => (
                            <ScheduleItem 
                                key={schedule.id}
                                onClick={() => handleScheduleClick(schedule)}
                                isSelected={selectedSchedule?.id === schedule.id}
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
