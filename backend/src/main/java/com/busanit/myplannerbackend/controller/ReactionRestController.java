package com.busanit.myplannerbackend.controller;

import com.busanit.myplannerbackend.domain.CommentDTO;
import com.busanit.myplannerbackend.domain.UserDTO;
import com.busanit.myplannerbackend.entity.Comment;
import com.busanit.myplannerbackend.entity.User;
import com.busanit.myplannerbackend.service.CommentService;
import com.busanit.myplannerbackend.service.HeartService;
import lombok.RequiredArgsConstructor;
import org.antlr.v4.runtime.misc.Pair;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/reaction")
public class ReactionRestController {
  private final CommentService commentService;
  private final HeartService heartService;

  //댓글 리스트 슬라이스
  @GetMapping("/comment/list")
  public Slice<CommentDTO> getCommentList(@RequestParam Long scheduleId, @RequestParam int page, @RequestParam int size) {
    Pageable pageable = PageRequest.of(page, size);

    return commentService.getComment(scheduleId, pageable);
  }

  //전체 댓글 갯수
  @GetMapping("/comment/count")
  public int getCommentCount(@RequestParam Long scheduleId) {
    return commentService.getCommentCount(scheduleId);
  }

  //댓글 작성
  @PostMapping("/comment/write/{userId}")
  public CommentDTO writeComment(@RequestBody CommentDTO comment, @PathVariable Long userId) {
    Comment response = commentService.writeComment(comment, userId);
    return CommentDTO.toDTO(response);
  }

  //댓글 수정
  @PostMapping("/comment/update")
  public CommentDTO updateComment(@RequestBody CommentDTO comment) {
    Comment response = commentService.updateComment(comment);
    return CommentDTO.toDTO(response);
  }

  //댓글 삭제
  @GetMapping("/comment/delete")
  public void deleteComment(@RequestParam Long id) {
    commentService.deleteComment(id);
  }

  //좋아요 토글
  @GetMapping("/like")
  public void like(@RequestParam Long scheduleId, @RequestParam Long userId) {
    heartService.HeartToggle(scheduleId, userId);
  }

  //내가 좋아요 눌렀는지 확인하기
  @GetMapping("/like/check")
  public ResponseEntity<Boolean> checkLike(@RequestParam Long scheduleId, @RequestParam Long userId) {
    Boolean response = heartService.checkMyLike(scheduleId, userId);
    return ResponseEntity.ok(response);
  }

  //좋아요 누른 유저 정보 불러오기
  @GetMapping("/like/list")
  public Slice<UserDTO> getLikeList(@RequestParam Long scheduleId, @RequestParam int page, @RequestParam int size) {
    Pageable pageable = PageRequest.of(page, size);
    return heartService.getHeartUsers(scheduleId, pageable);
  }

  //전체 좋아요 갯수
  @GetMapping("/like/count")
  public int getLikeCount(@RequestParam Long scheduleId) {
    return heartService.getHeartCount(scheduleId);
  }
}
