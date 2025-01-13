package com.busanit.myplannerbackend.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;
import org.springframework.context.ApplicationEventPublisher;

@Entity
@Getter
@Setter
@Data
public class Participant {
  //초대 알림 보내기
  public void publishInviteEvent(ApplicationEventPublisher eventPublisher) {
    if(eventPublisher != null) {
      eventPublisher.publishEvent(Notification.of(user, Notification.NotiType.INVITE, schedule.getUser(), schedule.getId()));
    }
  }

  public void publishParticipateEvent(ApplicationEventPublisher eventPublisher) {
    if(eventPublisher != null) {
      eventPublisher.publishEvent(Notification.of(schedule.getUser(), Notification.NotiType.PARTICIPATE, user, schedule.getId() ));
    }
  }

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne
  @JoinColumn(name = "schedule_id")
  private Schedule schedule;

  @ManyToOne
  @JoinColumn(name = "user_id")
  private User user;

  //일정 초대 상태
  @Enumerated(EnumType.STRING)
  private Status status;

  public enum Status {
    // 초대중, 수락, 거절
    PENDING, ACCEPTED, DECLINED
  }

  public static Participant of(Schedule schedule, User user) {
    Participant participant = new Participant();
    participant.setSchedule(schedule);
    participant.setUser(user);
    participant.setStatus(Status.PENDING);
    return participant;
  }
}
