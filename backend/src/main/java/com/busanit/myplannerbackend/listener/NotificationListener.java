package com.busanit.myplannerbackend.listener;

import com.busanit.myplannerbackend.entity.Notification;
import com.busanit.myplannerbackend.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
@RequiredArgsConstructor
public class NotificationListener {
  private final NotificationService notificationService;

  @TransactionalEventListener
  @Async
  public void handleNotification(Notification notification) {
    notificationService.send(notification);
  }
}
