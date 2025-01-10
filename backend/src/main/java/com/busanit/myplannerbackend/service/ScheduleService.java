package com.busanit.myplannerbackend.service;

import com.busanit.myplannerbackend.domain.CheckListDTO;
import com.busanit.myplannerbackend.domain.ScheduleDTO;
import com.busanit.myplannerbackend.entity.Category;
import com.busanit.myplannerbackend.entity.CheckList;
import com.busanit.myplannerbackend.entity.Schedule;
import com.busanit.myplannerbackend.entity.User;
import com.busanit.myplannerbackend.repository.CategoryRepository;
import com.busanit.myplannerbackend.repository.CheckListRepository;
import com.busanit.myplannerbackend.repository.ScheduleRepository;
import com.busanit.myplannerbackend.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Log4j2
@Service
@RequiredArgsConstructor
public class ScheduleService {

    private final ScheduleRepository scheduleRepository;
    private final UserRepository userRepository;
    private final CheckListRepository checkListRepository;
    private final CategoryRepository categoryRepository;

    @Transactional
    // 일정 등록
    public void createSchedule(ScheduleDTO scheduleDTO) {
      //userId에 해당하는 User 객체를 찾아서 엔티티로 변환시 사용
      Long userId = scheduleDTO.getUserId();
      User user = userRepository.findById(userId).orElse(null);
      if (user == null) {
        throw new RuntimeException("User not found");
      }

      Schedule schedule = ScheduleDTO.toEntity(scheduleDTO, user);
      Category category = categoryRepository.findById(scheduleDTO.getCategoryId()).orElse(null);
      schedule.setCategory(category);
      schedule.setCheckList(scheduleDTO.getCheckList() != null ? scheduleDTO.getCheckList() : new ArrayList<>());

      scheduleRepository.save(schedule);

      for (CheckListDTO checkListDTO : scheduleDTO.getCheckListItem()) {
        CheckList checkList_entity = new CheckList();
        checkList_entity.setContent(checkListDTO.getContent());
        checkList_entity.setIsDone(checkListDTO.getIsDone());
        checkList_entity.setSchedule(schedule);
        checkListRepository.save(checkList_entity);
      }
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

    // 특정 일정 조회(return DTO)
    public ScheduleDTO getScheduleDTOById(Long id) {
        Schedule schedule = scheduleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("일정을 찾을 수 없습니다."));

        return ScheduleDTO.toDTO(schedule);
    }

    // 특정 사용자 ID로 일정 조회
    public List<Schedule> getSchedulesByUserId(Long userId) {
        return scheduleRepository.findByUserId(userId);
    }

    // 일정 수정
    public Schedule updateSchedule(Long id, Schedule scheduleDetails) {
        Schedule schedule = scheduleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("일정을 찾을 수 없습니다."));

        // 체크리스트가 null일 경우 빈 리스트로 초기화
        if (scheduleDetails.getCheckList() == null) {
            scheduleDetails.setCheckList(new ArrayList<>());
        }

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
        schedule.setDone(scheduleDetails.getDone());
        schedule.setDetail(scheduleDetails.getDetail());
        schedule.setCreatedAt(scheduleDetails.getCreatedAt());

        // 기존 체크리스트 가져오기
        List<CheckList> existingCheckLists = checkListRepository.findBySchedule(schedule);

        // 새로운 체크리스트 항목을 처리
        for (CheckList checkList : scheduleDetails.getCheckList()) {
            log.info("일정 수정 정보: " + checkList);
            checkList.setSchedule(schedule);
            checkListRepository.save(checkList);
        }

        // 기존 체크리스트 중 삭제된 항목 처리
        for (CheckList existingCheckList : existingCheckLists) {
            if (scheduleDetails.getCheckList().stream()
                    .noneMatch(cl -> cl.getId().equals(existingCheckList.getId()))) {
                // 삭제된 항목
                checkListRepository.delete(existingCheckList);
            }
        }

        return scheduleRepository.save(schedule);
    }

    // 일정 삭제
    public void deleteSchedule(Long id) {
        scheduleRepository.deleteById(id);
    }

    // 모든 일정 최신순 슬라이스
    public Slice<Schedule> getAllScheduleSlice(Pageable pageable) {
        return scheduleRepository.findAllByIsPrivateFalseOrderByCreatedAtDesc(pageable);
    }

    //내가 팔로우하는 사람의 일정 최신순 슬라이스
    public Slice<Schedule> getFollwingScheduleSlice(Long userId, Pageable pageable) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return null;
        }
        List<Long> follows = user.getFollows().stream().map(follow -> follow.getFollowTo().getId()).toList();
        return scheduleRepository.findAllByUserIdInAndIsPrivateFalseOrderByCreatedAtDesc(follows, pageable);
    }

    //일정 제목으로 검색(임시)
    public Slice<Schedule> searchByTitle(String title, Pageable pageable) {
      return scheduleRepository.findByTitleContainingIgnoreCaseAndIsPrivateFalseOrderByCreatedAtDesc(title, pageable);
    }
}
