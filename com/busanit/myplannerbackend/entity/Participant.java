package com.busanit.myplannerbackend.entity;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class Participant {
    private String email;
    private String status;  // "ACTIVE" or "LEFT"
} 