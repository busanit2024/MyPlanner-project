package com.busanit.myplannerbackend.entity;


import jakarta.persistence.*;
import lombok.*;
import org.springframework.context.ApplicationEventPublisher;

@Entity
@Getter
@Setter
public class Heart { //좋아요 like는 예약어와 겹쳐서 대신 heart로 바꿈
  public void publishEvent(ApplicationEventPublisher eventPublisher) {
    if (eventPublisher != null) {
      eventPublisher.publishEvent(Notification.of(schedule.getUser(), Notification.NotiType.HEART, user, schedule));
    }
  }

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "schedule_id")
  private Schedule schedule;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id")
  private User user;

  public static Heart of(Schedule schedule, User user) {
    Heart heart = new Heart();
    heart.setUser(user);
    heart.setSchedule(schedule);
    return heart;
  }
}
