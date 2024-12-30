package com.busanit.myplannerbackend.domain;

import lombok.Builder;
import lombok.Getter;
import java.time.LocalDateTime;

@Getter
@Builder
public class MessageResponse {
    private String id;
    private String contents;
    private String senderId;
    private String senderName;
    private LocalDateTime sendTime;
} 