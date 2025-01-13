package com.busanit.myplannerbackend.repository;

import com.busanit.myplannerbackend.entity.Message;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.data.mongodb.repository.ReactiveMongoRepository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;


public interface MessageRepository extends ReactiveMongoRepository<Message, String> {
    Flux<Message> findByChatRoomIdOrderBySendTimeAsc(String chatRoomId);
    Mono<Void> deleteByChatRoomId(String chatRoomId);
    Mono<Message> findFirstByChatRoomIdOrderBySendTimeDesc(String chatRoomId);
    Mono<Long> countByChatRoomIdAndIdAfter(String chatRoomId, String messageId);
}