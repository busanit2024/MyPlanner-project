package com.busanit.myplannerbackend.repository;

import com.busanit.myplannerbackend.entity.Notification;
import com.busanit.myplannerbackend.entity.User;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

  Slice<Notification> findAllByUser(User user, Pageable pageable);

  Slice<Notification> findAllByUserAndTypeNotOrderByCreatedAtDesc(User user, Notification.NotiType type, Pageable pageable );

  Slice<Notification> findAllByUserAndTypeOrderByCreatedAtDesc(User user, Notification.NotiType type, Pageable pageable);
}
