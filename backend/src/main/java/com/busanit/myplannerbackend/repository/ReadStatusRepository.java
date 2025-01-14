package com.busanit.myplannerbackend.repository;

import com.busanit.myplannerbackend.entity.ReadStatus;
import org.springframework.data.mongodb.repository.ReactiveMongoRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Repository
public interface ReadStatusRepository extends ReactiveMongoRepository<ReadStatus, String> {
    Mono<ReadStatus> findByUserEmailAndChatRoomId(String userEmail, String chatRoomId);
    Flux<ReadStatus> findByChatRoomId(String chatRoomId);
    Mono<Void> deleteByUserEmailAndChatRoomId(String userEmail, String chatRoomId);
}
