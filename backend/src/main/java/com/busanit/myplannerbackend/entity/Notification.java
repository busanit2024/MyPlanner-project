package com.busanit.myplannerbackend.entity;

import com.busanit.myplannerbackend.domain.UserDTO;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonSubTypes;
import io.hypersistence.utils.hibernate.type.json.JsonType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.Type;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
public class Notification {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne
  @JoinColumn(name = "user_id")
  private User user;

  @Enumerated(EnumType.STRING)
  private NotiType type;

  @Type(JsonType.class)
  @Column(columnDefinition = "json")
  @JdbcTypeCode(SqlTypes.JSON)
  private NotiArgs args;

  @CreationTimestamp
  @Column(updatable = false)
  private LocalDateTime createdAt;

  @UpdateTimestamp
  @Column(insertable = false)
  private LocalDateTime updatedAt;

  private LocalDateTime deletedAt;

  @Data
  @AllArgsConstructor
  public static class NotiArgs {
    private UserDTO fromUser;
    private Long targetId;
  }

  private boolean isRead;

  public enum NotiType {
    INVITE, FOLLOW, LIKE_POST, COMMENT
  }

  public static Notification of(User user, NotiType type, NotiArgs args) {
    Notification notification = new Notification();
    notification.user = user;
    notification.type = type;
    notification.args = args;
    notification.isRead = false;
    return notification;
  }
}
