package com.busanit.myplannerbackend.repository;

import com.busanit.myplannerbackend.entity.ChatRoom;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ChatRepository extends MongoRepository<ChatRoom, String> {
    List<ChatRoom> findByParticipantsEmailOrderByCreatedAtDesc(String email);
}
