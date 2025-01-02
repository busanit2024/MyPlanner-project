package com.busanit.myplannerbackend.service;

import com.busanit.myplannerbackend.domain.NotificationDTO;
import com.busanit.myplannerbackend.entity.Notification;
import com.busanit.myplannerbackend.entity.User;
import com.busanit.myplannerbackend.repository.EmitterRepository;
import com.busanit.myplannerbackend.repository.EmitterRepositoryImpl;
import com.busanit.myplannerbackend.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.aspectj.weaver.ast.Not;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Log4j2
public class NotificationService {

  private final EmitterRepository emitterRepository;
  private final long timeout = 60L * 1000L * 60L;
  private final NotificationRepository notificationRepository;

  public SseEmitter subscribe(Long userId, String lastEventId) {
    log.debug("subscribe start");
    String emitterId = makeTimeIncludeId(userId);
    try {
      SseEmitter emitter = emitterRepository.save(emitterId, new SseEmitter(timeout));
      emitter.onCompletion(() -> emitterRepository.deleteById(emitterId));
      emitter.onTimeout(() -> emitterRepository.deleteById(emitterId));

      String eventId = makeTimeIncludeId(userId);
      sendNotification(emitter, eventId, emitterId, "EventStream Created. [userId=" + userId + "]");

      if (hasLostData(lastEventId)) {
        sendLostData(lastEventId, userId, emitterId, emitter);
      }

      return emitter;
    } catch (Exception e) {
      log.error("error subscribing user: " + userId, e);
      emitterRepository.deleteById(emitterId);
    }
    return null;
  }

  private String makeTimeIncludeId(Long userId) {
    return userId + "_" + System.currentTimeMillis();
  }

  private void sendNotification(SseEmitter emitter, String eventId, String emitterId, Object data) {
    try {
      emitter.send(SseEmitter.event()
              .id(eventId)
              .data(data));
    } catch (IOException exception) {
      emitterRepository.deleteById(emitterId);
      throw new RuntimeException(exception);
    }
  }

  private boolean hasLostData(String lastEventId) {
    return !lastEventId.isEmpty();
  }

  private void sendLostData(String lastEventId, Long userId, String emitterId, SseEmitter emitter) {
    Map<String, Object> eventCaches = emitterRepository.findAllEventCacheStartWithByUserId(String.valueOf(userId));
    eventCaches.entrySet().stream()
            .filter(entry -> lastEventId.compareTo(entry.getKey()) < 0)
            .forEach(entry -> sendNotification(emitter, entry.getKey(), emitterId, entry.getValue()));
  }

  public void send(Notification sendedNotification) {
    if (sendedNotification.getType().equals(Notification.NotiType.FOLLOW)) {
      notificationRepository.findByUserAndFromUser(sendedNotification.getUser(), sendedNotification.getFromUser()).ifPresent(existingNoti -> sendedNotification.setId(existingNoti.getId()));
    }
    Notification notification = notificationRepository.save(sendedNotification);
    String recieverId = String.valueOf(notification.getUser().getId());
    String eventId = makeTimeIncludeId(notification.getUser().getId());
    Map<String, SseEmitter> emitters = emitterRepository.findAllEmitterStartWithByUserId(recieverId);
    emitters.forEach(
            (key, emitter) -> {
              emitterRepository.saveEventCache(key, notification);
              sendNotification(emitter, eventId, key, NotificationDTO.toDTO(notification));
            }
    );
  }

}
