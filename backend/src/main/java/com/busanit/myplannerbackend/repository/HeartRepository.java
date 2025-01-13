package com.busanit.myplannerbackend.repository;

import com.busanit.myplannerbackend.entity.Heart;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface HeartRepository extends JpaRepository<Heart, Long> {
  Optional<Heart> findByScheduleIdAndUserId(Long scheduleId, Long userId);

  int countByScheduleId(Long scheduleId);

  Slice<Heart> findByScheduleId(Long scheduleId, Pageable pageable);
}
