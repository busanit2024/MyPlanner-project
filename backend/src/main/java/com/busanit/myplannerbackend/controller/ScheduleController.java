package com.busanit.myplannerbackend.controller;

import com.busanit.myplannerbackend.domain.CheckListDTO;
import com.busanit.myplannerbackend.domain.ScheduleDTO;
import com.busanit.myplannerbackend.domain.UserDTO;
import com.busanit.myplannerbackend.entity.Category;
import com.busanit.myplannerbackend.entity.CheckList;
import com.busanit.myplannerbackend.entity.Schedule;
import com.busanit.myplannerbackend.entity.User;
import com.busanit.myplannerbackend.repository.UserRepository;
import com.busanit.myplannerbackend.service.CategoryService;
import com.busanit.myplannerbackend.service.CheckListService;
import com.busanit.myplannerbackend.service.ScheduleService;
import com.busanit.myplannerbackend.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.*;


import java.io.Console;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/schedules")
@RequiredArgsConstructor
public class ScheduleController {

    private final ScheduleService scheduleService;
    private final UserService userService;
    private final CategoryService categoryService;
    private final CheckListService checkListService;

    // 일정 등록
    @PostMapping
    public ResponseEntity createSchedule(@RequestBody ScheduleDTO scheduleDTO) {
        // Schedule 엔티티에서 userId를 통해 User 엔티티 조회
//        if (scheduleDTO.getUser() == null || scheduleDTO.getUser().getId() == null) {
//            return ResponseEntity.badRequest().body(null);
//        }
//        User user = userService.findById(scheduleDTO.getUserId());  // 사용자 존재 여부 확인
//        Category category = categoryService.findById(scheduleDTO.getCategoryId());  // 사용자 존재 여부 확인

//        Schedule schedule = ScheduleDTO.toEntity(scheduleDTO, user);
//        schedule.setUser(user);
//        schedule.setCategory(category);

        // 체크리스트가 null일 경우 빈 리스트로 초기화
        if (scheduleDTO.getCheckList() == null) {
            scheduleDTO.setCheckList(new ArrayList<>());
        }

        scheduleService.createSchedule(scheduleDTO);
//        checkListService.saveCheckList(scheduleDTO.getCheckListItem(), schedule);

        //return ResponseEntity.noContent().build();
        return new ResponseEntity<>("success", HttpStatus.OK);
    }

    // 모든 일정 조회
    @GetMapping
    public List<Schedule> getAllSchedules(Long id) {
        return scheduleService.getAllSchedules(id);
    }

    // 특정 일정 조회
    @GetMapping("/{id}")
    public ResponseEntity<ScheduleDTO> getScheduleDTOById(@PathVariable Long id) {
        ScheduleDTO scheduleDTO = scheduleService.getScheduleDTOById(id);

        return new ResponseEntity<>(scheduleDTO, HttpStatus.OK);
    }
//    @GetMapping("/{id}")
//    public ResponseEntity<Schedule> getScheduleById(@PathVariable Long id) {
//        return scheduleService.getScheduleById(id)
//                .map(ResponseEntity::ok)
//                .orElse(ResponseEntity.notFound().build());
//    }

    //모든 일정 최신순 슬라이스
    @GetMapping("/feed")
    public Slice<ScheduleDTO> getScheduleFeed(@RequestParam int size, @RequestParam int page) {
        Pageable pageable = PageRequest.of(page, size);
        Slice<Schedule> slice = scheduleService.getAllScheduleSlice(pageable);
      return ScheduleDTO.toDTO(slice);
    }

    //내가 팔로우하는 사람 일정 최신순 슬라이스
    @GetMapping("/feed/follow")
    public Slice<ScheduleDTO> getScheduleFollows(@RequestParam Long userId, @RequestParam int size, @RequestParam int page) {
        Pageable pageable = PageRequest.of(page, size);
        Slice<Schedule> slice = scheduleService.getFollwingScheduleSlice(userId, pageable);
      return ScheduleDTO.toDTO(slice);
    }

    //일정 제목으로 검색(임시)
    @GetMapping("/search")
    public Slice<ScheduleDTO> searchSchedule(@RequestParam String searchText, @RequestParam int size, @RequestParam int page) {
        Pageable pageable = PageRequest.of(page, size);
        Slice<Schedule> slice = scheduleService.searchByTitle(searchText, pageable);
        return ScheduleDTO.toDTO(slice);
    }

    //미완료 일정 조회
    @GetMapping("/todo")
    public Page<ScheduleDTO> getTodoSchedules(@RequestParam Long userId, @RequestParam int size) {
        Pageable pageable = PageRequest.of(0, size);
        Page<Schedule> page = scheduleService.getTodoSchedules(userId, pageable);
        return page.map(ScheduleDTO::toDTO);
    }

    @GetMapping("/check")
    public void scheduleDoneCheck(@RequestParam Long id, @RequestParam boolean done) {
        scheduleService.scheduleDoneToggle(id, done);
    }

    @GetMapping("/checklist/check")
    public void checkListDoneCheck(@RequestParam Long id, @RequestParam boolean done) {
        scheduleService.checkListDoneToggle(id, done);
    }

    // 일정 수정
    @PutMapping("/{id}")
    public Schedule updateSchedule(@PathVariable Long id, @RequestBody Schedule scheduleDetails) {
        // 체크리스트가 null인 경우 빈 리스트로 초기화
        if (scheduleDetails.getCheckList() == null) {
            scheduleDetails.setCheckList(new ArrayList<>());
        }

        return scheduleService.updateSchedule(id, scheduleDetails);
    }

    // 일정 삭제
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSchedule(@PathVariable Long id) {
        scheduleService.deleteSchedule(id);
        return ResponseEntity.noContent().build();
    }
}
