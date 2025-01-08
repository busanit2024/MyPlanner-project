package com.busanit.myplannerbackend.service;

import com.busanit.myplannerbackend.domain.ScheduleDTO;
import com.busanit.myplannerbackend.entity.Schedule;
import com.busanit.myplannerbackend.repository.ScheduleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ScheduleService {

    @Autowired
    private ScheduleRepository scheduleRepository;

    // 일정 등록
    public void createSchedule(ScheduleDTO scheduleDTO) {
        scheduleRepository.save(ScheduleDTO.toEntity(scheduleDTO));
    }

    // 모든 일정 조회
    public List<Schedule> getAllSchedules() {
        return scheduleRepository.findAll();
    }

    // 특정 사용자 일정 조회
    public List<Schedule> getAllSchedules(Long id) {
        return scheduleRepository.findByUserId(id);
    }

    // 특정 일정 조회
    public Optional<Schedule> getScheduleById(Long id) {
        return scheduleRepository.findById(id);
    }

    // 특정 사용자 ID로 일정 조회
    public List<Schedule> getSchedulesByUserId(Long userId) {
        return scheduleRepository.findByUserId(userId);
    }

    // 일정 수정
    public Schedule updateSchedule(Long id, Schedule scheduleDetails) {
        Schedule schedule = scheduleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("일정을 찾을 수 없습니다."));

        schedule.setTitle(scheduleDetails.getTitle());
        schedule.setCategory(scheduleDetails.getCategory());
        schedule.setStartDate(scheduleDetails.getStartDate());
        schedule.setStartTime(scheduleDetails.getStartTime());
        schedule.setEndDate(scheduleDetails.getEndDate());
        schedule.setEndTime(scheduleDetails.getEndTime());
        schedule.setAllDay(scheduleDetails.getAllDay());
        schedule.setIsRepeat(scheduleDetails.getIsRepeat());
        schedule.setIsAlarm(scheduleDetails.getIsAlarm());
        schedule.setIsPrivate(scheduleDetails.getIsPrivate());
        schedule.setImageUrl(scheduleDetails.getImageUrl());
        schedule.setCheckList(scheduleDetails.getCheckList());
        schedule.setDone(scheduleDetails.getDone());
        schedule.setCreatedAt(scheduleDetails.getCreatedAt());

        return scheduleRepository.save(schedule);
    }

    // 일정 삭제
    public void deleteSchedule(Long id) {
        scheduleRepository.deleteById(id);
    }
}
