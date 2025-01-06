package com.busanit.myplannerbackend.controller;

import com.busanit.myplannerbackend.entity.Schedule;
import com.busanit.myplannerbackend.entity.User;
import com.busanit.myplannerbackend.repository.UserRepository;
import com.busanit.myplannerbackend.service.ScheduleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/schedules")
public class ScheduleController {

    @Autowired
    private ScheduleService scheduleService;
    @Autowired
    private UserRepository userRepository;

    //    // 일정 추가
//    @PostMapping
//    public ResponseEntity<Schedule> createSchedule(@RequestBody Schedule schedule) {
//        // 유저정보 강제 입력(추후 db에서 불러옴)
//        User user = new User();
//        user.setId(1L);
//        user.setEmail("sorimchuku@gmail.com");
//        user.setFirebaseUid("WtYjJSX3FPQAuA47TXYTG7PI8w52");
//        user.setPhone("01011112222");
//
//        schedule.setUser(user);
//        Schedule createdSchedule = scheduleService.createSchedule(schedule);
//        return ResponseEntity.ok(createdSchedule);
//    }
@PostMapping
public ResponseEntity<Schedule> createSchedule(@RequestBody Schedule schedule) {
    // 유저 정보는 인증 시스템을 사용하여 자동으로 가져오는 방식으로 개선 가능
    User user = userRepository.findById(1L).orElseThrow(() -> new RuntimeException("User not found"));
    schedule.setUser(user);
    Schedule savedSchedule = scheduleService.createSchedule(schedule);
    return ResponseEntity.ok(savedSchedule);
}
    // 일정 수정
    @PutMapping("/{id}")
    public ResponseEntity<Schedule> updateSchedule(@PathVariable Long id, @RequestBody Schedule schedule) {
        Optional<Schedule> updatedSchedule = scheduleService.updateSchedule(id, schedule);
        return updatedSchedule.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // 일정 삭제
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSchedule(@PathVariable Long id) {
        scheduleService.deleteSchedule(id);
        return ResponseEntity.noContent().build();
    }

    // 일정 목록 조회
    @GetMapping
    public ResponseEntity<List<Schedule>> getAllSchedules() {
        List<Schedule> schedules = scheduleService.getAllSchedules();
        return ResponseEntity.ok(schedules);
    }

    // 특정 일정 조회
    @GetMapping("/{id}")
    public ResponseEntity<Schedule> getScheduleById(@PathVariable Long id) {
        Optional<Schedule> schedule = scheduleService.getScheduleById(id);
        return schedule.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
