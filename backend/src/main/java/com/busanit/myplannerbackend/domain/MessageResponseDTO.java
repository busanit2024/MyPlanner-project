package com.busanit.myplannerbackend.domain;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
public class MessageResponseDTO {
    private String id;
    private String contents;
    private String senderEmail;
    private String senderName;
    private String senderProfile;
    private LocalDateTime sendTime;
    private String messageType;
}
