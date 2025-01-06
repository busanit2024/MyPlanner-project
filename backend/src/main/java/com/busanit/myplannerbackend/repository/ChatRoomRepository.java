package com.busanit.myplannerbackend.repository;

import com.busanit.myplannerbackend.entity.ChatRoom;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.ReactiveMongoRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;

import java.util.List;

@Repository
public interface ChatRoomRepository extends ReactiveMongoRepository<ChatRoom, String> {
    Flux<ChatRoom> findByParticipantsEmailContaining(String email);
}
