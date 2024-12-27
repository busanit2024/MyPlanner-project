package com.busanit.myplannerbackend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.apache.catalina.Group;
import org.apache.catalina.User;

import java.sql.Time;
import java.util.Date;

@Entity
@Getter
@Setter
@Table(name = "schedule")
public class Schedule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;    // 일정 게시물 아이디

//    @ManyToOne
//    @JoinColumn(name = "user_id", nullable = false)
//    private User user;    // 사용자 아이디

    @Column(name = "type")
    private String type;    // 개인 일정, 그룹 일정

    @Column(name = "title")
    private String title;   // 일정 제목

    @Column(name = "start_date", nullable = false)
    private Date startDate; // 시작일

    @Column(name = "start_time", nullable = false)
    private Time startTime; // 시작 시간

    @Column(name = "end_date", nullable = false)
    private Date endDate;   // 종료일

    @Column(name = "end_time", nullable = false)
    private Time endTime;   // 종료 시간

    @Column(name = "all_day", nullable = false)
    private Boolean allDay; // 종일 여부

    @Column(name = "repeat")
    private String repeat;  // 반복 기간

    @Column(name = "alarm")
    private Boolean alarm;  // 알람 여부

    @Column(name = "private", nullable = false)
    private Boolean isPrivate;  // 공개 여부

    @ManyToOne
    @JoinColumn(name = "category_id")
    private Category category;  // 카테고리 (Category 엔티티와의 관계)

    @Column(name = "image_url")
    private String imageUrl;  // 이미지 URL

    @Column(name = "created_at", updatable = false)
    @Temporal(TemporalType.TIMESTAMP)
    private java.util.Date createdAt;

    @Column(name = "done", nullable = false)
    private Boolean done;  // 완료 여부

//    @ManyToOne
//    @JoinColumn(name = "group_id")
//    private Group group;  // 그룹 (Group 엔티티와의 관계)



}










