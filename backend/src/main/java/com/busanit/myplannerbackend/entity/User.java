package com.busanit.myplannerbackend.entity;


import com.busanit.myplannerbackend.domain.UserJoinDTO;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
public class User {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(unique = true, nullable = false)
  private String firebaseUid;

  @Column(unique = true, nullable = false)
  private String email;

  private String username;
  private String bio;
  private String phone;

  @CreationTimestamp
  private LocalDateTime regDate;

  @Enumerated(EnumType.STRING)
  private Role role;
  private String profileImageUrl;

  public enum Role {
    ADMIN, USER
  }

  public static User toEntity(UserJoinDTO dto) {
    UserBuilder builder = User.builder()
            .firebaseUid(dto.getFirebaseUid())
            .email(dto.getEmail())
            .username(dto.getUsername())
            .bio(dto.getBio())
            .phone(dto.getPhone())
            .role(dto.getRole())
            .profileImageUrl(dto.getProfileImageUrl());

    return builder.build();
  }

}
