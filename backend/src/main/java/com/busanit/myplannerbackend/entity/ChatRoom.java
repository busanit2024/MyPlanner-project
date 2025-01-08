package com.busanit.myplannerbackend.entity;

import com.busanit.myplannerbackend.domain.Participant;
import jakarta.persistence.Id;
import lombok.*;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Document
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ChatRoom {

    @Id
    private String id;

    private List<Participant> participants;
    private String chatroomTitle;
    private String chatRoomType;

    private LocalDateTime createdAt;
    private LocalDateTime lastMessageAt;
    private String lastMessage;

    public void updateParticipantInfo(User updatedUser) {
        this.participants = this.participants.stream()
                .map(participant -> {
                    if (participant.getEmail().equals(updatedUser.getEmail())) {
                        return Participant.builder()
                                .email(updatedUser.getEmail())
                                .username(updatedUser.getUsername())
                                .profileImageUrl(updatedUser.getProfileImageUrl())
                                .status(participant.getStatus())
                                .build();
                    }
                    return participant;
                })
                .collect(Collectors.toList());
    }
}
