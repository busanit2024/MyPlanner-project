package com.busanit.myplannerbackend.domain;

import com.busanit.myplannerbackend.entity.Schedule;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CheckListDTO {

    private Long id;    // 체크리스트 아이디

    private String content; // 내용

    private Boolean isDone; // 체크리스트 완료 여부

    private Schedule schedule;    // 스케줄 아이디
}
