package com.busanit.myplannerbackend.repository;

import com.busanit.myplannerbackend.entity.Message;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface MessageRepository extends MongoRepository<Message, String> {
    List<Message> findByChatRoomIdOrderBySendTimeAsc(String chatRoomId);
}