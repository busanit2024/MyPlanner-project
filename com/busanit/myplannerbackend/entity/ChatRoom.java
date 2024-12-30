package com.busanit.myplannerbackend.entity;

import jakarta.persistence.Id;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "chatrooms")
@Getter
@Setter
public class ChatRoom {
    @Id
    private String id;
    
    private List<Participant> participants;
    private String chatRoomTitle;
    private String chatRoomType;
    private LocalDateTime createdAt;
    private Message lastMessage;
} 