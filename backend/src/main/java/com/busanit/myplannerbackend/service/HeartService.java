package com.busanit.myplannerbackend.service;

import com.busanit.myplannerbackend.domain.UserDTO;
import com.busanit.myplannerbackend.entity.Heart;
import com.busanit.myplannerbackend.entity.Schedule;
import com.busanit.myplannerbackend.entity.User;
import com.busanit.myplannerbackend.repository.HeartRepository;
import com.busanit.myplannerbackend.repository.ScheduleRepository;
import com.busanit.myplannerbackend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class HeartService {
  private final HeartRepository heartRepository;
  private final ScheduleRepository scheduleRepository;
  private final UserRepository userRepository;
  private final ApplicationEventPublisher eventPublisher;

  //좋아요가 없으면 좋아요 보내기, 좋아요가 있으면 취소
  public void HeartToggle(Long scheduleId, Long userId) {
    Schedule schedule = scheduleRepository.findById(scheduleId).orElse(null);
    if (schedule == null) {
      throw new RuntimeException("Schedule not found");
    }
    User user = userRepository.findById(userId).orElse(null);
    if (user == null) {
      throw new RuntimeException("User not found");
    }
    Heart heart = heartRepository.findByScheduleIdAndUserId(scheduleId, userId).orElse(null);

    if (heart == null) {
      heart = Heart.of(schedule, user);
      heartRepository.save(heart);
      heart.publishEvent(eventPublisher);
    } else {
      heartRepository.delete(heart);
    }
  }

  // 좋아요 누른 유저 정보만 슬라이스
  public Slice<UserDTO> getHeartUsers(Long scheduleId, Pageable pageable) {
    Slice<Heart> hearts = heartRepository.findByScheduleId(scheduleId, pageable);
    return hearts.map(heart -> UserDTO.toDTO(heart.getUser()));
  }

  //전체 좋아요 갯수
  public int getHeartCount(Long scheduleId) {
    return heartRepository.countByScheduleId(scheduleId);
  }
}
