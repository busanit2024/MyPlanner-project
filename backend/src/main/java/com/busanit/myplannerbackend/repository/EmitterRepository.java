package com.busanit.myplannerbackend.repository;

import lombok.NoArgsConstructor;
import org.springframework.stereotype.Repository;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.Map;

public interface EmitterRepository {
  SseEmitter save(String emitterId, SseEmitter emitter);
  void saveEventCache(String eventCacheId, Object event);
  Map<String, SseEmitter> findAllEmitterStartWithByUserId(String userId);
  Map<String, Object> findAllEventCacheStartWithByUserId(String userId);
  void deleteById(String id);
  void deleteAllEmitterStartWithUserId(String userId);
  void deleteAllEventCacheStartWithUserId(String userId);
}
