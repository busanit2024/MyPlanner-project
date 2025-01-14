package com.busanit.myplannerbackend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.annotation.CreatedDate;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Comment {
  public void publishEvent(ApplicationEventPublisher eventPublisher) {
    if (eventPublisher != null) {
      eventPublisher.publishEvent(Notification.of(schedule.getUser(), Notification.NotiType.COMMENT, user, schedule));
    }
  }

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @JsonIgnore
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "schedule_id")
  private Schedule schedule;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id")
  private User user;

  private String content;

  @CreationTimestamp
  private LocalDateTime createdAt;

}
