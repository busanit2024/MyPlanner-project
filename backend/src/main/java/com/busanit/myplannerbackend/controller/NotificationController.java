package com.busanit.myplannerbackend.controller;

import com.busanit.myplannerbackend.domain.NotificationDTO;
import com.busanit.myplannerbackend.entity.Notification;
import com.busanit.myplannerbackend.service.NotificationService;
import com.busanit.myplannerbackend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
@RequestMapping("/api/notification")
public class NotificationController {
  private final NotificationService notificationService;
  private final UserService userService;

  //SSE 구독 시작
  @GetMapping(value = "/subscribe", produces = "text/event-stream")
  @ResponseStatus(HttpStatus.OK)
  public SseEmitter subscribe(@RequestParam Long userId, @RequestHeader(value = "Last-Event-ID", required = false, defaultValue = "") String lastEventId) {
    return notificationService.subscribe(userId, lastEventId);
  }

  //읽음 처리
  @GetMapping("/read")
  public ResponseEntity<NotificationDTO> read(@RequestParam Long notificationId) {
    Notification notification = notificationService.read(notificationId);
    if (notification == null) {
      return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }
    return ResponseEntity.ok(NotificationDTO.toDTO(notification));
  }

  //읽음 처리(리스트)
  @PostMapping("/read")
  public ResponseEntity<String> readAll(@RequestBody List<String> idList) {
    List<Long> longIdList = idList.stream().map(Long::parseLong).toList();
    notificationService.readAll(longIdList);
    return new ResponseEntity<>(HttpStatus.OK);
  }

  //읽지 않은 알림 갯수
  @GetMapping("/unreadCount")
  public ResponseEntity<Integer> unreadCount(@RequestParam Long userId) {
    Integer unreadCount = userService.getUnreadCount(userId);
    if (unreadCount == null) {
      return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }
    return new ResponseEntity<>(unreadCount, HttpStatus.OK);
  }

}
