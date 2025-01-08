package com.busanit.myplannerbackend.entity;

import jakarta.persistence.Id;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Document
@Getter
@Setter
@Builder
public class Message {
    @Id
    private String id;
    private String chatRoomId;
    private String messageId;
    private String senderEmail;
    private String contents;
    private LocalDateTime sendTime;
    private List<String> images;
    private String messageType;
}