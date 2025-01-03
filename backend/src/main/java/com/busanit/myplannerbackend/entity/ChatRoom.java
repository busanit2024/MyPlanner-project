package com.busanit.myplannerbackend.entity;

import com.busanit.myplannerbackend.domain.Participant;
import jakarta.persistence.Id;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Document
@Getter
@Setter
public class ChatRoom {

    @Id
    private String id;

    private List<Participant> participants;
    private String chatroomTitle;
    private String chatRoomType;

    private LocalDateTime createdAt;
    private LocalDateTime lastMessageAt;
    private String lastMessage;
}
