package com.busanit.myplannerbackend.domain;

import com.busanit.myplannerbackend.entity.Category;
import com.busanit.myplannerbackend.entity.Schedule;
import com.busanit.myplannerbackend.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.domain.Slice;

import java.util.Date;

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

    private String checkList;           // 체크리스트

    private Boolean done;                // 완료 여부

    private String color;               // 색상

    private UserDTO user;                  // 유저

    private Long userId;                // 사용자 아이디

    private Category category;          // 카테고리

    private Long categoryId;            // 카테고리 아이디

    public static Schedule toEntity(ScheduleDTO scheduleDTO, User user) {
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
        schedule.setCheckList(scheduleDTO.getCheckList());
        schedule.setDone(scheduleDTO.getDone());
        schedule.setColor(scheduleDTO.getColor());
        schedule.setUser(user);
        schedule.setCategory(scheduleDTO.getCategory());
        return schedule;
    }

    public static ScheduleDTO toDTO(Schedule schedule) {
        ScheduleDTOBuilder builder = ScheduleDTO.builder()
                .id(schedule.getId())
                .type(schedule.getType())
                .title(schedule.getTitle())
                .startDate(schedule.getStartDate())
                .startTime(schedule.getStartTime())
                .endDate(schedule.getEndDate())
                .endTime(schedule.getEndTime())
                .allDay(schedule.getAllDay())
                .isRepeat(schedule.getIsRepeat())
                .isAlarm(schedule.getIsAlarm())
                .isPrivate(schedule.getIsPrivate())
                .imageUrl(schedule.getImageUrl())
                .createdAt(schedule.getCreatedAt())
                .checkList(schedule.getCheckList())
                .done(schedule.getDone())
                .color(schedule.getColor())
                //보안상 User필드를 UserDTO로 변환
                .user(UserDTO.toDTO(schedule.getUser()))
                .category(schedule.getCategory());

        return builder.build();
    }

    public static Slice<ScheduleDTO> toDTO(Slice<Schedule> slice) {
        return slice.map(ScheduleDTO::toDTO);
    }
}
