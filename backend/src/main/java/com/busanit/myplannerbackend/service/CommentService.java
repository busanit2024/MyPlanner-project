package com.busanit.myplannerbackend.service;

import com.busanit.myplannerbackend.domain.CommentDTO;
import com.busanit.myplannerbackend.entity.Comment;
import com.busanit.myplannerbackend.entity.Schedule;
import com.busanit.myplannerbackend.entity.User;
import com.busanit.myplannerbackend.repository.CommentRepository;
import com.busanit.myplannerbackend.repository.ScheduleRepository;
import com.busanit.myplannerbackend.repository.UserRepository;
import com.google.api.gax.rpc.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.crossstore.ChangeSetPersister;
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
    Slice<Comment> slice = commentRepository.getCommentByScheduleId(scheduleId, pageable);
    return slice.map(CommentDTO::toDTO);
  }

  //댓글 쓰기
  public void writeComment(CommentDTO commentDTO, Long userId) {
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

    commentRepository.save(comment);
    //알림 발생
    comment.publishEvent(eventPublisher);
  }

  //댓글 수정
  public void updateComment(CommentDTO commentDTO) {
    Comment comment = commentRepository.findById(commentDTO.getId()).orElse(null);
    if (comment == null) {
      throw new RuntimeException("Comment not found");
    }

    comment.setContent(commentDTO.getContent());
    commentRepository.save(comment);
    //알림 발생 안함
  }

  //댓글 삭제
  public void deleteComment(Long id) {
    commentRepository.deleteById(id);
  }
}
