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

  //모든 일정 슬라이스
  Slice<Schedule> findAllByOrderByCreatedAtDesc(Pageable pageable);

  //작성자 id가 userIds 리스트에 포함된 일정 슬라이스
  Slice<Schedule> findAllByUserIdInOrderByCreatedAtDesc(List<Long> userIds, Pageable pageable);

  //일정 제목으로 검색 슬라이스(임시)
  Slice<Schedule> findByTitleContainingIgnoreCaseOrderByCreatedAtDesc(String title, Pageable pageable);

}
