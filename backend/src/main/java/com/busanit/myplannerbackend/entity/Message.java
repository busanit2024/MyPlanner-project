package com.busanit.myplannerbackend.entity;

import jakarta.persistence.Id;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

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
    private Schedule schedule;
    private String messageType;

    //읽음처리
    @Builder.Default
    private Map<String, Boolean> readStatus = new HashMap<>();

    public void markAsRead(String userEmail) {
        readStatus.put(userEmail, true);
    }

    public boolean isReadBy(String userEmail) {
        return readStatus.getOrDefault(userEmail, false);
    }

    public long getUnreadCount(List<String> participants) {
        return participants.stream()
                .filter(p -> !isReadBy(p))
                .count();
    }
}