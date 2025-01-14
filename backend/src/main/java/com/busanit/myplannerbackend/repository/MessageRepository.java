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

    @Query(value = "{ 'chatRoomId': ?0, 'senderEmail': { '$ne': ?1 } }", count = true)
    Mono<Long> countByChatRoomIdAndSenderEmailNot(String chatRoomId, String userEmail);

    @Query(value = "{ 'chatRoomId': ?0, '_id': { '$gt': { '$oid': ?1 } }, 'senderEmail': { '$ne': ?2 } }", count = true)
    Mono<Long> countByChatRoomIdAndIdAfterAndSenderEmailNot(String chatRoomId, String lastReadId, String userEmail);


}