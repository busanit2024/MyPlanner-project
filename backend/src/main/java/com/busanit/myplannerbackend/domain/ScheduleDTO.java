package com.busanit.myplannerbackend.domain;

import com.busanit.myplannerbackend.entity.Category;
import com.busanit.myplannerbackend.entity.CheckList;
import com.busanit.myplannerbackend.entity.Schedule;
import com.busanit.myplannerbackend.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ScheduleDTO {

    private Long id;                    // 일정 게시물 아이디

    private String type;                // 개인 일정, 그룹 일정

    private String title;               // 일정 제목

    private Date startDate;             // 시작일

    private String startTime;           // 시작 시간

    private Date endDate;               // 종료일

    private String endTime;             // 종료 시간

    private Boolean allDay;             // 종일 여부

    private String isRepeat;            // 반복 기간

    private Boolean isAlarm;            // 알람 여부

    private Boolean isPrivate;          // 공개 여부

    private String imageUrl;            // 이미지 URL

    private Date createdAt;             // 등록 날짜

    private List<CheckListDTO> checkList;           // 체크리스트

    private Boolean done;                // 완료 여부

    private String detail;              // 상세 내용

    private User user;                  // 유저

    private Long userId;                // 사용자 아이디

    private Category category;          // 카테고리

    private Long categoryId;            // 카테고리 아이디

    public static Schedule toEntity(ScheduleDTO scheduleDTO) {
        Schedule schedule = new Schedule();
        schedule.setId(scheduleDTO.getId());
        schedule.setType(scheduleDTO.getType());
        schedule.setTitle(scheduleDTO.getTitle());
        schedule.setStartDate(scheduleDTO.getStartDate());
        schedule.setStartTime(scheduleDTO.getStartTime());
        schedule.setEndDate(scheduleDTO.getEndDate());
        schedule.setEndTime(scheduleDTO.getEndTime());
        schedule.setAllDay(scheduleDTO.getAllDay());
        schedule.setIsRepeat(scheduleDTO.getIsRepeat());
        schedule.setIsAlarm(scheduleDTO.getIsAlarm());
        schedule.setIsPrivate(scheduleDTO.getIsPrivate());
        schedule.setImageUrl(scheduleDTO.getImageUrl());
        schedule.setCreatedAt(scheduleDTO.getCreatedAt());
        schedule.setCheckList(schedule.getCheckList());
        schedule.setDone(scheduleDTO.getDone());
        schedule.setDetail(scheduleDTO.getDetail());
        schedule.setUser(scheduleDTO.getUser());
        schedule.setCategory(scheduleDTO.getCategory());
        return schedule;
    }
}
