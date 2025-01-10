package com.busanit.myplannerbackend.repository;

import com.busanit.myplannerbackend.entity.Comment;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CommentRepository extends JpaRepository<Comment, Long> {
  Slice<Comment> getCommentByScheduleId(Long scheduleId, Pageable pageable);
}
