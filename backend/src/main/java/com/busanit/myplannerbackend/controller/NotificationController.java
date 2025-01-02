package com.busanit.myplannerbackend.controller;

import com.busanit.myplannerbackend.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@RestController
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
@RequestMapping("/api/notification")
public class NotificationController {
  private final NotificationService notificationService;

  @GetMapping(value = "/subscribe", produces = "text/event-stream")
  @ResponseStatus(HttpStatus.OK)
  public SseEmitter subscribe(@RequestParam Long userId, @RequestHeader(value = "Last-Event-ID", required = false, defaultValue = "") String lastEventId) {
    return notificationService.subscribe(userId, lastEventId);
  }

}
