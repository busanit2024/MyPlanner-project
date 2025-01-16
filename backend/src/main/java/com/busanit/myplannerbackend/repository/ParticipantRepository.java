package com.busanit.myplannerbackend.repository;

import com.busanit.myplannerbackend.entity.Participant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ParticipantRepository extends JpaRepository<Participant, Long> {

  List<Participant> findByScheduleId(Long scheduleId);

  Optional<Participant> findByScheduleIdAndUserId(Long scheduleId, Long userId);

  List<Participant> findByUserIdAndStatus(Long userId, Participant.Status status);
}
