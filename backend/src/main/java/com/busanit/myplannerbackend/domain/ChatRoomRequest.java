package com.busanit.myplannerbackend.domain;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class ChatRoomRequest {
    private List<Participant> participantIds;
    private String chatroomTitle;
    private String chatroomType;
}
