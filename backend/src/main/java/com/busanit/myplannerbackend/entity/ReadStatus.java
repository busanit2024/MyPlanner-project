package com.busanit.myplannerbackend.entity;

import jakarta.persistence.Id;
import lombok.*;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@CompoundIndex(def="{'userEmail':1, 'chatRoomId':1}", unique=true)
public class ReadStatus {

    @Id
    private String id;

    private String userEmail;
    private String chatRoomId;
    private String lastChatLogId;;
    private LocalDateTime updatedAt;
    private boolean isLeave;

}
