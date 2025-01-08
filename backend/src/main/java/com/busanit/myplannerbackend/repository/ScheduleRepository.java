package com.busanit.myplannerbackend.repository;

import com.busanit.myplannerbackend.entity.Schedule;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ScheduleRepository extends JpaRepository<Schedule, Long> {

  Slice<Schedule> findAllByOrderByCreatedAtDesc(Pageable pageable);

  Slice<Schedule> findAllByUserIdInOrderByCreatedAtDesc(List<Long> userIds, Pageable pageable);

}
