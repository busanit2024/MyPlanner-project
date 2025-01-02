package com.busanit.myplannerbackend.domain;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class Participant {
    private String email;
    private String username;
    private String profileImageUrl;
    private String status;
}
