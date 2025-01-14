package com.busanit.myplannerbackend.service;

import com.busanit.myplannerbackend.domain.CheckListDTO;
import com.busanit.myplannerbackend.domain.ScheduleDTO;
import com.busanit.myplannerbackend.entity.*;
import com.busanit.myplannerbackend.repository.*;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
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
    private final ParticipantRepository participantRepository;
    private final ApplicationEventPublisher eventPublisher;
  private final NotificationRepository notificationRepository;

  @Transactional
    // 일정 등록
    public Schedule createSchedule(ScheduleDTO scheduleDTO) {
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

      for (CheckListDTO checkListDTO : scheduleDTO.getCheckListItem()) {
        CheckList checkList_entity = new CheckList();
        checkList_entity.setContent(checkListDTO.getContent());
        checkList_entity.setIsDone(checkListDTO.getIsDone());
        checkList_entity.setSchedule(schedule);
        checkListRepository.save(checkList_entity);
      }

      return scheduleRepository.save(schedule);
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

    //완료되지 않은 개인 일정 종료일이 가까운 순으로 조회
    public Page<Schedule> getTodoSchedules(Long userId, Pageable pageable) {
      return scheduleRepository.findByUserIdAndDoneFalseOrderByEndDateAsc(userId, pageable);
    }

    //일정 완료 상태 관리
    public void scheduleDoneToggle(Long id, boolean done) {
      Schedule schedule = scheduleRepository.findById(id).orElse(null);
      if (schedule == null) {
        throw new RuntimeException("Schedule not found");
      }
      schedule.setDone(done);
      scheduleRepository.save(schedule);
    }

    //일정 체크리스트 완료 상태 관리
    public void checkListDoneToggle(Long id, boolean done) {
      CheckList checkList = checkListRepository.findById(id).orElse(null);
      if (checkList == null) {
        throw new RuntimeException("CheckList not found");
      }
      checkList.setIsDone(done);
      checkListRepository.save(checkList);
    }

    //일정 초대
    //targetUser를 participant 리스트에 추가한다
    @Transactional
    public void inviteUser(Long scheduleId, Long targetUserId) {
      Schedule schedule = scheduleRepository.findById(scheduleId).orElse(null);
      if (schedule == null) {
        throw new RuntimeException("Schedule not found");
      }
      User targetUser = userRepository.findById(targetUserId).orElse(null);
      if (targetUser == null) {
        throw new RuntimeException("User not found");
      }

      Participant newParticipant;

      // 같은 userId를 가진 참여자가 이미 존재하는지 확인
      Optional<Participant> existingParticipant = schedule.getParticipants().stream().filter(participant -> participant.getUser().getId().equals(targetUserId)).findFirst();

      if (existingParticipant.isPresent()) {
        newParticipant = existingParticipant.get();
        // 이미 존재하고, 거절된 상태라면 다시 한 번 초대 보내기
        if (newParticipant.getStatus().equals(Participant.Status.DECLINED)) {
          newParticipant.setStatus(Participant.Status.PENDING);
        } else return;
      } else {
        //존재하지 않을 시 새로 만들기
        newParticipant = Participant.of(schedule, targetUser);
      }

      Participant savedParticipant =  participantRepository.save(newParticipant);
      //일정 초대 시 notification 이벤트 발행
      savedParticipant.publishInviteEvent(eventPublisher);
    }

    // 초대 삭제
    public void inviteCancel(Long scheduleId, Long targetUserId) {
      Schedule schedule = scheduleRepository.findById(scheduleId).orElse(null);
      if (schedule == null) {
        throw new RuntimeException("Schedule not found");
      }
      User targetUser = userRepository.findById(targetUserId).orElse(null);
      if (targetUser == null) {
        throw new RuntimeException("User not found");
      }

      Participant existingParticipant = participantRepository.findByScheduleIdAndUserId(scheduleId, targetUserId).orElse(null);
      if (existingParticipant == null) {
        return;
      }
      participantRepository.delete(existingParticipant);

      notificationRepository.findByUserAndTargetIdAndType(targetUser, scheduleId, Notification.NotiType.INVITE).ifPresent(notificationRepository::delete);
    }

    //일정 참여하기
    @Transactional
    public void participate(Long scheduleId, Long userId) {
      Schedule schedule = scheduleRepository.findById(scheduleId).orElse(null);
      if (schedule == null) {
        throw new RuntimeException("Schedule not found");
      }
      User user = userRepository.findById(userId).orElse(null);
      if (user == null) {
        throw new RuntimeException("User not found");
      }

      Participant newParticipant = Participant.of(schedule, user);

      Optional<Participant> existingParticipant = participantRepository.findByScheduleIdAndUserId(scheduleId, userId);

      if (existingParticipant.isPresent()) {
        newParticipant = existingParticipant.get();
        //수락하지 않은 초대가 이미 존재할 시 상태를 수락으로 바꿈
        if (newParticipant.getStatus().equals(Participant.Status.ACCEPTED)) {
          return;
        } else {
          newParticipant.setStatus(Participant.Status.ACCEPTED);
        }
      }

      Participant savedParticipant = participantRepository.save(newParticipant);
      //일정 작성자에게 알림 보내기
      savedParticipant.publishParticipateEvent(eventPublisher);

      // 수락하지 않은 초대 알림이 있을 시 상태를 수락으로 바꿈
      Notification notification = notificationRepository.findByUserAndTargetIdAndType(user, scheduleId, Notification.NotiType.INVITE ).orElse(null);
      if (notification != null) {
        notification.setInviteStatus(Participant.Status.ACCEPTED);
        notificationRepository.save(notification);
      }

    }

    //일정 초대 거절하기
    @Transactional
    public void declineInvite(Long scheduleId, Long userId) {
      Schedule schedule = scheduleRepository.findById(scheduleId).orElse(null);
      if (schedule == null) {
        throw new RuntimeException("Schedule not found");
      }
      User user = userRepository.findById(userId).orElse(null);
      if (user == null) {
        throw new RuntimeException("User not found");
      }

      Participant existingParticipant = participantRepository.findByScheduleIdAndUserId(scheduleId, userId).orElse(null);
      if (existingParticipant == null) {
        return;
      }

      existingParticipant.setStatus(Participant.Status.DECLINED);
      participantRepository.save(existingParticipant);

      Notification notification = notificationRepository.findByUserAndTargetIdAndType(user, scheduleId, Notification.NotiType.INVITE).orElse(null);
      if (notification == null) {
        return;
      }
      notification.setInviteStatus(Participant.Status.DECLINED);
      notificationRepository.save(notification);
    }

}
