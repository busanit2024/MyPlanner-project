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
import jakarta.persistence.Column;
import lombok.Data;
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
import java.util.Date;
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

        Schedule response = scheduleService.createSchedule(scheduleDTO);
//        checkListService.saveCheckList(scheduleDTO.getCheckListItem(), schedule);

        //return ResponseEntity.noContent().build();
        return new ResponseEntity<Long>(response.getId(), HttpStatus.OK);
    }

    // 모든 일정 조회
//    @GetMapping
//    public List<Schedule> getAllSchedules(Long id) {
//
//        return scheduleService.getAllSchedules(id);
//    }

    @GetMapping // 모든 일정 가져오기
    public ResponseEntity<List<ScheduleDTO>> getAllSchedules() {
        List<Schedule> schedules = scheduleService.getAllSchedules();
        return ResponseEntity.ok(ScheduleDTO.toDTO(schedules));
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

    //일정 완료
    @GetMapping("/check")
    public void scheduleDoneCheck(@RequestParam Long id, @RequestParam boolean done) {
        scheduleService.scheduleDoneToggle(id, done);
    }

    //체크리스트 완료
    @GetMapping("/checklist/check")
    public void checkListDoneCheck(@RequestParam Long id, @RequestParam boolean done) {
        scheduleService.checkListDoneToggle(id, done);
    }

    @GetMapping("/user/{id}")
    public ResponseEntity<List<ScheduleDTO>> getSchedulesByUserId(@PathVariable Long id) {
        List<Schedule> schedules = scheduleService.getSchedulesByUserId(id);
        return ResponseEntity.ok(ScheduleDTO.toDTO(schedules));
    }

    // 일정 수정
    @PutMapping("/{id}")
    public ScheduleDTO updateSchedule(@PathVariable Long id, @RequestBody Schedule scheduleDetails) {
        // 체크리스트가 null인 경우 빈 리스트로 초기화
        if (scheduleDetails.getCheckList() == null) {
            scheduleDetails.setCheckList(new ArrayList<>());
        }

        Schedule response = scheduleService.updateSchedule(id, scheduleDetails);
        return ScheduleDTO.toDTO(response);
    }

    @PutMapping("/{id}/datetime")
    public ScheduleDTO updateScheduleDateTime(@PathVariable Long id, @RequestBody ScheduleDTO.DateTimeData data){
        Schedule response = scheduleService.updateDateTime(id, data);
        return ScheduleDTO.toDTO(response);
    }

    // 일정 삭제
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSchedule(@PathVariable Long id) {
        scheduleService.deleteSchedule(id);
        return ResponseEntity.noContent().build();
    }

    //일정초대
    @PostMapping("/invite/{scheduleId}")
    public ResponseEntity<String> inviteUsers(@RequestBody List<Long> userIds, @PathVariable Long scheduleId) {
        for (Long userId : userIds) {
            scheduleService.inviteUser(scheduleId, userId);
        }
        return new ResponseEntity<>("success", HttpStatus.OK);
    }

    //초대 취소
    @PostMapping("/invite/{scheduleId}/cancel")
    public ResponseEntity<String> inviteCancel(@RequestBody List<Long> userIds, @PathVariable Long scheduleId) {
        for (Long userId : userIds) {
            scheduleService.inviteCancel(scheduleId, userId);
        }
        return new ResponseEntity<>("success", HttpStatus.OK);
    }

    //일정 초대 수락
    @GetMapping("/invite/{scheduleId}/accept")
    public ResponseEntity<String> inviteAccept(@RequestParam Long userId, @PathVariable Long scheduleId) {
        scheduleService.participate(scheduleId, userId);
        return new ResponseEntity<>("success", HttpStatus.OK);
    }

    //일정 초대 거절
    @GetMapping("/invite/{scheduleId}/decline")
    public ResponseEntity<String> inviteDecline(@PathVariable Long scheduleId, @RequestParam Long userId) {
        scheduleService.declineInvite(scheduleId, userId);
        return new ResponseEntity<>("success", HttpStatus.OK);
    }

    //일정 참가
    @GetMapping("/participate/{scheduleId}")
    public ResponseEntity<String> participate(@PathVariable Long scheduleId, @RequestParam Long userId) {
        scheduleService.participate(scheduleId, userId);
        return new ResponseEntity<>("success", HttpStatus.OK);
    }

    //일정 참가 취소
    @GetMapping("/participate/{scheduleId}/cancel")
    public ResponseEntity<String> participateCancel(@PathVariable Long scheduleId, @RequestParam Long userId) {
        scheduleService.participateCancel(scheduleId, userId);
        return new ResponseEntity<>("success", HttpStatus.OK);
    }

    //내가 참여한 일정 가져오기
    @GetMapping("/{userId}/participated")
    public ResponseEntity<List<ScheduleDTO>> getParticipatedSchedules(@PathVariable Long userId) {
        List<Schedule> schedules = scheduleService.getParticipatedSchedule(userId);
        return ResponseEntity.ok(ScheduleDTO.toDTO(schedules));
    }

}


