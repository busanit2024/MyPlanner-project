package com.busanit.myplannerbackend.service;

import com.busanit.myplannerbackend.domain.CommentDTO;
import com.busanit.myplannerbackend.entity.Comment;
import com.busanit.myplannerbackend.entity.Schedule;
import com.busanit.myplannerbackend.entity.User;
import com.busanit.myplannerbackend.repository.CommentRepository;
import com.busanit.myplannerbackend.repository.ScheduleRepository;
import com.busanit.myplannerbackend.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CommentService {
  private final CommentRepository commentRepository;
  private final UserRepository userRepository;
  private final ScheduleRepository scheduleRepository;
  private final ApplicationEventPublisher eventPublisher;

  //scheduleId에 해당하는 댓글 목록 슬라이스
  public Slice<CommentDTO> getComment(Long scheduleId, Pageable pageable) {
    Slice<Comment> slice = commentRepository.getCommentByScheduleIdOrderByCreatedAtDesc(scheduleId, pageable);
    return slice.map(CommentDTO::toDTO);
  }

  //scheduleId에 해당하는 전체 댓글 갯수
  public int getCommentCount(Long scheduleId) {
    return commentRepository.countByScheduleId(scheduleId);
  }

  //댓글 쓰기
  @Transactional
  public Comment writeComment(CommentDTO commentDTO, Long userId) {
    User user = userRepository.findById(userId).orElse(null);
    if (user == null) {
      throw new RuntimeException("User not found");
    }
    Schedule schedule = scheduleRepository.findById(commentDTO.getScheduleId()).orElse(null);
    if (schedule == null) {
      throw new RuntimeException("Schedule not found");
    }

    Comment comment = new Comment();
    comment.setContent(commentDTO.getContent());
    comment.setUser(user);
    comment.setSchedule(schedule);

    Comment savedComment = commentRepository.save(comment);

    //본인 일정에 작성한 댓글의 경우 알림 발생 안함
    if (!savedComment.getUser().getId().equals(userId)) {
      //알림 발생
      savedComment.publishEvent(eventPublisher);
    }

    return savedComment;
  }

  //댓글 수정
  @Transactional
  public Comment updateComment(CommentDTO commentDTO) {
    if (commentDTO.getId() == null) {
      throw new RuntimeException("Comment id not found");
    }
    Comment comment = commentRepository.findById(commentDTO.getId()).orElse(null);
    if (comment == null) {
      throw new RuntimeException("Comment not found");
    }

    comment.setContent(commentDTO.getContent());
    //알림 발생 안함
    return commentRepository.save(comment);
  }

  //댓글 삭제
  public void deleteComment(Long id) {
    commentRepository.deleteById(id);
  }
}
