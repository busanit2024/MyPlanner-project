package com.busanit.myplannerbackend.repository;

import com.busanit.myplannerbackend.entity.Follow;
import com.busanit.myplannerbackend.entity.User;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface FollowRepository extends JpaRepository<Follow, Long> {
  Optional<Follow> findByFollowFromAndFollowTo(User from, User to);
  Slice<Follow> findFollowFromByFollowTo(User user, Pageable pageable);
  Slice<Follow> findFollowToByFollowFrom(User user, Pageable pageable);
}
