package com.busanit.myplannerbackend.domain;

import com.busanit.myplannerbackend.entity.Comment;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class CommentDTO {
  private Long id;

  private Long scheduleId;

  private UserDTO user;

  private String content;

  private LocalDateTime createdAt;

  public static CommentDTO toDTO(Comment comment) {
    CommentDTOBuilder builder = CommentDTO.builder()
            .id(comment.getId())
            .scheduleId(comment.getSchedule().getId())
            .user(UserDTO.toDTO(comment.getUser()))
            .content(comment.getContent())
            .createdAt(comment.getCreatedAt());

    return builder.build();
  }

  public static List<CommentDTO> toDTO(List<Comment> comments) {
    return comments.stream().map(CommentDTO::toDTO).toList();
  }
}
