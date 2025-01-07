package com.busanit.myplannerbackend.repository;

import com.busanit.myplannerbackend.entity.Schedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ScheduleRepository extends JpaRepository<Schedule, Long> {

    // 특정 사용자 ID로 일정 목록 조회
    List<Schedule> findByUserId(Long userId);
}
