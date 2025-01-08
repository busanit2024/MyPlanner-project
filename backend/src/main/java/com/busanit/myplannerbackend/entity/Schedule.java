package com.busanit.myplannerbackend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.Check;

import java.sql.Time;
import java.util.Date;
import java.util.List;

@Entity
@Table(name = "schedule")
@Getter
@Setter
public class Schedule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;    // 일정 게시물 아이디

    @Column(name = "type")
    private String type;    // 개인 일정, 그룹 일정

    @Column(name = "title")
    private String title;   // 일정 제목

    @Column(name = "start_date", nullable = false)
    private Date startDate; // 시작일

    @Column(name = "start_time", nullable = false)
    private String startTime; // 시작 시간

    @Column(name = "end_date", nullable = false)
    private Date endDate;   // 종료일

    @Column(name = "end_time", nullable = false)
    private String endTime;   // 종료 시간

    @Column(name = "all_day", nullable = false)
    private Boolean allDay; // 종일 여부

    @Column(name = "is_repeat")
    private String isRepeat;  // 반복 기간

    @Column(name = "is_alarm")
    private Boolean isAlarm;  // 알람 여부

    @Column(name = "is_private", nullable = false)
    private Boolean isPrivate;  // 공개 여부

    @Column(name = "image_url", columnDefinition = "LONGTEXT")
    private String imageUrl;  // 이미지 URL

    @Column(name = "created_at", updatable = false)
    @Temporal(TemporalType.TIMESTAMP)
    private java.util.Date createdAt;   // 등록 날짜

    @OneToMany(mappedBy = "schedule", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CheckList> checkList;   // 체크리스트

    @Column(name = "done", nullable = false)
    private Boolean done;  // 일정 완료 여부

    @Column(name = "detail")
    private String detail;  // 상세 내용

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;    // 사용자 아이디

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;  // 카테고리 (Category 엔티티와의 관계)

//    @ManyToOne
//    @JoinColumn(name = "group_id")
//    private Group group;  // 그룹 (Group 엔티티와의 관계)



}





