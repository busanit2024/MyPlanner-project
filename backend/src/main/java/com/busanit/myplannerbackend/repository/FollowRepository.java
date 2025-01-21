package com.busanit.myplannerbackend.repository;

import com.busanit.myplannerbackend.entity.Follow;
import com.busanit.myplannerbackend.entity.User;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FollowRepository extends JpaRepository<Follow, Long> {

  //from유저, to유저로 팔로우 열 찾기
  Optional<Follow> findByFollowFromAndFollowTo(User from, User to);

  //user를 팔로우하는 유저 목록
  Slice<Follow> findFollowFromByFollowTo(User user, Pageable pageable);

  //user가 팔로우하는 유저 목록
  Slice<Follow> findFollowToByFollowFrom(User user, Pageable pageable);

}
