package com.busanit.myplannerbackend.repository;

import com.busanit.myplannerbackend.entity.Message;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface MessageRepository extends MongoRepository<Message, String> {
}
