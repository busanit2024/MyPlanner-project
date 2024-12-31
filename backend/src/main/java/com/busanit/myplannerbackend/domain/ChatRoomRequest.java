package com.busanit.myplannerbackend.domain;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class ChatRoomRequest {
    private List<Participant> participants;
    private String chatroomTitle;
    private String chatroomType;
}
