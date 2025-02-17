package com.busanit.myplannerbackend.repository;

import com.busanit.myplannerbackend.entity.Notification;
import com.busanit.myplannerbackend.entity.User;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

  Slice<Notification> findAllByUser(User user, Pageable pageable);

  Slice<Notification> findAllByUserAndTypeNotOrderByUpdatedAtDesc(User user, Notification.NotiType type, Pageable pageable );

  Slice<Notification> findAllByUserAndTypeOrderByUpdatedAtDesc(User user, Notification.NotiType type, Pageable pageable);

  Optional<Notification> findByUserAndFromUser(User user, User fromUser);

  Optional<Notification> findByUserAndTargetIdAndType(User user, Long targetId, Notification.NotiType type);

  Integer countByUserAndIsRead(User user, boolean isRead);

}
