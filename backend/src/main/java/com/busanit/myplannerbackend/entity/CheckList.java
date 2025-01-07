package com.busanit.myplannerbackend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "checklist")
public class CheckList {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;            // 체크리스트 아이디

    @Column(name = "schedule_id", nullable = false)
    private Long schedule_id;   // 스케줄 아이디

    @Column(name = "content")
    private String content;     // 내용

    @Column(name = "done", nullable = false)
    private Boolean done;       // 완료 여부

}
