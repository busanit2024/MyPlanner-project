package com.busanit.myplannerbackend.service;

import com.busanit.myplannerbackend.domain.NotificationDTO;
import com.busanit.myplannerbackend.entity.Notification;
import com.busanit.myplannerbackend.repository.EmitterRepository;
import com.busanit.myplannerbackend.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Log4j2
public class NotificationService {

  private final EmitterRepository emitterRepository;
  private final long timeout = 60L * 1000L * 60L;
  private final NotificationRepository notificationRepository;

  //SSE 구독
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

  //실제로 알림 발생 & 서버에 전송
  public void send(Notification sendedNotification) {
    //팔로우, 초대, 좋아요 알림의 경우 중복 저장 대신 새 알림으로 덮어쓰기
    Notification.NotiType sendedNotiType = sendedNotification.getType();
    if(sendedNotiType.equals(Notification.NotiType.FOLLOW) || sendedNotiType.equals(Notification.NotiType.INVITE) || sendedNotiType.equals(Notification.NotiType.HEART) || sendedNotiType.equals(Notification.NotiType.PARTICIPATE)) {
      notificationRepository.findByUserAndTargetIdAndType(sendedNotification.getUser(), sendedNotification.getTargetId(), sendedNotiType).ifPresent(existingNoti -> sendedNotification.setId(existingNoti.getId()));
    }

    Notification notification = notificationRepository.save(sendedNotification);
    String receiverId = String.valueOf(notification.getUser().getId());
    String eventId = makeTimeIncludeId(notification.getUser().getId());
    Map<String, SseEmitter> emitters = emitterRepository.findAllEmitterStartWithByUserId(receiverId);
    emitters.forEach(
            (key, emitter) -> {
              emitterRepository.saveEventCache(key, notification);
              sendNotification(emitter, eventId, key, NotificationDTO.toDTO(notification));
            }
    );
  }

  //읽음 처리
  public Notification read(Long id) {
    Notification notification = notificationRepository.findById(id).orElse(null);
    if (notification == null) {
      return null;
    }

    notification.setRead(true);
    return notificationRepository.save(notification);
  }

  public void readAll(List<Long> idList) {
    for (Long id : idList) {
      read(id);
    }
  }

}
