package com.busanit.myplannerbackend.domain;

import com.busanit.myplannerbackend.entity.Participant;
import com.busanit.myplannerbackend.entity.Schedule;
import com.busanit.myplannerbackend.entity.User;
import jakarta.persistence.*;
import lombok.Builder;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
@Builder
public class ParticipantDTO {
  private Long id;

  private Long scheduleId;

  private UserDTO user;

  private Participant.Status status;

  public static ParticipantDTO toDTO(Participant participant) {
    ParticipantDTOBuilder builder = ParticipantDTO.builder()
            .id(participant.getId())
            .scheduleId(participant.getSchedule().getId())
            .user(UserDTO.toDTO(participant.getUser()))
            .status(participant.getStatus());

    return builder.build();
  }

  public static List<ParticipantDTO> toDTO(List<Participant> participants) {
    return participants.stream().map(ParticipantDTO::toDTO).toList();
  }
}
