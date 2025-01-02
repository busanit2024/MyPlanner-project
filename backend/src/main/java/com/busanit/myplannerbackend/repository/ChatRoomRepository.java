package com.busanit.myplannerbackend.repository;

import com.busanit.myplannerbackend.entity.ChatRoom;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatRoomRepository extends MongoRepository<ChatRoom, String> {
    List<ChatRoom> findByParticipantsEmailContaining(String email);
}
