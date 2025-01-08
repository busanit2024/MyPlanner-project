package com.busanit.myplannerbackend.controller;

import com.busanit.myplannerbackend.domain.CheckListDTO;
import com.busanit.myplannerbackend.domain.ScheduleDTO;
import com.busanit.myplannerbackend.entity.Category;
import com.busanit.myplannerbackend.entity.CheckList;
import com.busanit.myplannerbackend.entity.Schedule;
import com.busanit.myplannerbackend.entity.User;
import com.busanit.myplannerbackend.repository.UserRepository;
import com.busanit.myplannerbackend.service.CategoryService;
import com.busanit.myplannerbackend.service.ScheduleService;
import com.busanit.myplannerbackend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/schedules")
@RequiredArgsConstructor
public class ScheduleController {

    private final ScheduleService scheduleService;
    private final UserService userService;
    private final CategoryService categoryService;

    // 일정 등록
    @PostMapping
    public ResponseEntity<Void> createSchedule(@RequestBody ScheduleDTO scheduleDTO) {
        // Schedule 엔티티에서 userId를 통해 User 엔티티 조회
//        if (scheduleDTO.getUser() == null || scheduleDTO.getUser().getId() == null) {
//            return ResponseEntity.badRequest().body(null);
//        }
        User user = userService.findById(scheduleDTO.getUserId());  // 사용자 존재 여부 확인
        Category category = categoryService.findById(scheduleDTO.getCategoryId());  // 사용자 존재 여부 확인

        Schedule schedule = ScheduleDTO.toEntity(scheduleDTO);
        schedule.setUser(user);
        schedule.setCategory(category);

        // 체크리스트 설정
        List<CheckList> checkLists = new ArrayList<>();
        for (CheckListDTO checkListDTO : scheduleDTO.getCheckList()) {
            CheckList checkList = new CheckList();
            checkList.setId(checkListDTO.getId());
            checkList.setContent(checkListDTO.getContent());
            checkList.setDone(checkListDTO.getIsDone());
            checkList.setSchedule(schedule);    // 현재 일정과 연결하기
            checkLists.add(checkList);
        }

        schedule.setCheckList(checkLists);

        scheduleService.createSchedule(scheduleDTO);
        return ResponseEntity.noContent().build();
    }

    // 모든 일정 조회
    @GetMapping
    public List<Schedule> getAllSchedules() {
        return scheduleService.getAllSchedules();
    }

    // 특정 일정 조회
    @GetMapping("/{id}")
    public ResponseEntity<Schedule> getScheduleById(@PathVariable Long id) {
        return scheduleService.getScheduleById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // 일정 수정
    @PutMapping("/{id}")
    public Schedule updateSchedule(@PathVariable Long id, @RequestBody Schedule scheduleDetails) {
        return scheduleService.updateSchedule(id, scheduleDetails);
    }

    // 일정 삭제
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSchedule(@PathVariable Long id) {
        scheduleService.deleteSchedule(id);
        return ResponseEntity.noContent().build();
    }
}
