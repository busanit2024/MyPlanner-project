package com.busanit.myplannerbackend.domain;

import lombok.*;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Participant {
    private String email;
    private String username;
    private String profileImageUrl;
    private String status;
    private String lastReadMessageId; //마지막으로 읽은 메시지ID
}
