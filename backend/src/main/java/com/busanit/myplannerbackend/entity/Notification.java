package com.busanit.myplannerbackend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
public class Notification {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  //알림을 받은 유저
  @ManyToOne
  @JoinColumn(name = "user_id")
  private User user;

  @Enumerated(EnumType.STRING)
  @Column(length = 50)
  private NotiType type;

  @CreationTimestamp
  @Column(updatable = false)
  private LocalDateTime createdAt;

  @UpdateTimestamp
  private LocalDateTime updatedAt;

  private LocalDateTime deletedAt;

  //알림을 발생시킨 유저
  @ManyToOne
  @JoinColumn(name = "from_user_id")
  private User fromUser;

  //알림 연결 대상 id (팔로우-유저 id, 초대/좋아요/댓글-게시물 id)
  //알림 클릭 시 해당 페이지로 이동을 위해 필요
  private Long targetId;

  private String targetName;

  private boolean isRead;

  @Enumerated(EnumType.STRING)
  private Participant.Status inviteStatus;

  public enum NotiType {
    INVITE, FOLLOW, PARTICIPATE, HEART, COMMENT
  }

  public static Notification of(User user, NotiType type, User fromUser, Object target) {
    Notification notification = new Notification();
    notification.user = user;
    notification.type = type;
    notification.fromUser = fromUser;

    if (target.getClass().equals(User.class)) {
      notification.targetId = ((User) target).getId();
      notification.targetName = ((User) target).getUsername();
    }

    if (target.getClass().equals(Schedule.class)) {
      notification.targetId = ((Schedule) target).getId();
      notification.targetName = ((Schedule) target).getTitle();
    }

    if (type.equals(NotiType.INVITE)) {
      notification.inviteStatus = Participant.Status.PENDING;
    }

    notification.isRead = false;
    return notification;
  }
}
