package com.busanit.myplannerbackend.domain;

import com.busanit.myplannerbackend.entity.Notification;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.domain.Slice;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class NotificationDTO {
  private Long id;
  private UserProfileDTO user;
  private Notification.NotiType type;
  private Notification.NotiArgs args;
  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;
  private LocalDateTime deletedAt;
  private boolean isRead;

  public static NotificationDTO toDTO(Notification notification) {
    NotificationDTOBuilder builder = NotificationDTO.builder()
            .id(notification.getId())
            .user(UserProfileDTO.toDTO(notification.getUser()))
            .type(notification.getType())
            .args(notification.getArgs())
            .createdAt(notification.getCreatedAt())
            .updatedAt(notification.getUpdatedAt())
            .deletedAt(notification.getDeletedAt())
            .isRead(notification.isRead());

    return builder.build();
  }

  public static Slice<NotificationDTO> toDTO(Slice<Notification> notifications) {
    return notifications.map(NotificationDTO::toDTO);
  }

}
