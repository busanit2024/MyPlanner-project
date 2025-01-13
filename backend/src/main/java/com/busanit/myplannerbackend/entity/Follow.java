package com.busanit.myplannerbackend.entity;

import com.busanit.myplannerbackend.domain.UserDTO;
import com.busanit.myplannerbackend.listener.NotificationListener;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.context.ApplicationEventPublisher;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Follow {


  //팔로우 알림 이벤트 발행
  public void publishEvent(ApplicationEventPublisher eventPublisher) {
    if (eventPublisher != null) {
      eventPublisher.publishEvent(Notification.of(followTo, Notification.NotiType.FOLLOW, followFrom, followFrom.getId()));
    }
  }

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;


  @JsonIgnore
  @ManyToOne(fetch = FetchType.EAGER)
  @JoinColumn(name = "follow_from", nullable = false)
  private User followFrom;

  @JsonIgnore
  @ManyToOne(fetch = FetchType.EAGER)
  @JoinColumn(name = "follow_to", nullable = false )
  private User followTo;

}
