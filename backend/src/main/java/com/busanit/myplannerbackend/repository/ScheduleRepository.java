package com.busanit.myplannerbackend.repository;

import com.busanit.myplannerbackend.entity.Schedule;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ScheduleRepository extends JpaRepository<Schedule, Long> {

  //모든 일정 슬라이스
  Slice<Schedule> findAllByIsPrivateFalseOrderByCreatedAtDesc(Pageable pageable);

  //작성자 id가 userIds 리스트에 포함된 일정 슬라이스
  Slice<Schedule> findAllByUserIdInAndIsPrivateFalseOrderByCreatedAtDesc(List<Long> userIds, Pageable pageable);

  //일정 제목으로 검색 슬라이스(임시)
  Slice<Schedule> findByTitleContainingIgnoreCaseAndIsPrivateFalseOrderByCreatedAtDesc(String title, Pageable pageable);

    // 특정 사용자 ID로 일정 목록 조회
    List<Schedule> findByUserId(Long userId);

    //완료되지 않은 일정 종료일이 갸까운 순으로 조회
    Page<Schedule> findByUserIdAndDoneFalseOrderByEndDateAsc(Long userId, Pageable pageable);
}
