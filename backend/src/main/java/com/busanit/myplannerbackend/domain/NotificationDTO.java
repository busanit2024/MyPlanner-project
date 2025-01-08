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
  private UserDTO user;
  private Notification.NotiType type;
  private UserDTO fromUser;
  private Long targetId;
  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;
  private LocalDateTime deletedAt;
  private boolean isRead;

  public static NotificationDTO toDTO(Notification notification) {
    NotificationDTOBuilder builder = NotificationDTO.builder()
            .id(notification.getId())
            .user(UserDTO.toDTO(notification.getUser()))
            .type(notification.getType())
            .fromUser(UserDTO.toDTO(notification.getFromUser()))
            .targetId(notification.getTargetId())
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
