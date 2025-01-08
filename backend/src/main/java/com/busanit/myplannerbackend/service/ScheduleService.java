package com.busanit.myplannerbackend.service;

import com.busanit.myplannerbackend.domain.ScheduleDTO;
import com.busanit.myplannerbackend.entity.Schedule;
import com.busanit.myplannerbackend.entity.User;
import com.busanit.myplannerbackend.repository.ScheduleRepository;
import com.busanit.myplannerbackend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ScheduleService {

    @Autowired
    private ScheduleRepository scheduleRepository;

    @Autowired
    private UserRepository userRepository;

    // 일정 등록
    public void createSchedule(ScheduleDTO scheduleDTO) {
      //userId에 해당하는 User 객체를 찾아서 엔티티로 변환시 사용
      Long userId = scheduleDTO.getUserId();
      User user = userRepository.findById(userId).orElse(null);
      if (user == null) {
        throw new RuntimeException("User not found");
      }
        scheduleRepository.save(ScheduleDTO.toEntity(scheduleDTO, user));
    }

    // 모든 일정 조회
    public List<Schedule> getAllSchedules() {
        return scheduleRepository.findAll();
    }

    // 특정 일정 조회
    public Optional<Schedule> getScheduleById(Long id) {
        return scheduleRepository.findById(id);
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
        schedule.setDetail(scheduleDetails.getDetail());
        schedule.setCreatedAt(scheduleDetails.getCreatedAt());

        return scheduleRepository.save(schedule);
    }

    // 일정 삭제
    public void deleteSchedule(Long id) {
        scheduleRepository.deleteById(id);
    }

    // 모든 일정 최신순 슬라이스
    public Slice<Schedule> getAllScheduleSlice(Pageable pageable) {
        return scheduleRepository.findAllByOrderByCreatedAtDesc(pageable);
    }

    //내가 팔로우하는 사람의 일정 최신순 슬라이스
    public Slice<Schedule> getFollwingScheduleSlice(Long userId, Pageable pageable) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return null;
        }
        List<Long> follows = user.getFollows().stream().map(follow -> follow.getFollowTo().getId()).toList();
        return scheduleRepository.findAllByUserIdInOrderByCreatedAtDesc(follows, pageable);
    }

    //일정 제목으로 검색(임시)
    public Slice<Schedule> searchByTitle(String title, Pageable pageable) {
      return scheduleRepository.findByTitleContainingIgnoreCaseOrderByCreatedAtDesc(title, pageable);
    }
}
