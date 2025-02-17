package com.busanit.myplannerbackend.domain;

import com.busanit.myplannerbackend.entity.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.domain.Slice;

import java.util.ArrayList;
import java.util.Comparator;
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

    private Boolean allDay = false;             // 종일 여부

    private String isRepeat;            // 반복 기간

    private Boolean isAlarm = false;            // 알람 여부

    private Boolean isPrivate = false;          // 공개 여부

    private String imageUrl;            // 이미지 URL

    private Date createdAt;             // 등록 날짜

    private List<CheckList> checkList;           // 체크리스트

    private List<CheckListDTO> checkListItem;   // dto로 체크리스트 받아오기 위해 따로 설정

    private Boolean done = false;                // 완료 여부

    private String detail;              // 상세 내용

    private String color;               // 일정 색깔

    private UserDTO user;                  // 유저

    private Long userId;                // 사용자 아이디

    private Category category;          // 카테고리

    private Long categoryId;            // 카테고리 아이디

    private List<ParticipantDTO> participants;

    private CommentDTO recentComment; //가장 최신 댓글

    private List<Long> heartUserIds; //좋아요 누른 유저 id 목록

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
//        schedule.setCheckList(scheduleDTO.getCheckList());
        schedule.setDone(scheduleDTO.getDone());
        schedule.setDetail(scheduleDTO.getDetail());
        schedule.setColor(scheduleDTO.getColor());
        schedule.setUser(user);
        schedule.setCategory(scheduleDTO.getCategory());
        return schedule;
    }

    public static ScheduleDTO toDTO(Schedule schedule) {
        List<CheckListDTO> checkListDTOS = new ArrayList<>();

        for (CheckList checkList : schedule.getCheckList()) {
            CheckListDTO checkListDTO = new CheckListDTO();
            checkListDTO.setId(checkList.getId());
            checkListDTO.setContent(checkList.getContent());
            checkListDTO.setIsDone(checkList.getIsDone());
            checkListDTO.setSchedule(schedule);
            checkListDTOS.add(checkListDTO);
        }


        //좋아요 누른 유저 id
        List<Long> heartUsers  = new ArrayList<>();
        if (schedule.getHearts() != null) {
            heartUsers = schedule.getHearts().stream().map(heart -> heart.getUser().getId()).toList();
        }

        //가장 최근 댓글 1개
        List<Comment> comments = schedule.getComments();
        Comment recentComment = null;
        if (comments != null) {
            recentComment = comments.stream().max(Comparator.comparing(Comment::getCreatedAt)).orElse(null);
        }

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
                .detail(schedule.getDetail())
                .checkList(schedule.getCheckList())
                .done(schedule.getDone())
                .color(schedule.getColor())
                //보안상 User필드를 UserDTO로 변환
                .user(UserDTO.toDTO(schedule.getUser()))
                .category(schedule.getCategory())
                .participants(ParticipantDTO.toDTO(schedule.getParticipants()))
                .heartUserIds(heartUsers)
                .checkList(schedule.getCheckList());

        if (recentComment != null) {
            builder.recentComment(CommentDTO.toDTO(recentComment));
        }

        return builder.build();
    }

    public static List<ScheduleDTO> toDTO(List<Schedule> list) {
        return list.stream().map(ScheduleDTO::toDTO).toList();
    }

    public static Slice<ScheduleDTO> toDTO(Slice<Schedule> slice) {
        return slice.map(ScheduleDTO::toDTO);
    }

    @Data
    public static class DateTimeData {
        private Date startDate; // 시작일
        private String startTime; // 시작 시간
        private Date endDate;   // 종료일
        private String endTime;   // 종료 시간
        private Boolean allDay;
    }
}
