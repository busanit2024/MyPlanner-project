package com.busanit.myplannerbackend.service;

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

    // 일정 추가
    public Schedule createSchedule(Schedule schedule) {
        return scheduleRepository.save(schedule);
    }

    // 일정 수정
    public Optional<Schedule> updateSchedule(Long id, Schedule schedule) {
        if (scheduleRepository.existsById(id)) {
            schedule.setId(id);
            return Optional.of(scheduleRepository.save(schedule));
        }
        return Optional.empty();
    }

    // 일정 삭제
    public void deleteSchedule(Long id) {
        scheduleRepository.deleteById(id);
    }

    // 일정 목록 조회
    public List<Schedule> getAllSchedules() {
        return scheduleRepository.findAll();
    }

    //특정 일정 조회
    public Optional<Schedule> getScheduleById(Long id) {
        return scheduleRepository.findById(id);
    }
}
